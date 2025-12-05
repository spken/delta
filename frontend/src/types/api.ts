/**
 * API-related type definitions
 */

export interface AnalysisProgress {
  stage: 'fetching' | 'parsing' | 'analyzing' | 'summarizing';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
