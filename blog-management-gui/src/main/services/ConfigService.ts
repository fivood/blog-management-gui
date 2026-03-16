import Store from 'electron-store';
import { app } from 'electron';
import * as path from 'path';
import {
  AppConfig,
  CloudflareConfig,
  EditorPreferences,
  WindowState
} from '../../shared/types/config';
import {
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  AUTO_SAVE_DEBOUNCE
} from '../../shared/constants/defaults';

/**
 * ConfigService manages application configuration with persistent storage
 * Uses electron-store with encryption for sensitive data
 * 
 * Requirements:
 * - 13.5: Encrypt and store Cloudflare API credentials
 * - 14.3: Remember window size and position
 * - 17.1-17.5: Persistent configuration storage
 */
export class ConfigService {
  private store: Store<AppConfig>;
  private readonly defaultConfig: AppConfig;

  constructor() {
    // Initialize electron-store with encryption for sensitive data
    this.store = new Store<AppConfig>({
      name: 'config',
      // Encrypt sensitive fields (Cloudflare API token)
      encryptionKey: this.getEncryptionKey(),
      defaults: this.getDefaultConfig()
    });

    this.defaultConfig = this.getDefaultConfig();

    // Auto-populate recent projects if the list is empty
    this.ensureRecentProjects();
  }

  /**
   * Ensure recent projects list is not empty by checking known locations
   */
  private ensureRecentProjects(): void {
    const config = this.getConfig();
    if (config.recentProjects.length === 0) {
      const fs = require('fs');
      const knownPaths = [
        'g:\\fivood\\blog',
        'g:\\fivood\\fukkiorg'
      ];
      
      const validPaths = knownPaths.filter(p => fs.existsSync(p));
      if (validPaths.length > 0) {
        console.log('Auto-populating recent projects:', validPaths);
        this.updateConfig({ 
          recentProjects: validPaths,
          // If current path is default/empty, pick the first valid one
          hugoProjectPath: config.hugoProjectPath.includes('blog-fukki') || !config.hugoProjectPath 
            ? validPaths[0] 
            : config.hugoProjectPath
        });
      }
    }
  }

  /**
   * Get encryption key for sensitive data
   * Uses machine-specific identifier for encryption
   */
  private getEncryptionKey(): string {
    // Use app name and version as base for encryption key
    // In production, this should be more sophisticated
    const machineId = app.getName() + app.getVersion();
    return machineId;
  }

  /**
   * Get default configuration values
   */
  private getDefaultConfig(): AppConfig {
    // Use the blog directory in the parent folder of the app
    const defaultHugoPath = path.join(app.getAppPath(), '..', 'blog');
    
    return {
      version: app.getVersion(),
      hugoProjectPath: defaultHugoPath,
      cloudflare: {
        apiToken: '',
        accountId: '',
        projectName: ''
      },
      editor: {
        theme: 'light',
        fontSize: 14,
        tabSize: 2,
        wordWrap: true,
        showLineNumbers: true,
        autoSave: true,
        autoSaveDelay: AUTO_SAVE_DEBOUNCE
      },
      window: {
        width: DEFAULT_WINDOW_WIDTH,
        height: DEFAULT_WINDOW_HEIGHT,
        x: 0,
        y: 0,
        isMaximized: false
      },
      recentProjects: []
    };
  }

  /**
   * Get complete application configuration
   * Requirements: 17.3 - Load saved configuration on startup
   */
  getConfig(): AppConfig {
    try {
      const config = this.store.store;
      
      // Ensure all required fields exist (for backward compatibility)
      return {
        ...this.defaultConfig,
        ...config,
        cloudflare: {
          ...this.defaultConfig.cloudflare,
          ...config.cloudflare
        },
        editor: {
          ...this.defaultConfig.editor,
          ...config.editor
        },
        window: {
          ...this.defaultConfig.window,
          ...config.window
        }
      };
    } catch (error) {
      console.error('Failed to load configuration:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update application configuration
   * Requirements: 17.4 - Save configuration immediately when modified
   */
  updateConfig(updates: Partial<AppConfig>): void {
    try {
      const currentConfig = this.getConfig();
      
      // Merge updates with current config
      const newConfig: AppConfig = {
        ...currentConfig,
        ...updates,
        // Deep merge nested objects
        cloudflare: updates.cloudflare
          ? { ...currentConfig.cloudflare, ...updates.cloudflare }
          : currentConfig.cloudflare,
        editor: updates.editor
          ? { ...currentConfig.editor, ...updates.editor }
          : currentConfig.editor,
        window: updates.window
          ? { ...currentConfig.window, ...updates.window }
          : currentConfig.window
      };

      // Update version to current app version
      newConfig.version = app.getVersion();

      // Save to store (encryption handled automatically for sensitive fields)
      this.store.store = newConfig;
    } catch (error) {
      console.error('Failed to update configuration:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Configuration update failed: ${message}`);
    }
  }

  /**
   * Get window state configuration
   * Requirements: 14.3 - Restore window size and position
   */
  getWindowState(): WindowState {
    try {
      const config = this.getConfig();
      return config.window;
    } catch (error) {
      console.error('Failed to load window state:', error);
      return this.defaultConfig.window;
    }
  }

  /**
   * Save window state configuration
   * Requirements: 14.3 - Remember window size and position on close
   */
  saveWindowState(state: WindowState): void {
    try {
      this.updateConfig({ window: state });
    } catch (error) {
      console.error('Failed to save window state:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Window state save failed: ${message}`);
    }
  }

  /**
   * Update Cloudflare configuration
   * Requirements: 13.5 - Encrypt and store API token
   */
  updateCloudflareConfig(cloudflare: Partial<CloudflareConfig>): void {
    try {
      const currentConfig = this.getConfig();
      const updatedCloudflare = {
        ...currentConfig.cloudflare,
        ...cloudflare
      };
      this.updateConfig({ cloudflare: updatedCloudflare });
    } catch (error) {
      console.error('Failed to update Cloudflare configuration:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Cloudflare configuration update failed: ${message}`);
    }
  }

  /**
   * Update editor preferences
   */
  updateEditorPreferences(editor: Partial<EditorPreferences>): void {
    try {
      const currentConfig = this.getConfig();
      const updatedEditor = {
        ...currentConfig.editor,
        ...editor
      };
      this.updateConfig({ editor: updatedEditor });
    } catch (error) {
      console.error('Failed to update editor preferences:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Editor preferences update failed: ${message}`);
    }
  }

  /**
   * Add project to recent projects list
   */
  addRecentProject(projectPath: string): void {
    try {
      const config = this.getConfig();
      const recentProjects = config.recentProjects.filter(p => p !== projectPath);
      recentProjects.unshift(projectPath);
      
      // Keep only last 10 recent projects
      const updatedRecent = recentProjects.slice(0, 10);
      
      this.updateConfig({ recentProjects: updatedRecent });
    } catch (error) {
      console.error('Failed to add recent project:', error);
    }
  }

  /**
   * Clear all configuration (reset to defaults)
   */
  resetConfig(): void {
    try {
      this.store.clear();
      this.store.store = this.defaultConfig;
    } catch (error) {
      console.error('Failed to reset configuration:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Configuration reset failed: ${message}`);
    }
  }

  /**
   * Get configuration file path
   */
  getConfigPath(): string {
    return this.store.path;
  }
}
