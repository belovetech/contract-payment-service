import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../prismaClient/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(payload: CreateProfileDto) {
    const profile = await this.prisma.profiles.create({
      data: {
        first_name: payload.first_name,
        last_name: payload.last_name,
        profession: payload.profession,
        role: payload.role,
        balance: 0,
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
}
