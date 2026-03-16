import { ErrorCode, ErrorResponse } from '../types/index';
/**
 * Base class for all article-related errors
 * Provides consistent error handling and response formatting
 */
export declare class ArticleError extends Error {
    readonly code: ErrorCode;
    readonly details?: Record<string, any>;
    readonly timestamp: Date;
    constructor(code: ErrorCode, message: string, details?: Record<string, any>);
    /**
     * Convert error to ErrorResponse format
     */
    toErrorResponse(): ErrorResponse;
}
/**
 * Validation error - thrown when article data fails validation
 */
export declare class ValidationError extends ArticleError {
    constructor(message: string, details?: Record<string, any>);
}
/**
 * Not found error - thrown when article doesn't exist
 */
export declare class NotFoundError extends ArticleError {
    constructor(articleId: string);
}
/**
 * State transition error - thrown when invalid state transition is attempted
 */
export declare class StateTransitionError extends ArticleError {
    constructor(articleId: string, currentState: string, attemptedState: string);
}
/**
 * Authentication error - thrown when password authentication fails
 */
export declare class AuthenticationError extends ArticleError {
    constructor(message?: string);
}
/**
 * Storage error - thrown when storage operations fail
 */
export declare class StorageError extends ArticleError {
    constructor(message: string, details?: Record<string, any>);
}
/**
 * Internal error - thrown for unexpected system errors
 */
export declare class InternalError extends ArticleError {
    constructor(message: string, details?: Record<string, any>);
}
//# sourceMappingURL=ArticleError.d.ts.map