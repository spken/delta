/**
 * Global analysis state management with Context API
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { mrAnalysisService } from '@/config/api-config';
import type { AnalysisProgress } from '@/types/api';
import type { AnalysisResult } from '@/types/mr';

export type AnalysisStatus = 'idle' | 'analyzing' | 'success' | 'error';

interface CurrentAnalysis {
  status: AnalysisStatus;
  progress?: AnalysisProgress;
  result?: AnalysisResult;
  error?: string;
  startedAt?: Date;
  url?: string;
}

interface AnalysisContextValue {
  currentAnalysis: CurrentAnalysis;
  startAnalysis: (url: string) => Promise<AnalysisResult>;
  resetAnalysis: () => void;
  retryAnalysis: () => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextValue | undefined>(undefined);

interface AnalysisProviderProps {
  children: ReactNode;
}

export function AnalysisProvider({ children }: AnalysisProviderProps) {
  const [currentAnalysis, setCurrentAnalysis] = useState<CurrentAnalysis>({
    status: 'idle',
  });

  const startAnalysis = useCallback(async (url: string): Promise<AnalysisResult> => {
    setCurrentAnalysis({
      status: 'analyzing',
      startedAt: new Date(),
      url,
    });

    try {
      const result = await mrAnalysisService.analyzeAsync(url, (progress) => {
        setCurrentAnalysis((prev) => ({
          ...prev,
          progress,
        }));
      });

      setCurrentAnalysis({
        status: 'success',
        result,
        url,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setCurrentAnalysis({
        status: 'error',
        error: errorMessage,
        url,
      });
      throw error;
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setCurrentAnalysis({
      status: 'idle',
    });
  }, []);

  const retryAnalysis = useCallback(async () => {
    const { url } = currentAnalysis;
    if (!url) {
      throw new Error('No URL to retry');
    }
    await startAnalysis(url);
  }, [currentAnalysis, startAnalysis]);

  const value: AnalysisContextValue = {
    currentAnalysis,
    startAnalysis,
    resetAnalysis,
    retryAnalysis,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
}
