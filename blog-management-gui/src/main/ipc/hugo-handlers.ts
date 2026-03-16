import { ipcMain, BrowserWindow } from 'electron';
import { HugoService } from '../services/HugoService';
import { IPCResponse, ErrorResponse } from '../../shared/types/ipc';
import {
  HUGO_BUILD,
  HUGO_PREVIEW_START,
  HUGO_PREVIEW_STOP,
  HUGO_CONFIG_GET,
  HUGO_CONFIG_UPDATE
} from '../../shared/constants/ipc-channels';
import { BuildOptions, HugoConfig } from '../../shared/types/hugo';

/**
 * Register Hugo IPC handlers
 * Requirements: 9.1-9.6, 10.1-10.5, 11.1-11.4, 21.1-21.9
 */
export function registerHugoHandlers(hugoService: HugoService, mainWindow: BrowserWindow): void {
  // Build Hugo site
  ipcMain.handle(HUGO_BUILD, async (event, options?: BuildOptions): Promise<IPCResponse> => {
    try {
      // Set up output streaming
      const outputCallback = (output: string) => {
        mainWindow.webContents.send('hugo:build-output', output);
      };

      const result = await hugoService.build(options, outputCallback);
      return {
        success: true,
        data: result,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to build Hugo site'),
        requestId: generateRequestId()
      };
    }
  });

  // Start preview server
  ipcMain.handle(HUGO_PREVIEW_START, async (event, port?: number): Promise<IPCResponse> => {
    try {
      const server = await hugoService.startPreviewServer(port);
      return {
        success: true,
        data: server,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to start preview server'),
        requestId: generateRequestId()
      };
    }
  });

  // Stop preview server
  ipcMain.handle(HUGO_PREVIEW_STOP, async (): Promise<IPCResponse> => {
    try {
      await hugoService.stopPreviewServer();
      return {
        success: true,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to stop preview server'),
        requestId: generateRequestId()
      };
    }
  });

  // Get Hugo configuration
  ipcMain.handle(HUGO_CONFIG_GET, async (): Promise<IPCResponse> => {
    try {
      const config = await hugoService.getConfig();
      return {
        success: true,
        data: config,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to get Hugo configuration'),
        requestId: generateRequestId()
      };
    }
  });

  // Update Hugo configuration
  ipcMain.handle(HUGO_CONFIG_UPDATE, async (event, updates: Partial<HugoConfig>): Promise<IPCResponse> => {
    try {
      await hugoService.updateConfig(updates);
      return {
        success: true,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to update Hugo configuration'),
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

  if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
    code = 'FILE_NOT_FOUND';
    userMessage = 'Hugo executable or configuration not found';
    suggestedAction = 'Please ensure Hugo is installed and the project path is correct';
  } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    code = 'VALIDATION_ERROR';
    userMessage = 'Invalid Hugo configuration';
    suggestedAction = 'Please check the configuration values and try again';
  } else if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
    code = 'PERMISSION_DENIED';
    userMessage = 'Permission denied to access Hugo files';
    suggestedAction = 'Please check file permissions';
  } else if (errorMessage.includes('process') || errorMessage.includes('spawn') || errorMessage.includes('ENOENT')) {
    code = 'PROCESS_ERROR';
    userMessage = 'Failed to execute Hugo command';
    suggestedAction = 'Please ensure Hugo is installed and in your PATH';
  } else if (errorMessage.includes('port') || errorMessage.includes('address in use')) {
    code = 'STATE_ERROR';
    userMessage = 'Port already in use';
    suggestedAction = 'Please stop other servers or choose a different port';
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
