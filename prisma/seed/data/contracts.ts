import { contracts_status } from '@prisma/client';

interface Contract {
  client_id?: number;
  contractor_id?: number;
  terms: string;
  status: contracts_status;
}

export const contracts: Contract[] = [
  {
    terms: 'Terms and conditions',
    status: contracts_status.new,
  },
  {
    terms: 'Terms and conditions',
    status: contracts_status.in_progress,
  },
  {
    terms: 'Terms and conditions',
    status: contracts_status.terminated,
  },
];
