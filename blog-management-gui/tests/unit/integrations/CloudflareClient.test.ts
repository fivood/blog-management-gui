import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CloudflareClient } from '../../../src/main/integrations/CloudflareClient';
import { CloudflareConfig } from '../../../src/shared/types/config';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

// Mock modules
vi.mock('https');
vi.mock('fs');
vi.mock('path');

describe('CloudflareClient', () => {
  let client: CloudflareClient;
  let mockConfig: CloudflareConfig;

  beforeEach(() => {
    mockConfig = {
      apiToken: 'test-token-123',
      accountId: 'account-456',
      projectName: 'my-blog'
    };
    client = new CloudflareClient(mockConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      expect(client).toBeInstanceOf(CloudflareClient);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const newConfig: CloudflareConfig = {
        apiToken: 'new-token',
        accountId: 'new-account',
        projectName: 'new-project'
      };
      
      client.updateConfig(newConfig);
      
      // Verify by attempting to validate (which uses the config)
      expect(() => client['validateConfig']()).not.toThrow();
    });
  });

  describe('validateCredentials', () => {
    it('should return true for valid credentials', async () => {
      // Mock successful API response
      mockHttpsRequest({
        statusCode: 200,
        body: { success: true, result: {} }
      });

      const result = await client.validateCredentials();
      expect(result).toBe(true);
    });

    it('should return false for invalid credentials', async () => {
      // Mock failed API response
      mockHttpsRequest({
        statusCode: 401,
        body: { success: false, errors: [{ message: 'Invalid token' }] }
      });

      const result = await client.validateCredentials();
      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      // Mock network error
      mockHttpsRequestError(new Error('Network error'));

      const result = await client.validateCredentials();
      expect(result).toBe(false);
    });
  });

  describe('uploadFiles', () => {
    beforeEach(() => {
      // Mock file system operations
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'index.html', isDirectory: () => false, isFile: () => true } as any,
        { name: 'style.css', isDirectory: () => false, isFile: () => true } as any
      ]);
      vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from('test content'));
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
      vi.mocked(path.relative).mockImplementation((from, to) => to.replace(from + '/', ''));
    });

    it('should upload files successfully', async () => {
      // Mock API responses
      let callCount = 0;
      vi.mocked(https.request).mockImplementation((url: any, options: any, callback: any) => {
        const req = createMockRequest();
        
        setTimeout(() => {
          const res = createMockResponse(200, {
            success: true,
            result: callCount === 0 
              ? { id: 'deploy-123', url: 'https://my-blog.pages.dev' }
              : {}
          });
          callCount++;
          callback(res);
        }, 0);
        
        return req;
      });

      const result = await client.uploadFiles('/path/to/public');
      
      expect(result).toEqual({
        deploymentId: 'deploy-123',
        url: 'https://my-blog.pages.dev'
      });
    });

    it('should throw error if public directory does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await expect(client.uploadFiles('/nonexistent')).rejects.toThrow('Public directory not found');
    });

    it('should throw error if no files found', async () => {
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      await expect(client.uploadFiles('/path/to/public')).rejects.toThrow('No files found in public directory');
    });

    it('should throw error if API token is missing', async () => {
      client.updateConfig({ ...mockConfig, apiToken: '' });

      await expect(client.uploadFiles('/path/to/public')).rejects.toThrow('Cloudflare API token is required');
    });

    it('should throw error if account ID is missing', async () => {
      client.updateConfig({ ...mockConfig, accountId: '' });

      await expect(client.uploadFiles('/path/to/public')).rejects.toThrow('Cloudflare account ID is required');
    });

    it('should throw error if project name is missing', async () => {
      client.updateConfig({ ...mockConfig, projectName: '' });

      await expect(client.uploadFiles('/path/to/public')).rejects.toThrow('Cloudflare project name is required');
    });

    it('should handle API errors during deployment creation', async () => {
      mockHttpsRequest({
        statusCode: 500,
        body: { success: false, errors: [{ message: 'Internal server error' }] }
      });

      await expect(client.uploadFiles('/path/to/public')).rejects.toThrow('Internal server error');
    });
  });

  describe('getDeploymentStatus', () => {
    it('should return success status', async () => {
      mockHttpsRequest({
        statusCode: 200,
        body: {
          success: true,
          result: {
            id: 'deploy-123',
            url: 'https://my-blog.pages.dev',
            latest_stage: {
              name: 'deploy',
              status: 'success'
            }
          }
        }
      });

      const status = await client.getDeploymentStatus('deploy-123');
      
      expect(status).toEqual({
        id: 'deploy-123',
        status: 'success',
        url: 'https://my-blog.pages.dev'
      });
    });

    it('should return building status', async () => {
      mockHttpsRequest({
        statusCode: 200,
        body: {
          success: true,
          result: {
            id: 'deploy-123',
            url: 'https://my-blog.pages.dev',
            latest_stage: {
              name: 'build',
              status: 'active'
            }
          }
        }
      });

      const status = await client.getDeploymentStatus('deploy-123');
      expect(status.status).toBe('building');
    });

    it('should return deploying status', async () => {
      mockHttpsRequest({
        statusCode: 200,
        body: {
          success: true,
          result: {
            id: 'deploy-123',
            url: 'https://my-blog.pages.dev',
            latest_stage: {
              name: 'deploy',
              status: 'active'
            }
          }
        }
      });

      const status = await client.getDeploymentStatus('deploy-123');
      expect(status.status).toBe('deploying');
    });

    it('should return failed status', async () => {
      mockHttpsRequest({
        statusCode: 200,
        body: {
          success: true,
          result: {
            id: 'deploy-123',
            url: 'https://my-blog.pages.dev',
            latest_stage: {
              name: 'build',
              status: 'failure'
            }
          }
        }
      });

      const status = await client.getDeploymentStatus('deploy-123');
      expect(status.status).toBe('failed');
    });

    it('should handle API errors', async () => {
      mockHttpsRequest({
        statusCode: 404,
        body: { success: false, errors: [{ message: 'Deployment not found' }] }
      });

      await expect(client.getDeploymentStatus('deploy-123')).rejects.toThrow('Failed to get deployment status');
    });
  });

  describe('rate limiting', () => {
    it('should respect rate limits', async () => {
      // Set rate limit to 0
      const headers = {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 1) // Reset in 1 second
      };

      mockHttpsRequest({
        statusCode: 200,
        body: { success: true, result: {} },
        headers
      });

      // First call should succeed and set rate limit
      await client.validateCredentials();

      // Mock setTimeout to avoid actual waiting in tests
      const originalSetTimeout = global.setTimeout;
      let timeoutCalled = false;
      global.setTimeout = ((callback: any) => {
        timeoutCalled = true;
        callback();
        return {} as any;
      }) as any;

      // Second call should wait due to rate limit
      mockHttpsRequest({
        statusCode: 200,
        body: { success: true, result: {} }
      });

      await client.validateCredentials();
      
      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
      
      // Verify that rate limit was checked (timeout was called)
      expect(timeoutCalled).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle network timeout', async () => {
      vi.mocked(https.request).mockImplementation((url: any, options: any, callback: any) => {
        const req = {
          on: vi.fn(),
          write: vi.fn(),
          end: vi.fn(),
          setTimeout: vi.fn((timeout: number, handler: Function) => {
            // Immediately trigger timeout
            setTimeout(() => handler(), 0);
          }),
          destroy: vi.fn()
        };
        
        return req as any;
      });

      // validateCredentials catches errors and returns false
      const result = await client.validateCredentials();
      expect(result).toBe(false);
    });

    it('should handle malformed JSON response', async () => {
      vi.mocked(https.request).mockImplementation((url: any, options: any, callback: any) => {
        const req = createMockRequest();
        
        setTimeout(() => {
          const res = {
            statusCode: 200,
            headers: {},
            on: (event: string, handler: any) => {
              if (event === 'data') {
                handler('invalid json');
              } else if (event === 'end') {
                handler();
              }
            }
          };
          callback(res);
        }, 0);
        
        return req;
      });

      // validateCredentials catches errors and returns false
      const result = await client.validateCredentials();
      expect(result).toBe(false);
    });
  });
});

// Helper functions

function mockHttpsRequest(response: {
  statusCode: number;
  body: any;
  headers?: Record<string, string>;
}) {
  vi.mocked(https.request).mockImplementation((url: any, options: any, callback: any) => {
    const req = createMockRequest();
    
    setTimeout(() => {
      const res = createMockResponse(response.statusCode, response.body, response.headers);
      callback(res);
    }, 0);
    
    return req;
  });
}

function mockHttpsRequestError(error: Error) {
  vi.mocked(https.request).mockImplementation((url: any, options: any, callback: any) => {
    const req = createMockRequest();
    
    setTimeout(() => {
      req.emit('error', error);
    }, 0);
    
    return req;
  });
}

function createMockRequest() {
  const listeners: Record<string, Function[]> = {};
  
  return {
    on: (event: string, handler: Function) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
      return this;
    },
    emit: (event: string, ...args: any[]) => {
      if (listeners[event]) {
        listeners[event].forEach(handler => handler(...args));
      }
    },
    write: vi.fn(),
    end: vi.fn(),
    setTimeout: vi.fn(),
    destroy: vi.fn()
  };
}

function createMockResponse(statusCode: number, body: any, headers: Record<string, string> = {}) {
  const listeners: Record<string, Function[]> = {};
  
  return {
    statusCode,
    headers,
    on: (event: string, handler: Function) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
      
      // Immediately emit data and end events
      setTimeout(() => {
        if (event === 'data') {
          handler(JSON.stringify(body));
        } else if (event === 'end') {
          handler();
        }
      }, 0);
      
      return this;
    }
  };
}
