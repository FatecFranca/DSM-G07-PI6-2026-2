import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CulturasService } from './culturas.service';
@ApiTags('culturas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('culturas')
export class CulturasController {
  constructor(private readonly service: CulturasService) {}
  @Get() @ApiOperation({ summary: 'Lista culturas disponíveis' }) findAll() {
    return this.service.findAll();
  }
}
