import { ipcMain, BrowserWindow } from 'electron';
import { DeployService } from '../services/DeployService';
import { IPCResponse, ErrorResponse } from '../../shared/types/ipc';
import {
  DEPLOY_EXECUTE,
  DEPLOY_VALIDATE,
  DEPLOY_STATUS
} from '../../shared/constants/ipc-channels';

/**
 * Register deploy IPC handlers
 * Requirements: 12.1-12.7, 13.1-13.7
 */
export function registerDeployHandlers(deployService: DeployService, mainWindow: BrowserWindow): void {
  // Execute deployment
  ipcMain.handle(DEPLOY_EXECUTE, async (): Promise<IPCResponse> => {
    try {
      // Set up progress streaming
      deployService.setProgressCallback((progress: number, message: string) => {
        mainWindow.webContents.send('deploy:progress', { progress, message });
      });

      const result = await deployService.deploy();
      return {
        success: true,
        data: result,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to deploy website'),
        requestId: generateRequestId()
      };
    }
  });

  // Validate Cloudflare credentials
  ipcMain.handle(DEPLOY_VALIDATE, async (): Promise<IPCResponse> => {
    try {
      const isValid = await deployService.validateCredentials();
      return {
        success: true,
        data: isValid,  // Return boolean directly
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to validate credentials'),
        requestId: generateRequestId()
      };
    }
  });

  // Get deployment status
  ipcMain.handle(DEPLOY_STATUS, async (event, deploymentId: string): Promise<IPCResponse> => {
    try {
      const status = await deployService.getDeploymentStatus(deploymentId);
      return {
        success: true,
        data: status,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to get deployment status'),
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
    userMessage = 'Public folder not found';
    suggestedAction = 'Please build the Hugo site first';
  } else if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('required')) {
    code = 'VALIDATION_ERROR';
    userMessage = 'Invalid Cloudflare configuration';
    suggestedAction = 'Please check your API token, account ID, and project name';
  } else if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('ENOTFOUND')) {
    code = 'NETWORK_ERROR';
    userMessage = 'Network connection failed';
    suggestedAction = 'Please check your internet connection and try again';
  } else if (errorMessage.includes('API') || errorMessage.includes('401') || errorMessage.includes('403')) {
    code = 'API_ERROR';
    userMessage = 'Cloudflare API error';
    suggestedAction = 'Please verify your API credentials and try again';
  } else if (errorMessage.includes('rate limit')) {
    code = 'API_ERROR';
    userMessage = 'API rate limit exceeded';
    suggestedAction = 'Please wait a few minutes and try again';
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
