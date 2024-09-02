import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../prismaClient/prisma.service';
import { profiles_role } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(createProfileDto: CreateProfileDto) {
    const profile = await this.prisma.profiles.create({
      data: {
        ...createProfileDto,
      },
    });
    return profile;
  }

  async getProfileById(id: number) {
    const profile = await this.prisma.profiles.findUnique({
      where: {
        id,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async getAllProfiles(role: profiles_role) {
    return this.prisma.profiles.findMany({
      where: {
        role,
      },
    });
  }
}
