import { PrismaClient } from '@prisma/client';
import { clients, contractors, contracts, Job, jobs } from './data/';

const prisma = new PrismaClient();

/**
 * Creates profiles for clients and contractors, along with contracts and associated jobs.
 * Iterates through each client and contractor profile data to create corresponding profiles in the database.
 * Creates a contract linking the client and contractor profiles, then assigns random jobs to the contract.
 */
async function createProfileWithContractAndJobs(): Promise<void> {
  for (let i = 0; i < clients.length; i++) {
    const clientProfile = await prisma.profiles.create({
      data: clients[i],
    });

    const contractorProfile = await prisma.profiles.create({
      data: contractors[i],
    });

    const contract = await prisma.contracts.create({
      data: {
        ...contracts[i],
        client_id: clientProfile.id,
        contractor_id: contractorProfile.id,
      },
    });

    const randomJobs = getThreeRandomjobs(jobs, 3);
    for (let j = 0; j < randomJobs.length; j++) {
      await prisma.jobs.create({
        data: {
          ...randomJobs[j],
          contract_id: contract.id,
        },
      });
    }
  }
}

/**
 * Returns an array of 'num' randomly selected Job objects from the input 'jobs' array.
 *
 * @param jobs - An array of Job objects to select from.
 * @param num - The number of random Job objects to return.
 * @returns An array of 'num' randomly selected Job objects.
 */
function getThreeRandomjobs(jobs: Job[], num: number): Job[] {
  let shuffled = jobs.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

/**
 * Main function to seed the database with profiles, contracts, and jobs.
 * Truncates the 'jobs', 'contracts', and 'profiles' tables before seeding if not in production.
 */
async function main() {
  console.info('Start seeding ...');
  if (process.env.NODE_ENV !== 'production') {
    await prisma.$executeRaw`TRUNCATE TABLE "jobs" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "contracts" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "profiles" CASCADE`;
  }
  createProfileWithContractAndJobs();
  console.info('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Error seeding database: ', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
