/**
 * Core type definitions for Blog Article Management system
 */

/**
 * Error codes for the system
 */
export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_METADATA = 'INVALID_METADATA',

  // Not found errors
  ARTICLE_NOT_FOUND = 'ARTICLE_NOT_FOUND',

  // State errors
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',

  // Authentication errors
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  INVALID_PASSWORD = 'INVALID_PASSWORD',

  // System errors
  STORAGE_ERROR = 'STORAGE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
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
  plainPassword?: string;
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
  author?: string;
  slug?: string;
  publishedAt?: Date;
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
  // Identity
  id: string;

  // Content
  title: string;
  content: string;
  excerpt?: string;

  // Metadata
  tags: string[];
  categories: string[];
  author?: string;
  slug?: string;

  // State
  state: 'draft' | 'published';

  // Timestamps
  createdAt: Date;
  publishedAt?: Date;
  modifiedAt: Date;

  // Versioning
  version: number;

  // Protection
  isProtected: boolean;
  passwordHash?: string;
  passwordHint?: string;

  // Metadata
  metadata: ArticleMetadata;
}
