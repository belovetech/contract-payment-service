import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { PrismaService } from 'src/prismaClient/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

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
}
