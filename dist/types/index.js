"use strict";
/**
 * Core type definitions for Blog Article Management system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
/**
 * Error codes for the system
 */
var ErrorCode;
(function (ErrorCode) {
    // Validation errors
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["MISSING_REQUIRED_FIELD"] = "MISSING_REQUIRED_FIELD";
    ErrorCode["INVALID_METADATA"] = "INVALID_METADATA";
    // Not found errors
    ErrorCode["ARTICLE_NOT_FOUND"] = "ARTICLE_NOT_FOUND";
    // State errors
    ErrorCode["INVALID_STATE_TRANSITION"] = "INVALID_STATE_TRANSITION";
    // Authentication errors
    ErrorCode["AUTHENTICATION_FAILED"] = "AUTHENTICATION_FAILED";
    ErrorCode["INVALID_PASSWORD"] = "INVALID_PASSWORD";
    // System errors
    ErrorCode["STORAGE_ERROR"] = "STORAGE_ERROR";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=index.js.map