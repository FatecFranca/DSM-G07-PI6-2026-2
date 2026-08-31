import { Module } from '@nestjs/common';
import { SafraController } from './safra.controller';
import { SafraService } from './safra.service';

@Module({
  controllers: [SafraController],
  providers: [SafraService],
})
export class SafraModule {}
