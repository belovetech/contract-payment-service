import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Logger,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { AuthGuard } from './middlewares/auth';

@Controller('profiles')
export class ProfilesController {
  private readonly logger = new Logger(ProfilesController.name);
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  async create(@Body() payload: CreateProfileDto) {
    this.logger.log('Start: Creating profile');
    const profile = await this.profilesService.create(payload);
    this.logger.log('End: Creating profile');
    return {
      message: 'Profile created successfully',
      data: profile,
    };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@Request() { profile }) {
    this.logger.log('Start: Retrieving profile');
    return {
      message: 'Profile retrieved successfully',
      data: profile,
    };
  }
}
