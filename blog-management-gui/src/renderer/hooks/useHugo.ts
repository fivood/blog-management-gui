import { useState, useCallback, useEffect } from 'react';
import type { HugoConfig, BuildOptions, BuildResult, PreviewServer } from '../../shared/types';

/**
 * useHugo - Hook for Hugo build operations
 * Requirements: 9.1-9.6, 10.1-10.5, 11.1-11.4, 21.1-21.9
 * 
 * Provides:
 * - Build site
 * - Start/stop preview server
 * - Get/update Hugo configuration
 * - Build output streaming
 * 
 * Usage:
 * ```tsx
 * const { buildStatus, buildOutput, build, startPreview } = useHugo();
 * 
 * const handleBuild = async () => {
 *   await build({ minify: true });
 * };
 * ```
 */
export function useHugo() {
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success' | 'error'>('idle');
  const [buildOutput, setBuildOutput] = useState<string[]>([]);
  const [buildResult, setBuildResult] = useState<BuildResult | null>(null);
  const [previewServer, setPreviewServer] = useState<PreviewServer | null>(null);
  const [previewRunning, setPreviewRunning] = useState(false);
  const [config, setConfig] = useState<HugoConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up build output listener
  useEffect(() => {
    const handleBuildOutput = (output: string) => {
      setBuildOutput(prev => [...prev, output]);
    };

    window.electronAPI.hugo.onBuildOutput(handleBuildOutput);

    return () => {
      window.electronAPI.hugo.removeBuildOutputListener();
    };
  }, []);

  // Build site
  const build = useCallback(async (options?: BuildOptions): Promise<BuildResult | null> => {
    setBuildStatus('building');
    setBuildOutput([]);
    setBuildResult(null);
    setError(null);

    try {
      const response = await window.electronAPI.hugo.build(options);
      
      if (response.success && response.data) {
        setBuildStatus('success');
        setBuildResult(response.data);
        return response.data;
      } else {
        setBuildStatus('error');
        const errorMessage = response.error?.userMessage || 'Build failed';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      setBuildStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Build failed';
      setError(errorMessage);
      return null;
    }
  }, []);

  // Start preview server
  const startPreview = useCallback(async (port?: number): Promise<PreviewServer | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.hugo.previewStart(port);
      
      if (response.success && response.data) {
        setPreviewServer(response.data);
        setPreviewRunning(true);
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to start preview server';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start preview server';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Stop preview server
  const stopPreview = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.hugo.previewStop();
      
      if (response.success) {
        setPreviewServer(null);
        setPreviewRunning(false);
        return true;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to stop preview server';
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop preview server';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Hugo configuration
  const getConfig = useCallback(async (): Promise<HugoConfig | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.hugo.getConfig();
      
      if (response.success && response.data) {
        setConfig(response.data);
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to load configuration';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update Hugo configuration
  const updateConfig = useCallback(async (updates: Partial<HugoConfig>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.hugo.updateConfig(updates);
      
      if (response.success) {
        // Refresh config
        await getConfig();
        return true;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to update configuration';
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update configuration';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getConfig]);

  // Clear build output
  const clearBuildOutput = useCallback(() => {
    setBuildOutput([]);
  }, []);

  // Reset build status
  const resetBuildStatus = useCallback(() => {
    setBuildStatus('idle');
    setBuildResult(null);
    setError(null);
  }, []);

  return {
    buildStatus,
    buildOutput,
    buildResult,
    previewServer,
    previewRunning,
    config,
    loading,
    error,
    build,
    startPreview,
    stopPreview,
    getConfig,
    updateConfig,
    clearBuildOutput,
    resetBuildStatus
  };
}
