import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { AuthGuard } from 'src/profiles/middlewares/auth';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  async create(@Body() createJobDto: CreateJobDto) {
    const job = await this.jobsService.create(createJobDto);
    return {
      message: 'Job created successfully',
      data: job,
    };
  }

  @UseGuards(AuthGuard)
  @Get('unpaid')
  async getUnpaidJobs(@Request() { profile }) {
    const jobs = await this.jobsService.getUnpaidJobs(profile.id);
    return {
      message: 'Unpaid jobs retrieved successfully',
      data: jobs,
    };
  }

  @UseGuards(AuthGuard)
  @Post(':job_id/pay')
  async payForJob(@Request() { profile }, @Param('job_id') job_id: string) {
    const { updatedClient } = await this.jobsService.payForJob(
      Number(job_id),
      profile.id,
    );
    return {
      message: 'Job paid successfully',
      data: {
        updatedClient,
      },
    };
  }
}
