import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaService } from 'src/prismaClient/prisma.service';
import { ProfilesService } from 'src/profiles/profiles.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, PrismaService, ProfilesService],
})
export class JobsModule {}
