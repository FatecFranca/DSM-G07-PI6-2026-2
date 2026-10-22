import { Module } from '@nestjs/common';
import { AzureBlobStorageService } from './azure-blob-storage.service';
import { AzureServiceBusService } from './azure-service-bus.service';
import { CloudConfig } from './cloud.config';
import { DataFileConsumerService } from './data-file-consumer.service';
import { DataImportModule } from '../data-import/data-import.module';

@Module({
  imports: [DataImportModule],
  providers: [
    CloudConfig,
    AzureBlobStorageService,
    AzureServiceBusService,
    DataFileConsumerService,
  ],
  exports: [CloudConfig, AzureBlobStorageService, AzureServiceBusService],
})
export class CloudModule {}
