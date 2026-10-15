import { Module } from '@nestjs/common';
import { ClimaController } from './clima.controller';
import { ClimaService } from './clima.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ClimaController],
  providers: [ClimaService],
  imports: [AuthModule],
})
export class ClimaModule {}
