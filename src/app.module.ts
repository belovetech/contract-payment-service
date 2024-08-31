import { Module } from '@nestjs/common';
import { ProfilesModule } from './profiles/profiles.module';
import { ContractsModule } from './contracts/contracts.module';

@Module({
  imports: [ProfilesModule, ContractsModule],
})
export class AppModule {}
