export type DataFileType = 'clima' | 'safra' | 'regiao-uf';

export interface DataFileAvailableEvent {
  eventType: 'DataFileAvailable';
  eventVersion: 1;
  eventId: string;
  correlationId: string;
  occurredAt: string;
  dataFileType: DataFileType;
  containerName: string;
  blobName: string;
  sha256: string;
  contentLength: number;
  source: string;
  relatedFiles?: Array<{
    dataFileType: DataFileType;
    containerName: string;
    blobName: string;
  }>;
  period?: {
    start?: string;
    end?: string;
  };
}
