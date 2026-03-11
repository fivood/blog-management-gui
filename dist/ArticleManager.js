"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleManager = void 0;
const uuid_1 = require("uuid");
const index_1 = require("./types/index");
/**
 * Article Manager - Manages the complete lifecycle of blog articles
 * Handles creation, publication, modification, and deletion of articles
 */
class ArticleManager {
    constructor() {
        this.articles = new Map();
    }
    /**
     * Create a new article in Draft state
     * @param metadata Article metadata (title, description, etc.)
     * @param content Article content
     * @returns Promise resolving to the created article
     */
    async createDraft(metadata, content) {
        // Validate metadata
        const validation = this.validateMetadata(metadata);
        if (!validation.isValid) {
            throw this.createValidationError(validation);
        }
        // Validate content
        if (!content || content.trim().length === 0) {
            throw this.createValidationError({
                isValid: false,
                errors: [
                    {
                        field: 'content',
                        message: 'Content is required',
                        code: 'REQUIRED'
                    }
                ]
            });
        }
        const now = new Date();
        const article = {
            id: (0, uuid_1.v4)(),
            title: metadata.title,
            content: content.trim(),
            excerpt: metadata.description,
            tags: [],
            categories: [],
            author: metadata.author,
            state: 'draft',
            createdAt: now,
            modifiedAt: now,
            version: 1,
            isProtected: false,
            metadata
        };
        this.articles.set(article.id, article);
        return article;
    }
    /**
     * Publish a draft article to Published state
     * @param articleId ID of the article to publish
     * @returns Promise resolving to the published article
     */
    async publishArticle(articleId) {
        const article = this.articles.get(articleId);
        if (!article) {
            throw this.createNotFoundError(articleId);
        }
        if (article.state === 'published') {
            // Idempotent: already published, return as-is
            return article;
        }
        const now = new Date();
        article.state = 'published';
        article.publishedAt = now;
        article.modifiedAt = now;
        this.articles.set(articleId, article);
        return article;
    }
    /**
     * Modify an existing article
     * Preserves publication timestamp if article is already published
     * @param articleId ID of the article to modify
     * @param updates Updates to apply
     * @returns Promise resolving to the modified article
     */
    async modifyArticle(articleId, updates) {
        const article = this.articles.get(articleId);
        if (!article) {
            throw this.createNotFoundError(articleId);
        }
        // Validate metadata if provided
        if (updates.metadata) {
            const mergedMetadata = { ...article.metadata, ...updates.metadata };
            const validation = this.validateMetadata(mergedMetadata);
            if (!validation.isValid) {
                throw this.createValidationError(validation);
            }
        }
        const now = new Date();
        const originalPublishedAt = article.publishedAt;
        // Apply updates
        if (updates.title !== undefined) {
            article.title = updates.title;
        }
        if (updates.content !== undefined) {
            article.content = updates.content;
        }
        if (updates.excerpt !== undefined) {
            article.excerpt = updates.excerpt;
        }
        if (updates.tags !== undefined) {
            article.tags = updates.tags;
        }
        if (updates.categories !== undefined) {
            article.categories = updates.categories;
        }
        if (updates.metadata !== undefined) {
            article.metadata = { ...article.metadata, ...updates.metadata };
        }
        // Update modification tracking
        article.modifiedAt = now;
        article.version += 1;
        // Preserve original publication timestamp
        if (originalPublishedAt) {
            article.publishedAt = originalPublishedAt;
        }
        this.articles.set(articleId, article);
        return article;
    }
    /**
     * Delete an article completely
     * @param articleId ID of the article to delete
     * @returns Promise resolving when deletion is complete
     */
    async deleteArticle(articleId) {
        const article = this.articles.get(articleId);
        if (!article) {
            throw this.createNotFoundError(articleId);
        }
        this.articles.delete(articleId);
    }
    /**
     * Retrieve a single article by ID
     * @param articleId ID of the article to retrieve
     * @returns Promise resolving to the article
     */
    async getArticle(articleId) {
        const article = this.articles.get(articleId);
        if (!article) {
            throw this.createNotFoundError(articleId);
        }
        return article;
    }
    /**
     * List articles with optional filtering
     * @param filters Optional filters (state, tags, categories, author, dateRange)
     * @returns Promise resolving to array of matching articles
     */
    async listArticles(filters) {
        let results = Array.from(this.articles.values());
        if (!filters) {
            return results;
        }
        // Filter by state
        if (filters.state) {
            results = results.filter(a => a.state === filters.state);
        }
        // Filter by tags
        if (filters.tags && filters.tags.length > 0) {
            results = results.filter(a => filters.tags.some(tag => a.tags.includes(tag)));
        }
        // Filter by categories
        if (filters.categories && filters.categories.length > 0) {
            results = results.filter(a => filters.categories.some(cat => a.categories.includes(cat)));
        }
        // Filter by author
        if (filters.author) {
            results = results.filter(a => a.author === filters.author);
        }
        // Filter by date range
        if (filters.dateRange) {
            results = results.filter(a => {
                const pubDate = a.publishedAt || a.createdAt;
                return pubDate >= filters.dateRange.from && pubDate <= filters.dateRange.to;
            });
        }
        return results;
    }
    /**
     * Validate article metadata
     * @param metadata Metadata to validate
     * @returns ValidationResult with any errors found
     */
    validateMetadata(metadata) {
        const errors = [];
        // Check required fields
        if (!metadata.title || metadata.title.trim().length === 0) {
            errors.push({
                field: 'title',
                message: 'Title is required',
                code: 'REQUIRED'
            });
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Create a validation error response
     */
    createValidationError(validation) {
        return {
            code: index_1.ErrorCode.VALIDATION_ERROR,
            message: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
            details: { errors: validation.errors },
            timestamp: new Date()
        };
    }
    /**
     * Create a not found error response
     */
    createNotFoundError(articleId) {
        return {
            code: index_1.ErrorCode.ARTICLE_NOT_FOUND,
            message: `Article with ID "${articleId}" not found`,
            timestamp: new Date()
        };
    }
}
exports.ArticleManager = ArticleManager;
//# sourceMappingURL=ArticleManager.js.map