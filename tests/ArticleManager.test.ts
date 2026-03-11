import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ArticleManager } from '../src/ArticleManager';
import { ArticleMetadata, ErrorCode } from '../src/types/index';

describe('ArticleManager', () => {
  let manager: ArticleManager;

  beforeEach(() => {
    manager = new ArticleManager();
  });

  describe('createDraft', () => {
    it('should create an article in Draft state with valid metadata', async () => {
      const metadata: ArticleMetadata = {
        title: 'Test Article',
        description: 'A test article'
      };
      const content = 'This is test content';

      const article = await manager.createDraft(metadata, content);

      expect(article.state).toBe('draft');
      expect(article.title).toBe('Test Article');
      expect(article.content).toBe(content);
      expect(article.id).toBeDefined();
      expect(article.createdAt).toBeDefined();
      expect(article.modifiedAt).toBeDefined();
      expect(article.version).toBe(1);
      expect(article.isProtected).toBe(false);
      expect(article.publishedAt).toBeUndefined();
    });

    it('should generate unique IDs for different articles', async () => {
      const metadata: ArticleMetadata = { title: 'Article 1' };
      const article1 = await manager.createDraft(metadata, 'Content 1');
      const article2 = await manager.createDraft(metadata, 'Content 2');

      expect(article1.id).not.toBe(article2.id);
    });

    it('should reject creation with missing title', async () => {
      const metadata: ArticleMetadata = { title: '' };
      const content = 'Content';

      try {
        await manager.createDraft(metadata, content);
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
        expect(error.details.errors).toContainEqual(
          expect.objectContaining({
            field: 'title',
            code: 'REQUIRED'
          })
        );
      }
    });

    it('should reject creation with missing content', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const content = '';

      try {
        await manager.createDraft(metadata, content);
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
        expect(error.details.errors).toContainEqual(
          expect.objectContaining({
            field: 'content',
            code: 'REQUIRED'
          })
        );
      }
    });

    it('should trim whitespace from content', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const content = '  \n  Content  \n  ';

      const article = await manager.createDraft(metadata, content);

      expect(article.content).toBe('Content');
    });
  });

  describe('publishArticle', () => {
    it('should transition article from Draft to Published', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content');

      const published = await manager.publishArticle(draft.id);

      expect(published.state).toBe('published');
      expect(published.publishedAt).toBeDefined();
    });

    it('should set immutable publication timestamp', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content');
      const beforePublish = new Date();

      const published = await manager.publishArticle(draft.id);

      expect(published.publishedAt!.getTime()).toBeGreaterThanOrEqual(beforePublish.getTime());
    });

    it('should be idempotent - publishing twice returns same state', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content');

      const first = await manager.publishArticle(draft.id);
      const second = await manager.publishArticle(draft.id);

      expect(first.state).toBe('published');
      expect(second.state).toBe('published');
      expect(first.publishedAt).toEqual(second.publishedAt);
    });

    it('should throw error for non-existent article', async () => {
      try {
        await manager.publishArticle('non-existent-id');
        expect.fail('Should have thrown not found error');
      } catch (error: any) {
        expect(error.code).toBe(ErrorCode.ARTICLE_NOT_FOUND);
      }
    });
  });

  describe('modifyArticle', () => {
    it('should update article content and metadata', async () => {
      const metadata: ArticleMetadata = { title: 'Original' };
      const article = await manager.createDraft(metadata, 'Original content');

      const updated = await manager.modifyArticle(article.id, {
        title: 'Updated',
        content: 'Updated content'
      });

      expect(updated.title).toBe('Updated');
      expect(updated.content).toBe('Updated content');
    });

    it('should increment version on modification', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article = await manager.createDraft(metadata, 'Content');
      expect(article.version).toBe(1);

      const updated = await manager.modifyArticle(article.id, {
        title: 'Updated'
      });

      expect(updated.version).toBe(2);
    });

    it('should preserve publication timestamp after modification', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(draft.id);
      const originalPublishedAt = published.publishedAt;

      // Wait a bit to ensure timestamp would be different
      await new Promise(resolve => setTimeout(resolve, 10));

      const modified = await manager.modifyArticle(draft.id, {
        content: 'Modified content'
      });

      expect(modified.publishedAt).toEqual(originalPublishedAt);
    });

    it('should update modification timestamp', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article = await manager.createDraft(metadata, 'Content');
      const originalModifiedAt = article.modifiedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await manager.modifyArticle(article.id, {
        content: 'New content'
      });

      expect(updated.modifiedAt.getTime()).toBeGreaterThan(originalModifiedAt.getTime());
    });

    it('should throw error for non-existent article', async () => {
      try {
        await manager.modifyArticle('non-existent-id', { title: 'Updated' });
        expect.fail('Should have thrown not found error');
      } catch (error: any) {
        expect(error.code).toBe(ErrorCode.ARTICLE_NOT_FOUND);
      }
    });

    it('should validate metadata on modification', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article = await manager.createDraft(metadata, 'Content');

      try {
        await manager.modifyArticle(article.id, {
          metadata: { title: '' }
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      }
    });
  });

  describe('deleteArticle', () => {
    it('should remove article completely', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article = await manager.createDraft(metadata, 'Content');

      await manager.deleteArticle(article.id);

      try {
        await manager.getArticle(article.id);
        expect.fail('Should have thrown not found error');
      } catch (error: any) {
        expect(error.code).toBe(ErrorCode.ARTICLE_NOT_FOUND);
      }
    });

    it('should throw error for non-existent article', async () => {
      try {
        await manager.deleteArticle('non-existent-id');
        expect.fail('Should have thrown not found error');
      } catch (error: any) {
        expect(error.code).toBe(ErrorCode.ARTICLE_NOT_FOUND);
      }
    });
  });

  describe('getArticle', () => {
    it('should retrieve article by ID', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const created = await manager.createDraft(metadata, 'Content');

      const retrieved = await manager.getArticle(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.title).toBe('Test');
    });

    it('should throw error for non-existent article', async () => {
      try {
        await manager.getArticle('non-existent-id');
        expect.fail('Should have thrown not found error');
      } catch (error: any) {
        expect(error.code).toBe(ErrorCode.ARTICLE_NOT_FOUND);
      }
    });
  });

  describe('listArticles', () => {
    it('should return all articles when no filters provided', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      await manager.createDraft(metadata, 'Content 1');
      await manager.createDraft(metadata, 'Content 2');

      const articles = await manager.listArticles();

      expect(articles).toHaveLength(2);
    });

    it('should filter articles by state', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content 1');
      const published = await manager.publishArticle(draft.id);

      const draft2 = await manager.createDraft(metadata, 'Content 2');

      const draftArticles = await manager.listArticles({ state: 'draft' });
      const publishedArticles = await manager.listArticles({ state: 'published' });

      expect(draftArticles).toHaveLength(1);
      expect(publishedArticles).toHaveLength(1);
    });

    it('should filter articles by tags', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article1 = await manager.createDraft(metadata, 'Content 1');
      const article2 = await manager.createDraft(metadata, 'Content 2');

      await manager.modifyArticle(article1.id, { tags: ['javascript', 'web'] });
      await manager.modifyArticle(article2.id, { tags: ['python'] });

      const jsArticles = await manager.listArticles({ tags: ['javascript'] });

      expect(jsArticles).toHaveLength(1);
      expect(jsArticles[0].id).toBe(article1.id);
    });

    it('should filter articles by categories', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article1 = await manager.createDraft(metadata, 'Content 1');
      const article2 = await manager.createDraft(metadata, 'Content 2');

      await manager.modifyArticle(article1.id, { categories: ['tech'] });
      await manager.modifyArticle(article2.id, { categories: ['lifestyle'] });

      const techArticles = await manager.listArticles({ categories: ['tech'] });

      expect(techArticles).toHaveLength(1);
      expect(techArticles[0].id).toBe(article1.id);
    });

    it('should filter articles by author', async () => {
      const metadata1: ArticleMetadata = { title: 'Test', author: 'Alice' };
      const metadata2: ArticleMetadata = { title: 'Test', author: 'Bob' };

      await manager.createDraft(metadata1, 'Content 1');
      await manager.createDraft(metadata2, 'Content 2');

      const aliceArticles = await manager.listArticles({ author: 'Alice' });

      expect(aliceArticles).toHaveLength(1);
      expect(aliceArticles[0].author).toBe('Alice');
    });

    it('should filter articles by date range', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article1 = await manager.createDraft(metadata, 'Content 1');
      const article2 = await manager.createDraft(metadata, 'Content 2');

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const articlesInRange = await manager.listArticles({
        dateRange: { from: yesterday, to: tomorrow }
      });

      expect(articlesInRange.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('validateMetadata', () => {
    it('should validate required title field', () => {
      const metadata: ArticleMetadata = { title: 'Valid Title' };

      const result = manager.validateMetadata(metadata);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty title', () => {
      const metadata: ArticleMetadata = { title: '' };

      const result = manager.validateMetadata(metadata);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'title',
          code: 'REQUIRED'
        })
      );
    });

    it('should reject whitespace-only title', () => {
      const metadata: ArticleMetadata = { title: '   ' };

      const result = manager.validateMetadata(metadata);

      expect(result.isValid).toBe(false);
    });

    it('should allow optional fields', () => {
      const metadata: ArticleMetadata = {
        title: 'Test',
        description: 'Optional description',
        keywords: ['tag1', 'tag2'],
        author: 'John Doe'
      };

      const result = manager.validateMetadata(metadata);

      expect(result.isValid).toBe(true);
    });
  });

  // Property-based tests
  describe('Property-based tests', () => {
    // Helper to generate non-empty strings (not just whitespace)
    const nonEmptyString = () =>
      fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);

    it('Property 1: Draft Creation Invariant - created articles are always in Draft state with valid ID', async () => {
      const testCases = fc.sample(
        fc.tuple(
          fc.record({
            title: nonEmptyString(),
            description: fc.option(nonEmptyString()),
            author: fc.option(nonEmptyString())
          }),
          nonEmptyString()
        ),
        100
      );

      for (const [metadata, content] of testCases) {
        const article = await manager.createDraft(
          { title: metadata.title, ...metadata },
          content
        );

        expect(article.state).toBe('draft');
        expect(article.id).toBeDefined();
        expect(article.id.length).toBeGreaterThan(0);
      }
    });

    it('Property 2: Publication State Transition - published articles have immutable timestamp', async () => {
      const testCases = fc.sample(
        fc.tuple(
          fc.record({
            title: nonEmptyString(),
            description: fc.option(nonEmptyString())
          }),
          nonEmptyString()
        ),
        100
      );

      for (const [metadata, content] of testCases) {
        const draft = await manager.createDraft(
          { title: metadata.title, ...metadata },
          content
        );
        const published = await manager.publishArticle(draft.id);

        expect(published.state).toBe('published');
        expect(published.publishedAt).toBeDefined();

        // Verify timestamp is immutable by publishing again
        const republished = await manager.publishArticle(draft.id);
        expect(republished.publishedAt).toEqual(published.publishedAt);
      }
    });

    it('Property 4: Metadata Validation - missing required fields are always reported', () => {
      const testCases = fc.sample(fc.string(), 100);

      for (const title of testCases) {
        if (title.trim().length === 0) {
          const result = manager.validateMetadata({ title });
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.field === 'title')).toBe(true);
        }
      }
    });

    it('Property 7: Modification Preserves Publication Timestamp', async () => {
      const testCases = fc.sample(
        fc.tuple(
          fc.record({
            title: nonEmptyString(),
            description: fc.option(nonEmptyString())
          }),
          nonEmptyString(),
          nonEmptyString()
        ),
        100
      );

      for (const [metadata, content, newContent] of testCases) {
        const draft = await manager.createDraft(
          { title: metadata.title, ...metadata },
          content
        );
        const published = await manager.publishArticle(draft.id);
        const originalTimestamp = published.publishedAt;

        const modified = await manager.modifyArticle(draft.id, {
          content: newContent
        });

        expect(modified.publishedAt).toEqual(originalTimestamp);
      }
    });

    it('Property 8: Version Increment on Modification', async () => {
      const testCases = fc.sample(
        fc.tuple(
          fc.record({
            title: nonEmptyString(),
            description: fc.option(nonEmptyString())
          }),
          nonEmptyString(),
          fc.array(nonEmptyString(), { minLength: 1, maxLength: 5 })
        ),
        100
      );

      for (const [metadata, content, modifications] of testCases) {
        let article = await manager.createDraft(
          { title: metadata.title, ...metadata },
          content
        );
        expect(article.version).toBe(1);

        for (let i = 0; i < modifications.length; i++) {
          article = await manager.modifyArticle(article.id, {
            content: modifications[i]
          });
          expect(article.version).toBe(i + 2);
        }
      }
    });
  });
});
