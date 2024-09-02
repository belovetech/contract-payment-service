import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';
import { AdminService } from './admin.service';
import { BadRequestException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, ProfilesService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get(AdminService);
    prismaMock = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Validate start and end date Query Params', () => {
    it('should return correct Date objects when valid start and end dates are provided', () => {
      const start = '2023-01-01';
      const end = '2023-12-31';

      const result = service.validateDate(start, end);

      expect(result.startDate).toEqual(new Date(start));
      expect(result.endDate).toEqual(new Date(end));
    });

    it('should throw BadRequestException when invalid start date is provided', () => {
      const start = '2023-13-01';
      const end = '2023-12-31';
      expect(() => service.validateDate(start, end)).toThrow();
    });

    it('should throw BadRequestException if either start or end date is not provided', () => {
      const start = '2023-01-01';
      const end = '';
      expect(() => service.validateDate(start, end)).toThrow();
    });
  });

  describe('Best Professions', () => {
    it('should return the best profession when given a valid date range', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { profession: 'Engineer', total_earnings: 1000 },
      ]);

      const result = await service.getBestProfession(
        '2023-01-01',
        '2023-12-31',
      );
      expect(result?.profession).toEqual('Engineer');
      expect(result?.total_earnings).toEqual(1000);
    });

    it('should throw BadRequestException when start date is later than end date', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { profession: 'Engineer', total_earnings: 1000 },
      ]);
      await expect(
        service.getBestProfession('2023-12-31', '2023-01-01'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Best Clients', () => {
    it('should return the best clients when given a valid date range', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { client_id: 1, full_name: 'John Doe', total_paid: 1000 },
        { client_id: 2, full_name: 'Jane Doe', total_paid: 2000 },
      ]);

      const result = await service.getBestClients('2023-01-01', '2023-12-31');
      expect(result).toEqual([
        { client_id: 1, full_name: 'John Doe', total_paid: 1000 },
        { client_id: 2, full_name: 'Jane Doe', total_paid: 2000 },
      ]);
    });

    it('should throw BadRequestException when start date is later than end date', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { client_id: 1, full_name: 'John Doe', total_paid: 1000 },
        { client_id: 2, full_name: 'Jane Doe', total_paid: 2000 },
      ]);
      await expect(
        service.getBestClients('invalid_date', '2023-01-01'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
