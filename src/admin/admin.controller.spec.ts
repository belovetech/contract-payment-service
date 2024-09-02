import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { EmptyLogger } from '../test-utils/empty.logger';
import { ProfilesService } from '../profiles/profiles.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [AdminService, ProfilesService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    controller = module.get<AdminController>(AdminController);
    prismaMock = module.get(PrismaService);

    module.useLogger(new EmptyLogger());
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GetBestProfession', () => {
    it('should return the best profession when given a valid date range', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { profession: 'Engineer', total_earnings: 1000 },
      ]);

      const result = await controller.getBestProfession(
        '2023-01-01',
        '2023-12-31',
      );

      expect(result).toEqual({
        message: 'Best profession retrieved successfully',
        data: { profession: 'Engineer', total_earnings: 1000 },
      });
    });

    it('should throw an error when start or end date is missing', async () => {
      const mockAdminService = { getBestProfession: jest.fn() };
      await expect(
        controller.getBestProfession('', '2023-12-31'),
      ).rejects.toThrow();
      await expect(
        controller.getBestProfession('2023-01-01', ''),
      ).rejects.toThrow();
      expect(mockAdminService.getBestProfession).not.toHaveBeenCalled();
    });
  });

  describe('GetBestClients', () => {
    it('should return the best clients when given a valid date range', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        { client_id: 1, total_paid: 1000 },
        { client_id: 2, total_paid: 500 },
      ]);

      const startDate = '2023-01-01';
      const endDate = '2023-12-31';
      const result = await controller.getBestClients(startDate, endDate);

      expect(result).toEqual({
        message: 'Best clients retrieved successfully',
        data: [
          { client_id: 1, total_paid: 1000 },
          { client_id: 2, total_paid: 500 },
        ],
      });
    });

    it('should throw an error when start or end date is missing', async () => {
      const mockAdminService = { getBestClients: jest.fn() };
      await expect(
        controller.getBestClients('', '2023-12-31'),
      ).rejects.toThrow();
      await expect(
        controller.getBestClients('2023-01-01', ''),
      ).rejects.toThrow();
      expect(mockAdminService.getBestClients).not.toHaveBeenCalled();
    });
  });
});
