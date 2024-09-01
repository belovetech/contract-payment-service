import { PrismaClient } from '@prisma/client';
import { clients, contractors, contracts, Job, jobs } from './data/';

const prisma = new PrismaClient();

async function createProfileWithContractAndJobs() {
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

function getThreeRandomjobs(jobs: Job[], num: number) {
  let shuffled = jobs.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}
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
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
