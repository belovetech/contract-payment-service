export interface Job {
  description: string;
  price: number;
  contract_id?: number;
  is_paid: boolean;
}

export const jobs: Job[] = [
  {
    description: 'Initial job',
    price: 1000,
    is_paid: true,
  },
  {
    description: 'Follow-up job',
    price: 2000,
    is_paid: true,
  },
  {
    description: 'High value job',
    price: 5000,
    is_paid: false,
  },
  {
    description: 'Final job',
    price: 10000,
    is_paid: false,
  },
];
