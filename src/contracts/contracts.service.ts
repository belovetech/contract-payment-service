import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { PrismaService } from '../prismaClient/prisma.service';
import { contracts, contracts_status, profiles_role } from '@prisma/client';
import { Pagination, PaginationParam } from 'src/utils/types';
import PaginationUtil from '../utils/pagination.util';

@Injectable()
export class ContractsService {
  constructor(
    private prisma: PrismaService,
    private pagination: PaginationUtil,
  ) {}
  create(dto: CreateContractDto, client_id: number): Promise<contracts> {
    return this.prisma.$transaction(async (trx) => {
      const isValidContractor = await trx.profiles.findUnique({
        where: {
          id: dto.contractor_id,
          role: profiles_role.contractor,
        },
        select: {
          id: true,
        },
      });

      if (!isValidContractor) {
        throw new NotFoundException('Contractor does not exist');
      }

      return trx.contracts.create({
        data: {
          ...dto,
          client_id: client_id,
        },
      });
    });
  }

  async getContractById(id: number, profileId: number): Promise<contracts> {
    const contract = await this.prisma.contracts.findFirst({
      where: {
        id,
        OR: [{ client_id: profileId }, { contractor_id: profileId }],
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

    if (!contract) {
      throw new NotFoundException(
        'Contract not found or you are not authorized to view it',
      );
    }

    return contract;
  }

  async getContracts(
    profileId: number,
    query: PaginationParam,
  ): Promise<{ contracts: contracts[]; pagination: Pagination }> {
    const { take, skip } = this.pagination.calculatePagination(query);
    const whereQuery = {
      OR: [{ client_id: profileId }, { contractor_id: profileId }],
      status: {
        not: contracts_status.terminated,
      },
    };

    const [contracts, total] = await Promise.all([
      this.prisma.contracts.findMany({
        where: whereQuery,
        take,
        skip,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.contracts.count({
        where: whereQuery,
      }),
    ]);

    const pagination = this.pagination.getPagination(total, take, skip);
    return { contracts, pagination };
  }
}
