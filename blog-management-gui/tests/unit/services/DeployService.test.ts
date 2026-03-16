import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DeployService } from '../../../src/main/services/DeployService';
import { CloudflareClient } from '../../../src/main/integrations/CloudflareClient';
import { CloudflareConfig, DeploymentStatus } from '../../../src/shared/types/config';

// Mock CloudflareClient
vi.mock('../../../src/main/integrations/CloudflareClient');

describe('DeployService', () => {
  let service: DeployService;
  let mockConfig: CloudflareConfig;
  let mockCloudflareClient: any;

  beforeEach(() => {
    mockConfig = {
      apiToken: 'test-token',
      accountId: 'test-account',
      projectName: 'test-project'
    };

    // Create mock CloudflareClient instance
    mockCloudflareClient = {
      updateConfig: vi.fn(),
      validateCredentials: vi.fn(),
      uploadFiles: vi.fn(),
      getDeploymentStatus: vi.fn()
    };

    // Mock the constructor to return our mock instance
    vi.mocked(CloudflareClient).mockImplementation(() => mockCloudflareClient);

    service = new DeployService(mockConfig, '/path/to/hugo');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      expect(service).toBeInstanceOf(DeployService);
      expect(CloudflareClient).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe('updateConfig', () => {
    it('should update CloudflareClient configuration', () => {
      const newConfig: CloudflareConfig = {
        apiToken: 'new-token',
        accountId: 'new-account',
        projectName: 'new-project'
      };

      service.updateConfig(newConfig);

      expect(mockCloudflareClient.updateConfig).toHaveBeenCalledWith(newConfig);
    });
  });

  describe('updateHugoProjectPath', () => {
    it('should update Hugo project path', () => {
      service.updateHugoProjectPath('/new/path');
      
      // Verify by deploying (which uses the path)
      // We'll just check that the service doesn't throw
      expect(() => service.updateHugoProjectPath('/new/path')).not.toThrow();
    });
  });

  describe('setProgressCallback', () => {
    it('should set progress callback', () => {
      const callback = vi.fn();
      service.setProgressCallback(callback);
      
      // Verify by triggering a deployment that calls the callback
      expect(() => service.setProgressCallback(callback)).not.toThrow();
    });
  });

  describe('validateCredentials', () => {
    it('should return true for valid credentials', async () => {
      mockCloudflareClient.validateCredentials.mockResolvedValue(true);

      const result = await service.validateCredentials();

      expect(result).toBe(true);
      expect(mockCloudflareClient.validateCredentials).toHaveBeenCalled();
    });

    it('should return false for invalid credentials', async () => {
      mockCloudflareClient.validateCredentials.mockResolvedValue(false);

      const result = await service.validateCredentials();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockCloudflareClient.validateCredentials.mockRejectedValue(new Error('Network error'));

      const result = await service.validateCredentials();

      expect(result).toBe(false);
    });
  });

  describe('deploy', () => {
    beforeEach(() => {
      // Mock setTimeout to execute immediately
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should deploy successfully', async () => {
      // Mock successful upload
      mockCloudflareClient.uploadFiles.mockResolvedValue({
        deploymentId: 'deploy-123',
        url: 'https://test.pages.dev'
      });

      // Mock deployment status progression
      mockCloudflareClient.getDeploymentStatus
        .mockResolvedValueOnce({
          id: 'deploy-123',
          status: 'building',
          url: 'https://test.pages.dev'
        } as DeploymentStatus)
        .mockResolvedValueOnce({
          id: 'deploy-123',
          status: 'deploying',
          url: 'https://test.pages.dev'
        } as DeploymentStatus)
        .mockResolvedValueOnce({
          id: 'deploy-123',
          status: 'success',
          url: 'https://test.pages.dev'
        } as DeploymentStatus);

      const deployPromise = service.deploy();
      await vi.runAllTimersAsync();
      const result = await deployPromise;

      expect(result).toEqual({
        success: true,
        deploymentId: 'deploy-123',
        url: 'https://test.pages.dev'
      });
      expect(mockCloudflareClient.uploadFiles).toHaveBeenCalled();
      const callArg = mockCloudflareClient.uploadFiles.mock.calls[0][0];
      expect(callArg).toContain('public');
    });

    it('should handle deployment failure', async () => {
      mockCloudflareClient.uploadFiles.mockResolvedValue({
        deploymentId: 'deploy-123',
        url: 'https://test.pages.dev'
      });

      mockCloudflareClient.getDeploymentStatus.mockResolvedValue({
        id: 'deploy-123',
        status: 'failed',
        url: 'https://test.pages.dev'
      } as DeploymentStatus);

      const result = await service.deploy();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Deployment failed');
    });

    it('should handle upload error', async () => {
      mockCloudflareClient.uploadFiles.mockRejectedValue(new Error('Upload failed'));

      const result = await service.deploy();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload failed');
    });

    it('should call progress callback during deployment', async () => {
      const progressCallback = vi.fn();
      service.setProgressCallback(progressCallback);

      mockCloudflareClient.uploadFiles.mockResolvedValue({
        deploymentId: 'deploy-123',
        url: 'https://test.pages.dev'
      });

      mockCloudflareClient.getDeploymentStatus.mockResolvedValue({
        id: 'deploy-123',
        status: 'success',
        url: 'https://test.pages.dev'
      } as DeploymentStatus);

      await service.deploy();

      expect(progressCallback).toHaveBeenCalledWith(0, 'Starting deployment...');
      expect(progressCallback).toHaveBeenCalledWith(20, 'Uploading files to Cloudflare...');
      expect(progressCallback).toHaveBeenCalledWith(50, 'Monitoring deployment status...');
      expect(progressCallback).toHaveBeenCalledWith(100, 'Deployment completed successfully!');
    });

    it('should report building progress', async () => {
      const progressCallback = vi.fn();
      service.setProgressCallback(progressCallback);

      mockCloudflareClient.uploadFiles.mockResolvedValue({
        deploymentId: 'deploy-123',
        url: 'https://test.pages.dev'
      });

      mockCloudflareClient.getDeploymentStatus
        .mockResolvedValueOnce({
          id: 'deploy-123',
          status: 'building',
          url: 'https://test.pages.dev'
        } as DeploymentStatus)
        .mockResolvedValueOnce({
          id: 'deploy-123',
          status: 'success',
          url: 'https://test.pages.dev'
        } as DeploymentStatus);

      const deployPromise = service.deploy();
      await vi.runAllTimersAsync();
      await deployPromise;

      expect(progressCallback).toHaveBeenCalledWith(60, 'Building website...');
    });

    it('should report deploying progress', async () => {
      const progressCallback = vi.fn();
      service.setProgressCallback(progressCallback);

      mockCloudflareClient.uploadFiles.mockResolvedValue({
        deploymentId: 'deploy-123',
        url: 'https://test.pages.dev'
      });

      mockCloudflareClient.getDeploymentStatus
        .mockResolvedValueOnce({
          id: 'deploy-123',
          status: 'deploying',
          url: 'https://test.pages.dev'
        } as DeploymentStatus)
        .mockResolvedValueOnce({
          id: 'deploy-123',
          status: 'success',
          url: 'https://test.pages.dev'
        } as DeploymentStatus);

      const deployPromise = service.deploy();
      await vi.runAllTimersAsync();
      await deployPromise;

      expect(progressCallback).toHaveBeenCalledWith(80, 'Deploying to Cloudflare Pages...');
    });

    it('should handle unexpected deployment status', async () => {
      mockCloudflareClient.uploadFiles.mockResolvedValue({
        deploymentId: 'deploy-123',
        url: 'https://test.pages.dev'
      });

      // Mock a status that never completes (will timeout in test)
      mockCloudflareClient.getDeploymentStatus.mockResolvedValue({
        id: 'deploy-123',
        status: 'queued',
        url: 'https://test.pages.dev'
      } as DeploymentStatus);

      // Mock setTimeout to avoid actual waiting
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = ((callback: any) => {
        callback();
        return {} as any;
      }) as any;

      const result = await service.deploy();

      // Restore setTimeout
      global.setTimeout = originalSetTimeout;

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('should continue polling on status check error', async () => {
      mockCloudflareClient.uploadFiles.mockResolvedValue({
        deploymentId: 'deploy-123',
        url: 'https://test.pages.dev'
      });

      // First call fails, second succeeds
      mockCloudflareClient.getDeploymentStatus
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          id: 'deploy-123',
          status: 'success',
          url: 'https://test.pages.dev'
        } as DeploymentStatus);

      const deployPromise = service.deploy();
      await vi.runAllTimersAsync();
      const result = await deployPromise;

      expect(result.success).toBe(true);
    });
  });

  describe('getDeploymentStatus', () => {
    it('should return deployment status', async () => {
      const mockStatus: DeploymentStatus = {
        id: 'deploy-123',
        status: 'success',
        url: 'https://test.pages.dev'
      };

      mockCloudflareClient.getDeploymentStatus.mockResolvedValue(mockStatus);

      const result = await service.getDeploymentStatus('deploy-123');

      expect(result).toEqual(mockStatus);
      expect(mockCloudflareClient.getDeploymentStatus).toHaveBeenCalledWith('deploy-123');
    });

    it('should propagate errors', async () => {
      mockCloudflareClient.getDeploymentStatus.mockRejectedValue(new Error('Not found'));

      await expect(service.getDeploymentStatus('deploy-123')).rejects.toThrow('Not found');
    });
  });

  describe('cancelDeployment', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should cancel deployment monitoring', async () => {
      const progressCallback = vi.fn();
      service.setProgressCallback(progressCallback);

      mockCloudflareClient.uploadFiles.mockResolvedValue({
        deploymentId: 'deploy-123',
        url: 'https://test.pages.dev'
      });

      // Mock a long-running deployment
      let callCount = 0;
      mockCloudflareClient.getDeploymentStatus.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          // Cancel during first poll
          service.cancelDeployment();
        }
        return {
          id: 'deploy-123',
          status: 'building',
          url: 'https://test.pages.dev'
        } as DeploymentStatus;
      });

      const deployPromise = service.deploy();
      await vi.runAllTimersAsync();
      const result = await deployPromise;

      expect(result.success).toBe(false);
      expect(result.error).toContain('cancelled');
      expect(progressCallback).toHaveBeenCalledWith(0, 'Deployment monitoring cancelled');
    });
  });

  describe('edge cases', () => {
    it('should handle empty deployment ID', async () => {
      mockCloudflareClient.uploadFiles.mockRejectedValue(new Error('Invalid request'));

      const result = await service.deploy();

      expect(result.deploymentId).toBe('');
    });

    it('should handle missing URL in status', async () => {
      mockCloudflareClient.uploadFiles.mockResolvedValue({
        deploymentId: 'deploy-123',
        url: 'https://test.pages.dev'
      });

      mockCloudflareClient.getDeploymentStatus.mockResolvedValue({
        id: 'deploy-123',
        status: 'success'
        // url is missing
      } as DeploymentStatus);

      const result = await service.deploy();

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://test.pages.dev'); // Falls back to upload URL
    });

    it('should handle non-Error exceptions', async () => {
      mockCloudflareClient.uploadFiles.mockRejectedValue('String error');

      const result = await service.deploy();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });
});
