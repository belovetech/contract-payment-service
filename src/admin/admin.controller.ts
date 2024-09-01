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
    const profession = await this.adminService.findBestProfession(start, end);
    return {
      message: 'The profession that earned the most money',
      data: { profession },
    };
  }
}
