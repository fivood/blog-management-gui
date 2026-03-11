import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { HugoIntegration } from '../src/integrations/HugoIntegration';
import { Article, ArticleMetadata } from '../src/types/index';

describe('HugoIntegration', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for file tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hugo-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('toHugoFrontMatter', () => {
    it('should convert article to Hugo frontmatter with all metadata fields', () => {
      const article: Article = {
        id: 'test-1',
        title: 'Test Article',
        content: 'This is the article content.',
        excerpt: 'Short excerpt',
        tags: ['tag1', 'tag2'],
        categories: ['category1'],
        author: 'John Doe',
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-20T15:30:00Z'),
        version: 2,
        isProtected: false,
        metadata: {
          title: 'Test Article',
          description: 'A test article description',
          keywords: ['keyword1', 'keyword2'],
          author: 'John Doe',
        },
      };

      const result = HugoIntegration.toHugoFrontMatter(article);

      expect(result).toContain('---');
      expect(result).toContain('title: Test Article');
      expect(result).toContain('draft: false');
      expect(result).toContain('- tag1');
      expect(result).toContain('- tag2');
      expect(result).toContain('- category1');
      expect(result).toContain('author: John Doe');
      expect(result).toContain('description: A test article description');
      expect(result).toContain('This is the article content.');
    });

    it('should handle articles without tags and categories', () => {
      const article: Article = {
        id: 'test-2',
        title: 'Simple Article',
        content: 'Content here',
        tags: [],
        categories: [],
        state: 'draft',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-15T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Simple Article',
        },
      };

      const result = HugoIntegration.toHugoFrontMatter(article);

      expect(result).toContain('draft: true');
      expect(result).not.toContain('tags:');
      expect(result).not.toContain('categories:');
    });

    it('should include custom fields in frontmatter', () => {
      const article: Article = {
        id: 'test-3',
        title: 'Article with Custom Fields',
        content: 'Content',
        tags: [],
        categories: [],
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-15T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Article with Custom Fields',
          customFields: {
            featured: true,
            image: '/images/test.jpg',
            rating: 5,
          },
        },
      };

      const result = HugoIntegration.toHugoFrontMatter(article);

      expect(result).toContain('featured: true');
      expect(result).toContain('image: /images/test.jpg');
      expect(result).toContain('rating: 5');
    });

    it('should properly format dates in ISO format', () => {
      const article: Article = {
        id: 'test-4',
        title: 'Date Test',
        content: 'Content',
        tags: [],
        categories: [],
        state: 'published',
        createdAt: new Date('2024-01-15T10:30:45Z'),
        publishedAt: new Date('2024-01-15T10:30:45Z'),
        modifiedAt: new Date('2024-01-20T15:45:30Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Date Test',
        },
      };

      const result = HugoIntegration.toHugoFrontMatter(article);

      expect(result).toContain('2024-01-15T10:30:45.000Z');
      expect(result).toContain('2024-01-20T15:45:30.000Z');
    });
  });

  describe('fromHugoFrontMatter', () => {
    it('should parse Hugo frontmatter to Article', () => {
      const hugoContent = `---
title: Parsed Article
date: 2024-01-15T10:00:00Z
lastmod: 2024-01-20T15:30:00Z
draft: false
tags:
  - tag1
  - tag2
categories:
  - category1
author: Jane Doe
description: Article description
keywords:
  - keyword1
  - keyword2
---
This is the parsed article content.`;

      const article = HugoIntegration.fromHugoFrontMatter(hugoContent);

      expect(article.title).toBe('Parsed Article');
      expect(article.content).toBe('This is the parsed article content.');
      expect(article.state).toBe('published');
      expect(article.tags).toEqual(['tag1', 'tag2']);
      expect(article.categories).toEqual(['category1']);
      expect(article.author).toBe('Jane Doe');
      expect(article.metadata.description).toBe('Article description');
      expect(article.metadata.keywords).toEqual(['keyword1', 'keyword2']);
    });

    it('should handle draft articles', () => {
      const hugoContent = `---
title: Draft Article
date: 2024-01-15T10:00:00Z
lastmod: 2024-01-15T10:00:00Z
draft: true
---
Draft content here.`;

      const article = HugoIntegration.fromHugoFrontMatter(hugoContent);

      expect(article.state).toBe('draft');
      expect(article.publishedAt).toBeUndefined();
    });

    it('should preserve custom fields from frontmatter', () => {
      const hugoContent = `---
title: Article with Custom Fields
date: 2024-01-15T10:00:00Z
lastmod: 2024-01-15T10:00:00Z
draft: false
featured: true
image: /images/test.jpg
rating: 5
---
Content here.`;

      const article = HugoIntegration.fromHugoFrontMatter(hugoContent);

      expect(article.metadata.customFields).toBeDefined();
      expect(article.metadata.customFields?.featured).toBe(true);
      expect(article.metadata.customFields?.image).toBe('/images/test.jpg');
      expect(article.metadata.customFields?.rating).toBe(5);
    });

    it('should handle minimal frontmatter', () => {
      const hugoContent = `---
title: Minimal Article
date: 2024-01-15T10:00:00Z
lastmod: 2024-01-15T10:00:00Z
---
Minimal content.`;

      const article = HugoIntegration.fromHugoFrontMatter(hugoContent);

      expect(article.title).toBe('Minimal Article');
      expect(article.content).toBe('Minimal content.');
      expect(article.tags).toEqual([]);
      expect(article.categories).toEqual([]);
    });

    it('should throw error on invalid frontmatter format', () => {
      const invalidContent = 'No frontmatter here';

      expect(() => {
        HugoIntegration.fromHugoFrontMatter(invalidContent);
      }).toThrow('Invalid Hugo frontmatter format');
    });

    it('should handle content with multiple --- separators', () => {
      const hugoContent = `---
title: Article with Dashes
date: 2024-01-15T10:00:00Z
lastmod: 2024-01-15T10:00:00Z
---
Content with --- dashes in it.
More content here.`;

      const article = HugoIntegration.fromHugoFrontMatter(hugoContent);

      expect(article.title).toBe('Article with Dashes');
      expect(article.content).toContain('Content with --- dashes in it.');
      expect(article.content).toContain('More content here.');
    });
  });

  describe('Round-trip conversion', () => {
    it('should preserve article data through toHugoFrontMatter and fromHugoFrontMatter', () => {
      const originalArticle: Article = {
        id: 'test-roundtrip',
        title: 'Round Trip Article',
        content: 'This is the content that should be preserved.',
        tags: ['tag1', 'tag2'],
        categories: ['cat1'],
        author: 'Test Author',
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-20T15:30:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Round Trip Article',
          description: 'Test description',
          keywords: ['kw1', 'kw2'],
          author: 'Test Author',
        },
      };

      // Convert to Hugo format and back
      const hugoFormat = HugoIntegration.toHugoFrontMatter(originalArticle);
      const parsedArticle = HugoIntegration.fromHugoFrontMatter(hugoFormat);

      // Verify key fields are preserved
      expect(parsedArticle.title).toBe(originalArticle.title);
      // Content may have leading/trailing whitespace differences due to formatting
      expect(parsedArticle.content.trim()).toBe(originalArticle.content.trim());
      expect(parsedArticle.tags).toEqual(originalArticle.tags);
      expect(parsedArticle.categories).toEqual(originalArticle.categories);
      expect(parsedArticle.author).toBe(originalArticle.author);
      expect(parsedArticle.state).toBe(originalArticle.state);
      expect(parsedArticle.metadata.description).toBe(originalArticle.metadata.description);
      expect(parsedArticle.metadata.keywords).toEqual(originalArticle.metadata.keywords);
    });

    it('should preserve custom fields through round-trip conversion', () => {
      const originalArticle: Article = {
        id: 'test-custom',
        title: 'Custom Fields Article',
        content: 'Content',
        tags: [],
        categories: [],
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-15T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Custom Fields Article',
          customFields: {
            featured: true,
            image: '/images/test.jpg',
            rating: 5,
            nested: {
              value: 'test',
            },
          },
        },
      };

      const hugoFormat = HugoIntegration.toHugoFrontMatter(originalArticle);
      const parsedArticle = HugoIntegration.fromHugoFrontMatter(hugoFormat);

      expect(parsedArticle.metadata.customFields).toBeDefined();
      expect(parsedArticle.metadata.customFields?.featured).toBe(true);
      expect(parsedArticle.metadata.customFields?.image).toBe('/images/test.jpg');
      expect(parsedArticle.metadata.customFields?.rating).toBe(5);
    });
  });

  describe('generateStaticFile', () => {
    it('should write article to file with Hugo frontmatter', async () => {
      const article: Article = {
        id: 'test-file',
        title: 'File Test Article',
        content: 'This is file content.',
        tags: ['tag1'],
        categories: ['cat1'],
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-15T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'File Test Article',
        },
      };

      const outputPath = path.join(tempDir, 'test-article.md');
      await HugoIntegration.generateStaticFile(article, outputPath);

      // Verify file was created
      const fileContent = await fs.readFile(outputPath, 'utf-8');
      expect(fileContent).toContain('---');
      expect(fileContent).toContain('title: File Test Article');
      expect(fileContent).toContain('This is file content.');
    });

    it('should create nested directories if they do not exist', async () => {
      const article: Article = {
        id: 'test-nested',
        title: 'Nested Directory Test',
        content: 'Content',
        tags: [],
        categories: [],
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-15T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Nested Directory Test',
        },
      };

      const outputPath = path.join(tempDir, 'nested', 'deep', 'article.md');
      await HugoIntegration.generateStaticFile(article, outputPath);

      // Verify file was created in nested directory
      const fileContent = await fs.readFile(outputPath, 'utf-8');
      expect(fileContent).toContain('title: Nested Directory Test');
    });

    it('should overwrite existing file', async () => {
      const article1: Article = {
        id: 'test-1',
        title: 'First Article',
        content: 'First content',
        tags: [],
        categories: [],
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-15T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'First Article',
        },
      };

      const article2: Article = {
        id: 'test-2',
        title: 'Second Article',
        content: 'Second content',
        tags: [],
        categories: [],
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-15T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Second Article',
        },
      };

      const outputPath = path.join(tempDir, 'article.md');

      // Write first article
      await HugoIntegration.generateStaticFile(article1, outputPath);
      let fileContent = await fs.readFile(outputPath, 'utf-8');
      expect(fileContent).toContain('First Article');

      // Overwrite with second article
      await HugoIntegration.generateStaticFile(article2, outputPath);
      fileContent = await fs.readFile(outputPath, 'utf-8');
      expect(fileContent).toContain('Second Article');
      expect(fileContent).not.toContain('First Article');
    });

    it('should handle special characters in content', async () => {
      const article: Article = {
        id: 'test-special',
        title: 'Special Characters: Test & More',
        content: 'Content with "quotes" and \'apostrophes\' and special chars: @#$%',
        tags: [],
        categories: [],
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-15T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Special Characters: Test & More',
        },
      };

      const outputPath = path.join(tempDir, 'special.md');
      await HugoIntegration.generateStaticFile(article, outputPath);

      const fileContent = await fs.readFile(outputPath, 'utf-8');
      expect(fileContent).toContain('Special Characters');
      expect(fileContent).toContain('Content with');
    });
  });

  describe('Edge cases', () => {
    it('should handle articles with empty content', () => {
      const article: Article = {
        id: 'test-empty',
        title: 'Empty Content Article',
        content: '',
        tags: [],
        categories: [],
        state: 'draft',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-15T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Empty Content Article',
        },
      };

      const result = HugoIntegration.toHugoFrontMatter(article);
      expect(result).toContain('---');
      expect(result).toContain('title: Empty Content Article');
    });

    it('should handle articles with very long content', () => {
      const longContent = 'This is a paragraph. '.repeat(1000);
      const article: Article = {
        id: 'test-long',
        title: 'Long Content Article',
        content: longContent,
        tags: [],
        categories: [],
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-15T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Long Content Article',
        },
      };

      const result = HugoIntegration.toHugoFrontMatter(article);
      const parsed = HugoIntegration.fromHugoFrontMatter(result);

      // Content may have leading/trailing whitespace differences
      expect(parsed.content.trim()).toBe(longContent.trim());
    });

    it('should handle articles with many tags and categories', () => {
      const tags = Array.from({ length: 20 }, (_, i) => `tag${i + 1}`);
      const categories = Array.from({ length: 15 }, (_, i) => `category${i + 1}`);

      const article: Article = {
        id: 'test-many',
        title: 'Many Tags Article',
        content: 'Content',
        tags,
        categories,
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-15T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Many Tags Article',
        },
      };

      const result = HugoIntegration.toHugoFrontMatter(article);
      const parsed = HugoIntegration.fromHugoFrontMatter(result);

      expect(parsed.tags).toEqual(tags);
      expect(parsed.categories).toEqual(categories);
    });
  });
});
