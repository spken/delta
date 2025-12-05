/**
 * Real API implementation (to be connected to actual backend)
 */

import type { MRAnalysisService } from './types';
import type { AnalysisProgress } from '@/types/api';
import type { AnalysisResult } from '@/types/mr';

export class RealMRAnalysisService implements MRAnalysisService {
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com') {
    this.baseUrl = baseUrl;
  }

  async analyzeAsync(
    url: string,
    onProgress: (progress: AnalysisProgress) => void
  ): Promise<AnalysisResult> {
    // TODO: Implement actual API calls when backend is available
    // This would typically:
    // 1. POST to /api/analyze with the MR URL
    // 2. Poll /api/analyze/:id/status for progress updates
    // 3. Call onProgress callback with updates
    // 4. Return the final result when complete

    throw new Error('Real API not implemented yet. Use mock API for development.');
  }
}
