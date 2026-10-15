import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ClimaService } from './clima.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateClimaDto, UpdateClimaDto } from './dto/clima.dto';

@ApiTags('clima')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clima')
export class ClimaController {
  constructor(private readonly climaService: ClimaService) {}

  @Get(':regiaoId')
  @ApiOperation({ summary: 'Histórico climático da região' })
  @ApiParam({ name: 'regiaoId' })
  findByRegiao(@Param('regiaoId') regiaoId: string) {
    return this.climaService.findByRegiao(regiaoId);
  }

  @Post()
  @Roles('ADMIN', 'TECNICO')
  create(@Body() dto: CreateClimaDto) {
    return this.climaService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'TECNICO')
  update(@Param('id') id: string, @Body() dto: UpdateClimaDto) {
    return this.climaService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.climaService.remove(id);
  }
}
