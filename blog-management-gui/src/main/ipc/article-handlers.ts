import { ipcMain } from 'electron';
import { ArticleService } from '../services/ArticleService';
import { IPCResponse, ErrorResponse } from '../../shared/types/ipc';
import {
  ARTICLE_LIST,
  ARTICLE_GET,
  ARTICLE_CREATE,
  ARTICLE_UPDATE,
  ARTICLE_DELETE,
  ARTICLE_PUBLISH
} from '../../shared/constants/ipc-channels';
import { ArticleFilters, CreateArticleData, ArticleUpdate } from '../../shared/types/article';

/**
 * Register article IPC handlers
 * Requirements: 1.1-1.5, 2.1-2.9, 3.1-3.5, 4.1-4.4
 */
export function registerArticleHandlers(articleService: ArticleService): void {
  // List articles with optional filters
  ipcMain.handle(ARTICLE_LIST, async (event, filters?: ArticleFilters): Promise<IPCResponse> => {
    try {
      const articles = await articleService.listArticles(filters);
      return {
        success: true,
        data: articles,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to list articles'),
        requestId: generateRequestId()
      };
    }
  });

  // Get single article by ID
  ipcMain.handle(ARTICLE_GET, async (event, articleId: string): Promise<IPCResponse> => {
    try {
      const article = await articleService.getArticle(articleId);
      return {
        success: true,
        data: article,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to get article'),
        requestId: generateRequestId()
      };
    }
  });

  // Create new article
  ipcMain.handle(ARTICLE_CREATE, async (event, data: CreateArticleData): Promise<IPCResponse> => {
    try {
      const article = await articleService.createArticle(data);
      return {
        success: true,
        data: article,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to create article'),
        requestId: generateRequestId()
      };
    }
  });

  // Update existing article
  ipcMain.handle(ARTICLE_UPDATE, async (event, articleId: string, updates: ArticleUpdate): Promise<IPCResponse> => {
    try {
      const article = await articleService.updateArticle(articleId, updates);
      return {
        success: true,
        data: article,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to update article'),
        requestId: generateRequestId()
      };
    }
  });

  // Delete article
  ipcMain.handle(ARTICLE_DELETE, async (event, articleId: string): Promise<IPCResponse> => {
    try {
      await articleService.deleteArticle(articleId);
      return {
        success: true,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to delete article'),
        requestId: generateRequestId()
      };
    }
  });

  // Publish article
  ipcMain.handle(ARTICLE_PUBLISH, async (event, articleId: string): Promise<IPCResponse> => {
    try {
      const article = await articleService.publishArticle(articleId);
      return {
        success: true,
        data: article,
        requestId: generateRequestId()
      };
    } catch (error) {
      return {
        success: false,
        error: createErrorResponse(error, 'Failed to publish article'),
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
    userMessage = 'The requested article could not be found';
    suggestedAction = 'Please refresh the article list and try again';
  } else if (errorMessage.includes('validation') || errorMessage.includes('required') || errorMessage.includes('invalid')) {
    code = 'VALIDATION_ERROR';
    userMessage = 'Invalid article data provided';
    suggestedAction = 'Please check all required fields and try again';
  } else if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
    code = 'PERMISSION_DENIED';
    userMessage = 'Permission denied to access article';
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
