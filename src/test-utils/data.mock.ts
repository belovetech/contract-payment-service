import {
  contracts,
  contracts_status,
  jobs,
  Prisma,
  profiles,
  profiles_role,
} from '@prisma/client';

export const mockProfile: profiles = {
  first_name: 'John',
  last_name: 'Doe',
  profession: 'Software Engineer',
  role: profiles_role.client,
  uuid: '123',
  id: 1,
  created_at: new Date(),
  updated_at: new Date(),
  balance: new Prisma.Decimal(0),
};

export const mockProfiles: profiles[] = [
  {
    first_name: 'John',
    last_name: 'Doe',
    profession: 'Software Engineer',
    role: profiles_role.client,
    uuid: '123',
    id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    balance: new Prisma.Decimal(0),
  },
  {
    first_name: 'Jane',
    last_name: 'Doe',
    profession: 'Software Engineer',
    role: profiles_role.contractor,
    uuid: '123',
    id: 2,
    created_at: new Date(),
    updated_at: new Date(),
    balance: new Prisma.Decimal(0),
  },
];

export const mockContract: contracts = {
  id: 1,
  client_id: 1,
  contractor_id: 1,
  created_at: new Date(),
  updated_at: new Date(),
  status: contracts_status.in_progress,
  terms: 'some terms',
  uuid: '123',
};

export const mockContracts: contracts[] = [
  {
    id: 1,
    client_id: 1,
    contractor_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    status: contracts_status.new,
    terms: 'some terms',
    uuid: '123',
  },
  {
    id: 2,
    client_id: 1,
    contractor_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    status: contracts_status.in_progress,
    terms: 'some terms',
    uuid: '123',
  },
  {
    id: 3,
    client_id: 1,
    contractor_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    status: contracts_status.terminated,
    terms: 'some terms',
    uuid: '123',
  },
];

export const mockJob: jobs = {
  id: 1,
  description: 'Test Description',
  price: new Prisma.Decimal(100),
  contract_id: 1,
  is_paid: false,
  paid_date: new Date(),
  uuid: '123',
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockUnpaidJobs: jobs[] = [
  {
    id: 1,
    description: 'Test Description',
    price: new Prisma.Decimal(100),
    contract_id: 1,
    is_paid: false,
    paid_date: new Date(),
    uuid: '123',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    description: 'Test Description',
    price: new Prisma.Decimal(100),
    contract_id: 1,
    is_paid: false,
    paid_date: new Date(),
    uuid: '123',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const mockJobs: jobs[] = [
  ...mockUnpaidJobs,
  {
    id: 3,
    description: 'Test Description',
    price: new Prisma.Decimal(100),
    contract_id: 1,
    is_paid: true,
    paid_date: new Date(),
    uuid: '123',
    created_at: new Date(),
    updated_at: new Date(),
  },
];
