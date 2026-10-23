import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ModelosController } from './modelos.controller';
import { ModelosService } from './modelos.service';
@Module({
  imports: [AuthModule],
  controllers: [ModelosController],
  providers: [ModelosService],
})
export class ModelosModule {}
