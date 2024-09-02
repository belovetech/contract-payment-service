import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { PrismaService } from '../prismaClient/prisma.service';
import { contracts_status, jobs, Prisma, profiles } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto): Promise<jobs> {
    const isValidContract = await this.prisma.contracts.findUnique({
      where: {
        id: createJobDto.contract_id,
      },
    });

    if (!isValidContract) {
      throw new NotFoundException('Contract does not exist');
    }

    return await this.prisma.jobs.create({
      data: {
        ...createJobDto,
        is_paid: false,
      },
    });
  }

  async getUnpaidJobs(profile_id: number): Promise<jobs[]> {
    return this.prisma.jobs.findMany({
      where: {
        contract: {
          OR: [
            {
              client_id: profile_id,
            },
            {
              contractor_id: profile_id,
            },
          ],
          status: contracts_status.in_progress,
        },
        is_paid: false,
      },
    });
  }

  async payForJob(job_id: number, client_id: number): Promise<profiles> {
    const job = await this.prisma.jobs.findUnique({
      where: {
        id: job_id,
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

    if (!job) {
      throw new NotFoundException('Job not found or already paid for');
    }

    if (job.contract?.client_id !== client_id) {
      throw new ForbiddenException(
        'You are not authorized to pay for this job',
      );
    }

    return this.prisma.$transaction(async (trx) => {
      const updatedClient = await trx.profiles.update({
        where: {
          id: client_id,
        },
        data: {
          balance: {
            decrement: job.price,
          },
        },
      });

      if (updatedClient.balance < new Prisma.Decimal(0)) {
        throw new PreconditionFailedException('Insufficient balance');
      }

      await trx.profiles.update({
        where: {
          id: job.contract.contractor_id,
        },
        data: {
          balance: {
            increment: job.price,
          },
        },
      });

      try {
        await trx.jobs.update({
          where: {
            id: job_id,
            is_paid: false,
            updated_at: job.updated_at,
          },
          data: {
            is_paid: true,
            paid_date: new Date(),
          },
        });
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new BadRequestException('Job has already been paid for');
        }
        throw error;
      }
      return updatedClient;
    });
  }
}
