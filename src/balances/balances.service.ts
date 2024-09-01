import {
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { contracts_status } from '@prisma/client';
import { PrismaService } from '../prismaClient/prisma.service';
import { Profile } from './entities/profile.entity';

@Injectable()
export class BalancesService {
  constructor(private prisma: PrismaService) {}
  async depositFunds(client: Profile, amount: number) {
    const totalOutstandingPayments =
      await this.getTotalOutstandingPaymentsValue(client.id);

    const allowedDepositLimit = this.calculateAllowedDepositLimit(
      totalOutstandingPayments,
    );

    if (amount > allowedDepositLimit) {
      throw new PreconditionFailedException(
        `You cannot deposit more than ${allowedDepositLimit} at once`,
      );
    }

    const updatedProfile = await this.prisma.profiles.update({
      where: {
        id: client.id,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    return updatedProfile;
  }

  private calculateAllowedDepositLimit(
    totalOutstandingPayments: number,
  ): number {
    return totalOutstandingPayments * 0.25;
  }

  private async getTotalOutstandingPaymentsValue(
    client_id: number,
  ): Promise<number> {
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

    return Number(totalOutstandingPaymentsValue);
  }
}
