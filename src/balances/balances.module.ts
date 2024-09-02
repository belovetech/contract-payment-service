import { Module } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { BalancesController } from './balances.controller';
import { PrismaService } from '../prismaClient/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';

@Module({
  controllers: [BalancesController],
  providers: [BalancesService, PrismaService, ProfilesService],
})
export class BalancesModule {}
