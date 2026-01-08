export enum ProcessingStatus {
  IDLE = 'IDLE',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type Platform = 'General' | 'Adobe Stock' | 'Shutterstock' | 'iStock' | 'Getty Images' | 'Vecteezy' | 'Freepik';

export interface GenerationConfig {
  titleLength: number;
  descriptionLength: number;
  keywordsCount: number;
  contentType: string;
  customPrompt: string;
  targetPlatform: Platform;
}

export interface Metadata {
  title: string;
  description: string;
  tags: string;
  category: string;
  rawCsv: string;
}

export interface StockFile {
  id: string;
  file: File;
  status: ProcessingStatus;
  metadata: Metadata | null;
  error: string | null;
}