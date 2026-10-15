import { Module } from '@nestjs/common';
import { SafraController } from './safra.controller';
import { SafraService } from './safra.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [SafraController],
  providers: [SafraService],
  imports: [AuthModule],
})
export class SafraModule {}
