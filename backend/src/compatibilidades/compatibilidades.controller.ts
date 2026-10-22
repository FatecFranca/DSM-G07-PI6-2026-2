import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CompatibilidadeQueryDto } from './compatibilidades.dto';
import { CompatibilidadesService } from './compatibilidades.service';
@ApiTags('compatibilidades') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('compatibilidades')
export class CompatibilidadesController {
 constructor(private readonly service: CompatibilidadesService) {}
 @Get() @ApiOperation({ summary: 'Ranking de municípios por cultura e compatibilidade mínima' }) findAll(@Query() query: CompatibilidadeQueryDto, @Req() req: { user: { id: string; perfil: string } }) { return this.service.findAll(query, req.user); }
 @Get(':regiaoId') @ApiOperation({ summary: 'Compatibilidade das culturas para um município' }) findByMunicipio(@Param('regiaoId') id: string, @Req() req: { user: { id: string; perfil: string } }) { return this.service.findByMunicipio(id, req.user); }
}
