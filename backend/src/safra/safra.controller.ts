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
import { SafraService } from './safra.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateSafraDto, SafraQueryDto, UpdateSafraDto } from './dto/safra.dto';

@ApiTags('safra')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('safra')
export class SafraController {
  constructor(private readonly safraService: SafraService) {}

  @Get(':regiaoId')
  @ApiOperation({
    summary: 'Histórico de rendimento (t/ha) com filtro opcional de ano',
  })
  @ApiParam({ name: 'regiaoId' })
  findByRegiao(
    @Param('regiaoId') regiaoId: string,
    @Query() query: SafraQueryDto,
    @Req() req: { user: { id: string; perfil: string } },
  ) {
    return this.safraService.findByRegiao(regiaoId, query, req.user);
  }

  @Post()
  @Roles('ADMIN', 'TECNICO')
  create(
    @Body() dto: CreateSafraDto,
    @Req() req: { user: { id: string; perfil: string } },
  ) {
    return this.safraService.create(dto, req.user);
  }

  @Patch(':id')
  @Roles('ADMIN', 'TECNICO')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSafraDto,
    @Req() req: { user: { id: string; perfil: string } },
  ) {
    return this.safraService.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.safraService.remove(id);
  }
}
