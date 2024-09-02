import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { contracts_status, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { EmptyLogger } from '../test-utils/empty.logger';
import { ProfilesService } from '../profiles/profiles.service';
import {
  profile,
  contract,
  listOfContracts,
  query,
  pagination,
} from '../test-utils';
import { CreateContractDto } from './dto/create-contract.dto';
import PaginationUtil from '../utils/pagination.util';

describe('ContractsController', () => {
  let controller: ContractsController;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractsController],
      providers: [
        ContractsService,
        ProfilesService,
        PrismaService,
        PaginationUtil,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    controller = module.get<ContractsController>(ContractsController);
    prismaMock = module.get(PrismaService);

    module.useLogger(new EmptyLogger());
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create contract', () => {
    it('should create a contract when valid data is provided', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.profiles.findUnique.mockResolvedValue(profile);
        prismaMock.contracts.create.mockResolvedValue(contract);
        return callback(prismaMock);
      });

      const payload: CreateContractDto = {
        terms: 'some terms',
        status: contracts_status.in_progress,
        contractor_id: 1,
      };

      const result = await controller.create(payload, { profile });
      expect(result).toEqual({
        message: 'Contract created successfully',
        data: contract,
      });
    });
    it('should throw BadRequestException when invalid data is provided', async () => {
      const payload = {
        terms: '',
        status: contracts_status.in_progress,
        contractor_id: 1,
      };
      await expect(controller.create(payload, { profile })).rejects.toThrow();
    });

    it('should throw UnauthorizedException when the client does not exist or profile id is not included in the header', async () => {
      const payload = {
        terms: 'some terms',
        status: contracts_status.in_progress,
        contractor_id: 1,
      };
      prismaMock.profiles.findUnique.mockResolvedValue(null);
      await expect(
        controller.create(payload, { profile: null }),
      ).rejects.toThrow();
    });
  });

  describe('getContractById', () => {
    it('should return a contract when a valid id is provided', async () => {
      prismaMock.contracts.findFirst.mockResolvedValue(contract);
      const result = await controller.getContractById(1, { profile });
      expect(result).toEqual({
        message: 'Contract retrieved successfully',
        data: contract,
      });
    });

    it('should throw NotFoundException when an invalid id is provided', async () => {
      prismaMock.contracts.findFirst.mockResolvedValue(null);
      await expect(
        controller.getContractById(0, { profile }),
      ).rejects.toThrow();
    });

    it('should throw UnauthorizedException when the client is not authorized to view the contract', async () => {
      prismaMock.contracts.findUnique.mockResolvedValue(contract);
      await expect(
        controller.getContractById(1, { profile: { id: 2 } }),
      ).rejects.toThrow();
    });
  });

  describe('getContracts', () => {
    it('should return contracts when a valid profile id is provided', async () => {
      prismaMock.contracts.findMany.mockResolvedValue(listOfContracts);
      prismaMock.contracts.count.mockResolvedValue(10);
      const result = await controller.getContracts({ profile }, query);
      expect(result.data.contracts).toEqual(listOfContracts);
    });

    it('should throw UnauthorizedException when the profile id is not included in the header', async () => {
      await expect(
        controller.getContracts({ profile: null }, query),
      ).rejects.toThrow();
    });
  });
});
