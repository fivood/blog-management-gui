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
    const fs = require('fs');
    const knownPaths = [
      'g:\\fivood\\fivood-fukki\\blog',
      'g:\\fivood\\fivood-fukki\\fukkiorg',
      'g:\\fivood\\blog',
      'g:\\fivood\\fukkiorg'
    ];

    const validPaths = knownPaths.filter(p => fs.existsSync(p));
    if (validPaths.length === 0) return;

    const currentRecent = config.recentProjects || [];
    const missing = validPaths.filter(p => !currentRecent.includes(p));

    // If recent projects is empty, initialize it and optionally pick a sensible default project.
    if (currentRecent.length === 0) {
      console.log('Auto-populating recent projects:', validPaths);

      const currentPath = config.hugoProjectPath;
      const shouldOverrideProjectPath =
        !currentPath ||
        (typeof currentPath === 'string' && currentPath.includes('blog-fukki')) ||
        !fs.existsSync(currentPath);

      this.updateConfig({
        recentProjects: validPaths,
        // Only override when empty/missing, or migrating off legacy paths.
        hugoProjectPath: shouldOverrideProjectPath ? validPaths[0] : currentPath
      });
      return;
    }

    // If recent projects already has entries, gently append missing known paths (without changing current selection).
    if (missing.length > 0 && currentRecent.length < 10) {
      const updatedRecent = [...currentRecent, ...missing].slice(0, 10);
      console.log('Appending known projects to recent projects:', missing);
      this.updateConfig({ recentProjects: updatedRecent });
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
      baseURL: '',
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
      recentProjects: [],
      projectConfigs: {}
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
      const fullConfig: AppConfig = {
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
        },
        projectConfigs: config.projectConfigs || {}
      };
      
      // Load project-specific config if available
      const projectPath = fullConfig.hugoProjectPath;
      if (projectPath && fullConfig.projectConfigs[projectPath]) {
        const projectConfig = fullConfig.projectConfigs[projectPath];
        
        // Override with project-specific settings ONLY if they have values
        if (projectConfig.cloudflare) {
          // Only override fields that have actual values
          if (projectConfig.cloudflare.apiToken) {
            fullConfig.cloudflare.apiToken = projectConfig.cloudflare.apiToken;
          }
          if (projectConfig.cloudflare.accountId) {
            fullConfig.cloudflare.accountId = projectConfig.cloudflare.accountId;
          }
          if (projectConfig.cloudflare.projectName) {
            fullConfig.cloudflare.projectName = projectConfig.cloudflare.projectName;
          }
        }
        if (projectConfig.baseURL) {
          fullConfig.baseURL = projectConfig.baseURL;
        }
      }
      
      console.log('ConfigService.getConfig() returning:', {
        hugoProjectPath: fullConfig.hugoProjectPath,
        baseURL: fullConfig.baseURL,
        cloudflare: {
          apiToken: fullConfig.cloudflare.apiToken ? '***' : 'empty',
          accountId: fullConfig.cloudflare.accountId || 'empty',
          projectName: fullConfig.cloudflare.projectName || 'empty'
        }
      });
      
      return fullConfig;
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
          : currentConfig.window,
        projectConfigs: updates.projectConfigs
          ? { ...currentConfig.projectConfigs, ...updates.projectConfigs }
          : currentConfig.projectConfigs
      };

      // Update version to current app version
      newConfig.version = app.getVersion();
      
      // Save project-specific config
      const projectPath = newConfig.hugoProjectPath;
      if (projectPath) {
        const projectConfigs = newConfig.projectConfigs || {};
        
        // Initialize project config if it doesn't exist
        if (!projectConfigs[projectPath]) {
          projectConfigs[projectPath] = {};
        }
        
        // Save cloudflare and baseURL to project-specific config
        if (updates.cloudflare) {
          projectConfigs[projectPath].cloudflare = newConfig.cloudflare;
        }
        if (updates.baseURL !== undefined) {
          projectConfigs[projectPath].baseURL = newConfig.baseURL;
        }
        
        newConfig.projectConfigs = projectConfigs;
      }

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
