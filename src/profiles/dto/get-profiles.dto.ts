import { profiles_role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class GetProfilesDto {
  @IsOptional()
  @IsEnum(profiles_role)
  role: profiles_role;
}
