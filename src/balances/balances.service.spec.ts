import { Test, TestingModule } from '@nestjs/testing';
import { BalancesService } from './balances.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { mockProfile } from '../test-utils';

describe('BalancesService', () => {
  let service: BalancesService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BalancesService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get(BalancesService);
    prismaMock = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('DepositFund', () => {
    it('should deposit funds when amount is within the allowed limit', async () => {
      const total = new Prisma.Decimal(300);
      const balance = 200;
      prismaMock.profiles.findFirst.mockResolvedValue(mockProfile);
      prismaMock.profiles.update.mockResolvedValue({
        ...mockProfile,
        balance: total,
      });
      prismaMock.jobs.aggregate.mockResolvedValue({
        _sum: { price: total },
      } as any);
      const result = await service.depositFunds(
        { ...mockProfile, balance },
        70,
      );
      expect(result.balance).toBe(total);
    });

    it("should throw NotFoundException when the user's balance is not found", async () => {
      prismaMock.profiles.findFirst.mockResolvedValue(null);
      await expect(
        service.depositFunds({ ...mockProfile, balance: 10 }, 100),
      ).rejects.toThrow();
    });

    it('should throw PreconditionFailedException when the amount is greater than the allowed deposit limit', async () => {
      const total = new Prisma.Decimal(300);
      prismaMock.profiles.findFirst.mockResolvedValue(mockProfile);
      prismaMock.jobs.aggregate.mockResolvedValue({
        _sum: { price: total },
      } as any);
      await expect(
        service.depositFunds({ ...mockProfile, balance: 10 }, 100),
      ).rejects.toThrow();
    });
  });
});
