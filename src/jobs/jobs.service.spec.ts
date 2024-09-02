import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { JobsService } from './jobs.service';
import { ProfilesService } from '../profiles/profiles.service';
import { contract, job, profile, unpaidJobs } from '../test-utils/data';
import {
  ForbiddenException,
  NotFoundException,
  PreconditionFailedException,
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

    // it('should throw PreconditionFailedException if the client has insufficient balance', async () => {
    //   const mockJob = {
    //     ...job,
    //     price: new Prisma.Decimal(1000),
    //     is_paid: false,
    //     updated_at: new Date(),
    //     contract: {
    //       client_id: 1,
    //       contractor_id: 2,
    //     },
    //   };

    //   prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
    //   prismaMock.profiles.update.mockResolvedValue({
    //     ...profile,
    //     balance: new Prisma.Decimal(500), // Less than job price
    //   });

    //   await expect(service.payForJob(1, 1)).rejects.toThrow(
    //     PreconditionFailedException,
    //   );
    //   expect(prismaMock.profiles.update).toHaveBeenCalledWith({
    //     where: {
    //       id: 1,
    //     },
    //     data: {
    //       balance: {
    //         decrement: mockJob.price,
    //       },
    //     },
    //   });
    // });
  });

  // describe('CreateJob', () => {
  //   it('should create a job', async () => {
  //     prismaMock.contracts.findUnique.mockResolvedValue(contract);
  //     prismaMock.jobs.create.mockResolvedValue(job);
  //     const result = await service.create({ ...job, price: 1000 });
  //     expect(result).toEqual(job);
  //   });

  //   it("should thow NotFoundException when contract doesn't exist", async () => {
  //     prismaMock.contracts.findUnique.mockResolvedValue(null);
  //     const createJobDto: CreateJobDto = { ...job, price: 1000 };
  //     prismaMock.jobs.create.mockRejectedValue(new NotFoundException());
  //     await expect(service.create(createJobDto)).rejects.toThrow(
  //       NotFoundException,
  //     );
  //   });

  //   it('is_paid should be false when creating a job', async () => {
  //     prismaMock.contracts.findUnique.mockResolvedValue(contract);
  //     prismaMock.jobs.create.mockResolvedValue(job);
  //     const result = await service.create({ ...job, price: 1000 });
  //     expect(result.is_paid).toBe(false);
  //   });
  // });

  // describe('GetUnpaidJobs', () => {
  //   it('should return a list of unpaid jobs', async () => {
  //     prismaMock.jobs.findMany.mockResolvedValue(unpaidJobs);
  //     const result = await service.getUnpaidJobs(1);
  //     expect(result).toEqual(unpaidJobs);
  //   });

  //   it("should empty list when there's no unpaid jobs", async () => {
  //     prismaMock.jobs.findMany.mockResolvedValue([]);
  //     const result = await service.getUnpaidJobs(1);
  //     expect(result).toEqual([]);
  //   });
  // });

  // describe('payForJob', () => {
  //   const job_id = 1;
  //   const client_id = 1;

  //   const mockJob = {
  //     ...job,
  //     is_paid: true,
  //     contract: { client_id: 1, contractor_id: 2 },
  //   };

  //   it('should handle the transaction correctly and pay for a job', async () => {
  //     const job = {
  //       id: 1,
  //       price: new Prisma.Decimal(100),
  //       contract: {
  //         contractor_id: 2,
  //       },
  //     };

  //     const client = {
  //       ...profile,
  //       id: 1,
  //       balance: new Prisma.Decimal(200),
  //     };

  //     const updatedClient = {
  //       ...client,
  //       balance: client.balance.minus(job.price),
  //     };

  //     prismaMock.jobs.findUnique.mockResolvedValue({
  //       ...mockJob,
  //       is_paid: false,
  //     });
  //     prismaMock.profiles.findUnique.mockResolvedValue(client);
  //     prismaMock.profiles.update.mockResolvedValue(updatedClient);

  //     prismaMock.$transaction.mockImplementation(async (callback) =>
  //       callback(prismaMock),
  //     );

  //     const result = await service.payForJob(job.id, client.id);
  //     expect(result).toEqual(updatedClient);
  //     expect(prismaMock.$transaction).toHaveBeenCalled();
  //   });

  //   it("should throw NotFoundException when job doesn't exist", async () => {
  //     prismaMock.jobs.findUnique.mockResolvedValue(null);
  //     prismaMock.jobs.update.mockRejectedValue(new NotFoundException());
  //     await expect(service.payForJob(job_id, client_id)).rejects.toThrow(
  //       NotFoundException,
  //     );
  //   });

  //   it('should throw NotFoundException when contract is not associated with job', async () => {
  //     prismaMock.jobs.findUnique.mockResolvedValue({ ...job, contract_id: 2 });
  //     prismaMock.jobs.update.mockRejectedValue(new ForbiddenException());
  //     await expect(service.payForJob(job_id, client_id)).rejects.toThrow(
  //       ForbiddenException,
  //     );
  //   });

  //   it('should throw ForbiddenException when client is not authorized to pay for job', async () => {
  //     prismaMock.jobs.findUnique.mockResolvedValue({ ...job });
  //     prismaMock.jobs.update.mockRejectedValue(new NotFoundException());
  //     await expect(service.payForJob(job_id, client_id)).rejects.toThrow(
  //       ForbiddenException,
  //     );
  //   });

  //   it('should mark job as paid and set paid_date', async () => {
  //     const updatedClient = {
  //       id: 1,
  //       balance: 500,
  //     };

  //     const balance = new Prisma.Decimal(500);
  //     prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
  //     prismaMock.jobs.update.mockResolvedValue(job);
  //     prismaMock.profiles.update.mockResolvedValue({ ...profile, balance });
  //     prismaMock.$transaction.mockImplementation(async (callback) =>
  //       callback(prismaMock),
  //     );

  //     const result = await service.payForJob(1, 1);
  //     expect(Number(result.balance)).toEqual(updatedClient.balance);
  //     expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  //     expect(prismaMock.jobs.update).toHaveBeenCalledTimes(1);
  //   });

  //   it('should throw NotFoundException when job is not found or already paid for', async () => {
  //     prismaMock.jobs.findUnique.mockResolvedValue(null);
  //     await expect(service.payForJob(1, 1)).rejects.toThrow(NotFoundException);
  //     expect(prismaMock.jobs.findUnique).toHaveBeenCalledWith({
  //       where: { id: 1, is_paid: false },
  //       include: {
  //         contract: { select: { client_id: true, contractor_id: true } },
  //       },
  //     });
  //   });

  //   it('should successfully pay for a job when client has sufficient balance', async () => {
  //     const updatedClient = {
  //       ...profile,
  //       balance: new Prisma.Decimal(500),
  //     };

  //     prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
  //     prismaMock.profiles.update.mockResolvedValue(updatedClient);
  //     prismaMock.$transaction.mockImplementation(async (callback) =>
  //       callback(prismaMock),
  //     );

  //     const result = await service.payForJob(1, 1);
  //     expect(result).toEqual(updatedClient);
  //     expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  //     expect(prismaMock.jobs.update).toHaveBeenCalledTimes(1);
  //   });

  //   it("should decrement client's balance by job price", async () => {
  //     const updatedClient = {
  //       ...profile,
  //       balance: new Prisma.Decimal(500),
  //     };

  //     prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
  //     prismaMock.profiles.update.mockResolvedValue(updatedClient);
  //     prismaMock.$transaction.mockImplementation(async (callback) =>
  //       callback(prismaMock),
  //     );

  //     const result = await service.payForJob(1, 1);
  //     expect(result).toEqual(updatedClient);
  //     expect(prismaMock.profiles.update).toHaveBeenCalledWith({
  //       where: { id: 1 },
  //       data: { balance: { decrement: job.price } },
  //     });
  //   });

  //   it("should increment contractor's balance by job price when transaction completes successfully", async () => {
  //     const updatedClient = {
  //       ...profile,
  //       balance: new Prisma.Decimal(500),
  //     };

  //     prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
  //     prismaMock.profiles.update.mockResolvedValue(updatedClient);
  //     prismaMock.$transaction.mockImplementation(async (callback) =>
  //       callback(prismaMock),
  //     );

  //     const result = await service.payForJob(1, 1);
  //     expect(result).toEqual(updatedClient);
  //     expect(prismaMock.profiles.update).toHaveBeenCalledWith({
  //       where: { id: mockJob.contract.contractor_id },
  //       data: { balance: { increment: job.price } },
  //     });
  //   });

  //   it('should complete transaction without errors when paying for a job', async () => {
  //     const updatedClient = {
  //       ...profile,
  //       balance: new Prisma.Decimal(500),
  //     };

  //     prismaMock.jobs.findUnique.mockResolvedValue(mockJob);
  //     prismaMock.profiles.update.mockResolvedValue(updatedClient);
  //     prismaMock.$transaction.mockImplementation(async (callback) =>
  //       callback(prismaMock),
  //     );

  //     const result = await service.payForJob(1, 1);
  //     expect(result).toEqual(updatedClient);
  //     expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  //   });

  //   it("should return pre-condition failed exception when client's balance is insufficient", async () => {
  //     const updatedClient = {
  //       ...profile,
  //       balance: new Prisma.Decimal(0),
  //     };

  //     prismaMock.jobs.findUnique.mockResolvedValue({
  //       ...mockJob,
  //       price: new Prisma.Decimal(1000),
  //     });
  //     prismaMock.profiles.update.mockResolvedValue(updatedClient);
  //     prismaMock.$transaction.mockImplementation(async (callback) =>
  //       callback(prismaMock),
  //     );

  //     await expect(service.payForJob(1, 1)).rejects.toThrow(
  //       PreconditionFailedException,
  //     );
  //   });
  // });
});

/**
 * it('should throw BadRequestException if the job has already been paid for during the transaction', async () => {
    const mockJob = {
      id: 1,
      price: new Prisma.Decimal(1000),
      is_paid: false,
      updated_at: new Date(),
      contract: {
        client_id: 1,
        contractor_id: 2,
      },
    };

    prismaMock.jobs.findUnique.mockResolvedValue(mockJob);

    prismaMock.profiles.update.mockResolvedValueOnce({
      id: 1,
      balance: new Prisma.Decimal(10000),
    });

    prismaMock.profiles.update.mockResolvedValueOnce({
      id: 2,
      balance: new Prisma.Decimal(20000),
    });

    prismaMock.jobs.update.mockRejectedValueOnce(
      new PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '3.0.0',
      })
    );

    await expect(jobService.payForJob(1, 1)).rejects.toThrow(BadRequestException);

    expect(prismaMock.jobs.update).toHaveBeenCalledWith({
      where: {
        id: 1,
        is_paid: false,
        updated_at: mockJob.updated_at,
      },
      data: {
        is_paid: true,
        paid_date: expect.any(Date),
      },
    });
  });

  it('should successfully pay for the job and return the updated client profile', async () => {
    const mockJob = {
      id: 1,
      price: new Prisma.Decimal(1000),
      is_paid: false,
      updated_at: new Date(),
      contract: {
        client_id: 1,
        contractor_id: 2,
      },
    };

    const updatedClient = {
      id: 1,
      balance: new Prisma.Decimal(9000), // After payment
    };

    prismaMock.jobs.findUnique.mockResolvedValue(mockJob);

    prismaMock.profiles.update.mockResolvedValueOnce({
      id: 1,
      balance: new Prisma.Decimal(9000),
    });

    prismaMock.profiles.update.mockResolvedValueOnce({
      id: 2,
      balance: new Prisma.Decimal(21000),
    });

    prismaMock.jobs.update.mockResolvedValue({
      ...mockJob,
      is_paid: true,
      paid_date: new Date(),
    });

    const result = await jobService.payForJob(1, 1);

    expect(result).toEqual(updatedClient);
    expect(prismaMock.jobs.update).toHaveBeenCalledWith({
      where: {
        id: 1,
        is_paid: false,
        updated_at: mockJob.updated_at,
      },
      data: {
        is_paid: true,
        paid_date: expect.any(Date),
      },
    });
  });
 */
