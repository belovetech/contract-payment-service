import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { PrismaService } from '../prismaClient/prisma.service';
import { contracts, contracts_status } from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}
  create(createContractDto: CreateContractDto, client_id: number): Promise<contracts> {
    const isValidContractor = this.prisma.profiles.findUnique({
      where: {
        id: createContractDto.contractor_id,
      },
    });

    if (!isValidContractor) {
      throw new NotFoundException('Contractor does not exist');
    }

    return this.prisma.contracts.create({
      data: {
        ...createContractDto,
        client_id: client_id,
      },
    });
  }

  async getContractById(id: number, profileId: number): Promise<contracts> {
    const contract = await this.prisma.contracts.findUnique({
      where: {
        id,
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
      throw new NotFoundException('Contract not found');
    }

    if (
      contract.client_id === profileId ||
      contract.contractor_id === profileId
    ) {
      return contract;
    }

    throw new ForbiddenException(
      'You are not authorized to view this contract',
    );
  }

  async getContracts(profileId: number): Promise<contracts[]> {
    return this.prisma.contracts.findMany({
      where: {
        OR: [
          {
            client_id: profileId,
          },
          {
            contractor_id: profileId,
          },
        ],
        status: {
          not: contracts_status.terminated,
        },
      },
    });
  }
}
