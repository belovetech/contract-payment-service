import { profiles_role } from '@prisma/client';

export interface Profile {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  profession: string;
  balance: number;
  role: profiles_role;
  created_at: Date;
  updated_at: Date;
}
