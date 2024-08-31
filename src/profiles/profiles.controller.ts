import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { AuthGuard } from './middlewares/auth';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  async create(@Body() payload: CreateProfileDto) {
    const profile = await this.profilesService.create(payload);
    return {
      message: 'Profile created successfully',
      data: profile,
    };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@Request() { profile }) {
    return {
      message: 'Profile retrieved successfully',
      data: profile,
    };
  }
}
