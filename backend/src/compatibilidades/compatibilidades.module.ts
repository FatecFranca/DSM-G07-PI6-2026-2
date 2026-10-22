import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CompatibilidadesController } from './compatibilidades.controller';
import { CompatibilidadesService } from './compatibilidades.service';
@Module({ imports: [AuthModule], controllers: [CompatibilidadesController], providers: [CompatibilidadesService] })
export class CompatibilidadesModule {}
