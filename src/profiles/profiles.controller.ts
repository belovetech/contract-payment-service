import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Logger,
  Query,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { AuthGuard } from '../middlewares/auth';
import { GetProfilesDto } from './dto/get-profiles.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('profiles')
@ApiTags('Profiles')
export class ProfilesController {
  private readonly logger = new Logger(ProfilesController.name);
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  async create(@Body() payload: CreateProfileDto) {
    try {
      this.logger.log('Start: Creating profile');
      const profile = await this.profilesService.create(payload);
      this.logger.log('End: Creating profile');
      return {
        message: 'Profile created successfully',
        data: profile,
      };
    } catch (error) {
      this.logger.error({
        error: error.message,
        msg: "Couldn't create profile",
      });
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'profile_id', required: true })
  @Get('me')
  async getProfile(@Request() { profile }) {
    try {
      this.logger.log('Start: Retrieving profile');
      return {
        message: 'Profile retrieved successfully',
        data: profile,
      };
    } catch (error) {
      this.logger.error({
        error: error.message,
        msg: "Couldn't retrieve profile",
      });
      throw error;
    }
  }

  @Get()
  @ApiCreatedResponse({ type: GetProfilesDto })
  @ApiQuery({ name: 'role', required: false, enum: ['client', 'contractor'] })
  async getAllProfiles(@Query() { role }: GetProfilesDto) {
    try {
      this.logger.log('Start: Retrieving all profiles');
      const profiles = await this.profilesService.getAllProfiles(role);
      this.logger.log('End: Profiles retrieved');
      return {
        message: 'Profiles retrieved successfully',
        count: profiles.length,
        data: profiles,
      };
    } catch (error) {
      this.logger.error({
        error: error.message,
        msg: "Couldn't retrieve profiles",
      });
      throw error;
    }
  }
}
