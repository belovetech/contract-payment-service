import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Job description' })
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 1000 })
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 1 })
  contract_id: number;
}
