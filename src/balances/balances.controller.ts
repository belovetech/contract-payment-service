import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { BalancesService } from './balances.service';
import { AuthGuard } from 'src/profiles/middlewares/auth';
import { DepositDto } from './dto/deposit.dto';

@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @UseGuards(AuthGuard)
  @Post('deposit/:user_id')
  async depositFunds(
    @Request() { profile },
    @Body() payload: DepositDto,
    @Param('user_id') user_id: number,
  ) {
    const updatedProfile = await this.balancesService.depositFunds(
      profile,
      payload.amount,
    );
    return {
      message: 'Funds deposited successfully',
      data: updatedProfile,
    };
  }
}
