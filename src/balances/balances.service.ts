import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { contracts_status, profiles } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { Profile } from './entities/profile.entity';

@Injectable()
export class BalancesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Deposits funds into the client's balance based on the specified amount, considering the outstanding payments.
   * Calculates the allowed deposit limit as 25% of the total outstanding payments.
   * If the amount exceeds the allowed limit, throws a PreconditionFailedException with an appropriate message.
   * Updates the client's balance by incrementing the specified amount.
   *
   * @param client The client's profile to deposit funds for.
   * @param amount The amount to deposit into the client's balance.
   * @returns A Promise that resolves to the updated profile after depositing the funds.
   */
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
        `You cannot deposit more than ${allowedDepositLimit.toFixed(2)} at once`,
      );
    }

    return this.prisma.profiles.update({
      where: { id: client.id },
      data: { balance: { increment: amount } },
    });
  }
}
