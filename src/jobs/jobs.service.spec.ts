import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { JobsService } from './jobs.service';
import { ProfilesService } from '../profiles/profiles.service';
import { contract, job, profile, unpaidJobs } from '../test-utils/data';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';

describe('JobsService', () => {
  let service: JobsService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobsService, ProfilesService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get(JobsService);
    prismaMock = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreateJob', () => {
    it('should create a job', async () => {
      prismaMock.contracts.findUnique.mockResolvedValue(contract);
      prismaMock.jobs.create.mockResolvedValue(job);
      const result = await service.create({ ...job, price: 1000 });
      expect(result).toEqual(job);
    });

    it("should thow NotFoundException when contract doesn't exist", async () => {
      prismaMock.contracts.findUnique.mockResolvedValue(null);
      const createJobDto: CreateJobDto = { ...job, price: 1000 };
      prismaMock.jobs.create.mockRejectedValue(new NotFoundException());
      await expect(service.create(createJobDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('is_paid should be false when creating a job', async () => {
      prismaMock.contracts.findUnique.mockResolvedValue(contract);
      prismaMock.jobs.create.mockResolvedValue(job);
      const result = await service.create({ ...job, price: 1000 });
      expect(result.is_paid).toBe(false);
    });
  });

  describe('GetUnpaidJobs', () => {
    it('should return a list of unpaid jobs', async () => {
      prismaMock.jobs.findMany.mockResolvedValue(unpaidJobs);
      const result = await service.getUnpaidJobs(1);
      expect(result).toEqual(unpaidJobs);
    });

    it("should empty list when there's no unpaid jobs", async () => {
      prismaMock.jobs.findMany.mockResolvedValue([]);
      const result = await service.getUnpaidJobs(1);
      expect(result).toEqual([]);
    });
  });

  describe('payForJob', () => {
    const job_id = 1;
    const client_id = 1;

    const mockJob = {
      ...job,
      is_paid: true,
      contract: { client_id: 1, contractor_id: 2 },
    };

    it('should handle the transaction correctly and pay for a job', async () => {
      const job = {
        id: 1,
        price: new Prisma.Decimal(100),
        contract: {
          contractor_id: 2,
        },
      };

      const client = {
        ...profile,
        id: 1,
        balance: new Prisma.Decimal(200),
      };

      const updatedClient = {
        ...client,
        balance: client.balance.minus(job.price),
      };

      prismaMock.jobs.findUnique.mockResolvedValue({
        ...mockJob,
        is_paid: false,
      });
      prismaMock.profiles.findUnique.mockResolvedValue(client);
      prismaMock.profiles.update.mockResolvedValue(updatedClient);

      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );

      const result = await service.payForJob(job.id, client.id);
      expect(result).toEqual(updatedClient);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it("should throw NotFoundException when job doesn't exist", async () => {
      prismaMock.jobs.findUnique.mockResolvedValue(null);
      prismaMock.jobs.update.mockRejectedValue(new NotFoundException());
      await expect(service.payForJob(job_id, client_id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when contract is not associated with job', async () => {
      prismaMock.jobs.findUnique.mockResolvedValue({ ...job, contract_id: 2 });
      prismaMock.jobs.update.mockRejectedValue(new ForbiddenException());
      await expect(service.payForJob(job_id, client_id)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when client is not authorized to pay for job', async () => {
      prismaMock.jobs.findUnique.mockResolvedValue({ ...job });
      prismaMock.jobs.update.mockRejectedValue(new NotFoundException());
      await expect(service.payForJob(job_id, client_id)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when job has already been paid for', async () => {
      prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
      prismaMock.jobs.update.mockRejectedValue(new NotFoundException());
      await expect(service.payForJob(job_id, client_id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
