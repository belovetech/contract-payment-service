import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { contracts_status, profiles } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { Profile } from './entities/profile.entity';

@Injectable()
export class BalancesService {
  constructor(private prisma: PrismaService) {}

  async depositFunds(client: Profile, amount: number): Promise<profiles> {
    const totalOutstandingPayments = await this.prisma.jobs.aggregate({
      _sum: {
        price: true,
      },
      where: {
        contract: {
          client_id: client.id,
          status: contracts_status.in_progress,
        },
        is_paid: false,
      },
    });

    const totalOutstandingPaymentsValue =
      totalOutstandingPayments._sum.price || 0;

    const allowedDepositLimit = Number(totalOutstandingPaymentsValue) * 0.25;

    if (amount > allowedDepositLimit) {
      if (allowedDepositLimit === 0) {
        throw new PreconditionFailedException(
          `You have no outstanding payments to deposit funds against`,
        );
      }
      throw new PreconditionFailedException(
        `You cannot deposit more than ${allowedDepositLimit} at once`,
      );
    }

    return this.prisma.profiles.update({
      where: { id: client.id },
      data: { balance: { increment: amount } },
    });
  }
}
