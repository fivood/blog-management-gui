import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ArticleManager } from '../src/ArticleManager';
import { ArticleMetadata, ErrorCode } from '../src/types/index';

describe('Modification Tracking', () => {
  let manager: ArticleManager;

  beforeEach(() => {
    manager = new ArticleManager();
  });

  describe('Version Management', () => {
    it('should initialize article with version 1', async () => {
      const metadata: ArticleMetadata = { title: 'Test Article' };
      const article = await manager.createDraft(metadata, 'Content');

      expect(article.version).toBe(1);
    });

    it('should increment version by 1 on first modification', async () => {
      const metadata: ArticleMetadata = { title: 'Test Article' };
      const article = await manager.createDraft(metadata, 'Content');
      const originalVersion = article.version;

      const modified = await manager.modifyArticle(article.id, {
        content: 'Modified content'
      });

      expect(modified.version).toBe(originalVersion + 1);
      expect(modified.version).toBe(2);
    });

    it('should increment version by 1 on each modification', async () => {
      const metadata: ArticleMetadata = { title: 'Test Article' };
      let article = await manager.createDraft(metadata, 'Content');
      expect(article.version).toBe(1);

      // First modification
      article = await manager.modifyArticle(article.id, {
        content: 'Modified 1'
      });
      expect(article.version).toBe(2);

      // Second modification
      article = await manager.modifyArticle(article.id, {
        content: 'Modified 2'
      });
      expect(article.version).toBe(3);

      // Third modification
      article = await manager.modifyArticle(article.id, {
        title: 'Updated Title'
      });
      expect(article.version).toBe(4);
    });

    it('should increment version when modifying title', async () => {
      const metadata: ArticleMetadata = { title: 'Original Title' };
      const article = await manager.createDraft(metadata, 'Content');

      const modified = await manager.modifyArticle(article.id, {
        title: 'New Title'
      });

      expect(modified.version).toBe(2);
      expect(modified.title).toBe('New Title');
    });

    it('should increment version when modifying tags', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article = await manager.createDraft(metadata, 'Content');

      const modified = await manager.modifyArticle(article.id, {
        tags: ['javascript', 'typescript']
      });

      expect(modified.version).toBe(2);
      expect(modified.tags).toEqual(['javascript', 'typescript']);
    });

    it('should increment version when modifying categories', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article = await manager.createDraft(metadata, 'Content');

      const modified = await manager.modifyArticle(article.id, {
        categories: ['tech', 'programming']
      });

      expect(modified.version).toBe(2);
      expect(modified.categories).toEqual(['tech', 'programming']);
    });

    it('should increment version when modifying metadata', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article = await manager.createDraft(metadata, 'Content');

      const modified = await manager.modifyArticle(article.id, {
        metadata: { description: 'New description' }
      });

      expect(modified.version).toBe(2);
      expect(modified.metadata.description).toBe('New description');
    });

    it('should increment version when modifying excerpt', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article = await manager.createDraft(metadata, 'Content');

      const modified = await manager.modifyArticle(article.id, {
        excerpt: 'New excerpt'
      });

      expect(modified.version).toBe(2);
      expect(modified.excerpt).toBe('New excerpt');
    });
  });

  describe('Modification Timestamp Updates', () => {
    it('should update modifiedAt timestamp on modification', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article = await manager.createDraft(metadata, 'Content');
      const originalModifiedAt = article.modifiedAt;

      // Wait to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const modified = await manager.modifyArticle(article.id, {
        content: 'Modified content'
      });

      expect(modified.modifiedAt.getTime()).toBeGreaterThan(originalModifiedAt.getTime());
    });

    it('should update modifiedAt to current time', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article = await manager.createDraft(metadata, 'Content');

      const beforeModify = new Date();
      await new Promise(resolve => setTimeout(resolve, 5));

      const modified = await manager.modifyArticle(article.id, {
        content: 'Modified content'
      });

      const afterModify = new Date();

      expect(modified.modifiedAt.getTime()).toBeGreaterThanOrEqual(beforeModify.getTime());
      expect(modified.modifiedAt.getTime()).toBeLessThanOrEqual(afterModify.getTime());
    });

    it('should update modifiedAt on each modification', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      let article = await manager.createDraft(metadata, 'Content');
      const timestamps: Date[] = [article.modifiedAt];

      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
        article = await manager.modifyArticle(article.id, {
          content: `Modified ${i}`
        });
        timestamps.push(article.modifiedAt);
      }

      // Verify each timestamp is later than the previous
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i].getTime()).toBeGreaterThan(timestamps[i - 1].getTime());
      }
    });

    it('should update modifiedAt when modifying title', async () => {
      const metadata: ArticleMetadata = { title: 'Original' };
      const article = await manager.createDraft(metadata, 'Content');
      const originalModifiedAt = article.modifiedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      const modified = await manager.modifyArticle(article.id, {
        title: 'Updated Title'
      });

      expect(modified.modifiedAt.getTime()).toBeGreaterThan(originalModifiedAt.getTime());
    });

    it('should update modifiedAt when modifying tags', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const article = await manager.createDraft(metadata, 'Content');
      const originalModifiedAt = article.modifiedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      const modified = await manager.modifyArticle(article.id, {
        tags: ['new-tag']
      });

      expect(modified.modifiedAt.getTime()).toBeGreaterThan(originalModifiedAt.getTime());
    });
  });

  describe('Publication Timestamp Immutability', () => {
    it('should preserve publishedAt after modification of published article', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(draft.id);
      const originalPublishedAt = published.publishedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      const modified = await manager.modifyArticle(draft.id, {
        content: 'Modified content'
      });

      expect(modified.publishedAt).toEqual(originalPublishedAt);
    });

    it('should not change publishedAt when modifying title of published article', async () => {
      const metadata: ArticleMetadata = { title: 'Original' };
      const draft = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(draft.id);
      const originalPublishedAt = published.publishedAt;

      const modified = await manager.modifyArticle(draft.id, {
        title: 'Updated Title'
      });

      expect(modified.publishedAt).toEqual(originalPublishedAt);
    });

    it('should not change publishedAt when modifying tags of published article', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(draft.id);
      const originalPublishedAt = published.publishedAt;

      const modified = await manager.modifyArticle(draft.id, {
        tags: ['tag1', 'tag2']
      });

      expect(modified.publishedAt).toEqual(originalPublishedAt);
    });

    it('should not change publishedAt when modifying categories of published article', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(draft.id);
      const originalPublishedAt = published.publishedAt;

      const modified = await manager.modifyArticle(draft.id, {
        categories: ['cat1', 'cat2']
      });

      expect(modified.publishedAt).toEqual(originalPublishedAt);
    });

    it('should not change publishedAt when modifying metadata of published article', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(draft.id);
      const originalPublishedAt = published.publishedAt;

      const modified = await manager.modifyArticle(draft.id, {
        metadata: { description: 'New description' }
      });

      expect(modified.publishedAt).toEqual(originalPublishedAt);
    });

    it('should not change publishedAt when modifying excerpt of published article', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(draft.id);
      const originalPublishedAt = published.publishedAt;

      const modified = await manager.modifyArticle(draft.id, {
        excerpt: 'New excerpt'
      });

      expect(modified.publishedAt).toEqual(originalPublishedAt);
    });

    it('should preserve publishedAt through multiple modifications', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(draft.id);
      const originalPublishedAt = published.publishedAt;

      let article = published;
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
        article = await manager.modifyArticle(article.id, {
          content: `Modified ${i}`
        });
        expect(article.publishedAt).toEqual(originalPublishedAt);
      }
    });

    it('should not have publishedAt for draft articles', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content');

      expect(draft.publishedAt).toBeUndefined();

      const modified = await manager.modifyArticle(draft.id, {
        content: 'Modified content'
      });

      expect(modified.publishedAt).toBeUndefined();
    });
  });

  describe('Combined Modification Tracking', () => {
    it('should update version and modifiedAt but preserve publishedAt', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      const draft = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(draft.id);

      const originalVersion = published.version;
      const originalModifiedAt = published.modifiedAt;
      const originalPublishedAt = published.publishedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      const modified = await manager.modifyArticle(draft.id, {
        content: 'Modified content',
        title: 'New Title'
      });

      expect(modified.version).toBe(originalVersion + 1);
      expect(modified.modifiedAt.getTime()).toBeGreaterThan(originalModifiedAt.getTime());
      expect(modified.publishedAt).toEqual(originalPublishedAt);
    });

    it('should handle multiple modifications with correct tracking', async () => {
      const metadata: ArticleMetadata = { title: 'Test' };
      let article = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(article.id);
      const originalPublishedAt = published.publishedAt;

      const modifications = [
        { content: 'Mod 1' },
        { title: 'Title 1' },
        { tags: ['tag1'] },
        { categories: ['cat1'] },
        { excerpt: 'Excerpt 1' }
      ];

      let currentVersion = published.version;
      let previousModifiedAt = published.modifiedAt;

      for (const mod of modifications) {
        await new Promise(resolve => setTimeout(resolve, 10));
        article = await manager.modifyArticle(article.id, mod);

        expect(article.version).toBe(++currentVersion);
        expect(article.modifiedAt.getTime()).toBeGreaterThan(previousModifiedAt.getTime());
        expect(article.publishedAt).toEqual(originalPublishedAt);

        previousModifiedAt = article.modifiedAt;
      }
    });
  });

  // Property-based tests
  describe('Property-based tests', () => {
    const nonEmptyString = () =>
      fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);

    it('Property 7: Modification Preserves Publication Timestamp - **Validates: Requirements 3.2, 3.3**', async () => {
      const testCases = fc.sample(
        fc.tuple(
          fc.record({
            title: nonEmptyString(),
            description: fc.option(nonEmptyString(), { nil: undefined })
          }),
          nonEmptyString(),
          fc.array(
            fc.record({
              content: fc.option(nonEmptyString(), { nil: undefined }),
              title: fc.option(nonEmptyString(), { nil: undefined }),
              tags: fc.option(fc.array(nonEmptyString(), { maxLength: 3 }), { nil: undefined }),
              categories: fc.option(fc.array(nonEmptyString(), { maxLength: 3 }), { nil: undefined })
            }),
            { minLength: 1, maxLength: 5 }
          )
        ),
        100
      );

      for (const [metadata, content, modifications] of testCases) {
        const draft = await manager.createDraft(
          { title: metadata.title, description: metadata.description },
          content
        );
        const published = await manager.publishArticle(draft.id);
        const originalPublishedAt = published.publishedAt;

        for (const mod of modifications) {
          const modified = await manager.modifyArticle(draft.id, mod);
          expect(modified.publishedAt).toEqual(originalPublishedAt);
        }
      }
    });

    it('Property 8: Version Increment on Modification - **Validates: Requirements 3.6**', async () => {
      const testCases = fc.sample(
        fc.tuple(
          fc.record({
            title: nonEmptyString(),
            description: fc.option(nonEmptyString(), { nil: undefined })
          }),
          nonEmptyString(),
          fc.array(
            fc.record({
              content: fc.option(nonEmptyString(), { nil: undefined }),
              title: fc.option(nonEmptyString(), { nil: undefined }),
              tags: fc.option(fc.array(nonEmptyString(), { maxLength: 3 }), { nil: undefined }),
              categories: fc.option(fc.array(nonEmptyString(), { maxLength: 3 }), { nil: undefined }),
              excerpt: fc.option(nonEmptyString(), { nil: undefined })
            }),
            { minLength: 1, maxLength: 10 }
          )
        ),
        100
      );

      for (const [metadata, content, modifications] of testCases) {
        let article = await manager.createDraft(
          { title: metadata.title, description: metadata.description },
          content
        );
        expect(article.version).toBe(1);

        for (let i = 0; i < modifications.length; i++) {
          article = await manager.modifyArticle(article.id, modifications[i]);
          expect(article.version).toBe(i + 2);
        }
      }
    });
  });
});
