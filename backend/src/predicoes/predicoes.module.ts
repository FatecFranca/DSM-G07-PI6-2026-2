import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PredicoesController } from './predicoes.controller';
import { PredicoesService } from './predicoes.service';

@Module({
  imports: [AuthModule],
  controllers: [PredicoesController],
  providers: [PredicoesService],
})
export class PredicoesModule {}
