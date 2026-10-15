import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ClustersService } from './clusters.service';

@ApiTags('clusters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clusters')
export class ClustersController {
  constructor(private readonly clustersService: ClustersService) {}

  @Get()
  @ApiOperation({ summary: 'Agrupa regiões por perfil climático preliminar' })
  findAll() {
    return this.clustersService.findAll();
  }
}
