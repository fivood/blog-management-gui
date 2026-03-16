import { useState, useCallback, useEffect } from 'react';
import type { DeployResult, DeploymentStatus } from '../../shared/types';

/**
 * useDeploy - Hook for Cloudflare Pages deployment
 * Requirements: 12.1-12.7, 13.1-13.7
 * 
 * Provides:
 * - Deploy to Cloudflare Pages
 * - Validate credentials
 * - Get deployment status
 * - Track deployment progress
 * 
 * Usage:
 * ```tsx
 * const { deployStatus, progress, deploy, validateCredentials } = useDeploy();
 * 
 * const handleDeploy = async () => {
 *   const result = await deploy();
 *   if (result) {
 *     console.log('Deployed to:', result.url);
 *   }
 * };
 * ```
 */
export function useDeploy() {
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up progress listener
  useEffect(() => {
    const handleProgress = (data: { progress: number; message: string }) => {
      setProgress(data.progress);
      setProgressMessage(data.message);
    };

    window.electronAPI.deploy.onProgress(handleProgress);

    return () => {
      window.electronAPI.deploy.removeProgressListener();
    };
  }, []);

  // Deploy to Cloudflare Pages
  const deploy = useCallback(async (): Promise<DeployResult | null> => {
    setDeployStatus('deploying');
    setProgress(0);
    setProgressMessage('Starting deployment...');
    setDeployResult(null);
    setError(null);

    try {
      const response = await window.electronAPI.deploy.execute();
      
      if (response.success && response.data) {
        setDeployStatus('success');
        setDeployResult(response.data);
        setProgress(100);
        setProgressMessage('Deployment complete');
        return response.data;
      } else {
        setDeployStatus('error');
        const errorMessage = response.error?.userMessage || 'Deployment failed';
        setError(errorMessage);
        setProgress(0);
        setProgressMessage('');
        return null;
      }
    } catch (err) {
      setDeployStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Deployment failed';
      setError(errorMessage);
      setProgress(0);
      setProgressMessage('');
      return null;
    }
  }, []);

  // Validate Cloudflare credentials
  const validateCredentials = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.deploy.validate();
      
      if (response.success && response.data) {
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Invalid credentials';
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate credentials';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get deployment status
  const getDeploymentStatus = useCallback(async (
    deploymentId: string
  ): Promise<DeploymentStatus | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.deploy.getStatus(deploymentId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to get deployment status';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get deployment status';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset deployment state
  const resetDeployment = useCallback(() => {
    setDeployStatus('idle');
    setDeployResult(null);
    setProgress(0);
    setProgressMessage('');
    setError(null);
  }, []);

  return {
    deployStatus,
    deployResult,
    progress,
    progressMessage,
    loading,
    error,
    deploy,
    validateCredentials,
    getDeploymentStatus,
    resetDeployment
  };
}
