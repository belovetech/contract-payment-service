import { Controller, Get, Query, Logger } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from '../types/response.type';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('admin')
@ApiTags('Admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);
  constructor(private readonly adminService: AdminService) {}

  @Get('best-profession')
  @ApiQuery({ name: 'start', required: true, example: '2024-08-01' })
  @ApiQuery({ name: 'end', required: true, example: '2024-09-31' })
  @ApiOperation({
    description: 'Fetch the best profession based on total earnings',
  })
  async getBestProfession(
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<Response> {
    try {
      this.logger.log('Start: Retrieving best profession');
      const profession = await this.adminService.getBestProfession(start, end);
      this.logger.log('End: Best profession retrieved');
      return {
        message: 'Best profession retrieved successfully',
        data: profession,
      };
    } catch (error) {
      this.logger.error({
        error: error.message,
        msg: "Couldn't retrieve best profession",
      });
      throw error;
    }
  }

  @Get('best-clients')
  @ApiQuery({ name: 'start', required: true, example: '2024-08-01' })
  @ApiQuery({ name: 'end', required: true, example: '2024-09-31' })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 2' })
  @ApiOperation({
    description: 'Fetch the best clients based on total amount paid',
  })
  async getBestClients(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('limit') limit?: number,
  ): Promise<Response> {
    try {
      this.logger.log('Start: Retrieving best clients');
      const clients = await this.adminService.getBestClients(start, end, limit);
      this.logger.log('End: Best clients retrieved');
      return {
        message: 'Best clients retrieved successfully',
        data: clients,
      };
    } catch (error) {
      this.logger.error({
        error: error.message,
        msg: "Couldn't retrieve best clients",
      });
      throw error;
    }
  }
}
