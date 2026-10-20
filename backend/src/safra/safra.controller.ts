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
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SafraService } from './safra.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateSafraDto,
  SafraQueryDto,
  UpdateSafraDto,
} from './dto/safra.dto';

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
  ) {
    return this.safraService.findByRegiao(regiaoId, query);
  }

  @Post()
  @Roles('ADMIN', 'TECNICO')
  create(@Body() dto: CreateSafraDto) {
    return this.safraService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'TECNICO')
  update(@Param('id') id: string, @Body() dto: UpdateSafraDto) {
    return this.safraService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.safraService.remove(id);
  }
}
