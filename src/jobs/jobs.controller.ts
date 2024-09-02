import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  UseGuards,
  Param,
  Logger,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { AuthGuard } from '../middlewares/auth';
import { ApiHeader, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationParam } from 'src/utils/types';

@Controller('jobs')
@ApiTags('Jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  async create(@Body() createJobDto: CreateJobDto) {
    this.logger.log('Start: Creating job');
    try {
      const job = await this.jobsService.create(createJobDto);
      this.logger.log('End: Creating job');
      return {
        message: 'Job created successfully',
        data: job,
      };
    } catch (error) {
      this.logger.error({
        error: error.message,
        msg: "Couldn't create job",
      });
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'profile_id', required: true })
  @ApiQuery({ name: 'page_size', required: false })
  @ApiQuery({ name: 'page', required: false })
  @Get('unpaid')
  async getUnpaidJobs(@Request() { profile }, @Query() query: PaginationParam) {
    try {
      this.logger.log('Start: Retrieving unpaid jobs');
      const jobs = await this.jobsService.getUnpaidJobs(profile.id, query);
      this.logger.log('End: unpaid jobs retrieved');
      return {
        message: 'Unpaid jobs retrieved successfully',
        data: jobs,
      };
    } catch (error) {
      this.logger.error({
        error: error.message,
        msg: "Couldn't retrieve unpaid jobs",
      });
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Post(':job_id/pay')
  @ApiParam({ name: 'job_id', required: true })
  @ApiHeader({ name: 'profile_id', required: true })
  async payForJob(
    @Request() { profile },
    @Param('job_id', ParseIntPipe) job_id: number,
  ) {
    try {
      const clientProfile = await this.jobsService.payForJob(
        job_id,
        profile.id,
      );
      return {
        message: 'Job paid successfully',
        data: clientProfile,
      };
    } catch (error) {
      this.logger.error({
        error: error.message,
        msg: "Couldn't pay for job",
      });
      throw error;
    }
  }
}
