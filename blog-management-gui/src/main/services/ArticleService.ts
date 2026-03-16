import * as path from 'path';
import * as fs from 'fs/promises';
import { ArticleManager } from '../../../../src/ArticleManager';
import { HugoIntegration } from '../../../../src/integrations/HugoIntegration';
import { SecurityService } from '../../../../src/services/SecurityService';
import {
  Article,
  ArticleListItem,
  CreateArticleData,
  ArticleUpdate,
  ArticleFilters
} from '../../shared/types/article';

export class ArticleService {
  private articleManager: ArticleManager;
  private hugoProjectPath: string;
  private contentPostsPath: string;
  private dataPath: string;

  constructor(hugoProjectPath: string) {
    this.articleManager = new ArticleManager();
    this.hugoProjectPath = hugoProjectPath;
    this.contentPostsPath = path.join(hugoProjectPath, 'content', 'posts');
    this.dataPath = path.join(hugoProjectPath, 'data');
  }

  async listArticles(filters?: ArticleFilters): Promise<ArticleListItem[]> {
    try {
      const articles = await this.articleManager.listArticles(filters);
      const listItems: ArticleListItem[] = articles.map(article => ({
        id: article.id,
        title: article.title,
        createdAt: article.createdAt,
        modifiedAt: article.modifiedAt,
        tags: article.tags,
        categories: article.categories,
        isProtected: article.isProtected,
        state: article.state
      }));

      if (filters?.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        return listItems.filter(item => 
          item.title.toLowerCase().includes(searchLower) || 
          item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      return listItems;
    } catch (error) {
      throw new Error(`Failed to list articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getArticle(articleId: string): Promise<Article> {
    return this.articleManager.getArticle(articleId);
  }

  async createArticle(data: CreateArticleData): Promise<Article> {
    try {
      const article = await this.articleManager.createDraft(
        { 
          title: data.title, 
          description: undefined, 
          author: data.author 
        },
        data.content
      );

      // Update with additional fields
      const updates: any = {
        tags: data.tags || [],
        categories: data.categories || []
      };

      if (data.slug) {
        updates.metadata = { ...article.metadata, slug: data.slug };
      }

      if (data.author) {
        updates.metadata = { ...updates.metadata, author: data.author };
      }

      if (data.publishedAt) {
        updates.publishedAt = data.publishedAt;
      }

      await this.articleManager.modifyArticle(article.id, updates);

      if (data.password) {
        const passwordHash = await SecurityService.hashPassword(data.password);
        const encryptionResult = await SecurityService.encrypt(data.content, data.password);
        
        const updatedArticle = await this.articleManager.getArticle(article.id);
        updatedArticle.isProtected = true;
        updatedArticle.passwordHash = passwordHash;
        updatedArticle.metadata = updatedArticle.metadata || {};
        updatedArticle.metadata.plainPassword = data.password;
        if (data.passwordHint) updatedArticle.passwordHint = data.passwordHint;
        
        await (this.articleManager as any).articles.set(article.id, updatedArticle);
      }

      const finalArticle = await this.articleManager.getArticle(article.id);
      if (data.slug) finalArticle.slug = data.slug;
      if (data.author) finalArticle.author = data.author;
      if (data.publishedAt) finalArticle.publishedAt = data.publishedAt;
      await this.generateHugoFile(finalArticle);
      return finalArticle;
    } catch (error) {
      throw new Error(`Failed to create article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateArticle(articleId: string, updates: ArticleUpdate): Promise<Article> {
    try {
      const currentArticle = await this.articleManager.getArticle(articleId);
      
      const modifyUpdates: any = {
        title: updates.title,
        content: updates.content,
        tags: updates.tags,
        categories: updates.categories
      };

      // Handle metadata updates for author and slug
      if (updates.author !== undefined || updates.slug !== undefined) {
        modifyUpdates.metadata = {
          ...currentArticle.metadata,
          ...(updates.author !== undefined && { author: updates.author }),
          ...(updates.slug !== undefined && { slug: updates.slug })
        };
      }

      // Handle publishedAt
      if (updates.publishedAt !== undefined) {
        modifyUpdates.publishedAt = updates.publishedAt;
      }

      const article = await this.articleManager.modifyArticle(articleId, modifyUpdates);

      if (updates.password !== undefined) {
        if (updates.password) {
          const passwordHash = await SecurityService.hashPassword(updates.password);
          const currentContent = await this.articleManager.getArticle(articleId);
          const encryptionResult = await SecurityService.encrypt(currentContent.content, updates.password);
          
          const updatedArticle = await this.articleManager.getArticle(articleId);
          updatedArticle.isProtected = true;
          updatedArticle.passwordHash = passwordHash;
          updatedArticle.metadata = updatedArticle.metadata || {};
          updatedArticle.metadata.plainPassword = updates.password;
          if (updates.passwordHint !== undefined) updatedArticle.passwordHint = updates.passwordHint;
          
          await (this.articleManager as any).articles.set(articleId, updatedArticle);
        } else if (updates.isProtected === false) {
          const updatedArticle = await this.articleManager.getArticle(articleId);
          updatedArticle.isProtected = false;
          updatedArticle.passwordHash = undefined;
          updatedArticle.passwordHint = undefined;
          if (updatedArticle.metadata) delete updatedArticle.metadata.plainPassword;
          await (this.articleManager as any).articles.set(articleId, updatedArticle);
        }
      }

      const finalArticle = await this.articleManager.getArticle(articleId);
      if (updates.slug !== undefined) finalArticle.slug = updates.slug;
      if (updates.author !== undefined) finalArticle.author = updates.author;
      if (updates.publishedAt !== undefined) finalArticle.publishedAt = updates.publishedAt;
      await this.generateHugoFile(finalArticle);
      return finalArticle;
    } catch (error) {
      throw new Error(`Failed to update article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteArticle(articleId: string): Promise<void> {
    await this.articleManager.deleteArticle(articleId);
    try {
      await fs.unlink(this.getHugoFilePath(articleId));
    } catch (error) {}
  }

  async publishArticle(articleId: string): Promise<Article> {
    const article = await this.articleManager.publishArticle(articleId);
    await this.generateHugoFile(article);
    return article;
  }

  private async generateHugoFile(article: Article): Promise<void> {
    await HugoIntegration.generateStaticFile(article, this.getHugoFilePath(article.id));
  }

  private getHugoFilePath(articleId: string): string {
    return path.join(this.contentPostsPath, `${articleId}.md`);
  }

  updateHugoProjectPath(hugoProjectPath: string): void {
    this.hugoProjectPath = hugoProjectPath;
    this.contentPostsPath = path.join(hugoProjectPath, 'content', 'posts');
    this.initialize().catch(() => {});
  }

  async initialize(): Promise<void> {
    this.articleManager.clearArticles();
    await fs.mkdir(this.contentPostsPath, { recursive: true });
    await this.loadArticlesFromHugoFiles();
  }

  private async loadArticlesFromHugoFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.contentPostsPath);
      const markdownFiles = files.filter(f => f.endsWith('.md'));
      for (const filename of markdownFiles) {
        try {
          const content = await fs.readFile(path.join(this.contentPostsPath, filename), 'utf-8');
          const article = this.parseHugoFile(content, filename);
          if (article) (this.articleManager as any).articles.set(article.id, article);
        } catch (e) {}
      }
    } catch (e) {}
  }

  private parseHugoFile(content: string, filename: string): Article | null {
    try {
      const norm = content.replace(/\r\n/g, '\n');
      const match = norm.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!match) return null;
      const frontmatter = match[1];
      const text = match[2].trim();
      
      const title = (frontmatter.match(/^title:\s*["']?(.+?)["']?$/m) || [])[1] || 'Untitled';
      const date = (frontmatter.match(/^date:\s*(.+)$/m) || [])[1];
      const author = (frontmatter.match(/^author:\s*["']?(.+?)["']?$/m) || [])[1];
      const slug = (frontmatter.match(/^slug:\s*["']?(.+?)["']?$/m) || [])[1];
      const tags = ((frontmatter.match(/^tags:\s*\[(.*?)\]$/m) || [])[1] || '').split(',').map(s => s.trim().replace(/["']/g, '')).filter(s => s);
      const cats = ((frontmatter.match(/^categories:\s*\[(.*?)\]$/m) || [])[1] || '').split(',').map(s => s.trim().replace(/["']/g, '')).filter(s => s);
      const isDraft = (frontmatter.match(/^draft:\s*(true|false)$/m) || [])[1] === 'true';
      
      const id = filename.replace('.md', '');
      const createdAt = date ? new Date(date) : new Date();
      
      return {
        id, title, content: text, tags, categories: cats, 
        author: author || undefined,
        slug: slug || undefined,
        state: isDraft ? 'draft' : 'published',
        createdAt, modifiedAt: createdAt, publishedAt: isDraft ? undefined : createdAt,
        version: 1, isProtected: false, metadata: { title, author }
      };
    } catch (e) { return null; }
  }
}
