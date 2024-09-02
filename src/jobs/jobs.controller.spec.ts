import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { EmptyLogger } from '../test-utils/empty.logger';
import { ProfilesService } from '../profiles/profiles.service';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { mockContract, mockJob, mockJobs, query } from '../test-utils';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import PaginationUtil from '../utils/pagination.util';

describe('JobsController', () => {
  let controller: JobsController;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [JobsService, ProfilesService, PrismaService, PaginationUtil],
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

  describe('CreateJob', () => {
    it('should create a job', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.contracts.findUnique.mockResolvedValue(mockContract);
        prismaMock.jobs.create.mockResolvedValue(mockJob);
        return callback(prismaMock);
      });
      const result = await controller.create({ ...mockJob, price: 1000 });
      expect(result.data).toEqual(mockJob);
    });

    it("should thow NotFoundException when contract doesn't exist", async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.contracts.findUnique.mockResolvedValue(null);
        return callback(prismaMock);
      });
      const createJobDto = { ...mockJob, price: 1000 };
      prismaMock.jobs.create.mockRejectedValue(new NotFoundException());
      await expect(controller.create(createJobDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('is_paid should be false when creating a job', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.contracts.findUnique.mockResolvedValue(mockContract);
        prismaMock.jobs.create.mockResolvedValue(mockJob);
        return callback(prismaMock);
      });
      const result = await controller.create({ ...mockJob, price: 1000 });
      expect(result.data.is_paid).toBe(false);
    });
  });

  describe('GetUnpaidJobs', () => {
    it('should return unpaid jobs', async () => {
      prismaMock.jobs.findMany.mockResolvedValue(mockJobs);
      prismaMock.jobs.count.mockResolvedValue(10);
      const result = await controller.getUnpaidJobs({ profile: 1 }, query);
      expect(result.data.jobs).toEqual(mockJobs);
    });

    it('should get an empty array when there are no unpaid jobs', async () => {
      prismaMock.jobs.findMany.mockResolvedValue([]);
      prismaMock.jobs.count.mockResolvedValue(10);
      const result = await controller.getUnpaidJobs({ profile: 1 }, query);
      expect(result.data.jobs).toEqual([]);
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
      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
        prismaMock.jobs.findUnique.mockRejectedValue(NotFoundException);
        return callback(prismaMock);
      });
      await expect(controller.payForJob({ profile: 1 }, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
