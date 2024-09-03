import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  Logger,
} from '@nestjs/common';
import { BalancesService } from './balances.service';
import { AuthGuard } from '../middlewares/auth';
import { DepositDto } from './dto/deposit.dto';
import { ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('balances')
@ApiTags('Balances')
export class BalancesController {
  private readonly logger = new Logger(BalancesController.name);
  constructor(private readonly balancesService: BalancesService) {}

  @UseGuards(AuthGuard)
  @Post('deposit/:user_id')
  @ApiHeader({ name: 'profile_id', required: true })
  @ApiParam({ name: 'user_id', required: true })
  @ApiOperation({ description: 'Deposit funds' })
  async depositFunds(
    @Request() { profile },
    @Body() payload: DepositDto,
    @Param('user_id') user_id: number,
  ) {
    try {
      this.logger.log('Start: Depositing funds', { user_id: user_id });
      const updatedProfile = await this.balancesService.depositFunds(
        profile,
        payload.amount,
      );
      this.logger.log('End: Funds deposited', { user_id: user_id });
      return {
        message: 'Funds deposited successfully',
        data: updatedProfile,
      };
    } catch (error) {
      this.logger.error({
        error: error.message,
        msg: "Couldn't deposit funds",
      });
      throw error;
    }
  }
}
