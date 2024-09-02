import { ApiProperty } from '@nestjs/swagger';
import { profiles_role } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateProfileDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'John' })
  first_name: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Software Engineer' })
  profession: string;

  @IsEnum(profiles_role)
  @ApiProperty({ example: 'contractor' })
  role: profiles_role;
}
