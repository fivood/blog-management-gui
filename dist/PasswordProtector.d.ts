import { ArticleRepository } from './types/ArticleRepository';
/**
 * PasswordProtector handles password-based article protection
 * Uses bcrypt for secure password hashing with cost factor 12
 */
export declare class PasswordProtector {
    private readonly repository;
    private readonly BCRYPT_COST_FACTOR;
    constructor(repository: ArticleRepository);
    /**
     * Hash a password using bcrypt with cost factor 12
     * @param password - The plaintext password to hash
     * @returns Promise resolving to the bcrypt hash
     */
    hashPassword(password: string): Promise<string>;
    /**
     * Verify a plaintext password against a stored bcrypt hash
     * @param password - The plaintext password to verify
     * @param hash - The bcrypt hash to compare against
     * @returns Promise resolving to true if password matches, false otherwise
     */
    verifyPassword(password: string, hash: string): Promise<boolean>;
    /**
     * Protect an article with a password
     * @param articleId - The ID of the article to protect
     * @param password - The password to set for the article
     * @throws NotFoundError if article not found
     */
    protectArticle(articleId: string, password: string): Promise<void>;
    /**
     * Remove password protection from an article
     * @param articleId - The ID of the article to unprotect
     * @throws NotFoundError if article not found
     */
    unprotectArticle(articleId: string): Promise<void>;
    /**
     * Update the password for a protected article
     * @param articleId - The ID of the article
     * @param newPassword - The new password to set
     * @throws NotFoundError if article not found
     * @throws AuthenticationError if article is not protected
     */
    updatePassword(articleId: string, newPassword: string): Promise<void>;
    /**
     * Check if a user can access an article
     * @param articleId - The ID of the article
     * @param password - The password provided by the user (optional if article is unprotected)
     * @returns Promise resolving to true if access is granted, false otherwise
     * @throws NotFoundError if article not found
     */
    canAccessArticle(articleId: string, password?: string): Promise<boolean>;
    /**
     * Check if an article requires authentication
     * @param articleId - The ID of the article
     * @returns Promise resolving to true if article is protected, false otherwise
     * @throws NotFoundError if article not found
     */
    requiresAuthentication(articleId: string): Promise<boolean>;
}
//# sourceMappingURL=PasswordProtector.d.ts.map