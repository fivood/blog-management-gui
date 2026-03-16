import { ipcMain } from 'electron';
import { ImageService } from '../services/ImageService';
import { IPCResponse, ErrorResponse } from '../../shared/types/ipc';
import {
  IMAGE_LIST,
  IMAGE_UPLOAD,
  IMAGE_DELETE,
  IMAGE_GET_PATH
} from '../../shared/constants/ipc-channels';

/**
 * Register image IPC handlers
 * Requirements: 6.1-6.6, 7.1-7.6
 */
export function registerImageHandlers(imageService: ImageService): void {
  // List all images
  ipcMain.handle(IMAGE_LIST, async (): Promise<IPCResponse> => {
    try {
      const images = await imageService.listImages();
      return {
        success: true,
        data: images,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to list images'),
        requestId: generateRequestId()
      };
    }
  });

  // Upload image
  ipcMain.handle(IMAGE_UPLOAD, async (event, sourcePath: string, originalName: string): Promise<IPCResponse> => {
    try {
      const metadata = await imageService.uploadImage(sourcePath, originalName);
      return {
        success: true,
        data: metadata,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to upload image'),
        requestId: generateRequestId()
      };
    }
  });

  // Delete image
  ipcMain.handle(IMAGE_DELETE, async (event, filename: string): Promise<IPCResponse> => {
    try {
      await imageService.deleteImage(filename);
      return {
        success: true,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to delete image'),
        requestId: generateRequestId()
      };
    }
  });

  // Get image path
  ipcMain.handle(IMAGE_GET_PATH, async (event, filename: string): Promise<IPCResponse> => {
    try {
      const imagePath = imageService.getImagePath(filename);
      return {
        success: true,
        data: imagePath,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to get image path'),
        requestId: generateRequestId()
      };
    }
  });

  // Get image as Base64 data URL
  ipcMain.handle('image:get-data-url', async (event, filename: string): Promise<IPCResponse> => {
    try {
      const dataUrl = await imageService.getImageDataUrl(filename);
      return {
        success: true,
        data: dataUrl,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to get image data'),
        requestId: generateRequestId()
      };
    }
  });

  // Upload image from base64 data
  ipcMain.handle('image:upload-base64', async (event, base64Data: string, filename: string): Promise<IPCResponse> => {
    try {
      const metadata = await imageService.uploadFromBase64(base64Data, filename);
      return {
        success: true,
        data: metadata,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to upload image from base64'),
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
    userMessage = 'The requested image could not be found';
    suggestedAction = 'Please refresh the image list and try again';
  } else if (errorMessage.includes('format') || errorMessage.includes('invalid') || errorMessage.includes('supported')) {
    code = 'VALIDATION_ERROR';
    userMessage = 'Invalid image format';
    suggestedAction = 'Please use PNG, JPG, JPEG, GIF, or WebP format';
  } else if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
    code = 'PERMISSION_DENIED';
    userMessage = 'Permission denied to access image';
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
