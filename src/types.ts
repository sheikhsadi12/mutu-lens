export interface ProcessedImage {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  extractedText?: string;
  explanation?: string;
  latency?: number;
  error?: string;
  croppedDataUrl?: string;
}

export interface ExtractionRecord {
  id: string;
  image_data: string;
  extracted_text: string;
  latency: number;
  created_at: string;
}

export type Theme = 'light' | 'dark';
