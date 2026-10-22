import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DataImportService } from './data-import.service';

@Module({
  imports: [PrismaModule],
  providers: [DataImportService],
  exports: [DataImportService],
})
export class DataImportModule {}
