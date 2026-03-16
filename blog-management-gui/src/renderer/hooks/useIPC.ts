import { useState, useCallback } from 'react';
import type { IPCResponse } from '../../shared/types';

/**
 * useIPC - Generic hook for IPC communication
 * 
 * Provides a reusable pattern for making IPC calls with loading and error states
 * 
 * Usage:
 * ```tsx
 * const { data, loading, error, execute } = useIPC<Article[]>();
 * 
 * const loadArticles = async () => {
 *   await execute(() => window.electronAPI.article.list());
 * };
 * ```
 */
export function useIPC<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    ipcCall: () => Promise<IPCResponse<T>>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ipcCall();
      
      if (response.success && response.data !== undefined) {
        setData(response.data);
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || response.error?.message || 'Unknown error';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}
