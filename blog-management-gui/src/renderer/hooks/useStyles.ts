import { useState, useCallback } from 'react';
import type { StyleConfiguration } from '../../shared/types';

/**
 * useStyles - Hook for style configuration operations
 * Requirements: 21.1-21.9, 22.1-22.8, 23.1-23.8, 24.1-24.7, 25.1-25.7, 28.1-28.7, 29.1-29.6, 30.1-30.7
 * 
 * Provides:
 * - Get/update style configuration
 * - Export/import style configuration
 * - Reset to default styles
 * - Style history management
 * 
 * Usage:
 * ```tsx
 * const { styleConfig, loading, getStyleConfig, updateStyleConfig } = useStyles();
 * 
 * useEffect(() => {
 *   getStyleConfig();
 * }, []);
 * ```
 */
export function useStyles() {
  const [styleConfig, setStyleConfig] = useState<StyleConfiguration | null>(null);
  const [styleHistory, setStyleHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Get style configuration
  const getStyleConfig = useCallback(async (): Promise<StyleConfiguration | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.style.get();
      
      if (response.success && response.data) {
        setStyleConfig(response.data);
        setIsDirty(false);
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to load style configuration';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load style configuration';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update style configuration
  const updateStyleConfig = useCallback(async (
    config: Partial<StyleConfiguration>,
    description?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.style.update(config, description);
      
      if (response.success) {
        // Refresh config
        await getStyleConfig();
        return true;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to update style configuration';
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update style configuration';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getStyleConfig]);

  // Export style configuration
  const exportStyleConfig = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.style.export();
      
      if (response.success && response.data) {
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to export style configuration';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export style configuration';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Import style configuration
  const importStyleConfig = useCallback(async (jsonString: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.style.import(jsonString);
      
      if (response.success) {
        // Refresh config
        await getStyleConfig();
        return true;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to import style configuration';
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import style configuration';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getStyleConfig]);

  // Reset to default styles
  const resetToDefault = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.style.reset();
      
      if (response.success) {
        // Refresh config
        await getStyleConfig();
        return true;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to reset styles';
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset styles';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getStyleConfig]);

  // Get style history
  const getStyleHistory = useCallback(async (): Promise<any[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.style.getHistory();
      
      if (response.success && response.data) {
        setStyleHistory(response.data);
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to load style history';
        setError(errorMessage);
        return [];
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load style history';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore from history
  const restoreFromHistory = useCallback(async (historyId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.style.restoreFromHistory(historyId);
      
      if (response.success) {
        // Refresh config
        await getStyleConfig();
        return true;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to restore from history';
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore from history';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getStyleConfig]);

  // Update local config (for preview without saving)
  const updateLocalConfig = useCallback((updates: Partial<StyleConfiguration>) => {
    if (styleConfig) {
      setStyleConfig({ ...styleConfig, ...updates });
      setIsDirty(true);
    }
  }, [styleConfig]);

  return {
    styleConfig,
    styleHistory,
    loading,
    error,
    isDirty,
    getStyleConfig,
    updateStyleConfig,
    exportStyleConfig,
    importStyleConfig,
    resetToDefault,
    getStyleHistory,
    restoreFromHistory,
    updateLocalConfig
  };
}
