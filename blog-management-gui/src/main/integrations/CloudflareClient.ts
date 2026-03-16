import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { CloudflareConfig, DeploymentStatus } from '../../shared/types/config';

/**
 * CloudflareClient handles Cloudflare Pages API integration
 * 
 * Requirements:
 * - 12.1-12.7: Deploy to Cloudflare Pages
 * - 13.1-13.7: Cloudflare configuration management
 */
export class CloudflareClient {
  private readonly apiBaseUrl = 'https://api.cloudflare.com/client/v4';
  private config: CloudflareConfig;
  private rateLimitRemaining: number = 1200; // Cloudflare default
  private rateLimitReset: number = Date.now();

  constructor(config: CloudflareConfig) {
    this.config = config;
  }

  /**
   * Update Cloudflare configuration
   */
  updateConfig(config: CloudflareConfig): void {
    this.config = config;
  }

  /**
   * Validate Cloudflare credentials
   * Requirements: 12.2, 13.6 - Verify API credentials
   */
  async validateCredentials(): Promise<boolean> {
    try {
      console.log('Validating Cloudflare credentials...');
      console.log('API Base URL:', this.apiBaseUrl);
      console.log('Token length:', this.config.apiToken?.length || 0);
      console.log('Token prefix:', this.config.apiToken?.substring(0, 10) + '...');
      
      // Verify token by calling the token verification endpoint
      // This endpoint requires account ID
      if (!this.config.accountId) {
        console.error('Account ID is required for token verification');
        return false;
      }
      
      const response = await this.makeRequest<{ success: boolean; result?: any; errors?: any[] }>(
        'GET', 
        `accounts/${this.config.accountId}/tokens/verify`
      );
      
      console.log('Cloudflare API response:', JSON.stringify(response, null, 2));
      
      if (response.success === true) {
        console.log('✅ Token validation successful');
        return true;
      } else {
        console.log('❌ Token validation failed');
        if (response.errors && response.errors.length > 0) {
          console.log('Cloudflare API errors:', response.errors);
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Credential validation exception:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return false;
    }
  }

  /**
   * Upload files to Cloudflare Pages
   * Requirements: 12.3 - Upload public folder contents
   */
  async uploadFiles(publicDir: string): Promise<{ deploymentId: string; url: string }> {
    console.log('=== CloudflareClient.uploadFiles ===');
    console.log('Public directory:', publicDir);
    
    // Check rate limit before proceeding
    await this.checkRateLimit();

    // Validate configuration
    this.validateConfig();

    // Get list of files to upload
    const files = await this.getFilesToUpload(publicDir);
    console.log('Files to upload:', files.length);
    
    if (files.length === 0) {
      throw new Error('No files found in public directory');
    }

    // Create manifest - array of file paths (not hashes)
    const manifest: string[] = [];
    for (const file of files) {
      const normalizedPath = '/' + file.replace(/\\/g, '/');
      manifest.push(normalizedPath);
    }
    console.log('Manifest created with', manifest.length, 'entries');
    console.log('Manifest sample (first 5):', manifest.slice(0, 5));

    // Create deployment with manifest
    const deployment = await this.createDeployment(manifest);
    console.log('Deployment created:', deployment.id);
    
    try {
      // Upload files in batches to avoid overwhelming the API
      await this.uploadFilesInBatches(publicDir, files, deployment.id);
      console.log('Files uploaded successfully');
      
      // Finalize deployment
      await this.finalizeDeployment(deployment.id);
      console.log('Deployment finalized');
      
      return {
        deploymentId: deployment.id,
        url: deployment.url
      };
    } catch (error) {
      console.error('Upload error:', error);
      // Attempt to cancel failed deployment
      await this.cancelDeployment(deployment.id).catch(() => {
        // Ignore cancellation errors
      });
      throw error;
    }
  }

  /**
   * Get deployment status
   * Requirements: 12.4 - Track deployment progress
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    try {
      const endpoint = `/accounts/${this.config.accountId}/pages/projects/${this.config.projectName}/deployments/${deploymentId}`;
      
      const response = await this.makeRequest<{
        result: {
          id: string;
          url: string;
          latest_stage: {
            name: string;
            status: string;
          };
        };
      }>('GET', endpoint);

      const result = response.result;
      const stage = result.latest_stage;

      // Map Cloudflare status to our status enum
      let status: DeploymentStatus['status'] = 'queued';
      if (stage.status === 'success') {
        status = 'success';
      } else if (stage.status === 'failure' || stage.status === 'canceled') {
        status = 'failed';
      } else if (stage.name === 'build') {
        status = 'building';
      } else if (stage.name === 'deploy') {
        status = 'deploying';
      }

      return {
        id: result.id,
        status,
        url: result.url
      };
    } catch (error) {
      console.error('Failed to get deployment status:', error);
      throw new Error(`Failed to get deployment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate configuration completeness
   */
  private validateConfig(): void {
    if (!this.config.apiToken) {
      throw new Error('Cloudflare API token is required');
    }
    if (!this.config.accountId) {
      throw new Error('Cloudflare account ID is required');
    }
    if (!this.config.projectName) {
      throw new Error('Cloudflare project name is required');
    }
  }

  /**
   * Check rate limit and wait if necessary
   * Requirements: 12.6 - Handle API rate limiting
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    // If rate limit is exhausted and reset time hasn't passed, wait
    if (this.rateLimitRemaining <= 0 && now < this.rateLimitReset) {
      const waitTime = this.rateLimitReset - now;
      console.log(`Rate limit exceeded. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimit(headers: Record<string, string>): void {
    if (headers['x-ratelimit-remaining']) {
      this.rateLimitRemaining = parseInt(headers['x-ratelimit-remaining'], 10);
    }
    if (headers['x-ratelimit-reset']) {
      this.rateLimitReset = parseInt(headers['x-ratelimit-reset'], 10) * 1000; // Convert to ms
    }
  }

  /**
   * Get list of files to upload from public directory
   */
  private async getFilesToUpload(publicDir: string): Promise<string[]> {
    const files: string[] = [];
    
    const scanDirectory = (dir: string): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.isFile()) {
          // Get relative path from public directory
          const relativePath = path.relative(publicDir, fullPath);
          files.push(relativePath);
        }
      }
    };

    if (!fs.existsSync(publicDir)) {
      throw new Error(`Public directory not found: ${publicDir}`);
    }

    scanDirectory(publicDir);
    return files;
  }

  /**
   * Create a new deployment
   */
  private async createDeployment(manifest: string[]): Promise<{ id: string; url: string }> {
    const endpoint = `/accounts/${this.config.accountId}/pages/projects/${this.config.projectName}/deployments`;
    
    console.log('Creating deployment with manifest...');
    console.log('Endpoint:', endpoint);
    console.log('Manifest entries:', manifest.length);
    console.log('Manifest sample (first 3):', manifest.slice(0, 3));
    
    const requestBody = { manifest };
    console.log('Request body keys:', Object.keys(requestBody));
    console.log('Request body has manifest?', 'manifest' in requestBody);
    console.log('Manifest in body:', requestBody.manifest ? 'yes' : 'no');
    console.log('Manifest is array?', Array.isArray(requestBody.manifest));
    
    const response = await this.makeRequest<{
      result: {
        id: string;
        url: string;
      };
    }>('POST', endpoint, requestBody);

    console.log('Deployment created:', response.result);
    return {
      id: response.result.id,
      url: response.result.url
    };
  }

  /**
   * Upload files in batches
   */
  private async uploadFilesInBatches(
    publicDir: string,
    files: string[],
    deploymentId: string
  ): Promise<void> {
    const batchSize = 50; // Upload 50 files at a time
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await this.uploadBatch(publicDir, batch, deploymentId);
      
      // Small delay between batches to avoid overwhelming the API
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Upload a batch of files
   */
  private async uploadBatch(
    publicDir: string,
    files: string[],
    deploymentId: string
  ): Promise<void> {
    const endpoint = `/accounts/${this.config.accountId}/pages/projects/${this.config.projectName}/deployments/${deploymentId}/files`;
    
    // Prepare file data
    const fileData: Record<string, string> = {};
    for (const file of files) {
      const fullPath = path.join(publicDir, file);
      const content = fs.readFileSync(fullPath, 'base64');
      // Normalize path separators to forward slashes for Cloudflare
      const normalizedPath = file.replace(/\\/g, '/');
      fileData[normalizedPath] = content;
    }

    await this.makeRequest('POST', endpoint, fileData);
  }

  /**
   * Finalize deployment
   */
  private async finalizeDeployment(deploymentId: string): Promise<void> {
    const endpoint = `/accounts/${this.config.accountId}/pages/projects/${this.config.projectName}/deployments/${deploymentId}/finalize`;
    await this.makeRequest('POST', endpoint, {});
  }

  /**
   * Cancel deployment
   */
  private async cancelDeployment(deploymentId: string): Promise<void> {
    const endpoint = `/accounts/${this.config.accountId}/pages/projects/${this.config.projectName}/deployments/${deploymentId}`;
    await this.makeRequest('DELETE', endpoint);
  }

  /**
   * Make HTTP request to Cloudflare API
   * Requirements: 12.5 - Handle API errors
   */
  private async makeRequest<T = any>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Fix URL construction: ensure endpoint doesn't start with /
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      const fullUrl = `${this.apiBaseUrl}/${cleanEndpoint}`;
      
      console.log(`Making ${method} request to:`, fullUrl);
      
      const url = new URL(fullUrl);
      
      // Clean and validate token
      const token = this.config.apiToken?.trim();
      console.log('Token info:', {
        length: token?.length,
        hasSpaces: token?.includes(' '),
        hasNewlines: token?.includes('\n') || token?.includes('\r'),
        firstChar: token?.charCodeAt(0),
        lastChar: token?.charCodeAt(token.length - 1)
      });
      
      const options: https.RequestOptions = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'blog-management-gui/1.0.0'
        }
      };

      const req = https.request(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log('Response status code:', res.statusCode);
          console.log('Response headers:', JSON.stringify(res.headers, null, 2));
          console.log('Response body:', data);
          
          // Update rate limit info
          this.updateRateLimit(res.headers as Record<string, string>);

          // Parse response
          let parsedData: any;
          try {
            parsedData = JSON.parse(data);
          } catch (error) {
            reject(new Error(`Failed to parse API response: ${data}`));
            return;
          }

          console.log('Parsed response:', JSON.stringify(parsedData, null, 2));

          // Check for errors
          if (res.statusCode && res.statusCode >= 400) {
            const errorMessage = parsedData.errors?.[0]?.message || `API request failed with status ${res.statusCode}`;
            console.error('HTTP error:', errorMessage);
            reject(new Error(errorMessage));
            return;
          }

          if (!parsedData.success) {
            const errorMessage = parsedData.errors?.[0]?.message || 'API request failed';
            console.error('API error:', errorMessage);
            console.error('Full errors:', JSON.stringify(parsedData.errors, null, 2));
            reject(new Error(errorMessage));
            return;
          }

          resolve(parsedData as T);
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });

      // Set timeout
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      // Send body if present
      if (body !== undefined) {
        const bodyStr = JSON.stringify(body);
        console.log('Request body length:', bodyStr.length);
        console.log('Request body preview:', bodyStr.substring(0, 500));
        
        // Set Content-Length header
        if (!options.headers) {
          options.headers = {};
        }
        (options.headers as any)['Content-Length'] = Buffer.byteLength(bodyStr);
        console.log('Content-Length header set to:', (options.headers as any)['Content-Length']);
        
        req.write(bodyStr);
      } else {
        console.log('No request body');
      }

      req.end();
    });
  }
}
