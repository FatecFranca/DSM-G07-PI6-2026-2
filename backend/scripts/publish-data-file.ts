import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import { AzureBlobStorageService } from '../src/cloud/azure-blob-storage.service';
import { AzureServiceBusService } from '../src/cloud/azure-service-bus.service';
import { CloudConfig } from '../src/cloud/cloud.config';
import { DataFileType, DataFileAvailableEvent } from '../src/cloud/cloud.types';

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Informe ${name}`);
  return value;
}

function parseRelated(value: string | undefined): {
  type: DataFileType;
  path: string;
} | undefined {
  if (!value) return undefined;
  const separator = value.indexOf(':');
  if (separator <= 0) {
    throw new Error('--related deve usar o formato tipo:caminho');
  }
  return {
    type: value.slice(0, separator) as DataFileType,
    path: value.slice(separator + 1),
  };
}

async function main(): Promise<void> {
  const [, , filePath, dataFileType, blobNameArg, relatedArg] = process.argv;
  const type = required(dataFileType, 'o tipo do arquivo (clima, safra ou regiao-uf)') as DataFileType;
  const config = new CloudConfig();
  const storage = new AzureBlobStorageService(config);
  const bus = new AzureServiceBusService(config);
  const blobName = blobNameArg ?? `${type}/${Date.now()}-${basename(required(filePath, 'o caminho do arquivo'))}`;
  const uploaded = await storage.uploadFile(required(filePath, 'o caminho do arquivo'), blobName);
  const related = parseRelated(relatedArg);
  const relatedUploaded = related
    ? await storage.uploadFile(
        related.path,
        `${related.type}/${Date.now()}-${basename(related.path)}`,
      )
    : undefined;
  const event: DataFileAvailableEvent = {
    eventType: 'DataFileAvailable',
    eventVersion: 1,
    eventId: randomUUID(),
    correlationId: randomUUID(),
    occurredAt: new Date().toISOString(),
    dataFileType: type,
    containerName: uploaded.containerName,
    blobName: uploaded.blobName,
    sha256: uploaded.sha256,
    contentLength: uploaded.contentLength,
    source: 'backend/scripts/publish-data-file.ts',
    relatedFiles: relatedUploaded
      ? [
          {
            dataFileType: related.type,
            containerName: relatedUploaded.containerName,
            blobName: relatedUploaded.blobName,
          },
        ]
      : undefined,
  };
  await bus.sendDataFileAvailable(event);
  console.log(`Evento publicado: ${event.eventId}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
