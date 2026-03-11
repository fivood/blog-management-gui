import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { InMemoryArticleRepository } from '../src/repositories/InMemoryArticleRepository';
import { Article, ArticleMetadata } from '../src/types/index';
import { v4 as uuidv4 } from 'uuid';

/**
 * Test suite for ArticleRepository interface and InMemoryArticleRepository implementation
 */
describe('ArticleRepository', () => {
  let repository: InMemoryArticleRepository;

  beforeEach(() => {
    repository = new InMemoryArticleRepository();
  });

  // ============================================================================
  // Unit Tests
  // ============================================================================

  describe('Unit Tests', () => {
    describe('save() and findById()', () => {
      it('should save and retrieve an article', async () => {
        const article: Article = {
          id: uuidv4(),
          title: 'Test Article',
          content: 'Test content',
          tags: [],
          categories: [],
          state: 'draft',
          createdAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Test Article' }
        };

        await repository.save(article);
        const retrieved = await repository.findById(article.id);

        expect(retrieved).toEqual(article);
      });

      it('should return null for non-existent article', async () => {
        const result = await repository.findById('non-existent-id');
        expect(result).toBeNull();
      });

      it('should update an existing article', async () => {
        const article: Article = {
          id: uuidv4(),
          title: 'Original Title',
          content: 'Original content',
          tags: [],
          categories: [],
          state: 'draft',
          createdAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Original Title' }
        };

        await repository.save(article);

        const updated: Article = {
          ...article,
          title: 'Updated Title',
          version: 2,
          modifiedAt: new Date()
        };

        await repository.save(updated);
        const retrieved = await repository.findById(article.id);

        expect(retrieved?.title).toBe('Updated Title');
        expect(retrieved?.version).toBe(2);
      });

      it('should return a copy of the article, not the original reference', async () => {
        const article: Article = {
          id: uuidv4(),
          title: 'Test Article',
          content: 'Test content',
          tags: ['tag1'],
          categories: [],
          state: 'draft',
          createdAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Test Article' }
        };

        await repository.save(article);
        const retrieved = await repository.findById(article.id);

        // Modify the retrieved article
        if (retrieved) {
          retrieved.title = 'Modified Title';
        }

        // Original should be unchanged
        const retrieved2 = await repository.findById(article.id);
        expect(retrieved2?.title).toBe('Test Article');
      });
    });

    describe('findAll()', () => {
      it('should return all articles when no filters provided', async () => {
        const articles = [
          {
            id: uuidv4(),
            title: 'Article 1',
            content: 'Content 1',
            tags: [],
            categories: [],
            state: 'draft' as const,
            createdAt: new Date(),
            modifiedAt: new Date(),
            version: 1,
            isProtected: false,
            metadata: { title: 'Article 1' }
          },
          {
            id: uuidv4(),
            title: 'Article 2',
            content: 'Content 2',
            tags: [],
            categories: [],
            state: 'published' as const,
            createdAt: new Date(),
            modifiedAt: new Date(),
            version: 1,
            isProtected: false,
            metadata: { title: 'Article 2' }
          }
        ];

        for (const article of articles) {
          await repository.save(article);
        }

        const all = await repository.findAll();
        expect(all).toHaveLength(2);
      });

      it('should filter articles by state', async () => {
        const draft: Article = {
          id: uuidv4(),
          title: 'Draft Article',
          content: 'Content',
          tags: [],
          categories: [],
          state: 'draft',
          createdAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Draft Article' }
        };

        const published: Article = {
          id: uuidv4(),
          title: 'Published Article',
          content: 'Content',
          tags: [],
          categories: [],
          state: 'published',
          createdAt: new Date(),
          publishedAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Published Article' }
        };

        await repository.save(draft);
        await repository.save(published);

        const drafts = await repository.findAll({ state: 'draft' });
        expect(drafts).toHaveLength(1);
        expect(drafts[0].title).toBe('Draft Article');

        const published_articles = await repository.findAll({ state: 'published' });
        expect(published_articles).toHaveLength(1);
        expect(published_articles[0].title).toBe('Published Article');
      });

      it('should filter articles by tags', async () => {
        const article1: Article = {
          id: uuidv4(),
          title: 'Article 1',
          content: 'Content',
          tags: ['javascript', 'web'],
          categories: [],
          state: 'published',
          createdAt: new Date(),
          publishedAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Article 1' }
        };

        const article2: Article = {
          id: uuidv4(),
          title: 'Article 2',
          content: 'Content',
          tags: ['python', 'backend'],
          categories: [],
          state: 'published',
          createdAt: new Date(),
          publishedAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Article 2' }
        };

        await repository.save(article1);
        await repository.save(article2);

        const jsArticles = await repository.findAll({ tags: ['javascript'] });
        expect(jsArticles).toHaveLength(1);
        expect(jsArticles[0].title).toBe('Article 1');
      });

      it('should filter articles by categories', async () => {
        const article1: Article = {
          id: uuidv4(),
          title: 'Article 1',
          content: 'Content',
          tags: [],
          categories: ['tutorial', 'beginner'],
          state: 'published',
          createdAt: new Date(),
          publishedAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Article 1' }
        };

        const article2: Article = {
          id: uuidv4(),
          title: 'Article 2',
          content: 'Content',
          tags: [],
          categories: ['news', 'announcement'],
          state: 'published',
          createdAt: new Date(),
          publishedAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Article 2' }
        };

        await repository.save(article1);
        await repository.save(article2);

        const tutorials = await repository.findAll({ categories: ['tutorial'] });
        expect(tutorials).toHaveLength(1);
        expect(tutorials[0].title).toBe('Article 1');
      });

      it('should filter articles by author', async () => {
        const article1: Article = {
          id: uuidv4(),
          title: 'Article 1',
          content: 'Content',
          tags: [],
          categories: [],
          author: 'Alice',
          state: 'published',
          createdAt: new Date(),
          publishedAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Article 1', author: 'Alice' }
        };

        const article2: Article = {
          id: uuidv4(),
          title: 'Article 2',
          content: 'Content',
          tags: [],
          categories: [],
          author: 'Bob',
          state: 'published',
          createdAt: new Date(),
          publishedAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Article 2', author: 'Bob' }
        };

        await repository.save(article1);
        await repository.save(article2);

        const aliceArticles = await repository.findAll({ author: 'Alice' });
        expect(aliceArticles).toHaveLength(1);
        expect(aliceArticles[0].author).toBe('Alice');
      });

      it('should filter articles by date range', async () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const article1: Article = {
          id: uuidv4(),
          title: 'Article 1',
          content: 'Content',
          tags: [],
          categories: [],
          state: 'published',
          createdAt: yesterday,
          publishedAt: yesterday,
          modifiedAt: yesterday,
          version: 1,
          isProtected: false,
          metadata: { title: 'Article 1' }
        };

        const article2: Article = {
          id: uuidv4(),
          title: 'Article 2',
          content: 'Content',
          tags: [],
          categories: [],
          state: 'published',
          createdAt: nextWeek,
          publishedAt: nextWeek,
          modifiedAt: nextWeek,
          version: 1,
          isProtected: false,
          metadata: { title: 'Article 2' }
        };

        await repository.save(article1);
        await repository.save(article2);

        const inRange = await repository.findAll({
          dateRange: { from: yesterday, to: tomorrow }
        });
        expect(inRange).toHaveLength(1);
        expect(inRange[0].title).toBe('Article 1');
      });

      it('should combine multiple filters', async () => {
        const article1: Article = {
          id: uuidv4(),
          title: 'Article 1',
          content: 'Content',
          tags: ['javascript'],
          categories: ['tutorial'],
          author: 'Alice',
          state: 'published',
          createdAt: new Date(),
          publishedAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Article 1', author: 'Alice' }
        };

        const article2: Article = {
          id: uuidv4(),
          title: 'Article 2',
          content: 'Content',
          tags: ['javascript'],
          categories: ['news'],
          author: 'Bob',
          state: 'published',
          createdAt: new Date(),
          publishedAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Article 2', author: 'Bob' }
        };

        await repository.save(article1);
        await repository.save(article2);

        const results = await repository.findAll({
          state: 'published',
          tags: ['javascript'],
          author: 'Alice'
        });

        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Article 1');
      });
    });

    describe('delete()', () => {
      it('should delete an article', async () => {
        const article: Article = {
          id: uuidv4(),
          title: 'Test Article',
          content: 'Content',
          tags: [],
          categories: [],
          state: 'draft',
          createdAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Test Article' }
        };

        await repository.save(article);
        await repository.delete(article.id);

        const retrieved = await repository.findById(article.id);
        expect(retrieved).toBeNull();
      });

      it('should not throw when deleting non-existent article', async () => {
        await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
      });
    });

    describe('exists()', () => {
      it('should return true for existing article', async () => {
        const article: Article = {
          id: uuidv4(),
          title: 'Test Article',
          content: 'Content',
          tags: [],
          categories: [],
          state: 'draft',
          createdAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Test Article' }
        };

        await repository.save(article);
        const exists = await repository.exists(article.id);
        expect(exists).toBe(true);
      });

      it('should return false for non-existent article', async () => {
        const exists = await repository.exists('non-existent-id');
        expect(exists).toBe(false);
      });
    });

    describe('deleteMultiple()', () => {
      it('should delete multiple articles', async () => {
        const articles = [
          {
            id: uuidv4(),
            title: 'Article 1',
            content: 'Content',
            tags: [],
            categories: [],
            state: 'draft' as const,
            createdAt: new Date(),
            modifiedAt: new Date(),
            version: 1,
            isProtected: false,
            metadata: { title: 'Article 1' }
          },
          {
            id: uuidv4(),
            title: 'Article 2',
            content: 'Content',
            tags: [],
            categories: [],
            state: 'draft' as const,
            createdAt: new Date(),
            modifiedAt: new Date(),
            version: 1,
            isProtected: false,
            metadata: { title: 'Article 2' }
          },
          {
            id: uuidv4(),
            title: 'Article 3',
            content: 'Content',
            tags: [],
            categories: [],
            state: 'draft' as const,
            createdAt: new Date(),
            modifiedAt: new Date(),
            version: 1,
            isProtected: false,
            metadata: { title: 'Article 3' }
          }
        ];

        for (const article of articles) {
          await repository.save(article);
        }

        const idsToDelete = [articles[0].id, articles[1].id];
        await repository.deleteMultiple(idsToDelete);

        const remaining = await repository.findAll();
        expect(remaining).toHaveLength(1);
        expect(remaining[0].title).toBe('Article 3');
      });

      it('should handle empty array', async () => {
        const article: Article = {
          id: uuidv4(),
          title: 'Article',
          content: 'Content',
          tags: [],
          categories: [],
          state: 'draft',
          createdAt: new Date(),
          modifiedAt: new Date(),
          version: 1,
          isProtected: false,
          metadata: { title: 'Article' }
        };

        await repository.save(article);
        await repository.deleteMultiple([]);

        const all = await repository.findAll();
        expect(all).toHaveLength(1);
      });
    });
  });

  // ============================================================================
  // Property-Based Tests
  // ============================================================================

  describe('Property-Based Tests', () => {
    /**
     * Property 5: Article Deletion Completeness
     * For any published article, after deletion, the article SHALL not be retrievable
     * through any interface and all associated metadata SHALL be removed.
     *
     * Validates: Requirements 2.1, 2.2, 2.3
     */
    it('Property 5: Article Deletion Completeness', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1 }),
            content: fc.string({ minLength: 1 }),
            tags: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
            categories: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
            author: fc.option(fc.string({ minLength: 1 }))
          }),
          async (data) => {
            const repo = new InMemoryArticleRepository();
            const article: Article = {
              id: uuidv4(),
              title: data.title,
              content: data.content,
              tags: data.tags,
              categories: data.categories,
              author: data.author || undefined,
              state: 'published',
              createdAt: new Date(),
              publishedAt: new Date(),
              modifiedAt: new Date(),
              version: 1,
              isProtected: false,
              metadata: { title: data.title }
            };

            // Save the article
            await repo.save(article);

            // Verify it exists
            const exists1 = await repo.exists(article.id);
            expect(exists1).toBe(true);

            // Delete the article
            await repo.delete(article.id);

            // Verify it no longer exists
            const exists2 = await repo.exists(article.id);
            expect(exists2).toBe(false);

            // Verify it cannot be retrieved
            const retrieved = await repo.findById(article.id);
            expect(retrieved).toBeNull();

            // Verify it doesn't appear in findAll
            const all = await repo.findAll();
            expect(all).toHaveLength(0);

            // Verify it doesn't appear in filtered queries
            const filtered = await repo.findAll({
              state: 'published',
              tags: data.tags,
              categories: data.categories
            });
            expect(filtered).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6: Non-Existent Article Error
     * For any deletion or retrieval attempt on a non-existent article,
     * the system SHALL return a consistent "not found" error.
     *
     * Validates: Requirements 2.5
     */
    it('Property 6: Non-Existent Article Error', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          async (nonExistentId) => {
            const repo = new InMemoryArticleRepository();

            // Attempt to retrieve non-existent article
            const retrieved = await repo.findById(nonExistentId);
            expect(retrieved).toBeNull();

            // Attempt to delete non-existent article (should not throw)
            await expect(repo.delete(nonExistentId)).resolves.not.toThrow();

            // Verify exists returns false
            const exists = await repo.exists(nonExistentId);
            expect(exists).toBe(false);

            // Verify it doesn't appear in findAll
            const all = await repo.findAll();
            expect(all).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
