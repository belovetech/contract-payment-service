import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prismaClient/prisma.service';
import { BestProfession } from './entities/best.profession.entity';
import { BestClients } from './entities/best.clients';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves the best profession based on total earnings within a specified date range.
   *
   * @param start The start date of the date range.
   * @param end The end date of the date range.
   * @returns The best profession as a string or null if no data is found.
   */
  async getBestProfession(start: string, end: string): Promise<string | null> {
    const { startDate, endDate } = this.validateDate(start, end);
    const result = await this.prisma.$queryRaw`
      SELECT p.profession, SUM(j.price) as total_earnings
      FROM profiles p
      JOIN contracts c ON p.id = c.contractor_id
      JOIN jobs j ON c.id = j.contract_id
      WHERE p.role = 'contractor' AND j.is_paid = TRUE AND j.paid_date BETWEEN ${startDate} AND ${endDate}
      GROUP BY profession
      ORDER BY total_earnings DESC
      LIMIT 1;
    `;

    return (result && result[0]?.profession) || null;
  }

  /**
   * Retrieves the best clients based on total amount paid within a specified date range.
   *
   * @param start The start date of the date range.
   * @param end The end date of the date range.
   * @param limit The maximum number of best clients to retrieve (default is 2).
   * @returns A Promise that resolves to the best clients as an array of objects with 'id', 'full_name', and 'total_paid' properties.
   */
  async getBestClients(
    start: string,
    end: string,
    limit: number = 2,
  ): Promise<BestClients> {
    if (isNaN(limit)) limit = 2;
    const { startDate, endDate } = this.validateDate(start, end);
    const result = await this.prisma.$queryRaw`
    SELECT p.id AS client_id, CONCAT(p.first_name, ' ', p.last_name) AS full_name, SUM(j.price) AS total_paid
    FROM profiles p
    JOIN contracts c ON p.id = c.client_id
    JOIN jobs j ON c.id = j.contract_id
    WHERE p.role = 'client' AND j.is_paid = TRUE AND j.paid_date BETWEEN ${startDate} AND ${endDate}
    GROUP BY p.id, p.first_name, p.last_name
    ORDER BY total_paid DESC
    LIMIT ${limit};
    `;
    return result as BestClients;
  }

  /**
   * Validates the start and end date strings and converts them to Date objects.
   *
   * @param start The start date string.
   * @param end The end date string.
   * @returns An object containing startDate and endDate as Date objects.
   * @throws BadRequestException if start or end date is missing, date format is invalid, or start date is later than end date.
   */
  public validateDate(
    start: string,
    end: string,
  ): { startDate: Date; endDate: Date } {
    if (!start || !end) {
      throw new BadRequestException('Start date or end date is missing.');
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Please use a valid date string.',
      );
    }

    if (startDate > endDate) {
      throw new BadRequestException('Start date is later than end date.');
    }

    return { startDate, endDate };
  }
}
