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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateRegiaoDto,
  RegiaoQueryDto,
  UpdateRegiaoDto,
} from './dto/regiao.dto';
import { RegioesService } from './regioes.service';

@ApiTags('municipios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('regioes')
export class RegioesController {
  constructor(private readonly service: RegioesService) {}
  @Get()
  @ApiOperation({ summary: 'Lista municípios com filtros e paginação' })
  findAll(
    @Query() query: RegiaoQueryDto,
    @Req() req: { user: { id: string; perfil: string } },
  ) {
    return this.service.findAll(query, req.user);
  }
  @Get(':id') findOne(
    @Param('id') id: string,
    @Req() req: { user: { id: string; perfil: string } },
  ) {
    return this.service.findOne(id, req.user);
  }
  @Post() @Roles('ADMIN', 'TECNICO') create(@Body() dto: CreateRegiaoDto) {
    return this.service.create(dto);
  }
  @Post(':id/usuarios/:userId') @Roles('ADMIN') linkUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.service.linkUser(id, userId);
  }
  @Patch(':id') @Roles('ADMIN', 'TECNICO') update(
    @Param('id') id: string,
    @Body() dto: UpdateRegiaoDto,
    @Req() req: { user: { id: string; perfil: string } },
  ) {
    return this.service.update(id, dto, req.user);
  }
  @Delete(':id') @Roles('ADMIN') remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
