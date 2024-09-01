import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Sql } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prismaClient/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async findBestProfession(start: string, end: string): Promise<string | null> {
    const result = await this.prisma.$queryRaw`
      SELECT profession
      FROM profiles
      JOIN contracts ON profiles.id = contracts.contractor_id
      JOIN jobs ON contracts.id = jobs.contract_id
      WHERE contracts.created_at >= ${new Date(start)} AND contracts.created_at <= ${new Date(end)}
      GROUP BY profession
      ORDER BY SUM(jobs.price) DESC
      LIMIT 1
    `;
    return result[0]?.profession || null;
  }

  async getTopClients(start: string, end: string, limit: number = 2) {
    const formattedStart = new Date(start);
    const formattedEnd = new Date(end);

    // if (formattedStart == 'Invalid Date' || formattedEnd == 'Invalid Date') {
    //   throw new Error('Invalid date range');
    // }

    if (formattedStart > formattedEnd) {
      throw new Error('Invalid date range');
    }

    const result = await this.prisma.$queryRaw`
      SELECT client_id, last_name, first_name, SUM(jobs.price) as total_paid
      FROM profiles
      JOIN contracts ON profiles.id = contracts.client_id
      JOIN jobs ON contracts.id = jobs.contract_id
      WHERE jobs.is_paid = true AND jobs.paid_date >= ${new Date(start)} AND jobs.paid_date <= ${new Date(end)}
      GROUP BY client_id
      ORDER BY total_paid DESC
      LIMIT ${limit}
    `;

    console.log({ result });
    return result[0] || null;
  }
}

// const result = await this.prisma.jobs.groupBy({
//   by: ['contract_id'],
//   where: {
//     is_paid: true,
//     paid_date: {
//       gte: new Date(start),
//       lte: new Date(end),
//     },
//   },
//   _sum: {
//     price: true,
//   },
//   orderBy: {
//     _sum: {
//       price: 'desc',
//     },
//   },
//   take: 1,
// });

// console.log(result);

// if (result.length === 0) {
//   return null;
// }

// const topContract = await this.prisma.contracts.findUnique({
//   where: { id: result[0].contract_id },
//   include: { contractor: { select: { profession: true } } },
// });

// return topContract?.contractor.profession || null;

/**
 * const topContract = await this.prisma.jobs.groupBy({
      by: ['contract_id'],
      where: {
        is_paid: true,
        paid_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        price: true,
      },
      orderBy: {
        _sum: {
          price: 'desc',
        },
      },
      take: limit,
    });

    const clients = await this.prisma.profiles.findMany({
      where: {
        id: {
          in: topContract.map((client) => client.contract_id),
        },
      },
      include: {
        contractsAsClient: {
          include: {
            jobs: {
              where: {
                is_paid: true,
                paid_date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
          },
        },
      },
    });

    return clients;
 */
