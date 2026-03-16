"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordProtector = void 0;
const bcrypt = __importStar(require("bcrypt"));
const ArticleError_1 = require("./errors/ArticleError");
/**
 * PasswordProtector handles password-based article protection
 * Uses bcrypt for secure password hashing with cost factor 12
 */
class PasswordProtector {
    constructor(repository) {
        this.BCRYPT_COST_FACTOR = 12;
        this.repository = repository;
    }
    /**
     * Hash a password using bcrypt with cost factor 12
     * @param password - The plaintext password to hash
     * @returns Promise resolving to the bcrypt hash
     */
    async hashPassword(password) {
        return bcrypt.hash(password, this.BCRYPT_COST_FACTOR);
    }
    /**
     * Verify a plaintext password against a stored bcrypt hash
     * @param password - The plaintext password to verify
     * @param hash - The bcrypt hash to compare against
     * @returns Promise resolving to true if password matches, false otherwise
     */
    async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
    /**
     * Protect an article with a password
     * @param articleId - The ID of the article to protect
     * @param password - The password to set for the article
     * @throws NotFoundError if article not found
     */
    async protectArticle(articleId, password) {
        const article = await this.repository.findById(articleId);
        if (!article) {
            throw new ArticleError_1.NotFoundError(articleId);
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
    async unprotectArticle(articleId) {
        const article = await this.repository.findById(articleId);
        if (!article) {
            throw new ArticleError_1.NotFoundError(articleId);
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
    async updatePassword(articleId, newPassword) {
        const article = await this.repository.findById(articleId);
        if (!article) {
            throw new ArticleError_1.NotFoundError(articleId);
        }
        if (!article.isProtected) {
            throw new ArticleError_1.AuthenticationError(`Article is not protected: ${articleId}`);
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
    async canAccessArticle(articleId, password) {
        const article = await this.repository.findById(articleId);
        if (!article) {
            throw new ArticleError_1.NotFoundError(articleId);
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
    async requiresAuthentication(articleId) {
        const article = await this.repository.findById(articleId);
        if (!article) {
            throw new ArticleError_1.NotFoundError(articleId);
        }
        return article.isProtected;
    }
}
exports.PasswordProtector = PasswordProtector;
//# sourceMappingURL=PasswordProtector.js.map