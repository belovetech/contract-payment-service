import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { contracts_status, PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prismaClient/prisma.service';
import { profile, contract, listOfContracts } from '../test-utils/data';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ContractsService', () => {
  let service: ContractsService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractsService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get(ContractsService);
    prismaMock = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create contact', () => {
    it('should create a contract when valid contractor and client IDs are provided', async () => {
      prismaMock.profiles.findUnique.mockResolvedValue(profile);
      prismaMock.contracts.create.mockResolvedValue(contract);

      const createContractDto = {
        terms: 'some terms',
        status: contracts_status.in_progress,
        contractor_id: 1,
      };

      const result = await service.create(createContractDto, 1);
      expect(result).toEqual(contract);
      expect(prismaMock.profiles.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaMock.contracts.create).toHaveBeenCalledWith({
        data: { ...createContractDto, client_id: 1 },
      });
    });

    it('should throw NotFoundException when the contractor does not exist', async () => {
      prismaMock.profiles.findUnique.mockResolvedValue(null);
      prismaMock.contracts.create.mockRejectedValue(new NotFoundException());

      const createContractDto = {
        terms: 'some terms',
        status: contracts_status.in_progress,
        contractor_id: 1,
      };

      await expect(service.create(createContractDto, 1)).rejects.toThrow(
        new NotFoundException(),
      );
      expect(prismaMock.profiles.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('getContractById', () => {
    it('should return a contract when a valid id is provided', async () => {
      prismaMock.contracts.findUnique.mockResolvedValue(contract);
      const result = await service.getContractById(1, 1);
      expect(result).toEqual(contract);
    });

    it('should throw NotFoundException when an invalid id is provided', async () => {
      prismaMock.contracts.findUnique.mockResolvedValue(null);
      await expect(service.getContractById(0, 1)).rejects.toThrow(
        new NotFoundException('Contract not found'),
      );
    });

    it('should throw ForbiddenException when the profile is not part of the contract', async () => {
      prismaMock.contracts.findUnique.mockResolvedValue(contract);
      await expect(service.getContractById(1, 2)).rejects.toThrow(
        new ForbiddenException('You are not authorized to view this contract'),
      );
    });
  });

  describe('getContracts', () => {
    it('should return contracts when a valid profile ID is provided', async () => {
      prismaMock.contracts.findMany.mockResolvedValue([contract]);
      const result = await service.getContracts(1);
      expect(result).toEqual([contract]);
    });

    it('should return an empty array when an invalid profile ID is provided', async () => {
      prismaMock.contracts.findMany.mockResolvedValue([]);
      const result = await service.getContracts(1);
      expect(result).toEqual([]);
    });

    it('should return an empty array when an invalid profile ID is provided', async () => {
      prismaMock.contracts.findMany.mockResolvedValue([]);
      const result = await service.getContracts(1);
      expect(result).toEqual([]);
    });

    it('it should not return any terminated contracts', async () => {
      prismaMock.contracts.findMany.mockResolvedValue(listOfContracts);
      const result = await service.getContracts(1);
      expect(result).toEqual(listOfContracts);
    });
  });
});
