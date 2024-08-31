import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { AuthGuard } from 'src/profiles/middlewares/auth';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createContractDto: CreateContractDto,
    @Request() { profile },
  ) {

    const contract = await this.contractsService.create(createContractDto, profile.id);
    return {
      message: 'Contract created successfully',
      data: contract,
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  async getContracts(@Request() { profile }) {
    const contracts = await this.contractsService.getContracts(profile.id);
    return {
      message: 'Contracts retrieved successfully',
      data: contracts,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getContract(@Param('id') id: string, @Request() { profile }) {
    const contract = await this.contractsService.getContractById(
      Number(id),
      profile.id,
    );
    return {
      message: 'Contract retrieved successfully',
      data: contract,
    };
  }
}
