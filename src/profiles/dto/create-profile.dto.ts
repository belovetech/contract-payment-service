import { profiles_role } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateProfileDto {
  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsNotEmpty()
  profession: string;

  @IsEnum(profiles_role)
  role: profiles_role;
}
