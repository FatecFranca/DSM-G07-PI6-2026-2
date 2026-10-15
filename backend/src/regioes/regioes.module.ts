import { Module } from '@nestjs/common';
import { RegioesController } from './regioes.controller';
import { RegioesService } from './regioes.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [RegioesController],
  providers: [RegioesService],
  imports: [AuthModule],
})
export class RegioesModule {}
