import { ApiProperty } from '@nestjs/swagger';
import { contracts_status } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateContractDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Contract terms' })
  terms: string;

  @IsEnum(contracts_status)
  @ApiProperty({ example: contracts_status.new })
  status: contracts_status;

  @IsNotEmpty()
  @ApiProperty({ example: 1 })
  contractor_id: number;
}
