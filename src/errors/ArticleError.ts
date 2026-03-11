import { ErrorCode, ErrorResponse } from '../types/index';

/**
 * Base class for all article-related errors
 * Provides consistent error handling and response formatting
 */
export class ArticleError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ArticleError.prototype);
  }

  /**
   * Convert error to ErrorResponse format
   */
  toErrorResponse(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

/**
 * Validation error - thrown when article data fails validation
 */
export class ValidationError extends ArticleError {
  constructor(message: string, details?: Record<string, any>) {
    super(ErrorCode.VALIDATION_ERROR, message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Not found error - thrown when article doesn't exist
 */
export class NotFoundError extends ArticleError {
  constructor(articleId: string) {
    super(
      ErrorCode.ARTICLE_NOT_FOUND,
      `Article with ID "${articleId}" not found`
    );
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * State transition error - thrown when invalid state transition is attempted
 */
export class StateTransitionError extends ArticleError {
  constructor(articleId: string, currentState: string, attemptedState: string) {
    super(
      ErrorCode.INVALID_STATE_TRANSITION,
      `Cannot transition article "${articleId}" from state "${currentState}" to "${attemptedState}"`,
      { articleId, currentState, attemptedState }
    );
    Object.setPrototypeOf(this, StateTransitionError.prototype);
  }
}

/**
 * Authentication error - thrown when password authentication fails
 */
export class AuthenticationError extends ArticleError {
  constructor(message: string = 'Authentication failed') {
    super(ErrorCode.AUTHENTICATION_FAILED, message);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Storage error - thrown when storage operations fail
 */
export class StorageError extends ArticleError {
  constructor(message: string, details?: Record<string, any>) {
    super(ErrorCode.STORAGE_ERROR, message, details);
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}

/**
 * Internal error - thrown for unexpected system errors
 */
export class InternalError extends ArticleError {
  constructor(message: string, details?: Record<string, any>) {
    super(ErrorCode.INTERNAL_ERROR, message, details);
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}
