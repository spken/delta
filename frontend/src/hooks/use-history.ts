/**
 * Hook for history management with IndexedDB
 */

import { useState, useEffect, useCallback } from 'react';
import { historyStorage } from '@/services/storage/history-storage';
import type { AnalysisResult } from '@/types/mr';

interface UseHistoryReturn {
  history: AnalysisResult[];
  loading: boolean;
  error: string | null;
  saveToHistory: (result: AnalysisResult) => Promise<void>;
  deleteFromHistory: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  refreshHistory: () => Promise<void>;
}

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await historyStorage.getAll();
      setHistory(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToHistory = useCallback(async (result: AnalysisResult) => {
    try {
      await historyStorage.save(result);
      await loadHistory();
    } catch (err) {
      console.error('Error saving to history:', err);
      throw err;
    }
  }, [loadHistory]);

  const deleteFromHistory = useCallback(async (id: string) => {
    try {
      await historyStorage.delete(id);
      await loadHistory();
    } catch (err) {
      console.error('Error deleting from history:', err);
      throw err;
    }
  }, [loadHistory]);

  const clearHistory = useCallback(async () => {
    try {
      await historyStorage.clear();
      setHistory([]);
    } catch (err) {
      console.error('Error clearing history:', err);
      throw err;
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    error,
    saveToHistory,
    deleteFromHistory,
    clearHistory,
    refreshHistory: loadHistory,
  };
}
