import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CulturasController } from './culturas.controller';
import { CulturasService } from './culturas.service';
@Module({ imports: [AuthModule], controllers: [CulturasController], providers: [CulturasService] })
export class CulturasModule {}
