import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PredicaoQueryDto } from './dto/predicao-query.dto';
import { PredicoesService } from './predicoes.service';

@ApiTags('predicoes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('predicoes')
export class PredicoesController {
  constructor(private readonly service: PredicoesService) {}

  @Get(':regiaoId')
  @ApiOperation({
    summary: 'Consulta previsões offline de produtividade por município',
  })
  @ApiNotFoundResponse({
    description: 'Município ou previsão publicada não encontrada',
  })
  findByMunicipio(
    @Param('regiaoId') regiaoId: string,
    @Query() query: PredicaoQueryDto,
    @Req() req: { user: { id: string; perfil: string } },
  ) {
    return this.service.findByMunicipio(regiaoId, query, req.user);
  }
}
