import { Injectable } from '@nestjs/common';
import { DefaultAzureCredential } from '@azure/identity';
import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
} from '@azure/storage-blob';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat, writeFile } from 'node:fs/promises';
import { CloudConfig } from './cloud.config';

export interface UploadedDataFile {
  containerName: string;
  blobName: string;
  sha256: string;
  contentLength: number;
}

@Injectable()
export class AzureBlobStorageService {
  private client?: BlobServiceClient;

  constructor(private readonly config: CloudConfig) {}

  async uploadFile(
    filePath: string,
    blobName: string,
  ): Promise<UploadedDataFile> {
    const fileStats = await stat(filePath);
    const sha256 = await this.sha256(filePath);
    await this.container().createIfNotExists();
    const blob = this.blockBlob(blobName);

    await blob.uploadStream(createReadStream(filePath), undefined, undefined, {
      blobHTTPHeaders: { blobContentType: 'text/csv; charset=utf-8' },
      metadata: { sha256 },
    });

    return {
      containerName: this.config.storageContainerName,
      blobName,
      sha256,
      contentLength: fileStats.size,
    };
  }

  async downloadToFile(
    blobName: string,
    destinationPath: string,
  ): Promise<void> {
    const response = await this.blockBlob(blobName).download();
    if (!response.readableStreamBody) {
      throw new Error(`Blob sem conteúdo legível: ${blobName}`);
    }

    const chunks: Buffer[] = [];
    for await (const chunk of response.readableStreamBody) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const content = Buffer.concat(chunks);
    await writeFile(destinationPath, content);
  }

  private blockBlob(blobName: string): BlockBlobClient {
    return this.container().getBlockBlobClient(blobName);
  }

  private container(): ContainerClient {
    const client = this.serviceClient();
    return client.getContainerClient(this.config.storageContainerName);
  }

  private serviceClient(): BlobServiceClient {
    if (this.client) return this.client;
    this.config.assertStorageConfiguration();
    this.client = this.config.storageConnectionString
      ? BlobServiceClient.fromConnectionString(
          this.config.storageConnectionString,
        )
      : new BlobServiceClient(
          `https://${this.config.storageAccountName}.blob.core.windows.net`,
          new DefaultAzureCredential(),
        );
    return this.client;
  }

  private async sha256(filePath: string): Promise<string> {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    for await (const chunk of stream as AsyncIterable<Buffer>) {
      hash.update(chunk);
    }
    return hash.digest('hex');
  }
}
