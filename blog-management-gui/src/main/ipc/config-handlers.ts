import { ipcMain } from 'electron';
import { ConfigService } from '../services/ConfigService';
import { DeployService } from '../services/DeployService';
import { ArticleService } from '../services/ArticleService';
import { ImageService } from '../services/ImageService';
import { HugoService } from '../services/HugoService';
import { StyleService } from '../services/StyleService';
import { IPCResponse, ErrorResponse } from '../../shared/types/ipc';
import {
  CONFIG_GET,
  CONFIG_UPDATE,
  CONFIG_WINDOW_GET,
  CONFIG_WINDOW_SAVE
} from '../../shared/constants/ipc-channels';
import { AppConfig, WindowState } from '../../shared/types/config';

/**
 * Register config IPC handlers
 * Requirements: 13.1-13.7, 14.1-14.5, 17.1-17.5
 */
export function registerConfigHandlers(
  configService: ConfigService,
  deployService: DeployService,
  articleService: ArticleService,
  imageService: ImageService,
  hugoService: HugoService,
  styleService: StyleService
): void {
  // Get application configuration
  ipcMain.handle(CONFIG_GET, async (): Promise<IPCResponse> => {
    try {
      const config = configService.getConfig();
      return {
        success: true,
        data: config,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to get configuration'),
        requestId: generateRequestId()
      };
    }
  });

  // Update application configuration
  ipcMain.handle(CONFIG_UPDATE, async (_event, updates: Partial<AppConfig>): Promise<IPCResponse> => {
    try {
      configService.updateConfig(updates);
      
      // Update services with new configuration
      if (updates.cloudflare) {
        console.log('Updating DeployService with new Cloudflare config');
        console.log('New config:', JSON.stringify(updates.cloudflare, null, 2));
        deployService.updateConfig(updates.cloudflare);
      }
      
      if (updates.hugoProjectPath) {
        console.log('Updating services with new Hugo project path:', updates.hugoProjectPath);
        
        // First, update the project path in config
        const currentStore = configService['store'].store;
        currentStore.hugoProjectPath = updates.hugoProjectPath;
        configService['store'].store = currentStore;
        
        // Update all services with new path
        deployService.updateHugoProjectPath(updates.hugoProjectPath);
        hugoService.updateHugoProjectPath(updates.hugoProjectPath);
        articleService.updateHugoProjectPath(updates.hugoProjectPath);
        imageService.updateHugoProjectPath(updates.hugoProjectPath);
        styleService.updateHugoProjectPath(updates.hugoProjectPath);
        
        // Load baseURL from the new project's hugo.toml and save to project config
        try {
          const hugoConfig = await hugoService.getConfig();
          if (hugoConfig.baseURL) {
            console.log('Loaded baseURL from hugo.toml:', hugoConfig.baseURL);
            
            // Save baseURL to the NEW project's config
            const store = configService['store'].store;
            if (!store.projectConfigs) {
              store.projectConfigs = {};
            }
            if (!store.projectConfigs[updates.hugoProjectPath]) {
              store.projectConfigs[updates.hugoProjectPath] = {};
            }
            store.projectConfigs[updates.hugoProjectPath].baseURL = hugoConfig.baseURL;
            configService['store'].store = store;
            
            console.log('Saved baseURL to project config:', updates.hugoProjectPath);
          }
        } catch (error) {
          console.error('Failed to load baseURL from hugo.toml:', error);
          // Don't fail the entire config update if baseURL loading fails
        }
        
        // Load project-specific Cloudflare config and update DeployService
        const updatedConfig = configService.getConfig();
        if (updatedConfig.cloudflare) {
          console.log('Updating DeployService with project-specific Cloudflare config');
          console.log('Project config:', JSON.stringify(updatedConfig.cloudflare, null, 2));
          deployService.updateConfig(updatedConfig.cloudflare);
        }
      }
      
      // Sync baseURL to hugo.toml when updated
      if (updates.baseURL !== undefined) {
        console.log('Syncing baseURL to hugo.toml:', updates.baseURL);
        try {
          await hugoService.updateConfig({ baseURL: updates.baseURL });
          console.log('✅ Successfully synced baseURL to hugo.toml');
        } catch (error) {
          console.error('Failed to sync baseURL to hugo.toml:', error);
          // Don't fail the entire config update if hugo.toml sync fails
          // Just log the error and continue
        }
      }
      
      return {
        success: true,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to update configuration'),
        requestId: generateRequestId()
      };
    }
  });

  // Get window state
  ipcMain.handle(CONFIG_WINDOW_GET, async (): Promise<IPCResponse> => {
    try {
      const windowState = configService.getWindowState();
      return {
        success: true,
        data: windowState,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to get window state'),
        requestId: generateRequestId()
      };
    }
  });

  // Save window state
  ipcMain.handle(CONFIG_WINDOW_SAVE, async (_event, windowState: WindowState): Promise<IPCResponse> => {
    try {
      configService.saveWindowState(windowState);
      return {
        success: true,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to save window state'),
        requestId: generateRequestId()
      };
    }
  });
}

/**
 * Create error response from exception
 */
function createErrorResponse(error: unknown, defaultMessage: string): ErrorResponse {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Determine error code based on error message
  let code: ErrorResponse['code'] = 'UNKNOWN_ERROR';
  let userMessage = defaultMessage;
  let suggestedAction: string | undefined;

  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    code = 'VALIDATION_ERROR';
    userMessage = 'Invalid configuration data';
    suggestedAction = 'Please check the configuration values and try again';
  } else if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
    code = 'PERMISSION_DENIED';
    userMessage = 'Permission denied to access configuration';
    suggestedAction = 'Please check file permissions';
  } else if (errorMessage.includes('disk') || errorMessage.includes('space')) {
    code = 'DISK_FULL';
    userMessage = 'Not enough disk space';
    suggestedAction = 'Please free up disk space and try again';
  }

  return {
    code,
    message: errorMessage,
    timestamp: new Date(),
    userMessage,
    suggestedAction
  };
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
