import { Article, ArticleMetadata, ArticleUpdate, ArticleFilters, ValidationResult } from './types/index';
/**
 * Article Manager - Manages the complete lifecycle of blog articles
 * Handles creation, publication, modification, and deletion of articles
 */
export declare class ArticleManager {
    private articles;
    /**
     * Create a new article in Draft state
     * @param metadata Article metadata (title, description, etc.)
     * @param content Article content
     * @returns Promise resolving to the created article
     */
    createDraft(metadata: ArticleMetadata, content: string): Promise<Article>;
    /**
     * Publish a draft article to Published state
     * @param articleId ID of the article to publish
     * @returns Promise resolving to the published article
     */
    publishArticle(articleId: string): Promise<Article>;
    /**
     * Modify an existing article
     * Preserves publication timestamp if article is already published
     * @param articleId ID of the article to modify
     * @param updates Updates to apply
     * @returns Promise resolving to the modified article
     */
    modifyArticle(articleId: string, updates: ArticleUpdate): Promise<Article>;
    /**
     * Delete an article completely
     * @param articleId ID of the article to delete
     * @returns Promise resolving when deletion is complete
     */
    deleteArticle(articleId: string): Promise<void>;
    /**
     * Retrieve a single article by ID
     * @param articleId ID of the article to retrieve
     * @returns Promise resolving to the article
     */
    getArticle(articleId: string): Promise<Article>;
    /**
     * List articles with optional filtering
     * @param filters Optional filters (state, tags, categories, author, dateRange)
     * @returns Promise resolving to array of matching articles
     */
    listArticles(filters?: ArticleFilters): Promise<Article[]>;
    /**
     * Validate article metadata
     * @param metadata Metadata to validate
     * @returns ValidationResult with any errors found
     */
    validateMetadata(metadata: ArticleMetadata): ValidationResult;
    /**
     * Create a validation error response
     */
    private createValidationError;
    /**
     * Create a not found error response
     */
    private createNotFoundError;
}
//# sourceMappingURL=ArticleManager.d.ts.map