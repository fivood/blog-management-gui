import * as bcrypt from 'bcrypt';
import { ArticleRepository } from './types/ArticleRepository';
import { NotFoundError, AuthenticationError, StorageError } from './errors/ArticleError';

/**
 * PasswordProtector handles password-based article protection
 * Uses bcrypt for secure password hashing with cost factor 12
 */
export class PasswordProtector {
  private readonly repository: ArticleRepository;
  private readonly BCRYPT_COST_FACTOR = 12;

  constructor(repository: ArticleRepository) {
    this.repository = repository;
  }

  /**
   * Hash a password using bcrypt with cost factor 12
   * @param password - The plaintext password to hash
   * @returns Promise resolving to the bcrypt hash
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_COST_FACTOR);
  }

  /**
   * Verify a plaintext password against a stored bcrypt hash
   * @param password - The plaintext password to verify
   * @param hash - The bcrypt hash to compare against
   * @returns Promise resolving to true if password matches, false otherwise
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Protect an article with a password
   * @param articleId - The ID of the article to protect
   * @param password - The password to set for the article
   * @throws NotFoundError if article not found
   */
  async protectArticle(articleId: string, password: string): Promise<void> {
    const article = await this.repository.findById(articleId);
    if (!article) {
      throw new NotFoundError(articleId);
    }

    const passwordHash = await this.hashPassword(password);
    article.isProtected = true;
    article.passwordHash = passwordHash;
    article.modifiedAt = new Date();

    await this.repository.save(article);
  }

  /**
   * Remove password protection from an article
   * @param articleId - The ID of the article to unprotect
   * @throws NotFoundError if article not found
   */
  async unprotectArticle(articleId: string): Promise<void> {
    const article = await this.repository.findById(articleId);
    if (!article) {
      throw new NotFoundError(articleId);
    }

    article.isProtected = false;
    article.passwordHash = undefined;
    article.modifiedAt = new Date();

    await this.repository.save(article);
  }

  /**
   * Update the password for a protected article
   * @param articleId - The ID of the article
   * @param newPassword - The new password to set
   * @throws NotFoundError if article not found
   * @throws AuthenticationError if article is not protected
   */
  async updatePassword(articleId: string, newPassword: string): Promise<void> {
    const article = await this.repository.findById(articleId);
    if (!article) {
      throw new NotFoundError(articleId);
    }

    if (!article.isProtected) {
      throw new AuthenticationError(`Article is not protected: ${articleId}`);
    }

    const newPasswordHash = await this.hashPassword(newPassword);
    article.passwordHash = newPasswordHash;
    article.modifiedAt = new Date();

    await this.repository.save(article);
  }

  /**
   * Check if a user can access an article
   * @param articleId - The ID of the article
   * @param password - The password provided by the user (optional if article is unprotected)
   * @returns Promise resolving to true if access is granted, false otherwise
   * @throws NotFoundError if article not found
   */
  async canAccessArticle(articleId: string, password?: string): Promise<boolean> {
    const article = await this.repository.findById(articleId);
    if (!article) {
      throw new NotFoundError(articleId);
    }

    // Unprotected articles are always accessible
    if (!article.isProtected) {
      return true;
    }

    // Protected articles require a password
    if (!password || !article.passwordHash) {
      return false;
    }

    return this.verifyPassword(password, article.passwordHash);
  }

  /**
   * Check if an article requires authentication
   * @param articleId - The ID of the article
   * @returns Promise resolving to true if article is protected, false otherwise
   * @throws NotFoundError if article not found
   */
  async requiresAuthentication(articleId: string): Promise<boolean> {
    const article = await this.repository.findById(articleId);
    if (!article) {
      throw new NotFoundError(articleId);
    }

    return article.isProtected;
  }
}
