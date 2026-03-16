import * as path from 'path';
import * as fs from 'fs/promises';
import { spawn, exec, ChildProcess } from 'child_process';
import * as toml from '@iarna/toml';
import {
  HugoConfig,
  BuildOptions,
  BuildResult,
  BuildStats,
  PreviewServer
} from '../../shared/types/hugo';

/**
 * HugoService manages Hugo operations including build, preview server, and configuration
 * 
 * Requirements:
 * - 9.1-9.6: Hugo website build with output capture
 * - 10.1-10.5: Preview server management
 * - 11.1-11.4: Generate deployment files
 * - 21.1-21.9: Hugo configuration file editing
 */
export class HugoService {
  private hugoProjectPath: string;
  private configFilePath: string;
  private previewProcess: ChildProcess | null = null;
  private previewPort: number = 1314; // 改为 1314 避免冲突

  constructor(hugoProjectPath: string) {
    this.hugoProjectPath = hugoProjectPath;
    this.configFilePath = path.join(hugoProjectPath, 'hugo.toml');
    
    // Clean up any existing Hugo server processes on initialization
    this.cleanupExistingServers();
  }

  /**
   * Clean up any existing Hugo server processes
   * This prevents port conflicts when restarting the application
   */
  private cleanupExistingServers(): void {
    try {
      console.log('Cleaning up existing Hugo server processes...');
      
      // Kill any hugo server processes
      if (process.platform === 'win32') {
        // Windows: Use taskkill to find and kill hugo.exe processes
        exec('taskkill /F /IM hugo.exe /T', (error) => {
          if (error) {
            // Ignore errors - process might not exist
            console.log('No existing Hugo processes found (or already cleaned up)');
          } else {
            console.log('✅ Cleaned up existing Hugo server processes');
          }
        });
      } else {
        // Unix-like systems: Use pkill
        exec('pkill -f "hugo server"', (error) => {
          if (error) {
            console.log('No existing Hugo processes found (or already cleaned up)');
          } else {
            console.log('✅ Cleaned up existing Hugo server processes');
          }
        });
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      // Don't throw - this is a best-effort cleanup
    }
  }

  /**
   * Update Hugo project path
   */
  updateHugoProjectPath(hugoProjectPath: string): void {
    this.hugoProjectPath = hugoProjectPath;
    this.configFilePath = path.join(hugoProjectPath, 'hugo.toml');
    // Stop preview server if running
    if (this.isPreviewServerRunning()) {
      this.stopPreviewServer().catch(err => {
        console.error('Failed to stop preview server after path change:', err);
      });
    }
  }

  /**
   * Build the Hugo site
   * Requirements: 9.1-9.6 - Execute hugo --minify command and capture output
   * 
   * @param options Build options (minify, drafts)
   * @param outputCallback Optional callback for streaming output
   * @returns Promise resolving to build result with output and stats
   */
  async build(options: BuildOptions = {}, outputCallback?: (output: string) => void): Promise<BuildResult> {
    const startTime = Date.now();
    const output: string[] = [];
    
    try {
      // Prepare hugo command arguments
      const args: string[] = [];
      
      if (options.minify !== false) {
        args.push('--minify');
      }
      
      if (options.drafts) {
        args.push('--buildDrafts');
      }

      // Execute hugo build command
      const { stdout, stderr, exitCode } = await this.executeHugoCommand(args, outputCallback);
      
      console.log(`Build completed with exit code: ${exitCode}`);
      console.log(`Success check: exitCode === 0 ? ${exitCode === 0}`);
      
      // Capture all output
      output.push(...stdout);
      if (stderr.length > 0) {
        output.push(...stderr);
      }

      // Check if build was successful
      if (exitCode !== 0) {
        console.log('Build marked as FAILED due to non-zero exit code');
        return {
          success: false,
          output,
          stats: {
            pageCount: 0,
            duration: Date.now() - startTime,
            timestamp: new Date()
          },
          error: stderr.join('\n') || 'Hugo build failed'
        };
      }

      // Parse build statistics from output
      const stats = this.parseBuildStats(stdout, startTime);

      console.log('Build marked as SUCCESS');
      return {
        success: true,
        output,
        stats
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      output.push(`Error: ${message}`);
      
      return {
        success: false,
        output,
        stats: {
          pageCount: 0,
          duration: Date.now() - startTime,
          timestamp: new Date()
        },
        error: message
      };
    }
  }

  /**
   * Start Hugo preview server
   * Requirements: 10.1-10.5 - Start hugo server and manage process
   * 
   * @param port Optional port number (default: 1313)
   * @returns Promise resolving to preview server information
   */
  async startPreviewServer(port?: number): Promise<PreviewServer> {
    try {
      console.log('Starting Hugo preview server...');
      
      // Stop existing preview server if running
      if (this.previewProcess) {
        console.log('Stopping existing preview server...');
        await this.stopPreviewServer();
      }

      // Use provided port or default
      const serverPort = port || this.previewPort;
      this.previewPort = serverPort;

      // Check if port is already in use and clean it up
      const isPortInUse = await this.checkPortInUse(serverPort);
      if (isPortInUse) {
        console.log(`Port ${serverPort} is in use, attempting to free it...`);
        await this.freePort(serverPort);
        
        // Wait a bit for the port to be freed
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`Starting Hugo server on port ${serverPort}...`);
      console.log(`Hugo project path: ${this.hugoProjectPath}`);

      // Start hugo server with --buildDrafts to show draft posts
      const args = ['server', '--port', serverPort.toString(), '--buildDrafts'];
      
      this.previewProcess = spawn('hugo', args, {
        cwd: this.hugoProjectPath,
        shell: true
      });

      console.log('Hugo process spawned, waiting for server to start...');

      // Wait for server to start
      await this.waitForServerStart();

      const url = `http://localhost:${serverPort}`;
      console.log(`✅ Preview server started successfully at ${url}`);

      return {
        url,
        port: serverPort,
        isRunning: true
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to start preview server:', message);
      throw new Error(`Failed to start preview server: ${message}`);
    }
  }

  /**
   * Check if a port is in use
   */
  private async checkPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const command = process.platform === 'win32'
        ? `netstat -ano | findstr :${port}`
        : `lsof -i :${port}`;
      
      exec(command, (error, stdout) => {
        if (error || !stdout) {
          resolve(false);
        } else {
          resolve(stdout.trim().length > 0);
        }
      });
    });
  }

  /**
   * Free a port by killing the process using it
   */
  private async freePort(port: number): Promise<void> {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        // Windows: Find PID and kill it
        exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
          if (error || !stdout) {
            resolve();
            return;
          }
          
          // Extract PID from netstat output
          const lines = stdout.trim().split('\n');
          const pids = new Set<string>();
          
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0') {
              pids.add(pid);
            }
          }
          
          if (pids.size === 0) {
            resolve();
            return;
          }
          
          // Kill all PIDs
          const killCommands = Array.from(pids).map(pid => `taskkill /F /PID ${pid}`).join(' & ');
          exec(killCommands, () => {
            console.log(`✅ Freed port ${port}`);
            resolve();
          });
        });
      } else {
        // Unix-like: Use lsof and kill
        exec(`lsof -ti :${port} | xargs kill -9`, () => {
          console.log(`✅ Freed port ${port}`);
          resolve();
        });
      }
    });
  }

  /**
   * Stop Hugo preview server
   * Requirements: 10.5 - Stop preview server
   * 
   * @returns Promise resolving when server is stopped
   */
  async stopPreviewServer(): Promise<void> {
    if (!this.previewProcess) {
      return;
    }

    return new Promise((resolve) => {
      if (!this.previewProcess) {
        resolve();
        return;
      }

      this.previewProcess.on('close', () => {
        this.previewProcess = null;
        resolve();
      });

      // Kill the process
      this.previewProcess.kill('SIGTERM');

      // Force kill after 5 seconds if not stopped
      setTimeout(() => {
        if (this.previewProcess) {
          this.previewProcess.kill('SIGKILL');
          this.previewProcess = null;
          resolve();
        }
      }, 5000);
    });
  }

  /**
   * Get Hugo configuration
   * Requirements: 21.1-21.9 - Read hugo.toml file
   * 
   * @returns Promise resolving to Hugo configuration
   */
  async getConfig(): Promise<HugoConfig> {
    try {
      const content = await fs.readFile(this.configFilePath, 'utf-8');
      const parsed = toml.parse(content) as any;

      // Convert to HugoConfig format
      const config: HugoConfig = {
        baseURL: parsed.baseURL || '',
        languageCode: parsed.languageCode || 'en-us',
        title: parsed.title || '',
        theme: parsed.theme || '',
        params: parsed.params || {}
      };

      return config;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to read Hugo configuration: ${message}`);
    }
  }

  /**
   * Update Hugo configuration
   * Requirements: 21.7-21.9 - Validate and write hugo.toml file
   * 
   * @param config Partial Hugo configuration to update
   * @returns Promise resolving when configuration is updated
   */
  async updateConfig(config: Partial<HugoConfig>): Promise<void> {
    try {
      // Validate configuration
      this.validateConfig(config);

      // Read current configuration
      const currentConfig = await this.getConfig();

      // Merge with updates
      const updatedConfig: HugoConfig = {
        ...currentConfig,
        ...config,
        params: {
          ...currentConfig.params,
          ...(config.params || {})
        }
      };

      // Convert to TOML and write
      const tomlContent = toml.stringify(updatedConfig as any);
      await fs.writeFile(this.configFilePath, tomlContent, 'utf-8');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update Hugo configuration: ${message}`);
    }
  }

  /**
   * Validate Hugo configuration
   * Requirements: 21.7 - Validate configuration format
   * 
   * @param config Configuration to validate
   * @throws Error if configuration is invalid
   */
  private validateConfig(config: Partial<HugoConfig>): void {
    // Validate baseURL if provided
    if (config.baseURL !== undefined) {
      if (typeof config.baseURL !== 'string') {
        throw new Error('baseURL must be a string');
      }
      if (config.baseURL && !this.isValidURL(config.baseURL)) {
        throw new Error('baseURL must be a valid URL');
      }
    }

    // Validate languageCode if provided
    if (config.languageCode !== undefined && typeof config.languageCode !== 'string') {
      throw new Error('languageCode must be a string');
    }

    // Validate title if provided
    if (config.title !== undefined && typeof config.title !== 'string') {
      throw new Error('title must be a string');
    }

    // Validate theme if provided
    if (config.theme !== undefined && typeof config.theme !== 'string') {
      throw new Error('theme must be a string');
    }

    // Validate params if provided
    if (config.params !== undefined && typeof config.params !== 'object') {
      throw new Error('params must be an object');
    }
  }

  /**
   * Check if a string is a valid URL
   */
  private isValidURL(urlString: string): boolean {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Execute Hugo command and capture output
   * 
   * @param args Command arguments
   * @param outputCallback Optional callback for streaming output
   * @returns Promise resolving to command output
   */
  private executeHugoCommand(args: string[], outputCallback?: (output: string) => void): Promise<{
    stdout: string[];
    stderr: string[];
    exitCode: number;
  }> {
    return new Promise((resolve) => {
      const stdout: string[] = [];
      const stderr: string[] = [];

      const process = spawn('hugo', args, {
        cwd: this.hugoProjectPath,
        shell: true
      });

      process.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        stdout.push(...lines);
        // Stream output if callback provided
        if (outputCallback) {
          lines.forEach(line => outputCallback(line));
        }
      });

      process.stderr?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        stderr.push(...lines);
        // Stream errors if callback provided
        if (outputCallback) {
          lines.forEach(line => outputCallback(`ERROR: ${line}`));
        }
      });

      process.on('close', (code) => {
        console.log(`Hugo command exited with code: ${code}`);
        console.log(`Stdout lines: ${stdout.length}`);
        console.log(`Stderr lines: ${stderr.length}`);
        if (stderr.length > 0) {
          console.log('Stderr content:', stderr.join('\n'));
        }
        resolve({
          stdout,
          stderr,
          exitCode: code || 0
        });
      });

      process.on('error', (error) => {
        stderr.push(error.message);
        if (outputCallback) {
          outputCallback(`ERROR: ${error.message}`);
        }
        resolve({
          stdout,
          stderr,
          exitCode: 1
        });
      });
    });
  }

  /**
   * Parse build statistics from Hugo output
   * 
   * @param output Hugo command output lines
   * @param startTime Build start timestamp
   * @returns Build statistics
   */
  private parseBuildStats(output: string[], startTime: number): BuildStats {
    let pageCount = 0;
    
    // Look for Hugo output patterns like:
    // "Total in 123 ms"
    // "Pages | 42"
    for (const line of output) {
      // Parse page count
      const pageMatch = line.match(/pages?\s*\|\s*(\d+)/i);
      if (pageMatch) {
        pageCount = parseInt(pageMatch[1], 10);
      }
    }

    return {
      pageCount,
      duration: Date.now() - startTime,
      timestamp: new Date()
    };
  }

  /**
   * Wait for preview server to start
   * 
   * @returns Promise resolving when server is ready
   */
  private waitForServerStart(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.previewProcess) {
        reject(new Error('Preview process not started'));
        return;
      }

      let serverStarted = false;
      let errorOutput = '';
      
      const timeout = setTimeout(() => {
        if (!serverStarted) {
          reject(new Error(`Preview server start timeout. Error output: ${errorOutput}`));
        }
      }, 10000); // 10 second timeout

      // Listen to both stdout and stderr
      this.previewProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log('Hugo server stdout:', output);
        
        // Look for Hugo server ready message
        if (output.includes('Web Server is available at') || 
            output.includes('localhost') ||
            output.includes('Serving pages from')) {
          serverStarted = true;
          clearTimeout(timeout);
          resolve();
        }
      });

      this.previewProcess.stderr?.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log('Hugo server stderr:', output);
        errorOutput += output;
        
        // Hugo sometimes outputs server info to stderr
        if (output.includes('Web Server is available at') || 
            output.includes('localhost') ||
            output.includes('Serving pages from')) {
          serverStarted = true;
          clearTimeout(timeout);
          resolve();
        }
      });

      this.previewProcess.on('error', (error) => {
        clearTimeout(timeout);
        console.error('Hugo server process error:', error);
        reject(new Error(`Preview server process error: ${error.message}`));
      });

      this.previewProcess.on('close', (code) => {
        clearTimeout(timeout);
        if (!serverStarted) {
          console.error('Hugo server exited with code:', code);
          console.error('Error output:', errorOutput);
          reject(new Error(`Preview server exited with code ${code}. Error: ${errorOutput}`));
        }
      });
    });
  }

  /**
   * Check if preview server is running
   * 
   * @returns True if preview server is running
   */
  isPreviewServerRunning(): boolean {
    return this.previewProcess !== null && !this.previewProcess.killed;
  }

  /**
   * Get the public folder path
   * Requirements: 11.3 - Display public folder path
   * 
   * @returns Path to the public folder
   */
  getPublicFolderPath(): string {
    return path.join(this.hugoProjectPath, 'public');
  }
}
