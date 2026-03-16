"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = exports.StorageError = exports.AuthenticationError = exports.StateTransitionError = exports.NotFoundError = exports.ValidationError = exports.ArticleError = void 0;
const index_1 = require("../types/index");
/**
 * Base class for all article-related errors
 * Provides consistent error handling and response formatting
 */
class ArticleError extends Error {
    constructor(code, message, details) {
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
    toErrorResponse() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
            timestamp: this.timestamp
        };
    }
}
exports.ArticleError = ArticleError;
/**
 * Validation error - thrown when article data fails validation
 */
class ValidationError extends ArticleError {
    constructor(message, details) {
        super(index_1.ErrorCode.VALIDATION_ERROR, message, details);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
/**
 * Not found error - thrown when article doesn't exist
 */
class NotFoundError extends ArticleError {
    constructor(articleId) {
        super(index_1.ErrorCode.ARTICLE_NOT_FOUND, `Article with ID "${articleId}" not found`);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * State transition error - thrown when invalid state transition is attempted
 */
class StateTransitionError extends ArticleError {
    constructor(articleId, currentState, attemptedState) {
        super(index_1.ErrorCode.INVALID_STATE_TRANSITION, `Cannot transition article "${articleId}" from state "${currentState}" to "${attemptedState}"`, { articleId, currentState, attemptedState });
        Object.setPrototypeOf(this, StateTransitionError.prototype);
    }
}
exports.StateTransitionError = StateTransitionError;
/**
 * Authentication error - thrown when password authentication fails
 */
class AuthenticationError extends ArticleError {
    constructor(message = 'Authentication failed') {
        super(index_1.ErrorCode.AUTHENTICATION_FAILED, message);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Storage error - thrown when storage operations fail
 */
class StorageError extends ArticleError {
    constructor(message, details) {
        super(index_1.ErrorCode.STORAGE_ERROR, message, details);
        Object.setPrototypeOf(this, StorageError.prototype);
    }
}
exports.StorageError = StorageError;
/**
 * Internal error - thrown for unexpected system errors
 */
class InternalError extends ArticleError {
    constructor(message, details) {
        super(index_1.ErrorCode.INTERNAL_ERROR, message, details);
        Object.setPrototypeOf(this, InternalError.prototype);
    }
}
exports.InternalError = InternalError;
//# sourceMappingURL=ArticleError.js.map