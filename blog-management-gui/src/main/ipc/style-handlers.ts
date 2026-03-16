import { ipcMain } from 'electron';
import { StyleService } from '../services/StyleService';
import { IPCResponse, ErrorResponse } from '../../shared/types/ipc';
import {
  STYLE_GET,
  STYLE_UPDATE,
  STYLE_EXPORT,
  STYLE_IMPORT,
  STYLE_RESET,
  STYLE_HISTORY_GET,
  STYLE_HISTORY_RESTORE
} from '../../shared/constants/ipc-channels';
import { StyleConfiguration } from '../../shared/types/style';

/**
 * Register style IPC handlers
 * Requirements: 21.1-21.9, 22.1-22.8, 23.1-23.8, 24.1-24.7, 25.1-25.7, 28.1-28.7, 29.1-29.6, 30.1-30.7
 */
export function registerStyleHandlers(styleService: StyleService): void {
  // Get style configuration
  ipcMain.handle(STYLE_GET, async (): Promise<IPCResponse> => {
    try {
      const config = await styleService.getStyleConfig();
      return {
        success: true,
        data: config,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to get style configuration'),
        requestId: generateRequestId()
      };
    }
  });

  // Update style configuration
  ipcMain.handle(STYLE_UPDATE, async (event, config: StyleConfiguration, description?: string): Promise<IPCResponse> => {
    try {
      await styleService.updateStyleConfig(config, description);
      return {
        success: true,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to update style configuration'),
        requestId: generateRequestId()
      };
    }
  });

  // Export style configuration
  ipcMain.handle(STYLE_EXPORT, async (): Promise<IPCResponse> => {
    try {
      const json = await styleService.exportStyleConfig();
      return {
        success: true,
        data: json,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to export style configuration'),
        requestId: generateRequestId()
      };
    }
  });

  // Import style configuration
  ipcMain.handle(STYLE_IMPORT, async (event, jsonString: string): Promise<IPCResponse> => {
    try {
      await styleService.importStyleConfig(jsonString);
      return {
        success: true,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to import style configuration'),
        requestId: generateRequestId()
      };
    }
  });

  // Reset to default styles
  ipcMain.handle(STYLE_RESET, async (): Promise<IPCResponse> => {
    try {
      await styleService.resetToDefault();
      return {
        success: true,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to reset to default styles'),
        requestId: generateRequestId()
      };
    }
  });

  // Get style history
  ipcMain.handle(STYLE_HISTORY_GET, async (): Promise<IPCResponse> => {
    try {
      const history = styleService.getStyleHistory();
      return {
        success: true,
        data: history,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to get style history'),
        requestId: generateRequestId()
      };
    }
  });

  // Restore from history
  ipcMain.handle(STYLE_HISTORY_RESTORE, async (event, historyId: string): Promise<IPCResponse> => {
    try {
      await styleService.restoreFromHistory(historyId);
      return {
        success: true,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to restore from history'),
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
    userMessage = 'Style configuration file not found';
    suggestedAction = 'Please ensure the Hugo project path is correct';
  } else if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('must be')) {
    code = 'VALIDATION_ERROR';
    userMessage = 'Invalid style configuration';
    suggestedAction = 'Please check the configuration values and try again';
  } else if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
    code = 'PERMISSION_DENIED';
    userMessage = 'Permission denied to access style files';
    suggestedAction = 'Please check file permissions';
  } else if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
    code = 'VALIDATION_ERROR';
    userMessage = 'Invalid JSON format';
    suggestedAction = 'Please ensure the file contains valid JSON';
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
