import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { PrismaService } from 'src/prismaClient/prisma.service';
import { ProfilesService } from 'src/profiles/profiles.service';

@Module({
  controllers: [ContractsController],
  providers: [ContractsService, PrismaService, ProfilesService],
})
export class ContractsModule {}
