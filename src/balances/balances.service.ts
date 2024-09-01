import { Injectable, NotFoundException } from '@nestjs/common';
import { contracts_status } from '@prisma/client';
import { PrismaService } from 'src/prismaClient/prisma.service';

@Injectable()
export class BalancesService {
  constructor(private prisma: PrismaService) {}
  async depositFunds(client_id: number, amount: number) {
    const profile = await this.prisma.profiles.findUnique({
      where: {
        id: client_id,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const totalOutstandingPayments = await this.prisma.jobs.aggregate({
      _sum: {
        price: true,
      },
      where: {
        contract: {
          client_id,
          status: contracts_status.in_progress,
        },
        is_paid: false,
      },
    });

    const totalOutstandingPaymentsValue =
      totalOutstandingPayments._sum.price || 0;

    const twentyFivePercent = Number(totalOutstandingPaymentsValue) * 0.25;

    if (amount > twentyFivePercent) {
      throw new NotFoundException(
        'You cannot deposit more than 25% of your total outstanding payments',
      );
    }

    const updatedProfile = await this.prisma.profiles.update({
      where: {
        id: client_id,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    return updatedProfile;
  }
}
