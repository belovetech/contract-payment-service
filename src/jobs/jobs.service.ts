import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { PrismaService } from 'src/prismaClient/prisma.service';
import { contracts_status } from '@prisma/client';
import { ProfilesService } from 'src/profiles/profiles.service';
import { Job } from './entities/job.entity';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private profileService: ProfilesService,
  ) {}

  async create(createJobDto: CreateJobDto) {
    const isValidContract = await this.prisma.contracts.findUnique({
      where: {
        id: createJobDto.contract_id,
      },
    });

    if (!isValidContract) {
      throw new NotFoundException('Contract does not exist');
    }

    return this.prisma.jobs.create({
      data: {
        ...createJobDto,
        is_paid: false,
      },
    });
  }

  async getUnpaidJobs(profile_id: number) {
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

  async payForJob(job_id: number, profile_id: number) {
    const job = await this.prisma.jobs.findUnique({
      where: {
        id: job_id,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const contract = await this.prisma.contracts.findUnique({
      where: {
        id: job.contract_id,
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.client_id !== profile_id) {
      throw new NotFoundException('You are not authorized to pay for this job');
    }

    if (job.is_paid) {
      throw new NotFoundException('Job has already been paid for');
    }

    const client = await this.profileService.getProfileById(profile_id);

    if (client.balance < job.price) {
      throw new NotFoundException('Insufficient balance');
    }

    const [clientProfile, contractorProfile, _] =
      await this.prisma.$transaction([
        this.prisma.profiles.update({
          where: {
            id: profile_id,
          },
          data: {
            balance: {
              decrement: job.price,
            },
          },
        }),

        this.prisma.profiles.update({
          where: {
            id: contract.contractor_id,
          },
          data: {
            balance: {
              increment: job.price,
            },
          },
        }),

        this.prisma.jobs.update({
          where: {
            id: job_id,
          },
          data: {
            is_paid: true,
          },
        }),
      ]);
    return { clientProfile, contractorProfile };
  }
}
