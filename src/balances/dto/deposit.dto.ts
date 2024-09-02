import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DepositDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 1000 })
  amount: number;
}
