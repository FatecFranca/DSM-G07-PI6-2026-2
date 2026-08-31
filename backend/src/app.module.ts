import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClimaModule } from './clima/clima.module';
import { PrismaModule } from './prisma/prisma.module';
import { RegioesModule } from './regioes/regioes.module';
import { SafraModule } from './safra/safra.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RegioesModule,
    ClimaModule,
    SafraModule,
    // ClustersModule / PredicoesModule — Sprint 2 / Sprint 3
  ],
})
export class AppModule {}
