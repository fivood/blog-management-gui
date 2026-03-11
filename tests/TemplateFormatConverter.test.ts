import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { TemplateFormatConverter, TemplateArticleFormat } from '../src/utils/TemplateFormatConverter';
import { Article, ArticleMetadata } from '../src/types/index';

/**
 * Unit Tests for TemplateFormatConverter
 */
describe('TemplateFormatConverter - Unit Tests', () => {
  describe('toTemplateFormat', () => {
    it('should convert a complete article to template format', () => {
      const article: Article = {
        id: 'article-1',
        title: 'Test Article',
        content: 'This is test content',
        excerpt: 'Test excerpt',
        tags: ['tag1', 'tag2'],
        categories: ['category1'],
        author: 'John Doe',
        state: 'published',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        publishedAt: new Date('2024-01-02T10:00:00Z'),
        modifiedAt: new Date('2024-01-03T10:00:00Z'),
        version: 2,
        isProtected: false,
        metadata: {
          title: 'Test Article',
          description: 'A test article',
          keywords: ['test', 'article'],
          author: 'John Doe',
          customFields: { customKey: 'customValue' },
        },
      };

      const format = TemplateFormatConverter.toTemplateFormat(article);

      expect(format.id).toBe('article-1');
      expect(format.title).toBe('Test Article');
      expect(format.content).toBe('This is test content');
      expect(format.excerpt).toBe('Test excerpt');
      expect(format.tags).toEqual(['tag1', 'tag2']);
      expect(format.categories).toEqual(['category1']);
      expect(format.author).toBe('John Doe');
      expect(format.state).toBe('published');
      expect(format.version).toBe(2);
      expect(format.isProtected).toBe(false);
      expect(format.createdAt).toBe('2024-01-01T10:00:00.000Z');
      expect(format.publishedAt).toBe('2024-01-02T10:00:00.000Z');
      expect(format.modifiedAt).toBe('2024-01-03T10:00:00.000Z');
      expect(format.metadata.customFields).toEqual({ customKey: 'customValue' });
    });

    it('should handle articles without optional fields', () => {
      const article: Article = {
        id: 'article-2',
        title: 'Minimal Article',
        content: 'Content',
        excerpt: undefined,
        tags: [],
        categories: [],
        author: undefined,
        state: 'draft',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        publishedAt: undefined,
        modifiedAt: new Date('2024-01-01T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Minimal Article',
        },
      };

      const format = TemplateFormatConverter.toTemplateFormat(article);

      expect(format.excerpt).toBeUndefined();
      expect(format.publishedAt).toBeUndefined();
      expect(format.author).toBeUndefined();
      expect(format.metadata.description).toBeUndefined();
      expect(format.metadata.keywords).toBeUndefined();
      expect(format.metadata.customFields).toBeUndefined();
    });

    it('should preserve custom fields in metadata', () => {
      const customFields = {
        templateSpecific: 'value',
        nestedData: { key: 'value' },
        arrayData: [1, 2, 3],
      };

      const article: Article = {
        id: 'article-3',
        title: 'Article with Custom Fields',
        content: 'Content',
        tags: [],
        categories: [],
        state: 'published',
        createdAt: new Date(),
        publishedAt: new Date(),
        modifiedAt: new Date(),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Article with Custom Fields',
          customFields,
        },
      };

      const format = TemplateFormatConverter.toTemplateFormat(article);

      expect(format.metadata.customFields).toEqual(customFields);
    });

    it('should not include password hash in template format', () => {
      const article: Article = {
        id: 'article-4',
        title: 'Protected Article',
        content: 'Content',
        tags: [],
        categories: [],
        state: 'published',
        createdAt: new Date(),
        publishedAt: new Date(),
        modifiedAt: new Date(),
        version: 1,
        isProtected: true,
        passwordHash: '$2b$12$hashedpassword',
        metadata: {
          title: 'Protected Article',
        },
      };

      const format = TemplateFormatConverter.toTemplateFormat(article);

      expect(format.isProtected).toBe(true);
      expect((format as any).passwordHash).toBeUndefined();
    });
  });

  describe('fromTemplateFormat', () => {
    it('should convert template format back to article', () => {
      const format: TemplateArticleFormat = {
        id: 'article-1',
        title: 'Test Article',
        content: 'This is test content',
        excerpt: 'Test excerpt',
        tags: ['tag1', 'tag2'],
        categories: ['category1'],
        author: 'John Doe',
        state: 'published',
        createdAt: '2024-01-01T10:00:00.000Z',
        publishedAt: '2024-01-02T10:00:00.000Z',
        modifiedAt: '2024-01-03T10:00:00.000Z',
        version: 2,
        isProtected: false,
        metadata: {
          title: 'Test Article',
          description: 'A test article',
          keywords: ['test', 'article'],
          author: 'John Doe',
          customFields: { customKey: 'customValue' },
        },
      };

      const article = TemplateFormatConverter.fromTemplateFormat(format);

      expect(article.id).toBe('article-1');
      expect(article.title).toBe('Test Article');
      expect(article.content).toBe('This is test content');
      expect(article.excerpt).toBe('Test excerpt');
      expect(article.tags).toEqual(['tag1', 'tag2']);
      expect(article.categories).toEqual(['category1']);
      expect(article.author).toBe('John Doe');
      expect(article.state).toBe('published');
      expect(article.version).toBe(2);
      expect(article.isProtected).toBe(false);
      expect(article.createdAt).toEqual(new Date('2024-01-01T10:00:00.000Z'));
      expect(article.publishedAt).toEqual(new Date('2024-01-02T10:00:00.000Z'));
      expect(article.modifiedAt).toEqual(new Date('2024-01-03T10:00:00.000Z'));
      expect(article.metadata.customFields).toEqual({ customKey: 'customValue' });
    });

    it('should handle template format without optional fields', () => {
      const format: TemplateArticleFormat = {
        id: 'article-2',
        title: 'Minimal Article',
        content: 'Content',
        tags: [],
        categories: [],
        state: 'draft',
        createdAt: '2024-01-01T10:00:00.000Z',
        modifiedAt: '2024-01-01T10:00:00.000Z',
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Minimal Article',
        },
      };

      const article = TemplateFormatConverter.fromTemplateFormat(format);

      expect(article.excerpt).toBeUndefined();
      expect(article.publishedAt).toBeUndefined();
      expect(article.author).toBeUndefined();
      expect(article.passwordHash).toBeUndefined();
      expect(article.metadata.description).toBeUndefined();
    });

    it('should preserve custom fields when converting from template format', () => {
      const customFields = {
        templateSpecific: 'value',
        nestedData: { key: 'value' },
      };

      const format: TemplateArticleFormat = {
        id: 'article-3',
        title: 'Article with Custom Fields',
        content: 'Content',
        tags: [],
        categories: [],
        state: 'published',
        createdAt: '2024-01-01T10:00:00.000Z',
        publishedAt: '2024-01-02T10:00:00.000Z',
        modifiedAt: '2024-01-01T10:00:00.000Z',
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Article with Custom Fields',
          customFields,
        },
      };

      const article = TemplateFormatConverter.fromTemplateFormat(format);

      expect(article.metadata.customFields).toEqual(customFields);
    });
  });

  describe('Round-trip conversion', () => {
    it('should preserve article data through round-trip conversion', () => {
      const originalArticle: Article = {
        id: 'article-1',
        title: 'Test Article',
        content: 'This is test content',
        excerpt: 'Test excerpt',
        tags: ['tag1', 'tag2'],
        categories: ['category1'],
        author: 'John Doe',
        state: 'published',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        publishedAt: new Date('2024-01-02T10:00:00Z'),
        modifiedAt: new Date('2024-01-03T10:00:00Z'),
        version: 2,
        isProtected: false,
        metadata: {
          title: 'Test Article',
          description: 'A test article',
          keywords: ['test', 'article'],
          author: 'John Doe',
          customFields: { customKey: 'customValue' },
        },
      };

      const format = TemplateFormatConverter.toTemplateFormat(originalArticle);
      const recoveredArticle = TemplateFormatConverter.fromTemplateFormat(format);

      expect(recoveredArticle.id).toBe(originalArticle.id);
      expect(recoveredArticle.title).toBe(originalArticle.title);
      expect(recoveredArticle.content).toBe(originalArticle.content);
      expect(recoveredArticle.excerpt).toBe(originalArticle.excerpt);
      expect(recoveredArticle.tags).toEqual(originalArticle.tags);
      expect(recoveredArticle.categories).toEqual(originalArticle.categories);
      expect(recoveredArticle.author).toBe(originalArticle.author);
      expect(recoveredArticle.state).toBe(originalArticle.state);
      expect(recoveredArticle.version).toBe(originalArticle.version);
      expect(recoveredArticle.isProtected).toBe(originalArticle.isProtected);
      expect(recoveredArticle.createdAt.getTime()).toBe(originalArticle.createdAt.getTime());
      expect(recoveredArticle.publishedAt?.getTime()).toBe(originalArticle.publishedAt?.getTime());
      expect(recoveredArticle.modifiedAt.getTime()).toBe(originalArticle.modifiedAt.getTime());
      expect(recoveredArticle.metadata).toEqual(originalArticle.metadata);
    });

    it('should handle empty custom fields through round-trip', () => {
      const originalArticle: Article = {
        id: 'article-2',
        title: 'Article',
        content: 'Content',
        tags: [],
        categories: [],
        state: 'draft',
        createdAt: new Date(),
        modifiedAt: new Date(),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Article',
          customFields: {},
        },
      };

      const format = TemplateFormatConverter.toTemplateFormat(originalArticle);
      const recoveredArticle = TemplateFormatConverter.fromTemplateFormat(format);

      expect(recoveredArticle.metadata.customFields).toEqual({});
    });
  });
});

/**
 * Property-Based Tests for TemplateFormatConverter
 */
describe('TemplateFormatConverter - Property-Based Tests', () => {
  /**
   * Property 11: Template-Agnostic Data Format
   * **Validates: Requirements 5.4**
   *
   * For any article retrieved from the system, the data format SHALL be consistent
   * and independent of template rendering, containing all required fields in standardized format.
   */
  it('Property 11: Template-Agnostic Data Format - should maintain consistent format for all articles', () => {
    const articleArb = fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 200 }),
      content: fc.string({ minLength: 1, maxLength: 5000 }),
      excerpt: fc.option(fc.string({ maxLength: 500 })),
      tags: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
      categories: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
      author: fc.option(fc.string({ maxLength: 100 })),
      state: fc.constantFrom<'draft' | 'published'>('draft', 'published'),
      createdAt: fc.date(),
      publishedAt: fc.option(fc.date()),
      modifiedAt: fc.date(),
      version: fc.integer({ min: 1, max: 1000 }),
      isProtected: fc.boolean(),
      metadata: fc.record({
        title: fc.string({ minLength: 1, maxLength: 200 }),
        description: fc.option(fc.string({ maxLength: 500 })),
        keywords: fc.option(fc.array(fc.string({ maxLength: 50 }), { maxLength: 20 })),
        author: fc.option(fc.string({ maxLength: 100 })),
        customFields: fc.option(
          fc.record({
            key1: fc.string(),
            key2: fc.integer(),
          })
        ),
      }),
    });

    fc.assert(
      fc.property(articleArb, (articleData) => {
        const article: Article = {
          ...articleData,
          passwordHash: undefined,
        };

        const format = TemplateFormatConverter.toTemplateFormat(article);

        // Verify all required fields are present
        expect(format.id).toBeDefined();
        expect(format.title).toBeDefined();
        expect(format.content).toBeDefined();
        expect(format.state).toBeDefined();
        expect(format.createdAt).toBeDefined();
        expect(format.modifiedAt).toBeDefined();
        expect(format.version).toBeDefined();
        expect(format.isProtected).toBeDefined();
        expect(format.metadata).toBeDefined();

        // Verify format is consistent (ISO 8601 dates)
        expect(typeof format.createdAt).toBe('string');
        expect(typeof format.modifiedAt).toBe('string');
        if (format.publishedAt) {
          expect(typeof format.publishedAt).toBe('string');
        }

        // Verify no password hash is exposed
        expect((format as any).passwordHash).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Metadata Preservation Round Trip
   * **Validates: Requirements 6.1, 6.2, 6.4**
   *
   * For any article metadata (tags, categories, custom fields), after saving and retrieving,
   * the metadata SHALL be identical to the original.
   */
  it('Property 12: Metadata Preservation Round Trip - should preserve all metadata through conversion', () => {
    const metadataArb = fc.record({
      title: fc.string({ minLength: 1, maxLength: 200 }),
      description: fc.option(fc.string({ maxLength: 500 })),
      keywords: fc.option(fc.array(fc.string({ maxLength: 50 }), { maxLength: 20 })),
      author: fc.option(fc.string({ maxLength: 100 })),
      customFields: fc.option(
        fc.record({
          templateField1: fc.string(),
          templateField2: fc.integer(),
          nestedData: fc.record({
            nested: fc.string(),
          }),
        })
      ),
    });

    const articleArb = fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 200 }),
      content: fc.string({ minLength: 1, maxLength: 5000 }),
      tags: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
      categories: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
      state: fc.constantFrom<'draft' | 'published'>('draft', 'published'),
      createdAt: fc.date(),
      publishedAt: fc.option(fc.date()),
      modifiedAt: fc.date(),
      version: fc.integer({ min: 1, max: 1000 }),
      isProtected: fc.boolean(),
      metadata: metadataArb,
    });

    fc.assert(
      fc.property(articleArb, (articleData) => {
        const originalArticle: Article = {
          ...articleData,
          excerpt: undefined,
          author: undefined,
          passwordHash: undefined,
        };

        // Convert to template format and back
        const format = TemplateFormatConverter.toTemplateFormat(originalArticle);
        const recoveredArticle = TemplateFormatConverter.fromTemplateFormat(format);

        // Verify metadata is identical
        expect(recoveredArticle.metadata.title).toBe(originalArticle.metadata.title);
        expect(recoveredArticle.metadata.description).toBe(originalArticle.metadata.description);
        expect(recoveredArticle.metadata.keywords).toEqual(originalArticle.metadata.keywords);
        expect(recoveredArticle.metadata.author).toBe(originalArticle.metadata.author);
        expect(recoveredArticle.metadata.customFields).toEqual(originalArticle.metadata.customFields);

        // Verify tags and categories are preserved
        expect(recoveredArticle.tags).toEqual(originalArticle.tags);
        expect(recoveredArticle.categories).toEqual(originalArticle.categories);
      }),
      { numRuns: 100 }
    );
  });
});
