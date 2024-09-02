import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { contracts_status, PrismaClient, profiles_role } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ContractsService } from './contracts.service';
import { PrismaService } from '../prismaClient/prisma.service';
import { mockProfile, mockContract, query, mockContracts } from '../test-utils';
import PaginationUtil from '../utils/pagination.util';

describe('ContractsService', () => {
  let service: ContractsService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractsService, PrismaService, PaginationUtil],
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
      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.profiles.findUnique.mockResolvedValue(mockProfile);
        prismaMock.contracts.create.mockResolvedValue(mockContract);
        return callback(prismaMock);
      });

      const createContractDto = {
        terms: 'some terms',
        status: contracts_status.in_progress,
        contractor_id: 1,
      };

      const result = await service.create(createContractDto, 1);
      expect(result).toEqual(mockContract);
      expect(prismaMock.profiles.findUnique).toHaveBeenCalledWith({
        where: {
          id: createContractDto.contractor_id,
          role: profiles_role.contractor,
        },
        select: {
          id: true,
        },
      });
      expect(prismaMock.contracts.create).toHaveBeenCalledWith({
        data: { ...createContractDto, client_id: 1 },
      });
    });

    it('should throw NotFoundException when the contractor does not exist', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.profiles.findUnique.mockResolvedValue(null);
        return callback(prismaMock);
      });

      const createContractDto = {
        terms: 'some terms',
        status: contracts_status.in_progress,
        contractor_id: 1,
      };

      await expect(service.create(createContractDto, 1)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.profiles.findUnique).toHaveBeenCalledWith({
        where: {
          id: createContractDto.contractor_id,
          role: profiles_role.contractor,
        },
        select: {
          id: true,
        },
      });
      expect(prismaMock.contracts.create).not.toHaveBeenCalled();
    });
  });

  describe('getContractById', () => {
    it('should return a contract when a valid id is provided', async () => {
      prismaMock.contracts.findFirst.mockResolvedValue(mockContract);
      const result = await service.getContractById(1, 1);
      expect(result).toEqual(mockContract);
      expect(prismaMock.contracts.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          OR: [{ client_id: 1 }, { contractor_id: 1 }],
        },
        include: {
          jobs: {
            select: {
              id: true,
              description: true,
              price: true,
              is_paid: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when an invalid id is provided', async () => {
      prismaMock.contracts.findFirst.mockResolvedValue(null);
      await expect(service.getContractById(0, 1)).rejects.toThrow(
        new NotFoundException(
          'Contract not found or you are not authorized to view it',
        ),
      );
    });

    it('should throw ForbiddenException when the profile is not part of the contract', async () => {
      prismaMock.contracts.findUnique.mockResolvedValue(mockContract);
      await expect(service.getContractById(1, 2)).rejects.toThrow(
        new ForbiddenException(
          'Contract not found or you are not authorized to view it',
        ),
      );
    });
  });

  describe('getContracts', () => {
    it('should return contracts with pagination', async () => {
      prismaMock.contracts.findMany.mockResolvedValue(mockContracts);
      prismaMock.contracts.count.mockResolvedValue(mockContracts.length);
      const query = { page: 1, page_size: 10 };
      const result = await service.getContracts(1, query);

      expect(result.contracts).toEqual(mockContracts);
      expect(result.pagination).toEqual({
        total_items: mockContracts.length,
        total_page: 1,
        current_page: 1,
        page_size: 10,
      });

      expect(prismaMock.contracts.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ client_id: 1 }, { contractor_id: 1 }],
          status: {
            not: contracts_status.terminated,
          },
        },
        take: 10,
        skip: 0,
        orderBy: { created_at: 'desc' },
      });

      expect(prismaMock.contracts.count).toHaveBeenCalledWith({
        where: {
          OR: [{ client_id: 1 }, { contractor_id: 1 }],
          status: {
            not: contracts_status.terminated,
          },
        },
      });
    });

    it('should return empty results if no contracts are found', async () => {
      prismaMock.contracts.findMany.mockResolvedValue([]);
      prismaMock.contracts.count.mockResolvedValue(0);

      const query = { page: 1, page_size: 10 };
      const result = await service.getContracts(1, query);

      expect(result.contracts).toEqual([]);
      expect(result.pagination).toEqual({
        total_items: 0,
        total_page: 0,
        current_page: 1,
        page_size: 10,
      });

      expect(prismaMock.contracts.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ client_id: 1 }, { contractor_id: 1 }],
          status: {
            not: contracts_status.terminated,
          },
        },
        take: 10,
        skip: 0,
        orderBy: { created_at: 'desc' },
      });

      expect(prismaMock.contracts.count).toHaveBeenCalledWith({
        where: {
          OR: [{ client_id: 1 }, { contractor_id: 1 }],
          status: {
            not: contracts_status.terminated,
          },
        },
      });
    });

    it('should return an empty array when an invalid profile ID is provided', async () => {
      prismaMock.contracts.findMany.mockResolvedValue([]);
      const result = await service.getContracts(1, query);
      expect(result.contracts).toEqual([]);
    });

    it('it should not return any terminated contracts', async () => {
      prismaMock.contracts.findMany.mockResolvedValue(mockContracts);
      const result = await service.getContracts(1, query);
      expect(result.contracts).toEqual(mockContracts);
    });

    it('should test pagination', async () => {
      prismaMock.contracts.findMany.mockResolvedValue(mockContracts);
      prismaMock.contracts.count.mockResolvedValue(10);
      const result = await service.getContracts(1, query);
      expect(result.contracts).toEqual(mockContracts);
      expect(result.pagination).toHaveProperty('total_items', 10);
      expect(result.pagination).toHaveProperty('total_page', 5);
      expect(result.pagination).toHaveProperty('current_page', 1);
      expect(result.pagination).toHaveProperty('page_size', 2);
    });
  });
});
