export interface Job {
  description: string;
  price: number;
  contract_id?: number;
  is_paid: boolean;
}

export const jobs: Job[] = [
  {
    description: 'job description',
    price: 1000,
    is_paid: false,
  },
  {
    description: 'job description',
    price: 2000,
    is_paid: false,
  },
  {
    description: 'job description',
    price: 3000,
    is_paid: false,
  },
  {
    description: 'job description',
    price: 4000,
    is_paid: false,
  },
  {
    description: 'job description',
    price: 5000,
    is_paid: false,
  },
  {
    description: 'job description',
    price: 6000,
    is_paid: false,
  },
  {
    description: 'job description',
    price: 7000,
    is_paid: false,
  },
  {
    description: 'job description',
    price: 8000,
    is_paid: false,
  },
  {
    description: 'job description',
    price: 9000,
    is_paid: false,
  },
  {
    description: 'job description',
    price: 10000,
    is_paid: false,
  },
];
