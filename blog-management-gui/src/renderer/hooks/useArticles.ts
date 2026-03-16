import { useState, useCallback } from 'react';
import type { 
  Article, 
  ArticleListItem, 
  CreateArticleData, 
  ArticleUpdate, 
  ArticleFilters 
} from '../../shared/types';
import { useIPC } from './useIPC';

/**
 * useArticles - Hook for article operations
 * Requirements: 1.1-1.5, 2.1-2.9, 3.1-3.5, 4.1-4.4
 * 
 * Provides:
 * - List articles with filtering
 * - Get single article
 * - Create article
 * - Update article
 * - Delete article
 * - Publish article
 * 
 * Usage:
 * ```tsx
 * const { articles, loading, loadArticles, createArticle } = useArticles();
 * 
 * useEffect(() => {
 *   loadArticles();
 * }, []);
 * ```
 */
export function useArticles() {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load articles list
  const loadArticles = useCallback(async (filters?: ArticleFilters): Promise<ArticleListItem[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.article.list(filters);
      
      if (response.success && response.data) {
        setArticles(response.data);
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to load articles';
        setError(errorMessage);
        return [];
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load articles';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single article
  const getArticle = useCallback(async (articleId: string): Promise<Article | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.article.get(articleId);
      
      if (response.success && response.data) {
        setCurrentArticle(response.data);
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to load article';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load article';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create article
  const createArticle = useCallback(async (data: CreateArticleData): Promise<Article | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.article.create(data);
      
      if (response.success && response.data) {
        // Refresh articles list
        await loadArticles();
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to create article';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create article';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadArticles]);

  // Update article
  const updateArticle = useCallback(async (
    articleId: string, 
    updates: ArticleUpdate
  ): Promise<Article | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.article.update(articleId, updates);
      
      if (response.success && response.data) {
        // Refresh articles list
        await loadArticles();
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to update article';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update article';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadArticles]);

  // Delete article
  const deleteArticle = useCallback(async (articleId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.article.delete(articleId);
      
      if (response.success) {
        // Refresh articles list
        await loadArticles();
        return true;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to delete article';
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete article';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadArticles]);

  // Publish article
  const publishArticle = useCallback(async (articleId: string): Promise<Article | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.article.publish(articleId);
      
      if (response.success && response.data) {
        // Refresh articles list
        await loadArticles();
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to publish article';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish article';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadArticles]);

  return {
    articles,
    currentArticle,
    loading,
    error,
    loadArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    publishArticle
  };
}
