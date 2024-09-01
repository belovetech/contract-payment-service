import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from '../types/response.type';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('best-profession')
  async getBestProfession(
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<Response> {
    const profession = await this.adminService.getBestProfession(start, end);
    return {
      message: 'The profession that earned the most money',
      data: { profession },
    };
  }

  @Get('best-clients')
  async getBestClients(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('limit') limit: number,
  ): Promise<Response> {
    const clients = await this.adminService.getBestClients(start, end, limit);
    return {
      message: 'The clients that paid the most money',
      data: clients,
    };
  }
}
