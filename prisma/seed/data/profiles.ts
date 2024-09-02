import { profiles_role } from '@prisma/client';

interface Profile {
  first_name: string;
  last_name: string;
  profession: string;
  balance: number;
  role: profiles_role;
}

export const clients: Profile[] = [
  {
    first_name: 'John',
    last_name: 'Doe',
    profession: 'Client_1',
    balance: 0,
    role: 'client',
  },
  {
    first_name: 'Jane',
    last_name: 'Doe',
    profession: 'Client_2',
    balance: 0,
    role: 'client',
  },
  {
    first_name: 'Alice',
    last_name: 'Doe',
    profession: 'Client_2',
    balance: 0,
    role: 'client',
  },
];

export const contractors: Profile[] = [
  {
    first_name: 'Bob',
    last_name: 'Doe',
    profession: 'Software Engineer',
    balance: 0,
    role: 'contractor',
  },

  {
    first_name: 'David',
    last_name: 'Doe',
    profession: 'UX Designer',
    balance: 0,
    role: 'contractor',
  },
  {
    first_name: 'Eve',
    last_name: 'Doe',
    profession: 'Graphic Designer',
    balance: 0,
    role: 'contractor',
  },
  {
    first_name: 'Charlie',
    last_name: 'Doe',
    profession: 'Software Engineer',
    balance: 0,
    role: 'contractor',
  },
  {
    first_name: 'Frank',
    last_name: 'Doe',
    profession: 'Marketing Specialist',
    balance: 0,
    role: 'contractor',
  },
  {
    first_name: 'Grace',
    last_name: 'Doe',
    profession: 'DevOps Engineer',
    balance: 0,
    role: 'contractor',
  },
  {
    first_name: 'Harry',
    last_name: 'Doe',
    profession: 'Quality Assurance',
    balance: 0,
    role: 'contractor',
  },
  {
    first_name: 'Ivy',
    last_name: 'Doe',
    profession: 'Software Engineer',
    balance: 0,
    role: 'contractor',
  },
];
