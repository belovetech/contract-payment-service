import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { EmptyLogger } from '../test-utils/empty.logger';
import { ProfilesService } from '../profiles/profiles.service';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';
import { mockProfile } from '../test-utils/data.mock';
import { DepositDto } from './dto/deposit.dto';
import { NotFoundException } from '@nestjs/common';

describe('BalancesController', () => {
  let controller: BalancesController;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalancesController],
      providers: [BalancesService, ProfilesService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    controller = module.get<BalancesController>(BalancesController);
    prismaMock = module.get(PrismaService);

    module.useLogger(new EmptyLogger());
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('DepositFunds', () => {
    it('should deposit funds', async () => {
      const total = new Prisma.Decimal(300);
      prismaMock.profiles.findFirst.mockResolvedValue(mockProfile);
      prismaMock.profiles.update.mockResolvedValue({
        ...mockProfile,
        balance: total,
      });
      prismaMock.jobs.aggregate.mockResolvedValue({
        _sum: { price: total },
      } as any);

      const user_id = 1;
      const dto: DepositDto = { amount: 75 };
      const result = await controller.depositFunds(
        { profile: mockProfile },
        dto,
        user_id,
      );
      expect(result.data.balance).toEqual(total);
    });

    it('should throw NotFoundException when the profile does not exist', async () => {
      const total = new Prisma.Decimal(300);
      prismaMock.profiles.findUnique.mockResolvedValue(null);
      prismaMock.profiles.update.mockRejectedValue(new NotFoundException());
      prismaMock.jobs.aggregate.mockResolvedValue({
        _sum: { price: total },
      } as any);

      await expect(
        controller.depositFunds({ profile: mockProfile }, { amount: 0 }, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
