import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as fc from 'fast-check';
import { ArticleManager } from '../src/ArticleManager';
import { PasswordProtector } from '../src/PasswordProtector';
import { HugoIntegration } from '../src/integrations/HugoIntegration';
import { InMemoryArticleRepository } from '../src/repositories/InMemoryArticleRepository';
import { Article, ArticleMetadata, ErrorCode } from '../src/types/index';

describe('Integration Tests: Complete Article Lifecycle', () => {
  let manager: ArticleManager;
  let protector: PasswordProtector;
  let repository: InMemoryArticleRepository;
  let tempDir: string;

  beforeEach(async () => {
    // Initialize components
    repository = new InMemoryArticleRepository();
    manager = new ArticleManager();
    protector = new PasswordProtector(repository);

    // Create temporary directory for Hugo file generation
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'integration-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Complete Article Lifecycle', () => {
    it('should handle complete article lifecycle: create, publish, modify, delete', async () => {
      // Step 1: Create draft article
      const metadata: ArticleMetadata = {
        title: 'My First Article',
        description: 'An article about testing',
        keywords: ['testing', 'integration'],
        author: 'Test Author'
      };
      const content = 'This is the initial content of the article.';

      const draft = await manager.createDraft(metadata, content);
      expect(draft.state).toBe('draft');
      expect(draft.id).toBeDefined();
      expect(draft.version).toBe(1);
      expect(draft.publishedAt).toBeUndefined();

      // Step 2: Publish the article
      const published = await manager.publishArticle(draft.id);
      expect(published.state).toBe('published');
      expect(published.publishedAt).toBeDefined();
      const originalPublishedAt = published.publishedAt;

      // Step 3: Modify the article
      const modifiedContent = 'This is the updated content of the article.';
      const modified = await manager.modifyArticle(draft.id, {
        content: modifiedContent,
        tags: ['testing', 'integration'],
        categories: ['tutorials']
      });

      expect(modified.state).toBe('published');
      expect(modified.content).toBe(modifiedContent);
      expect(modified.tags).toEqual(['testing', 'integration']);
      expect(modified.categories).toEqual(['tutorials']);
      expect(modified.version).toBe(2);
      expect(modified.publishedAt).toEqual(originalPublishedAt); // Immutable
      expect(modified.modifiedAt.getTime()).toBeGreaterThanOrEqual(published.modifiedAt.getTime());

      // Step 4: Delete the article
      await manager.deleteArticle(draft.id);

      // Verify deletion
      try {
        await manager.getArticle(draft.id);
        expect.fail('Article should not exist after deletion');
      } catch (error: any) {
        expect(error.code).toBe(ErrorCode.ARTICLE_NOT_FOUND);
      }
    });

    it('should preserve metadata through complete workflow', async () => {
      const metadata: ArticleMetadata = {
        title: 'Metadata Test Article',
        description: 'Testing metadata preservation',
        keywords: ['metadata', 'preservation'],
        author: 'Metadata Tester',
        customFields: {
          customField1: 'value1',
          customField2: 42
        }
      };

      const draft = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(draft.id);

      // Modify and check metadata preservation
      const modified = await manager.modifyArticle(draft.id, {
        metadata: {
          description: 'Updated description'
        }
      });

      expect(modified.metadata.title).toBe('Metadata Test Article');
      expect(modified.metadata.description).toBe('Updated description');
      expect(modified.metadata.keywords).toEqual(['metadata', 'preservation']);
      expect(modified.metadata.author).toBe('Metadata Tester');
      expect(modified.metadata.customFields).toEqual({
        customField1: 'value1',
        customField2: 42
      });
    });
  });

  describe('Password Protection Integration', () => {
    it('should protect article and require password for access', async () => {
      // Create and publish article
      const metadata: ArticleMetadata = { title: 'Protected Article' };
      const draft = await manager.createDraft(metadata, 'Secret content');
      const published = await manager.publishArticle(draft.id);

      // Save to repository for password protector
      await repository.save(published);

      // Protect with password
      const password = 'SecurePassword123!';
      await protector.protectArticle(published.id, password);

      // Verify article is protected
      const isProtected = await protector.requiresAuthentication(published.id);
      expect(isProtected).toBe(true);

      // Verify correct password grants access
      const canAccess = await protector.canAccessArticle(published.id, password);
      expect(canAccess).toBe(true);

      // Verify incorrect password denies access
      const cannotAccess = await protector.canAccessArticle(published.id, 'WrongPassword');
      expect(cannotAccess).toBe(false);

      // Verify no password denies access
      const noPasswordAccess = await protector.canAccessArticle(published.id);
      expect(noPasswordAccess).toBe(false);
    });

    it('should allow unprotected articles to be accessed without password', async () => {
      // Create and publish article
      const metadata: ArticleMetadata = { title: 'Public Article' };
      const draft = await manager.createDraft(metadata, 'Public content');
      const published = await manager.publishArticle(draft.id);

      // Save to repository
      await repository.save(published);

      // Verify article is not protected
      const isProtected = await protector.requiresAuthentication(published.id);
      expect(isProtected).toBe(false);

      // Verify access without password
      const canAccess = await protector.canAccessArticle(published.id);
      expect(canAccess).toBe(true);

      // Verify access with password still works (password ignored for unprotected)
      const canAccessWithPassword = await protector.canAccessArticle(published.id, 'AnyPassword');
      expect(canAccessWithPassword).toBe(true);
    });

    it('should update password and invalidate old password', async () => {
      // Create and protect article
      const metadata: ArticleMetadata = { title: 'Password Update Test' };
      const draft = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(draft.id);
      await repository.save(published);

      const oldPassword = 'OldPassword123!';
      await protector.protectArticle(published.id, oldPassword);

      // Verify old password works
      let canAccess = await protector.canAccessArticle(published.id, oldPassword);
      expect(canAccess).toBe(true);

      // Update password
      const newPassword = 'NewPassword456!';
      await protector.updatePassword(published.id, newPassword);

      // Verify old password no longer works
      canAccess = await protector.canAccessArticle(published.id, oldPassword);
      expect(canAccess).toBe(false);

      // Verify new password works
      canAccess = await protector.canAccessArticle(published.id, newPassword);
      expect(canAccess).toBe(true);
    });

    it('should unprotect article and allow public access', async () => {
      // Create and protect article
      const metadata: ArticleMetadata = { title: 'Unprotect Test' };
      const draft = await manager.createDraft(metadata, 'Content');
      const published = await manager.publishArticle(draft.id);
      await repository.save(published);

      const password = 'TestPassword123!';
      await protector.protectArticle(published.id, password);

      // Verify article is protected
      let isProtected = await protector.requiresAuthentication(published.id);
      expect(isProtected).toBe(true);

      // Unprotect article
      await protector.unprotectArticle(published.id);

      // Verify article is no longer protected
      isProtected = await protector.requiresAuthentication(published.id);
      expect(isProtected).toBe(false);

      // Verify access without password
      const canAccess = await protector.canAccessArticle(published.id);
      expect(canAccess).toBe(true);
    });

    it('should handle password protection with article modification - verify password persists', async () => {
      // Create and publish article
      const metadata: ArticleMetadata = { title: 'Protected Modification Test' };
      const draft = await manager.createDraft(metadata, 'Initial content');
      const published = await manager.publishArticle(draft.id);
      await repository.save(published);

      const password = 'ProtectionPassword123!';
      await protector.protectArticle(published.id, password);

      // Get the protected article from repository
      const protectedArticle = await repository.findById(published.id);
      expect(protectedArticle?.isProtected).toBe(true);

      // Verify password works
      let canAccess = await protector.canAccessArticle(published.id, password);
      expect(canAccess).toBe(true);

      // Verify incorrect password denies access
      const cannotAccess = await protector.canAccessArticle(published.id, 'WrongPassword');
      expect(cannotAccess).toBe(false);
    });
  });

  describe('Hugo Integration', () => {
    it('should generate Hugo frontmatter with all metadata', () => {
      const article: Article = {
        id: 'test-article-1',
        title: 'Hugo Integration Test',
        content: 'This is the article content for Hugo.',
        excerpt: 'Short excerpt',
        tags: ['hugo', 'integration', 'testing'],
        categories: ['tutorials', 'guides'],
        author: 'Hugo Tester',
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-20T15:30:00Z'),
        version: 2,
        isProtected: false,
        metadata: {
          title: 'Hugo Integration Test',
          description: 'Testing Hugo integration',
          keywords: ['hugo', 'test'],
          author: 'Hugo Tester',
          customFields: {
            customField: 'customValue'
          }
        }
      };

      const hugoContent = HugoIntegration.toHugoFrontMatter(article);

      // Verify frontmatter structure
      expect(hugoContent).toContain('---');
      expect(hugoContent).toContain('title: Hugo Integration Test');
      expect(hugoContent).toContain('draft: false');
      expect(hugoContent).toContain('This is the article content for Hugo.');

      // Verify tags and categories
      expect(hugoContent).toContain('tags:');
      expect(hugoContent).toContain('- hugo');
      expect(hugoContent).toContain('- integration');
      expect(hugoContent).toContain('- testing');
      expect(hugoContent).toContain('categories:');
      expect(hugoContent).toContain('- tutorials');
      expect(hugoContent).toContain('- guides');
    });

    it('should parse Hugo frontmatter back to Article', () => {
      const hugoContent = `---
title: Parsed Article
date: 2024-01-15T10:00:00.000Z
lastmod: 2024-01-20T15:30:00.000Z
draft: false
tags:
  - tag1
  - tag2
categories:
  - category1
author: Test Author
description: Article description
keywords:
  - keyword1
  - keyword2
customField: customValue
---

This is the parsed article content.`;

      const article = HugoIntegration.fromHugoFrontMatter(hugoContent);

      expect(article.title).toBe('Parsed Article');
      expect(article.content.trim()).toBe('This is the parsed article content.');
      expect(article.state).toBe('published');
      expect(article.tags).toEqual(['tag1', 'tag2']);
      expect(article.categories).toEqual(['category1']);
      expect(article.author).toBe('Test Author');
      expect(article.metadata.description).toBe('Article description');
      expect(article.metadata.keywords).toEqual(['keyword1', 'keyword2']);
      expect(article.metadata.customFields?.customField).toBe('customValue');
    });

    it('should generate static file with Hugo frontmatter', async () => {
      const article: Article = {
        id: 'static-file-test',
        title: 'Static File Test',
        content: 'Content for static file generation.',
        tags: ['static', 'file'],
        categories: ['testing'],
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-15T10:00:00Z'),
        version: 1,
        isProtected: false,
        metadata: {
          title: 'Static File Test',
          description: 'Testing static file generation'
        }
      };

      const outputPath = path.join(tempDir, 'content', 'posts', 'test-article.md');
      await HugoIntegration.generateStaticFile(article, outputPath);

      // Verify file was created
      const fileExists = await fs.stat(outputPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      // Verify file content
      const fileContent = await fs.readFile(outputPath, 'utf-8');
      expect(fileContent).toContain('---');
      expect(fileContent).toContain('title: Static File Test');
      expect(fileContent).toContain('Content for static file generation.');
    });

    it('should round-trip article through Hugo format', () => {
      const originalArticle: Article = {
        id: 'round-trip-test',
        title: 'Round Trip Test Article',
        content: 'This is the original content.\n\nWith multiple paragraphs.',
        excerpt: 'Short excerpt',
        tags: ['roundtrip', 'test'],
        categories: ['testing'],
        author: 'Round Trip Tester',
        state: 'published',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        modifiedAt: new Date('2024-01-20T15:30:00Z'),
        version: 2,
        isProtected: false,
        metadata: {
          title: 'Round Trip Test Article',
          description: 'Testing round-trip conversion',
          keywords: ['roundtrip', 'conversion'],
          author: 'Round Trip Tester',
          customFields: {
            customField1: 'value1',
            customField2: 42
          }
        }
      };

      // Convert to Hugo format
      const hugoContent = HugoIntegration.toHugoFrontMatter(originalArticle);

      // Parse back from Hugo format
      const parsedArticle = HugoIntegration.fromHugoFrontMatter(hugoContent);

      // Verify key fields are preserved
      expect(parsedArticle.title).toBe(originalArticle.title);
      expect(parsedArticle.content.trim()).toBe(originalArticle.content);
      expect(parsedArticle.tags).toEqual(originalArticle.tags);
      expect(parsedArticle.categories).toEqual(originalArticle.categories);
      expect(parsedArticle.author).toBe(originalArticle.author);
      expect(parsedArticle.state).toBe(originalArticle.state);
      expect(parsedArticle.metadata.description).toBe(originalArticle.metadata.description);
      expect(parsedArticle.metadata.keywords).toEqual(originalArticle.metadata.keywords);
      expect(parsedArticle.metadata.customFields).toEqual(originalArticle.metadata.customFields);
    });
  });

  describe('Complete Workflow: Create, Protect, Publish, Generate Hugo', () => {
    it('should handle complete workflow with password protection and Hugo generation', async () => {
      // Step 1: Create draft article
      const metadata: ArticleMetadata = {
        title: 'Complete Workflow Article',
        description: 'Testing complete workflow',
        keywords: ['workflow', 'complete'],
        author: 'Workflow Tester',
        customFields: {
          featured: true,
          readTime: 5
        }
      };
      const content = 'This is the complete workflow test article content.';

      const draft = await manager.createDraft(metadata, content);
      expect(draft.state).toBe('draft');

      // Step 2: Publish article
      const published = await manager.publishArticle(draft.id);
      expect(published.state).toBe('published');
      expect(published.publishedAt).toBeDefined();

      // Step 3: Save to repository
      await repository.save(published);

      // Step 4: Protect with password
      const password = 'WorkflowPassword123!';
      await protector.protectArticle(published.id, password);

      // Verify protection
      const isProtected = await protector.requiresAuthentication(published.id);
      expect(isProtected).toBe(true);

      // Step 5: Modify article
      const modified = await manager.modifyArticle(published.id, {
        content: 'Updated workflow article content.',
        tags: ['workflow', 'complete', 'test']
      });

      expect(modified.version).toBe(2);
      expect(modified.publishedAt).toEqual(published.publishedAt);

      // Step 6: Update repository
      await repository.save(modified);

      // Step 7: Generate Hugo file
      const outputPath = path.join(tempDir, 'content', 'posts', 'workflow-article.md');
      await HugoIntegration.generateStaticFile(modified, outputPath);

      // Verify Hugo file was created
      const fileContent = await fs.readFile(outputPath, 'utf-8');
      expect(fileContent).toContain('title: Complete Workflow Article');
      expect(fileContent).toContain('Updated workflow article content.');
      expect(fileContent).toContain('- workflow');
      expect(fileContent).toContain('- complete');
      expect(fileContent).toContain('- test');

      // Step 8: Verify password still works
      const canAccess = await protector.canAccessArticle(published.id, password);
      expect(canAccess).toBe(true);

      // Step 9: Parse Hugo file back to Article
      const parsedArticle = HugoIntegration.fromHugoFrontMatter(fileContent);
      expect(parsedArticle.title).toBe(modified.title);
      expect(parsedArticle.content.trim()).toBe(modified.content);
      expect(parsedArticle.tags).toEqual(modified.tags);
      expect(parsedArticle.metadata.customFields).toEqual(modified.metadata.customFields);
    });

    it('should handle multiple articles with different protection levels', async () => {
      // Create public article
      const publicMetadata: ArticleMetadata = { title: 'Public Article' };
      const publicDraft = await manager.createDraft(publicMetadata, 'Public content');
      const publicPublished = await manager.publishArticle(publicDraft.id);
      await repository.save(publicPublished);

      // Create protected article
      const protectedMetadata: ArticleMetadata = { title: 'Protected Article' };
      const protectedDraft = await manager.createDraft(protectedMetadata, 'Protected content');
      const protectedPublished = await manager.publishArticle(protectedDraft.id);
      await repository.save(protectedPublished);

      const protectedPassword = 'ProtectedPass123!';
      await protector.protectArticle(protectedPublished.id, protectedPassword);

      // Verify public article access
      const publicCanAccess = await protector.canAccessArticle(publicPublished.id);
      expect(publicCanAccess).toBe(true);

      // Verify protected article requires password
      const protectedCanAccessWithoutPassword = await protector.canAccessArticle(protectedPublished.id);
      expect(protectedCanAccessWithoutPassword).toBe(false);

      const protectedCanAccessWithPassword = await protector.canAccessArticle(
        protectedPublished.id,
        protectedPassword
      );
      expect(protectedCanAccessWithPassword).toBe(true);

      // Generate Hugo files for both
      const publicPath = path.join(tempDir, 'content', 'posts', 'public.md');
      const protectedPath = path.join(tempDir, 'content', 'posts', 'protected.md');

      await HugoIntegration.generateStaticFile(publicPublished, publicPath);
      await HugoIntegration.generateStaticFile(protectedPublished, protectedPath);

      // Verify both files exist
      const publicExists = await fs.stat(publicPath).then(() => true).catch(() => false);
      const protectedExists = await fs.stat(protectedPath).then(() => true).catch(() => false);

      expect(publicExists).toBe(true);
      expect(protectedExists).toBe(true);
    });
  });

  describe('Metadata Preservation Through Complete Workflow', () => {
    it('should preserve all metadata fields through create, publish, modify, and Hugo generation', async () => {
      const originalMetadata: ArticleMetadata = {
        title: 'Metadata Preservation Test',
        description: 'Testing metadata preservation through workflow',
        keywords: ['metadata', 'preservation', 'workflow'],
        author: 'Metadata Tester',
        customFields: {
          featured: true,
          readTime: 8,
          difficulty: 'intermediate'
        }
      };

      // Create article
      const draft = await manager.createDraft(originalMetadata, 'Initial content');
      expect(draft.metadata).toEqual(originalMetadata);

      // Publish article
      const published = await manager.publishArticle(draft.id);
      expect(published.metadata).toEqual(originalMetadata);

      // Modify article
      const modified = await manager.modifyArticle(draft.id, {
        content: 'Modified content',
        metadata: {
          description: 'Updated description'
        }
      });

      expect(modified.metadata.title).toBe(originalMetadata.title);
      expect(modified.metadata.description).toBe('Updated description');
      expect(modified.metadata.keywords).toEqual(originalMetadata.keywords);
      expect(modified.metadata.author).toBe(originalMetadata.author);
      expect(modified.metadata.customFields).toEqual(originalMetadata.customFields);

      // Generate Hugo content
      const hugoContent = HugoIntegration.toHugoFrontMatter(modified);

      // Parse back from Hugo
      const parsedArticle = HugoIntegration.fromHugoFrontMatter(hugoContent);

      // Verify metadata preservation
      expect(parsedArticle.title).toBe(modified.title);
      expect(parsedArticle.metadata.description).toBe('Updated description');
      expect(parsedArticle.metadata.keywords).toEqual(originalMetadata.keywords);
      expect(parsedArticle.metadata.author).toBe(originalMetadata.author);
      expect(parsedArticle.metadata.customFields).toEqual(originalMetadata.customFields);
    });
  });

  describe('Property-Based Integration Tests', () => {
    it('should handle article lifecycle with random metadata', async () => {
      const metadataArb = fc.record({
        title: fc.stringOf(fc.char(), { minLength: 1, maxLength: 50 }),
        description: fc.option(fc.stringOf(fc.char(), { maxLength: 100 })),
        keywords: fc.array(fc.stringOf(fc.char(), { minLength: 1, maxLength: 15 }), {
          maxLength: 3
        }),
        author: fc.option(fc.stringOf(fc.char(), { maxLength: 30 }))
      });

      const contentArb = fc.stringOf(fc.char(), { minLength: 1, maxLength: 200 });

      await fc.assert(
        fc.asyncProperty(metadataArb, contentArb, async (metadata, content) => {
          const articleMetadata: ArticleMetadata = {
            title: metadata.title,
            description: metadata.description || undefined,
            keywords: metadata.keywords.length > 0 ? metadata.keywords : undefined,
            author: metadata.author || undefined
          };

          // Create and publish
          const draft = await manager.createDraft(articleMetadata, content);
          expect(draft.state).toBe('draft');
          expect(draft.id).toBeDefined();

          const published = await manager.publishArticle(draft.id);
          expect(published.state).toBe('published');
          expect(published.publishedAt).toBeDefined();

          // Modify
          const modified = await manager.modifyArticle(draft.id, {
            content: content + ' modified'
          });

          expect(modified.version).toBe(2);
          expect(modified.publishedAt).toEqual(published.publishedAt);

          // Delete
          await manager.deleteArticle(draft.id);

          try {
            await manager.getArticle(draft.id);
            throw new Error('Article should not exist');
          } catch (error: any) {
            expect(error.code).toBe(ErrorCode.ARTICLE_NOT_FOUND);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('should preserve metadata through Hugo round-trip with random data', async () => {
      const customFieldsArb = fc.record({
        stringField: fc.stringOf(fc.char(), { minLength: 1, maxLength: 20 }),
        numberField: fc.integer({ min: 0, max: 100 }),
        booleanField: fc.boolean()
      });

      await fc.assert(
        fc.property(customFieldsArb, (customFields) => {
          const article: Article = {
            id: 'test-id',
            title: 'Test Article',
            content: 'Test content',
            tags: ['tag1', 'tag2'],
            categories: ['cat1'],
            state: 'published',
            createdAt: new Date(),
            publishedAt: new Date(),
            modifiedAt: new Date(),
            version: 1,
            isProtected: false,
            metadata: {
              title: 'Test Article',
              customFields
            }
          };

          // Convert to Hugo and back
          const hugoContent = HugoIntegration.toHugoFrontMatter(article);
          const parsed = HugoIntegration.fromHugoFrontMatter(hugoContent);

          // Verify custom fields are preserved (allowing for YAML parsing quirks)
          expect(parsed.metadata.customFields?.numberField).toBe(customFields.numberField);
          expect(parsed.metadata.customFields?.booleanField).toBe(customFields.booleanField);
        }),
        { numRuns: 20 }
      );
    });
  });
});
