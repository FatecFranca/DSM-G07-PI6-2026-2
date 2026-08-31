import { Module } from '@nestjs/common';
import { RegioesController } from './regioes.controller';
import { RegioesService } from './regioes.service';

@Module({
  controllers: [RegioesController],
  providers: [RegioesService],
})
export class RegioesModule {}
