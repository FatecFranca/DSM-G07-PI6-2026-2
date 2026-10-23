import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ClustersService } from './clusters.service';
@ApiTags('clusters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clusters')
export class ClustersController {
  constructor(private readonly service: ClustersService) {}
  @Get()
  @ApiOperation({
    summary: 'Consulta clusters climáticos calculados pelo pipeline',
  })
  findAll(@Req() req: { user: { id: string; perfil: string } }) {
    return this.service.findAll(req.user);
  }
  @Get(':regiaoId')
  @ApiOperation({ summary: 'Consulta o cluster e perfil de um município' })
  findByMunicipio(
    @Param('regiaoId') id: string,
    @Req() req: { user: { id: string; perfil: string } },
  ) {
    return this.service.findByMunicipio(id, req.user);
  }
}
