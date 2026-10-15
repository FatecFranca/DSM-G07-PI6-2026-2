import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RegioesService } from './regioes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateRegiaoDto, UpdateRegiaoDto } from './dto/regiao.dto';

@ApiTags('regioes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('regioes')
export class RegioesController {
  constructor(private readonly regioesService: RegioesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista regiões produtoras (filtro opcional por país)',
  })
  @ApiQuery({ name: 'pais', required: false })
  findAll(@Query('pais') pais?: string) {
    return this.regioesService.findAll(pais);
  }

  @Post()
  @Roles('ADMIN', 'TECNICO')
  @ApiOperation({ summary: 'Cadastra uma região produtora' })
  create(@Body() dto: CreateRegiaoDto) {
    return this.regioesService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'TECNICO')
  update(@Param('id') id: string, @Body() dto: UpdateRegiaoDto) {
    return this.regioesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.regioesService.remove(id);
  }
}
