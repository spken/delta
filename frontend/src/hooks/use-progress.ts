/**
 * Hook for progress calculations and time estimates
 */

import { useMemo } from 'react';
import type { AnalysisProgress } from '@/types/api';

interface ProgressDetails {
  elapsedSeconds: number;
  elapsedFormatted: string;
  remainingFormatted: string;
  progressPercentage: number;
}

export function useProgress(
  startedAt?: Date,
  progress?: AnalysisProgress
): ProgressDetails {
  return useMemo(() => {
    if (!startedAt || !progress) {
      return {
        elapsedSeconds: 0,
        elapsedFormatted: '0s',
        remainingFormatted: '—',
        progressPercentage: 0,
      };
    }

    const now = new Date();
    const elapsedMs = now.getTime() - startedAt.getTime();
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    return {
      elapsedSeconds,
      elapsedFormatted: formatSeconds(elapsedSeconds),
      remainingFormatted: progress.estimatedTimeRemaining
        ? formatSeconds(progress.estimatedTimeRemaining)
        : '—',
      progressPercentage: progress.progress,
    };
  }, [startedAt, progress]);
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}
