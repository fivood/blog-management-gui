import { Article, ArticleFilters } from '../types/index';
import { ArticleRepository } from '../types/ArticleRepository';
/**
 * In-Memory Article Repository Implementation
 * Stores articles in memory using a Map
 * Suitable for testing and development
 */
export declare class InMemoryArticleRepository implements ArticleRepository {
    private articles;
    /**
     * Save an article to the repository
     * @param article Article to save
     */
    save(article: Article): Promise<void>;
    /**
     * Find an article by ID
     * @param id Article ID
     * @returns The article or null if not found
     */
    findById(id: string): Promise<Article | null>;
    /**
     * Find all articles with optional filtering
     * @param filters Optional filters (state, tags, categories, author, dateRange)
     * @returns Array of matching articles
     */
    findAll(filters?: ArticleFilters): Promise<Article[]>;
    /**
     * Delete an article by ID
     * @param id Article ID
     */
    delete(id: string): Promise<void>;
    /**
     * Check if an article exists
     * @param id Article ID
     * @returns true if article exists, false otherwise
     */
    exists(id: string): Promise<boolean>;
    /**
     * Delete multiple articles by IDs
     * @param ids Array of article IDs to delete
     */
    deleteMultiple(ids: string[]): Promise<void>;
}
//# sourceMappingURL=InMemoryArticleRepository.d.ts.map