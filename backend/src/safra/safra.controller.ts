import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SafraService } from './safra.service';

@ApiTags('safra')
@Controller('safra')
export class SafraController {
  constructor(private readonly safraService: SafraService) {}

  @Get(':regiaoId')
  @ApiOperation({ summary: 'Histórico de rendimento (t/ha) da região' })
  @ApiParam({ name: 'regiaoId' })
  findByRegiao(@Param('regiaoId') regiaoId: string) {
    return this.safraService.findByRegiao(regiaoId);
  }
}
