import { Controller, Post, Body } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

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
}
