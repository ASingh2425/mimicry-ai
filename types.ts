export interface StyleMetrics {
  creativity: number;
  technicality: number;
  conciseness: number;
  vocabulary: number;
  emotion: number;
}

export interface AnalysisResult {
  systemInstruction: string;
  metrics: StyleMetrics;
  summary: string;
}

export enum AppState {
  INGEST = 'INGEST',
  TUNING = 'TUNING',
  STUDIO = 'STUDIO',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}