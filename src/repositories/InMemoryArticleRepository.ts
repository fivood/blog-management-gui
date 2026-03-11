import { Article, ArticleFilters } from '../types/index';
import { ArticleRepository } from '../types/ArticleRepository';

/**
 * In-Memory Article Repository Implementation
 * Stores articles in memory using a Map
 * Suitable for testing and development
 */
export class InMemoryArticleRepository implements ArticleRepository {
  private articles: Map<string, Article> = new Map();

  /**
   * Save an article to the repository
   * @param article Article to save
   */
  async save(article: Article): Promise<void> {
    this.articles.set(article.id, { ...article });
  }

  /**
   * Find an article by ID
   * @param id Article ID
   * @returns The article or null if not found
   */
  async findById(id: string): Promise<Article | null> {
    const article = this.articles.get(id);
    return article ? { ...article } : null;
  }

  /**
   * Find all articles with optional filtering
   * @param filters Optional filters (state, tags, categories, author, dateRange)
   * @returns Array of matching articles
   */
  async findAll(filters?: ArticleFilters): Promise<Article[]> {
    let results = Array.from(this.articles.values()).map(a => ({ ...a }));

    if (!filters) {
      return results;
    }

    // Filter by state
    if (filters.state) {
      results = results.filter(a => a.state === filters.state);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(a =>
        filters.tags!.some(tag => a.tags.includes(tag))
      );
    }

    // Filter by categories
    if (filters.categories && filters.categories.length > 0) {
      results = results.filter(a =>
        filters.categories!.some(cat => a.categories.includes(cat))
      );
    }

    // Filter by author
    if (filters.author) {
      results = results.filter(a => a.author === filters.author);
    }

    // Filter by date range
    if (filters.dateRange) {
      results = results.filter(a => {
        const pubDate = a.publishedAt || a.createdAt;
        return pubDate >= filters.dateRange!.from && pubDate <= filters.dateRange!.to;
      });
    }

    return results;
  }

  /**
   * Delete an article by ID
   * @param id Article ID
   */
  async delete(id: string): Promise<void> {
    this.articles.delete(id);
  }

  /**
   * Check if an article exists
   * @param id Article ID
   * @returns true if article exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    return this.articles.has(id);
  }

  /**
   * Delete multiple articles by IDs
   * @param ids Array of article IDs to delete
   */
  async deleteMultiple(ids: string[]): Promise<void> {
    ids.forEach(id => this.articles.delete(id));
  }
}
