import { Module, Global } from '@nestjs/common';
import PaginationUtil from './pagination.util';

@Global()
@Module({
  providers: [PaginationUtil],
  exports: [PaginationUtil],
})
export class UtilityModule {}
