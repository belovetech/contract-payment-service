import { Module } from '@nestjs/common';
import { ProfilesModule } from './profiles/profiles.module';
import { ContractsModule } from './contracts/contracts.module';
import { JobsModule } from './jobs/jobs.module';
import { BalancesModule } from './balances/balances.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [ProfilesModule, ContractsModule, JobsModule, BalancesModule, AdminModule],
})
export class AppModule {}
