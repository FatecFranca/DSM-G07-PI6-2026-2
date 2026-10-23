import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ModelosService } from './modelos.service';
@ApiTags('modelos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('modelos')
export class ModelosController {
  constructor(private readonly service: ModelosService) {}
  @Get('metricas')
  @ApiOperation({
    summary: 'Métricas de validação dos modelos por cultura e versão',
  })
  findMetrics(
    @Query('cultura') cultura?: string,
    @Query('versao') versao?: string,
  ) {
    return this.service.findMetrics(cultura, versao);
  }
}
