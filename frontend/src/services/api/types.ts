/**
 * Service layer type definitions
 */

import type { AnalysisProgress } from '@/types/api';
import type { AnalysisResult } from '@/types/mr';

export interface MRAnalysisService {
  /**
   * Analyzes a GitLab MR and provides progress updates
   * @param url - GitLab MR URL
   * @param onProgress - Callback for progress updates
   * @returns Analysis result
   */
  analyzeAsync(
    url: string,
    onProgress: (progress: AnalysisProgress) => void
  ): Promise<AnalysisResult>;
}
