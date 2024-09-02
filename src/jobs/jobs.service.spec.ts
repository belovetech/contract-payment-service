import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { JobsService } from './jobs.service';
import { ProfilesService } from '../profiles/profiles.service';
import {
  mockContract as contract,
  mockJob as job,
  mockProfile as profile,
  mockUnpaidJobs as unpaidJobs,
} from '../test-utils/data.mock';
import {
  ForbiddenException,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { query } from '../test-utils';
import PaginationUtil from '../utils/pagination.util';

describe('JobsService', () => {
  let service: JobsService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobsService, ProfilesService, PrismaService, PaginationUtil],
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
    // it('should create a job', async () => {
    //   prismaMock.contracts.findUnique.mockResolvedValue(contract);
    //   prismaMock.jobs.create.mockResolvedValue(job);
    //   const result = await service.createJob({ ...job, price: 1000 });
    //   expect(result).toEqual(job);
    // });
    it('should create a job if the contract exists', async () => {
      const createJobDto = {
        contract_id: 1,
        description: 'Test Job',
        price: 1000,
      };
      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.contracts.findUnique.mockResolvedValue(contract);
        prismaMock.jobs.create.mockResolvedValue(job);
        return callback(prismaMock);
      });

      const result = await service.createJob(createJobDto);
      expect(result).toEqual(job);
      expect(prismaMock.contracts.findUnique).toHaveBeenCalledWith({
        where: { id: createJobDto.contract_id },
      });
      expect(prismaMock.jobs.create).toHaveBeenCalledWith({
        data: {
          ...createJobDto,
          is_paid: false,
        },
      });
    });

    it('should throw NotFoundException if the contract does not exist', async () => {
      const createJobDto = {
        contract_id: 1,
        description: 'Test Job',
        price: 1000,
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.contracts.findUnique.mockResolvedValue(null);
        return callback(prismaMock);
      });

      await expect(service.createJob(createJobDto)).rejects.toThrow(
        new NotFoundException('Contract does not exist'),
      );

      expect(prismaMock.contracts.findUnique).toHaveBeenCalledWith({
        where: { id: createJobDto.contract_id },
      });
      expect(prismaMock.jobs.create).not.toHaveBeenCalled();
    });

    it('is_paid should be false when creating a job', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.contracts.findUnique.mockResolvedValue(contract);
        prismaMock.jobs.create.mockResolvedValue(job);
        return callback(prismaMock);
      });
      const result = await service.createJob({ ...job, price: 1000 });
      expect(result.is_paid).toBe(false);
    });
  });

  describe('GetUnpaidJobs', () => {
    it('should return a list of unpaid jobs', async () => {
      prismaMock.jobs.findMany.mockResolvedValue(unpaidJobs);
      prismaMock.jobs.count.mockResolvedValue(10);
      const result = await service.getUnpaidJobs(1, query);
      expect(result.jobs).toEqual(unpaidJobs);
    });

    it("should empty list when there's no unpaid jobs", async () => {
      prismaMock.jobs.findMany.mockResolvedValue([]);
      prismaMock.jobs.count.mockResolvedValue(10);
      const result = await service.getUnpaidJobs(1, query);
      expect(result.jobs).toEqual([]);
    });
  });

  describe('PayForJob', () => {
    it('should throw NotFoundException if the job is not found or already paid for', async () => {
      prismaMock.jobs.findUnique.mockResolvedValue(null);
      await expect(service.payForJob(1, 1)).rejects.toThrow(NotFoundException);
      expect(prismaMock.jobs.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
          is_paid: false,
        },
        include: {
          contract: {
            select: {
              client_id: true,
              contractor_id: true,
            },
          },
        },
      });
    });

    it('should throw ForbiddenException if the client is not authorized to pay for the job', async () => {
      const mockJob = {
        ...job,
        price: new Prisma.Decimal(1000),
        is_paid: false,
        updated_at: new Date(),
        contract: {
          client_id: 2, // Not matching client_id
          contractor_id: 3,
        },
      };

      prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
      await expect(service.payForJob(1, 1)).rejects.toThrow(ForbiddenException);
      expect(prismaMock.jobs.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
          is_paid: false,
        },
        include: {
          contract: {
            select: {
              client_id: true,
              contractor_id: true,
            },
          },
        },
      });
    });

    it('should throw PreconditionFailedException if the client has insufficient balance', async () => {
      const mockJob = {
        ...job,
        id: 1,
        price: new Prisma.Decimal(1000), // Job price is 1000
        is_paid: false,
        updated_at: new Date(),
        contract: {
          client_id: 1,
          contractor_id: 2,
        },
      };

      const mockProfileAfterUpdate = {
        ...profile,
        id: 1,
        balance: new Prisma.Decimal(-500), // Resulting balance is negative
      };

      prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );
      prismaMock.profiles.update.mockResolvedValueOnce(mockProfileAfterUpdate);

      await expect(service.payForJob(1, 1)).rejects.toThrow(
        PreconditionFailedException,
      );

      expect(prismaMock.profiles.update).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          balance: {
            decrement: mockJob.price,
          },
        },
      });
    });

    it('should handle the transaction correctly and pay for a job', async () => {
      const mockJob = {
        ...job,
        is_paid: false,
        contract: { client_id: 1, contractor_id: 2 },
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

      prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
      prismaMock.profiles.findUnique.mockResolvedValue(client);
      prismaMock.profiles.update.mockResolvedValue(updatedClient);

      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );

      const result = await service.payForJob(job.id, client.id);
      expect(result).toEqual(updatedClient);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('should mark job as paid and set paid_date', async () => {
      const updatedClient = {
        id: 1,
        balance: 500,
      };
      const mockJob = {
        ...job,
        is_paid: false,
        contract: { client_id: 1, contractor_id: 2 },
      };

      const balance = new Prisma.Decimal(500);
      prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
      prismaMock.jobs.update.mockResolvedValue(job);
      prismaMock.profiles.update.mockResolvedValue({ ...profile, balance });
      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );

      const result = await service.payForJob(1, 1);
      expect(Number(result.balance)).toEqual(updatedClient.balance);
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.jobs.update).toHaveBeenCalledTimes(1);
    });

    it('should successfully pay for a job when client has sufficient balance', async () => {
      const updatedClient = {
        ...profile,
        balance: new Prisma.Decimal(500),
      };
      const mockJob = {
        ...job,
        is_paid: false,
        contract: { client_id: 1, contractor_id: 2 },
      };
      prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
      prismaMock.profiles.update.mockResolvedValue(updatedClient);
      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );

      const result = await service.payForJob(1, 1);
      expect(result).toEqual(updatedClient);
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.jobs.update).toHaveBeenCalledTimes(1);
    });
    it("should decrement client's balance by job price", async () => {
      const updatedClient = {
        ...profile,
        balance: new Prisma.Decimal(500),
      };
      const mockJob = {
        ...job,
        is_paid: false,
        contract: { client_id: 1, contractor_id: 2 },
      };

      prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
      prismaMock.profiles.update.mockResolvedValue(updatedClient);
      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );

      const result = await service.payForJob(1, 1);
      expect(result).toEqual(updatedClient);
      expect(prismaMock.profiles.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { balance: { decrement: job.price } },
      });
    });

    it("should increment contractor's balance by job price when transaction completes successfully", async () => {
      const updatedClient = {
        ...profile,
        balance: new Prisma.Decimal(500),
      };
      const mockJob = {
        ...job,
        is_paid: false,
        contract: { client_id: 1, contractor_id: 2 },
      };

      prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
      prismaMock.profiles.update.mockResolvedValue(updatedClient);
      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );

      const result = await service.payForJob(1, 1);
      expect(result).toEqual(updatedClient);
      expect(prismaMock.profiles.update).toHaveBeenCalledWith({
        where: { id: mockJob.contract.contractor_id },
        data: { balance: { increment: job.price } },
      });
    });
  });
});
