import { contracts_status } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateContractDto {
  @IsNotEmpty()
  terms: string;

  @IsEnum(contracts_status)
  status: contracts_status;

  @IsNotEmpty()
  contractor_id: number;

  //   @IsNotEmpty()
  //   client_id: number;
}
