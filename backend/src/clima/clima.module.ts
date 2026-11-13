import { Module } from '@nestjs/common';
import { ClimaController } from './clima.controller';
import { ClimaService } from './clima.service';
import { AuthModule } from '../auth/auth.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  controllers: [ClimaController],
  providers: [ClimaService],
  imports: [AuthModule, NotificacoesModule],
})
export class ClimaModule {}
