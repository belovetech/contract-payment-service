import { profiles_role } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class GetProfilesDto {
  @IsNotEmpty()
  @IsEnum(profiles_role)
  role: profiles_role;
}
