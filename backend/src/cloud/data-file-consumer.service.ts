import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ServiceBusReceivedMessage } from '@azure/service-bus';
import { AzureBlobStorageService } from './azure-blob-storage.service';
import { AzureServiceBusService } from './azure-service-bus.service';
import { CloudConfig } from './cloud.config';
import { DataFileAvailableEvent, DataFileType } from './cloud.types';
import { DataImportService } from '../data-import/data-import.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DataFileConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DataFileConsumerService.name);
  private subscription?: { close(): Promise<void> };

  constructor(
    private readonly config: CloudConfig,
    private readonly bus: AzureServiceBusService,
    private readonly storage: AzureBlobStorageService,
    private readonly importer: DataImportService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    if (!this.config.enabled) {
      this.logger.log(
        'Integração Azure desabilitada; o processamento manual continua disponível.',
      );
      return;
    }

    const receiver = this.bus.createReceiver();
    this.subscription = receiver.subscribe({
      processMessage: async (message) => this.processMessage(message),
      processError: (error) => {
        this.logger.error(`Erro no consumidor Service Bus: ${error.error}`);
        return Promise.resolve();
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.subscription?.close();
  }

  private async processMessage(
    message: ServiceBusReceivedMessage,
  ): Promise<void> {
    const event = this.parseEvent(message.body);
    const existing = await this.prisma.dataFileEvent.findUnique({
      where: { eventId: event.eventId },
      select: { status: true },
    });
    if (existing?.status === 'PROCESSED') {
      await this.bus.createReceiver().completeMessage(message);
      this.logger.log(`Evento já processado: ${event.eventId}`);
      return;
    }
    await this.prisma.dataFileEvent.upsert({
      where: { eventId: event.eventId },
      update: { status: 'PROCESSING', errorMessage: null },
      create: {
        eventId: event.eventId,
        correlationId: event.correlationId,
        sha256: event.sha256,
        status: 'PROCESSING',
      },
    });
    const directory = await mkdtemp(join(tmpdir(), 'cafe-pi-data-'));
    try {
      const files = new Map<DataFileType, string>();
      files.set(
        event.dataFileType,
        join(directory, `${event.dataFileType}.csv`),
      );
      const downloaded = await this.storage.downloadToFile(
        event.blobName,
        files.get(event.dataFileType)!,
      );
      if (
        downloaded.sha256 !== event.sha256 ||
        downloaded.contentLength !== event.contentLength
      ) {
        throw new Error(`Integridade divergente para o blob ${event.blobName}`);
      }

      for (const related of event.relatedFiles ?? []) {
        const path = join(directory, `${related.dataFileType}.csv`);
        await this.storage.downloadToFile(related.blobName, path);
        files.set(related.dataFileType, path);
      }

      await this.importer.importTreatedFiles(
        files.get('clima'),
        files.get('safra'),
        files.get('regiao-uf'),
      );
      await this.prisma.dataFileEvent.update({
        where: { eventId: event.eventId },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });
      await this.bus.createReceiver().completeMessage(message);
      this.logger.log(
        `Arquivo processado: ${event.blobName} (${event.correlationId})`,
      );
    } catch (error) {
      this.logger.error(
        `Falha ao processar ${event.blobName} (${event.correlationId}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      await this.prisma.dataFileEvent.update({
        where: { eventId: event.eventId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  private parseEvent(body: unknown): DataFileAvailableEvent {
    if (
      !body ||
      typeof body !== 'object' ||
      (body as { eventType?: unknown }).eventType !== 'DataFileAvailable' ||
      (body as { eventVersion?: unknown }).eventVersion !== 1
    ) {
      throw new Error(
        'Mensagem inválida: esperado evento DataFileAvailable v1',
      );
    }
    const event = body as DataFileAvailableEvent;
    if (
      !event.eventId ||
      !event.correlationId ||
      !event.blobName ||
      !event.containerName ||
      event.containerName !== this.config.storageContainerName ||
      !event.dataFileType ||
      !event.sha256 ||
      !/^[a-f0-9]{64}$/i.test(event.sha256) ||
      !Number.isSafeInteger(event.contentLength) ||
      event.contentLength < 0 ||
      !['clima', 'safra', 'regiao-uf'].includes(event.dataFileType)
    ) {
      throw new Error('Mensagem inválida: faltam referência ao blob ou tipo');
    }
    return event;
  }
}
