import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudConfig {
  readonly enabled = process.env.AZURE_INTEGRATION_ENABLED === 'true';
  readonly storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  readonly storageContainerName =
    process.env.AZURE_STORAGE_CONTAINER_NAME ?? 'data-treated';
  readonly storageConnectionString =
    process.env.AZURE_STORAGE_CONNECTION_STRING;
  readonly serviceBusNamespace = process.env.AZURE_SERVICE_BUS_NAMESPACE;
  readonly serviceBusConnectionString =
    process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
  readonly serviceBusQueueName =
    process.env.AZURE_SERVICE_BUS_QUEUE_NAME ?? 'data-file-available';
  readonly maxMessageDeliveryAttempts = Number(
    process.env.AZURE_SERVICE_BUS_MAX_DELIVERY_ATTEMPTS ?? 5,
  );

  assertStorageConfiguration(): void {
    if (
      !this.storageConnectionString &&
      (!this.storageAccountName || !this.enabled)
    ) {
      throw new Error(
        'Configure AZURE_STORAGE_ACCOUNT_NAME ou AZURE_STORAGE_CONNECTION_STRING para usar o Blob Storage.',
      );
    }
  }

  assertServiceBusConfiguration(): void {
    if (
      !this.serviceBusConnectionString &&
      (!this.serviceBusNamespace || !this.enabled)
    ) {
      throw new Error(
        'Configure AZURE_SERVICE_BUS_NAMESPACE ou AZURE_SERVICE_BUS_CONNECTION_STRING para usar o Service Bus.',
      );
    }
  }
}
