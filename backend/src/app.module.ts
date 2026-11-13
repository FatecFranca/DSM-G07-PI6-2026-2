import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClimaModule } from './clima/clima.module';
import { ClustersModule } from './clusters/clusters.module';
import { CloudModule } from './cloud/cloud.module';
import { PrismaModule } from './prisma/prisma.module';
import { RegioesModule } from './regioes/regioes.module';
import { SafraModule } from './safra/safra.module';
import { CulturasModule } from './culturas/culturas.module';
import { CompatibilidadesModule } from './compatibilidades/compatibilidades.module';
import { ModelosModule } from './modelos/modelos.module';
import { PredicoesModule } from './predicoes/predicoes.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RegioesModule,
    ClimaModule,
    ClustersModule,
    SafraModule,
    CloudModule,
    CulturasModule,
    CompatibilidadesModule,
    ModelosModule,
    PredicoesModule,
    NotificacoesModule,
  ],
})
export class AppModule {}
