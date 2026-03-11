/**
 * Core type definitions for Blog Article Management system
 */
/**
 * Error codes for the system
 */
export declare enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
    INVALID_METADATA = "INVALID_METADATA",
    ARTICLE_NOT_FOUND = "ARTICLE_NOT_FOUND",
    INVALID_STATE_TRANSITION = "INVALID_STATE_TRANSITION",
    AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
    INVALID_PASSWORD = "INVALID_PASSWORD",
    STORAGE_ERROR = "STORAGE_ERROR",
    INTERNAL_ERROR = "INTERNAL_ERROR"
}
/**
 * Validation error details
 */
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}
/**
 * Result of validation operation
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}
/**
 * Error response from the system
 */
export interface ErrorResponse {
    code: ErrorCode;
    message: string;
    details?: Record<string, any>;
    timestamp: Date;
}
/**
 * Article metadata
 */
export interface ArticleMetadata {
    title: string;
    description?: string;
    keywords?: string[];
    author?: string;
    customFields?: Record<string, any>;
}
/**
 * Article update payload
 */
export interface ArticleUpdate {
    title?: string;
    content?: string;
    excerpt?: string;
    tags?: string[];
    categories?: string[];
    metadata?: Partial<ArticleMetadata>;
    password?: string;
}
/**
 * Filters for article queries
 */
export interface ArticleFilters {
    state?: 'draft' | 'published';
    tags?: string[];
    categories?: string[];
    author?: string;
    dateRange?: {
        from: Date;
        to: Date;
    };
}
/**
 * Article data model
 */
export interface Article {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    tags: string[];
    categories: string[];
    author?: string;
    state: 'draft' | 'published';
    createdAt: Date;
    publishedAt?: Date;
    modifiedAt: Date;
    version: number;
    isProtected: boolean;
    passwordHash?: string;
    metadata: ArticleMetadata;
}
//# sourceMappingURL=index.d.ts.map