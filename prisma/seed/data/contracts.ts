import { contracts_status } from '@prisma/client';

interface Contract {
  client_id?: number;
  contractor_id?: number;
  terms: string;
  status: contracts_status;
}

export const contracts: Contract[] = [
  {
    terms: 'Software development project',
    status: contracts_status.new,
  },
  {
    terms: 'Design project',
    status: contracts_status.in_progress,
  },
  {
    terms: 'Graphic design project',
    status: contracts_status.terminated,
  },
];
