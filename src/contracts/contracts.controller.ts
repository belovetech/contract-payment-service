import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { AuthGuard } from 'src/profiles/middlewares/auth';

@Controller('contracts')
export class ContractsController {
  private readonly logger = new Logger(ContractsController.name);
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createContractDto: CreateContractDto,
    @Request() { profile },
  ) {
    try {
      this.logger.log('Start: Creating contract');
      const contract = await this.contractsService.create(
        createContractDto,
        profile.id,
      );
      this.logger.log('End: contract created', { contract_id: contract.id });
      return {
        message: 'Contract created successfully',
        data: contract,
      };
    } catch (error) {
      this.logger.error({
        error: error.message,
        msg: "Couldn't create contract",
      });
      throw error;
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  async getContracts(@Request() { profile }) {
    try {
      this.logger.log('Start: Retrieving contracts');
      const contracts = await this.contractsService.getContracts(profile.id);
      this.logger.log('End: Contracts retrieved', {
        count: contracts.length,
        profile_id: profile.id,
      });
      return {
        message: 'Contracts retrieved successfully',
        data: contracts,
      };
    } catch (error) {
      this.logger.error({
        error: error.message,
        msg: "Couldn't retrieve contracts",
      });
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getContract(@Param('id') id: string, @Request() { profile }) {
    try {
      this.logger.log('Start: Retrieving contract');
      const contract = await this.contractsService.getContractById(
        Number(id),
        profile.id,
      );
      this.logger.log('End: Contract retrieved', { contract_id: contract.id });
      return {
        message: 'Contract retrieved successfully',
        data: contract,
      };
    } catch (error) {
      this.logger.error({
        error: error.message,
        msg: "Couldn't retrieve contract",
      });
      throw error;
    }
  }
}
