import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  contract_id: number;
}
