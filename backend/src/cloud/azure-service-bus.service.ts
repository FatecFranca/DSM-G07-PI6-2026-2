import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DefaultAzureCredential } from '@azure/identity';
import {
  ServiceBusClient,
  ServiceBusReceiver,
  ServiceBusSender,
} from '@azure/service-bus';
import { CloudConfig } from './cloud.config';
import { DataFileAvailableEvent } from './cloud.types';

@Injectable()
export class AzureServiceBusService implements OnModuleDestroy {
  private client?: ServiceBusClient;
  private sender?: ServiceBusSender;
  private receiver?: ServiceBusReceiver;

  constructor(private readonly config: CloudConfig) {}

  async sendDataFileAvailable(event: DataFileAvailableEvent): Promise<void> {
    await this.senderClient().sendMessages({
      body: event,
      contentType: 'application/json',
      messageId: event.eventId,
      correlationId: event.correlationId,
      subject: event.eventType,
    });
  }

  createReceiver(): ServiceBusReceiver {
    if (this.receiver) return this.receiver;
    this.receiver = this.clientForConnection().createReceiver(
      this.config.serviceBusQueueName,
      { receiveMode: 'peekLock' },
    );
    return this.receiver;
  }

  async onModuleDestroy(): Promise<void> {
    await this.receiver?.close();
    await this.sender?.close();
    await this.client?.close();
  }

  private senderClient(): ServiceBusSender {
    if (this.sender) return this.sender;
    this.sender = this.clientForConnection().createSender(
      this.config.serviceBusQueueName,
    );
    return this.sender;
  }

  private clientForConnection(): ServiceBusClient {
    if (this.client) return this.client;
    this.config.assertServiceBusConfiguration();
    this.client = this.config.serviceBusConnectionString
      ? new ServiceBusClient(this.config.serviceBusConnectionString)
      : new ServiceBusClient(
          `https://${this.config.serviceBusNamespace}.servicebus.windows.net`,
          new DefaultAzureCredential(),
        );
    return this.client;
  }
}
