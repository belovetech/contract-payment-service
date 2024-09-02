import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { PrismaService } from '../prismaClient/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';

@Module({
  controllers: [ContractsController],
  providers: [ContractsService, PrismaService, ProfilesService],
})
export class ContractsModule {}
