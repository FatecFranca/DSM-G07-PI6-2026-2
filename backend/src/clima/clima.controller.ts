import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ClimaService } from './clima.service';

@ApiTags('clima')
@Controller('clima')
export class ClimaController {
  constructor(private readonly climaService: ClimaService) {}

  @Get(':regiaoId')
  @ApiOperation({ summary: 'Histórico climático da região' })
  @ApiParam({ name: 'regiaoId' })
  findByRegiao(@Param('regiaoId') regiaoId: string) {
    return this.climaService.findByRegiao(regiaoId);
  }
}
