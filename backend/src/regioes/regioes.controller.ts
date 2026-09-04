import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RegioesService } from './regioes.service';

@ApiTags('regioes')
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
}
