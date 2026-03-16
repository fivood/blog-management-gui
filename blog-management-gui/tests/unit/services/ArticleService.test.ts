import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ArticleService } from '../../../src/main/services/ArticleService';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('ArticleService', () => {
  let articleService: ArticleService;
  let testHugoPath: string;

  beforeEach(async () => {
    // Create a temporary directory for testing
    testHugoPath = path.join(os.tmpdir(), `hugo-test-${Date.now()}`);
    await fs.mkdir(testHugoPath, { recursive: true });

    // Initialize ArticleService
    articleService = new ArticleService(testHugoPath);
    await articleService.initialize();
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(testHugoPath, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to clean up test directory:', error);
    }
  });

  describe('createArticle', () => {
    it('should create a new article with title and content', async () => {
      const data = {
        title: 'Test Article',
        content: 'This is test content.'
      };

      const article = await articleService.createArticle(data);

      expect(article).toBeDefined();
      expect(article.id).toBeDefined();
      expect(article.title).toBe(data.title);
      expect(article.content).toBe(data.content);
      expect(article.state).toBe('draft');
      expect(article.tags).toEqual([]);
      expect(article.categories).toEqual([]);
      expect(article.isProtected).toBe(false);
    });

    it('should create an article with tags and categories', async () => {
      const data = {
        title: 'Tagged Article',
        content: 'Content with tags.',
        tags: ['tech', 'programming'],
        categories: ['tutorials']
      };

      const article = await articleService.createArticle(data);

      expect(article.tags).toEqual(data.tags);
      expect(article.categories).toEqual(data.categories);
    });

    it('should create a password-protected article', async () => {
      const data = {
        title: 'Protected Article',
        content: 'Secret content.',
        password: 'secret123'
      };

      const article = await articleService.createArticle(data);

      expect(article.isProtected).toBe(true);
      expect(article.passwordHash).toBeDefined();
    });

    it('should generate Hugo frontmatter file', async () => {
      const data = {
        title: 'Hugo Test',
        content: 'Test content for Hugo.'
      };

      const article = await articleService.createArticle(data);

      // Check if Hugo file was created
      const hugoFilePath = path.join(testHugoPath, 'content', 'posts', `${article.id}.md`);
      const fileExists = await fs.access(hugoFilePath).then(() => true).catch(() => false);
      
      expect(fileExists).toBe(true);

      // Read and verify file content
      const fileContent = await fs.readFile(hugoFilePath, 'utf-8');
      expect(fileContent).toContain('---');
      expect(fileContent).toContain(`title: ${data.title}`);
      expect(fileContent).toContain(data.content);
    });

    it('should throw error for empty title', async () => {
      const data = {
        title: '',
        content: 'Content without title.'
      };

      await expect(articleService.createArticle(data)).rejects.toThrow();
    });

    it('should throw error for empty content', async () => {
      const data = {
        title: 'Title without content',
        content: ''
      };

      await expect(articleService.createArticle(data)).rejects.toThrow();
    });
  });

  describe('listArticles', () => {
    it('should return empty array when no articles exist', async () => {
      const articles = await articleService.listArticles();
      expect(articles).toEqual([]);
    });

    it('should list all created articles', async () => {
      // Create multiple articles
      await articleService.createArticle({ title: 'Article 1', content: 'Content 1' });
      await articleService.createArticle({ title: 'Article 2', content: 'Content 2' });
      await articleService.createArticle({ title: 'Article 3', content: 'Content 3' });

      const articles = await articleService.listArticles();

      expect(articles).toHaveLength(3);
      expect(articles[0].title).toBe('Article 1');
      expect(articles[1].title).toBe('Article 2');
      expect(articles[2].title).toBe('Article 3');
    });

    it('should filter articles by search text in title', async () => {
      await articleService.createArticle({ title: 'TypeScript Tutorial', content: 'Content' });
      await articleService.createArticle({ title: 'JavaScript Guide', content: 'Content' });
      await articleService.createArticle({ title: 'Python Basics', content: 'Content' });

      const articles = await articleService.listArticles({ searchText: 'script' });

      expect(articles).toHaveLength(2);
      expect(articles.some(a => a.title.includes('TypeScript'))).toBe(true);
      expect(articles.some(a => a.title.includes('JavaScript'))).toBe(true);
    });

    it('should filter articles by search text in tags', async () => {
      await articleService.createArticle({ 
        title: 'Article 1', 
        content: 'Content',
        tags: ['typescript', 'programming']
      });
      await articleService.createArticle({ 
        title: 'Article 2', 
        content: 'Content',
        tags: ['python', 'data-science']
      });

      const articles = await articleService.listArticles({ searchText: 'typescript' });

      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Article 1');
    });

    it('should filter articles by tags', async () => {
      await articleService.createArticle({ 
        title: 'Article 1', 
        content: 'Content',
        tags: ['tech', 'programming']
      });
      await articleService.createArticle({ 
        title: 'Article 2', 
        content: 'Content',
        tags: ['lifestyle', 'travel']
      });

      const articles = await articleService.listArticles({ tags: ['tech'] });

      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Article 1');
    });

    it('should filter articles by categories', async () => {
      await articleService.createArticle({ 
        title: 'Article 1', 
        content: 'Content',
        categories: ['tutorials']
      });
      await articleService.createArticle({ 
        title: 'Article 2', 
        content: 'Content',
        categories: ['news']
      });

      const articles = await articleService.listArticles({ categories: ['tutorials'] });

      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Article 1');
    });

    it('should include password protection indicator', async () => {
      await articleService.createArticle({ 
        title: 'Protected', 
        content: 'Content',
        password: 'secret'
      });
      await articleService.createArticle({ 
        title: 'Public', 
        content: 'Content'
      });

      const articles = await articleService.listArticles();

      expect(articles).toHaveLength(2);
      expect(articles.find(a => a.title === 'Protected')?.isProtected).toBe(true);
      expect(articles.find(a => a.title === 'Public')?.isProtected).toBe(false);
    });
  });

  describe('getArticle', () => {
    it('should retrieve an article by ID', async () => {
      const created = await articleService.createArticle({
        title: 'Test Article',
        content: 'Test content'
      });

      const retrieved = await articleService.getArticle(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.title).toBe(created.title);
      expect(retrieved.content).toBe(created.content);
    });

    it('should throw error for non-existent article', async () => {
      await expect(articleService.getArticle('non-existent-id')).rejects.toThrow();
    });
  });

  describe('updateArticle', () => {
    it('should update article title', async () => {
      const article = await articleService.createArticle({
        title: 'Original Title',
        content: 'Content'
      });

      const updated = await articleService.updateArticle(article.id, {
        title: 'Updated Title'
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.content).toBe('Content');
    });

    it('should update article content', async () => {
      const article = await articleService.createArticle({
        title: 'Title',
        content: 'Original content'
      });

      const updated = await articleService.updateArticle(article.id, {
        content: 'Updated content'
      });

      expect(updated.content).toBe('Updated content');
    });

    it('should update tags and categories', async () => {
      const article = await articleService.createArticle({
        title: 'Title',
        content: 'Content'
      });

      const updated = await articleService.updateArticle(article.id, {
        tags: ['new-tag'],
        categories: ['new-category']
      });

      expect(updated.tags).toEqual(['new-tag']);
      expect(updated.categories).toEqual(['new-category']);
    });

    it('should add password protection', async () => {
      const article = await articleService.createArticle({
        title: 'Title',
        content: 'Content'
      });

      const updated = await articleService.updateArticle(article.id, {
        password: 'newsecret'
      });

      expect(updated.isProtected).toBe(true);
    });

    it('should remove password protection', async () => {
      const article = await articleService.createArticle({
        title: 'Title',
        content: 'Content',
        password: 'secret'
      });

      const updated = await articleService.updateArticle(article.id, {
        password: '',
        isProtected: false
      });

      expect(updated.isProtected).toBe(false);
    });

    it('should preserve publication timestamp', async () => {
      const article = await articleService.createArticle({
        title: 'Title',
        content: 'Content'
      });

      // Publish the article
      const published = await articleService.publishArticle(article.id);
      const originalPublishedAt = published.publishedAt;

      // Wait a bit to ensure timestamp would be different
      await new Promise(resolve => setTimeout(resolve, 10));

      // Update the article
      const updated = await articleService.updateArticle(article.id, {
        title: 'Updated Title'
      });

      expect(updated.publishedAt).toEqual(originalPublishedAt);
    });

    it('should regenerate Hugo file after update', async () => {
      const article = await articleService.createArticle({
        title: 'Original',
        content: 'Content'
      });

      await articleService.updateArticle(article.id, {
        title: 'Updated'
      });

      // Read Hugo file and verify it has updated content
      const hugoFilePath = path.join(testHugoPath, 'content', 'posts', `${article.id}.md`);
      const fileContent = await fs.readFile(hugoFilePath, 'utf-8');
      
      expect(fileContent).toContain('title: Updated');
    });
  });

  describe('deleteArticle', () => {
    it('should delete an article', async () => {
      const article = await articleService.createArticle({
        title: 'To Delete',
        content: 'Content'
      });

      await articleService.deleteArticle(article.id);

      await expect(articleService.getArticle(article.id)).rejects.toThrow();
    });

    it('should delete Hugo file', async () => {
      const article = await articleService.createArticle({
        title: 'To Delete',
        content: 'Content'
      });

      const hugoFilePath = path.join(testHugoPath, 'content', 'posts', `${article.id}.md`);
      
      // Verify file exists
      let fileExists = await fs.access(hugoFilePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      // Delete article
      await articleService.deleteArticle(article.id);

      // Verify file is deleted
      fileExists = await fs.access(hugoFilePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(false);
    });

    it('should throw error for non-existent article', async () => {
      await expect(articleService.deleteArticle('non-existent-id')).rejects.toThrow();
    });
  });

  describe('publishArticle', () => {
    it('should publish a draft article', async () => {
      const article = await articleService.createArticle({
        title: 'Draft',
        content: 'Content'
      });

      expect(article.state).toBe('draft');

      const published = await articleService.publishArticle(article.id);

      expect(published.state).toBe('published');
      expect(published.publishedAt).toBeDefined();
    });

    it('should be idempotent for already published articles', async () => {
      const article = await articleService.createArticle({
        title: 'Article',
        content: 'Content'
      });

      const published1 = await articleService.publishArticle(article.id);
      const publishedAt1 = published1.publishedAt;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      const published2 = await articleService.publishArticle(article.id);

      expect(published2.publishedAt).toEqual(publishedAt1);
    });

    it('should update Hugo file with published state', async () => {
      const article = await articleService.createArticle({
        title: 'Article',
        content: 'Content'
      });

      await articleService.publishArticle(article.id);

      const hugoFilePath = path.join(testHugoPath, 'content', 'posts', `${article.id}.md`);
      const fileContent = await fs.readFile(hugoFilePath, 'utf-8');
      
      expect(fileContent).toContain('draft: false');
    });
  });

  describe('initialize', () => {
    it('should create content/posts directory', async () => {
      const newTestPath = path.join(os.tmpdir(), `hugo-init-test-${Date.now()}`);
      
      try {
        const service = new ArticleService(newTestPath);
        await service.initialize();

        const postsPath = path.join(newTestPath, 'content', 'posts');
        const dirExists = await fs.access(postsPath).then(() => true).catch(() => false);
        
        expect(dirExists).toBe(true);
      } finally {
        await fs.rm(newTestPath, { recursive: true, force: true });
      }
    });
  });
});
