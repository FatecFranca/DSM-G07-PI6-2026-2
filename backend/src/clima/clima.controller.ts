import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
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
import { ClimaQueryDto, CreateClimaDto, UpdateClimaDto } from './dto/clima.dto';

@ApiTags('clima')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clima')
export class ClimaController {
  constructor(private readonly climaService: ClimaService) {}

  @Get('municipios/:regiaoId')
  @ApiOperation({ summary: 'Climatologia anual e sazonal do município' })
  findClimatologia(
    @Param('regiaoId') regiaoId: string,
    @Req() req: { user: { id: string; perfil: string } },
  ) {
    return this.climaService.findClimatologia(regiaoId, req.user);
  }

  @Get(':regiaoId')
  @ApiOperation({
    summary: 'Histórico climático da região com filtro opcional de período',
  })
  @ApiParam({ name: 'regiaoId' })
  findByRegiao(
    @Param('regiaoId') regiaoId: string,
    @Query() query: ClimaQueryDto,
    @Req() req: { user: { id: string; perfil: string } },
  ) {
    return this.climaService.findByRegiao(regiaoId, query, req.user);
  }

  @Post()
  @Roles('ADMIN', 'TECNICO')
  create(
    @Body() dto: CreateClimaDto,
    @Req() req: { user: { id: string; perfil: string } },
  ) {
    return this.climaService.create(dto, req.user);
  }

  @Patch(':id')
  @Roles('ADMIN', 'TECNICO')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClimaDto,
    @Req() req: { user: { id: string; perfil: string } },
  ) {
    return this.climaService.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.climaService.remove(id);
  }
}
