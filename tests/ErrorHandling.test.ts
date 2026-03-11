import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ArticleManager } from '../src/ArticleManager';
import { PasswordProtector } from '../src/PasswordProtector';
import { InMemoryArticleRepository } from '../src/repositories/InMemoryArticleRepository';
import {
  ArticleError,
  ValidationError,
  NotFoundError,
  StateTransitionError,
  AuthenticationError,
  StorageError,
  InternalError
} from '../src/errors/ArticleError';
import { ErrorCode } from '../src/types/index';

describe('Error Handling and Recovery', () => {
  let manager: ArticleManager;
  let repository: InMemoryArticleRepository;
  let protector: PasswordProtector;

  beforeEach(() => {
    repository = new InMemoryArticleRepository();
    manager = new ArticleManager();
    protector = new PasswordProtector(repository);
  });

  describe('Custom Error Classes', () => {
    it('should create ArticleError with code and message', () => {
      const error = new ArticleError(ErrorCode.INTERNAL_ERROR, 'Test error');
      expect(error).toBeInstanceOf(ArticleError);
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.message).toBe('Test error');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create ValidationError', () => {
      const error = new ValidationError('Title is required', {
        field: 'title'
      });
      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(ArticleError);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('should create NotFoundError', () => {
      const error = new NotFoundError('article-123');
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error).toBeInstanceOf(ArticleError);
      expect(error.code).toBe(ErrorCode.ARTICLE_NOT_FOUND);
      expect(error.message).toContain('article-123');
    });

    it('should create StateTransitionError', () => {
      const error = new StateTransitionError('article-123', 'draft', 'deleted');
      expect(error).toBeInstanceOf(StateTransitionError);
      expect(error).toBeInstanceOf(ArticleError);
      expect(error.code).toBe(ErrorCode.INVALID_STATE_TRANSITION);
      expect(error.details).toEqual({
        articleId: 'article-123',
        currentState: 'draft',
        attemptedState: 'deleted'
      });
    });

    it('should create AuthenticationError', () => {
      const error = new AuthenticationError('Invalid password');
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error).toBeInstanceOf(ArticleError);
      expect(error.code).toBe(ErrorCode.AUTHENTICATION_FAILED);
    });

    it('should create StorageError', () => {
      const error = new StorageError('Database connection failed', {
        retryable: true
      });
      expect(error).toBeInstanceOf(StorageError);
      expect(error).toBeInstanceOf(ArticleError);
      expect(error.code).toBe(ErrorCode.STORAGE_ERROR);
      expect(error.details).toEqual({ retryable: true });
    });

    it('should create InternalError', () => {
      const error = new InternalError('Unexpected error', {
        stack: 'error stack'
      });
      expect(error).toBeInstanceOf(InternalError);
      expect(error).toBeInstanceOf(ArticleError);
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('should convert error to ErrorResponse', () => {
      const error = new ValidationError('Test validation error', {
        field: 'title'
      });
      const response = error.toErrorResponse();

      expect(response.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(response.message).toBe('Test validation error');
      expect(response.details).toEqual({ field: 'title' });
      expect(response.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Validation Error Handling', () => {
    it('should throw ValidationError for missing title', async () => {
      await expect(
        manager.createDraft({ title: '', description: 'Test' }, 'Content')
      ).rejects.toThrow(ValidationError);

      try {
        await manager.createDraft({ title: '', description: 'Test' }, 'Content');
      } catch (e) {
        if (e instanceof ValidationError) {
          expect(e.code).toBe(ErrorCode.VALIDATION_ERROR);
          expect(e.message).toContain('Title is required');
          expect(e.details?.errors).toBeDefined();
        }
      }
    });

    it('should throw ValidationError for missing content', async () => {
      await expect(
        manager.createDraft({ title: 'Test Article' }, '')
      ).rejects.toThrow(ValidationError);

      try {
        await manager.createDraft({ title: 'Test Article' }, '');
      } catch (e) {
        if (e instanceof ValidationError) {
          expect(e.code).toBe(ErrorCode.VALIDATION_ERROR);
          expect(e.message).toContain('Content is required');
        }
      }
    });

    it('should include validation error details', async () => {
      try {
        await manager.createDraft({ title: '', description: 'Test' }, 'Content');
      } catch (e) {
        if (e instanceof ValidationError) {
          expect(e.details?.errors).toBeDefined();
          expect(Array.isArray(e.details?.errors)).toBe(true);
          if (Array.isArray(e.details?.errors)) {
            expect(e.details.errors[0]).toHaveProperty('field');
            expect(e.details.errors[0]).toHaveProperty('message');
            expect(e.details.errors[0]).toHaveProperty('code');
          }
        }
      }
    });
  });

  describe('Not Found Error Handling', () => {
    it('should throw NotFoundError when getting non-existent article', async () => {
      await expect(manager.getArticle('non-existent')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw NotFoundError when publishing non-existent article', async () => {
      await expect(manager.publishArticle('non-existent')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw NotFoundError when modifying non-existent article', async () => {
      await expect(
        manager.modifyArticle('non-existent', { title: 'New Title' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when deleting non-existent article', async () => {
      await expect(manager.deleteArticle('non-existent')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should include article ID in error message', async () => {
      try {
        await manager.getArticle('article-123');
      } catch (e) {
        if (e instanceof NotFoundError) {
          expect(e.message).toContain('article-123');
        }
      }
    });
  });

  describe('Failed Operation State Consistency', () => {
    it('should not modify article state on validation error', async () => {
      const article = await manager.createDraft(
        { title: 'Original Title' },
        'Original Content'
      );

      try {
        await manager.modifyArticle(article.id, {
          title: '', // Invalid: empty title
          content: 'New Content'
        });
      } catch (e) {
        // Error expected
      }

      const retrieved = await manager.getArticle(article.id);
      expect(retrieved.title).toBe('Original Title');
      expect(retrieved.content).toBe('Original Content');
      expect(retrieved.version).toBe(1);
    });

    it('should preserve article state on not found error', async () => {
      const article = await manager.createDraft(
        { title: 'Test Article' },
        'Test Content'
      );
      const originalVersion = article.version;

      try {
        await manager.modifyArticle('non-existent', { title: 'New Title' });
      } catch (e) {
        // Error expected
      }

      const retrieved = await manager.getArticle(article.id);
      expect(retrieved.version).toBe(originalVersion);
    });

    it('should not increment version on failed modification', async () => {
      const article = await manager.createDraft(
        { title: 'Test Article' },
        'Test Content'
      );
      const originalVersion = article.version;

      try {
        await manager.modifyArticle(article.id, {
          title: '', // Invalid
          content: 'New Content'
        });
      } catch (e) {
        // Error expected
      }

      const retrieved = await manager.getArticle(article.id);
      expect(retrieved.version).toBe(originalVersion);
    });

    it('should preserve modification timestamp on failed operation', async () => {
      const article = await manager.createDraft(
        { title: 'Test Article' },
        'Test Content'
      );
      const originalModifiedAt = article.modifiedAt;

      try {
        await manager.modifyArticle(article.id, {
          title: '', // Invalid
          content: 'New Content'
        });
      } catch (e) {
        // Error expected
      }

      const retrieved = await manager.getArticle(article.id);
      expect(retrieved.modifiedAt.getTime()).toBe(originalModifiedAt.getTime());
    });
  });

  describe('Error Message Descriptiveness', () => {
    it('should provide descriptive validation error message', async () => {
      try {
        await manager.createDraft({ title: '' }, 'Content');
      } catch (e) {
        if (e instanceof ValidationError) {
          expect(e.message).toBeTruthy();
          expect(e.message.length).toBeGreaterThan(0);
          expect(e.message).toContain('Validation failed');
        }
      }
    });

    it('should provide descriptive not found error message', async () => {
      try {
        await manager.getArticle('missing-article');
      } catch (e) {
        if (e instanceof NotFoundError) {
          expect(e.message).toContain('not found');
          expect(e.message).toContain('missing-article');
        }
      }
    });

    it('should not expose sensitive data in error messages', async () => {
      const article = await manager.createDraft(
        { title: 'Test' },
        'Content'
      );
      await repository.save(article);

      const hashedArticle = await repository.findById(article.id);
      if (hashedArticle) {
        await protector.protectArticle(article.id, 'secret-password-123');
        const canAccess = await protector.canAccessArticle(article.id, 'wrong-password');
        expect(canAccess).toBe(false);
      }
    });

    it('should include error code in response', async () => {
      try {
        await manager.getArticle('non-existent');
      } catch (e) {
        if (e instanceof ArticleError) {
          const response = e.toErrorResponse();
          expect(response.code).toBeDefined();
          expect(Object.values(ErrorCode)).toContain(response.code);
        }
      }
    });

    it('should include timestamp in error response', async () => {
      try {
        await manager.getArticle('non-existent');
      } catch (e) {
        if (e instanceof ArticleError) {
          const response = e.toErrorResponse();
          expect(response.timestamp).toBeInstanceOf(Date);
        }
      }
    });
  });

  describe('Property 13: Failed Operation State Consistency', () => {
    it('should maintain state consistency on failed operations', async () => {
      const testCases = [
        { title: 'Test 1', content: 'Content 1' },
        { title: 'Article Title', content: 'Article Content' },
        { title: 'Another', content: 'More content' }
      ];

      for (const testCase of testCases) {
        const article = await manager.createDraft(
          { title: testCase.title },
          testCase.content
        );
        const originalVersion = article.version;
        const originalModifiedAt = article.modifiedAt;

        try {
          // Attempt invalid modification
          await manager.modifyArticle(article.id, {
            title: '', // Invalid
            content: 'New content'
          });
        } catch (e) {
          // Expected to fail
        }

        const retrieved = await manager.getArticle(article.id);
        expect(retrieved.version).toBe(originalVersion);
        expect(retrieved.modifiedAt.getTime()).toBe(
          originalModifiedAt.getTime()
        );
        expect(retrieved.title).toBe(testCase.title);
        expect(retrieved.content).toBe(testCase.content);
      }
    });

    it('should not leave articles in inconsistent state after errors', async () => {
      const testCases = [
        { title: 'Test 1', content: 'Content 1' },
        { title: 'Article Title', content: 'Article Content' },
        { title: 'Another', content: 'More content' }
      ];

      for (const testCase of testCases) {
        const article = await manager.createDraft(
          { title: testCase.title },
          testCase.content
        );

        try {
          await manager.deleteArticle('non-existent');
        } catch (e) {
          // Expected to fail
        }

        // Original article should still exist and be unchanged
        const retrieved = await manager.getArticle(article.id);
        expect(retrieved.id).toBe(article.id);
        expect(retrieved.title).toBe(testCase.title);
      }
    });
  });

  describe('Property 14: Error Message Descriptiveness', () => {
    it('should provide descriptive error messages for all error types', async () => {
      const testCases = [
        { title: 'Test 1', content: 'Content 1' },
        { title: 'Article Title', content: 'Article Content' },
        { title: 'Another', content: 'More content' }
      ];

      for (const testCase of testCases) {
        // Test validation error
        try {
          await manager.createDraft({ title: '' }, 'Content');
        } catch (e) {
          if (e instanceof ArticleError) {
            const response = e.toErrorResponse();
            expect(response.code).toBeDefined();
            expect(response.message).toBeTruthy();
            expect(response.message.length).toBeGreaterThan(0);
            expect(response.timestamp).toBeInstanceOf(Date);
          }
        }

        // Test not found error
        try {
          await manager.getArticle('non-existent-id');
        } catch (e) {
          if (e instanceof ArticleError) {
            const response = e.toErrorResponse();
            expect(response.code).toBe(ErrorCode.ARTICLE_NOT_FOUND);
            expect(response.message).toContain('not found');
          }
        }
      }
    });

    it('should include relevant details in error responses', async () => {
      const testCases = [
        { title: 'Test 1' },
        { title: 'Article Title' },
        { title: 'Another' }
      ];

      for (const testCase of testCases) {
        try {
          await manager.createDraft({ title: '' }, 'Content');
        } catch (e) {
          if (e instanceof ValidationError) {
            const response = e.toErrorResponse();
            expect(response.details).toBeDefined();
            expect(response.details?.errors).toBeDefined();
          }
        }
      }
    });
  });

  describe('Password Protector Error Handling', () => {
    it('should throw NotFoundError when protecting non-existent article', async () => {
      await expect(
        protector.protectArticle('non-existent', 'password')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when unprotecting non-existent article', async () => {
      await expect(
        protector.unprotectArticle('non-existent')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when updating password for non-existent article', async () => {
      await expect(
        protector.updatePassword('non-existent', 'new-password')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthenticationError when updating password for unprotected article', async () => {
      const article = await manager.createDraft(
        { title: 'Test' },
        'Content'
      );
      await repository.save(article);

      await expect(
        protector.updatePassword(article.id, 'new-password')
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw NotFoundError when checking access for non-existent article', async () => {
      await expect(
        protector.canAccessArticle('non-existent', 'password')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when checking authentication requirement for non-existent article', async () => {
      await expect(
        protector.requiresAuthentication('non-existent')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Error Recovery', () => {
    it('should allow retry after validation error', async () => {
      // First attempt fails
      await expect(
        manager.createDraft({ title: '' }, 'Content')
      ).rejects.toThrow(ValidationError);

      // Second attempt succeeds
      const article = await manager.createDraft(
        { title: 'Valid Title' },
        'Content'
      );
      expect(article.title).toBe('Valid Title');
    });

    it('should allow retry after not found error', async () => {
      // First attempt fails
      await expect(manager.getArticle('non-existent')).rejects.toThrow(
        NotFoundError
      );

      // Create article and retry succeeds
      const article = await manager.createDraft(
        { title: 'Test' },
        'Content'
      );
      const retrieved = await manager.getArticle(article.id);
      expect(retrieved.id).toBe(article.id);
    });

    it('should maintain data integrity after multiple failed operations', async () => {
      const article = await manager.createDraft(
        { title: 'Original' },
        'Content'
      );

      // Multiple failed attempts
      for (let i = 0; i < 5; i++) {
        try {
          await manager.modifyArticle(article.id, { title: '' });
        } catch (e) {
          // Expected
        }
      }

      const retrieved = await manager.getArticle(article.id);
      expect(retrieved.title).toBe('Original');
      expect(retrieved.version).toBe(1);
    });
  });
});
