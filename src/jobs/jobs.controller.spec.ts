import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { EmptyLogger } from '../test-utils/empty.logger';
import { ProfilesService } from '../profiles/profiles.service';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { contract, job, profile } from '../test-utils/data';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('JobsController', () => {
  let controller: JobsController;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [JobsService, ProfilesService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    controller = module.get<JobsController>(JobsController);
    prismaMock = module.get(PrismaService);

    module.useLogger(new EmptyLogger());
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockJob = {
    ...job,
    is_paid: true,
    contract: { client_id: 1, contractor_id: 2 },
  };
  describe('CreateJob', () => {
    it('should create a job', async () => {
      prismaMock.contracts.findUnique.mockResolvedValue(contract);
      prismaMock.jobs.create.mockResolvedValue(job);
      const result = await controller.create({ ...job, price: 1000 });
      expect(result.data).toEqual(job);
    });

    it("should thow NotFoundException when contract doesn't exist", async () => {
      prismaMock.contracts.findUnique.mockResolvedValue(null);
      const createJobDto = { ...job, price: 1000 };
      prismaMock.jobs.create.mockRejectedValue(new NotFoundException());
      await expect(controller.create(createJobDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('is_paid should be false when creating a job', async () => {
      prismaMock.contracts.findUnique.mockResolvedValue(contract);
      prismaMock.jobs.create.mockResolvedValue(job);
      const result = await controller.create({ ...job, price: 1000 });
      expect(result.data.is_paid).toBe(false);
    });
  });

  describe('GetUnpaidJobs', () => {
    it('should return unpaid jobs', async () => {
      prismaMock.jobs.findMany.mockResolvedValue([job]);
      const result = await controller.getUnpaidJobs({ profile: 1 });
      expect(result.data).toEqual([job]);
    });

    it('should get an empty array when there are no unpaid jobs', async () => {
      prismaMock.jobs.findMany.mockResolvedValue([]);
      const result = await controller.getUnpaidJobs({ profile: 1 });
      expect(result.data).toEqual([]);
    });
  });

  describe('PayForJob', () => {
    it('should throw NotFoundException when the job does not exist', async () => {
      prismaMock.jobs.findUnique.mockResolvedValue(null);
      prismaMock.jobs.update.mockRejectedValue(new NotFoundException());
      await expect(controller.payForJob({ profile: 1 }, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when the client is not the job client', async () => {
      prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
      prismaMock.jobs.update.mockRejectedValue(new ForbiddenException());
      await expect(controller.payForJob({ profile: 1 }, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
