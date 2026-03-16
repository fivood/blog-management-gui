import { CloudflareClient } from '../integrations/CloudflareClient';
import { CloudflareConfig, DeployResult, DeploymentStatus } from '../../shared/types/config';
import * as path from 'path';

/**
 * DeployService handles deployment operations to Cloudflare Pages
 * 
 * Requirements:
 * - 12.1: Deploy website to Cloudflare Pages
 * - 12.2: Validate Cloudflare credentials before deployment
 * - 12.3: Upload public folder contents
 * - 12.4: Track deployment progress
 * - 12.5: Display deployment status and URL
 * - 12.6: Handle deployment errors
 * - 12.7: Support deployment cancellation
 */
export class DeployService {
  private cloudflareClient: CloudflareClient;
  private hugoProjectPath: string;
  private currentDeploymentId: string | null = null;
  private progressCallback: ((progress: number, message: string) => void) | null = null;

  constructor(config: CloudflareConfig, hugoProjectPath: string) {
    this.cloudflareClient = new CloudflareClient(config);
    this.hugoProjectPath = hugoProjectPath;
  }

  /**
   * Update Cloudflare configuration
   */
  updateConfig(config: CloudflareConfig): void {
    this.cloudflareClient.updateConfig(config);
  }

  /**
   * Update Hugo project path
   */
  updateHugoProjectPath(hugoProjectPath: string): void {
    this.hugoProjectPath = hugoProjectPath;
  }

  /**
   * Set progress callback for deployment updates
   */
  setProgressCallback(callback: (progress: number, message: string) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Validate Cloudflare credentials
   * Requirements: 12.2 - Validate credentials before deployment
   */
  async validateCredentials(): Promise<boolean> {
    try {
      return await this.cloudflareClient.validateCredentials();
    } catch (error) {
      console.error('Credential validation failed:', error);
      return false;
    }
  }

  /**
   * Deploy website to Cloudflare Pages using Wrangler CLI
   * Requirements: 12.1, 12.3, 12.4, 12.5, 12.6
   * 
   * @param baseURL Optional custom domain URL to display instead of Cloudflare's default URL
   */
  async deploy(baseURL?: string): Promise<DeployResult> {
    try {
      console.log('=== Starting deployment using Wrangler ===');
      console.log('Hugo project path:', this.hugoProjectPath);
      console.log('Base URL:', baseURL);
      
      // Report progress: Starting
      this.reportProgress(0, 'Starting deployment...');

      // Get public folder path
      const publicDir = path.join(this.hugoProjectPath, 'public');
      console.log('Public directory:', publicDir);

      // Check if public directory exists
      const fs = require('fs');
      if (!fs.existsSync(publicDir)) {
        throw new Error('Public directory not found. Please build your Hugo site first.');
      }

      // Get Cloudflare config
      const projectName = this.cloudflareClient['config'].projectName;
      const apiToken = this.cloudflareClient['config'].apiToken;
      
      if (!projectName) {
        throw new Error('Cloudflare project name not configured');
      }
      if (!apiToken) {
        throw new Error('Cloudflare API token not configured');
      }

      console.log('Project name:', projectName);
      console.log('Using Wrangler CLI for deployment...');
      
      // Report progress: Deploying
      this.reportProgress(20, 'Deploying to Cloudflare Pages via Wrangler...');

      const { spawn } = require('child_process');
      
      // Execute wrangler pages deploy command
      // Force deployment to production (main branch) instead of preview
      const wranglerArgs = [
        'wrangler',
        'pages',
        'deploy',
        publicDir,
        '--project-name',
        projectName,
        '--branch',
        'main'
      ];

      console.log('Executing: npx', wranglerArgs.join(' '));

      return new Promise((resolve, reject) => {
        const wrangler = spawn('npx', wranglerArgs, {
          cwd: this.hugoProjectPath,
          shell: true,
          env: {
            ...process.env,
            CLOUDFLARE_API_TOKEN: apiToken
          }
        });

        let output = '';
        let errorOutput = '';

        wrangler.stdout?.on('data', (data: Buffer) => {
          const text = data.toString();
          output += text;
          console.log('Wrangler stdout:', text);
          
          // Parse progress from Wrangler output
          if (text.includes('Uploading') || text.includes('Uploaded')) {
            this.reportProgress(40, 'Uploading files...');
          } else if (text.includes('Deployment complete') || text.includes('✨')) {
            this.reportProgress(90, 'Deployment complete!');
          }
        });

        wrangler.stderr?.on('data', (data: Buffer) => {
          const text = data.toString();
          errorOutput += text;
          console.error('Wrangler stderr:', text);
        });

        wrangler.on('close', (code) => {
          console.log('Wrangler exited with code:', code);
          
          if (code === 0) {
            // Extract URL from output
            const urlMatch = output.match(/https:\/\/[^\s]+\.pages\.dev/);
            const deploymentUrl = urlMatch ? urlMatch[0] : '';
            
            const displayUrl = baseURL || deploymentUrl;
            
            this.reportProgress(100, 'Deployment completed successfully!');
            console.log('=== Deployment successful ===');
            resolve({
              success: true,
              deploymentId: '',
              url: displayUrl
            });
          } else {
            console.log('=== Deployment failed ===');
            reject(new Error(`Wrangler deployment failed: ${errorOutput || 'Unknown error'}`));
          }
        });

        wrangler.on('error', (error) => {
          console.error('Wrangler process error:', error);
          reject(new Error(`Failed to start Wrangler: ${error.message}. Please ensure Wrangler is installed (npm install -g wrangler)`));
        });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('=== Deployment error ===');
      console.error('Error:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error('Stack:', error.stack);
      }
      this.reportProgress(0, `Deployment failed: ${errorMessage}`);
      
      return {
        success: false,
        deploymentId: '',
        url: '',
        error: errorMessage
      };
    } finally {
      this.currentDeploymentId = null;
    }
  }

  /**
   * Get deployment status
   * Requirements: 12.4 - Track deployment progress
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    return await this.cloudflareClient.getDeploymentStatus(deploymentId);
  }

  /**
   * Cancel current deployment
   * Requirements: 12.7 - Support deployment cancellation
   */
  cancelDeployment(): void {
    // Note: Cloudflare Pages API doesn't support cancellation after upload starts
    // We can only stop polling for status
    this.currentDeploymentId = null;
    this.reportProgress(0, 'Deployment monitoring cancelled');
  }

  /**
   * Poll deployment status until completion
   * Requirements: 12.4 - Track deployment progress
   */
  private async pollDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5s)
    const pollInterval = 5000; // 5 seconds
    let attempts = 0;

    while (attempts < maxAttempts) {
      // Check if deployment was cancelled
      if (this.currentDeploymentId !== deploymentId) {
        throw new Error('Deployment cancelled');
      }

      try {
        const status = await this.cloudflareClient.getDeploymentStatus(deploymentId);

        // Update progress based on status
        if (status.status === 'building') {
          this.reportProgress(60, 'Building website...');
        } else if (status.status === 'deploying') {
          this.reportProgress(80, 'Deploying to Cloudflare Pages...');
        }

        // Check if deployment is complete
        if (status.status === 'success' || status.status === 'failed') {
          return status;
        }

        // Wait before next poll
        await this.sleep(pollInterval);
        attempts++;
      } catch (error) {
        console.error('Error polling deployment status:', error);
        // Continue polling on error
        await this.sleep(pollInterval);
        attempts++;
      }
    }

    // Timeout reached
    throw new Error('Deployment status polling timeout');
  }

  /**
   * Report progress to callback
   */
  private reportProgress(progress: number, message: string): void {
    if (this.progressCallback) {
      this.progressCallback(progress, message);
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
