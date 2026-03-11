import { Article, ArticleFilters } from './index';

/**
 * Article Repository Interface
 * Defines the contract for article persistence and retrieval
 */
export interface ArticleRepository {
  /**
   * Save an article to the repository
   * @param article Article to save
   * @returns Promise resolving when save is complete
   */
  save(article: Article): Promise<void>;

  /**
   * Find an article by ID
   * @param id Article ID
   * @returns Promise resolving to the article or null if not found
   */
  findById(id: string): Promise<Article | null>;

  /**
   * Find all articles with optional filtering
   * @param filters Optional filters (state, tags, categories, author, dateRange)
   * @returns Promise resolving to array of matching articles
   */
  findAll(filters?: ArticleFilters): Promise<Article[]>;

  /**
   * Delete an article by ID
   * @param id Article ID
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Check if an article exists
   * @param id Article ID
   * @returns Promise resolving to true if article exists, false otherwise
   */
  exists(id: string): Promise<boolean>;

  /**
   * Delete multiple articles by IDs
   * @param ids Array of article IDs to delete
   * @returns Promise resolving when all deletions are complete
   */
  deleteMultiple(ids: string[]): Promise<void>;
}
