# Blog Article Management System

A comprehensive TypeScript-based system for managing blog articles in a Hugo-based blog platform. This system provides a complete article lifecycle management solution with password protection, template-agnostic design, and Hugo integration.

## Table of Contents

- [Project Structure](#project-structure)
- [Core Data Models](#core-data-models)
- [Article Manager API](#article-manager-api)
- [Password Protector API](#password-protector-api)
- [Hugo Integration API](#hugo-integration-api)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Setup & Testing](#setup--testing)

## Project Structure

```
.
├── src/
│   ├── types/
│   │   └── index.ts                    # Core type definitions
│   ├── ArticleManager.ts               # Article lifecycle management
│   ├── PasswordProtector.ts            # Password protection
│   ├── integrations/
│   │   └── HugoIntegration.ts          # Hugo template integration
│   └── index.ts                        # Main entry point
├── tests/
│   ├── ArticleManager.test.ts          # Article Manager tests
│   ├── PasswordProtector.test.ts       # Password Protector tests
│   ├── HugoIntegration.test.ts         # Hugo Integration tests
│   └── Integration.test.ts             # End-to-end integration tests
├── dist/                               # Compiled JavaScript and type definitions
├── package.json                        # Project dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
├── vitest.config.ts                    # Vitest configuration
└── README.md                           # This file
```

## Core Data Models

### Article

The main data model representing a blog article:

```typescript
interface Article {
  // Identity
  id: string                          // Unique identifier (UUID)
  
  // Content
  title: string                       // Article title (required)
  content: string                     // Article body (required)
  excerpt?: string                    // Short summary
  
  // Metadata
  tags: string[]                      // Article tags
  categories: string[]                // Article categories
  author?: string                     // Author name
  
  // State
  state: 'draft' | 'published'        // Current state
  
  // Timestamps
  createdAt: Date                     // Creation timestamp
  publishedAt?: Date                  // Publication timestamp (immutable after first publish)
  modifiedAt: Date                    // Last modification timestamp
  
  // Versioning
  version: number                     // Revision counter (incremented on each modification)
  
  // Protection
  isProtected: boolean                // Whether article requires password
  passwordHash?: string               // Bcrypt hash (never plaintext)
  
  // Metadata
  metadata: ArticleMetadata
}
```

### ArticleMetadata

Metadata for articles:

```typescript
interface ArticleMetadata {
  title: string                       // Required
  description?: string                // Optional
  keywords?: string[]                 // Optional
  author?: string                     // Optional
  customFields?: Record<string, any>  // Template-specific fields
}
```

### ArticleUpdate

Update payload for modifying articles:

```typescript
interface ArticleUpdate {
  title?: string
  content?: string
  excerpt?: string
  tags?: string[]
  categories?: string[]
  metadata?: Partial<ArticleMetadata>
  password?: string                   // For password updates
}
```

### ArticleFilters

Query filters for retrieving articles:

```typescript
interface ArticleFilters {
  state?: 'draft' | 'published'
  tags?: string[]
  categories?: string[]
  author?: string
  dateRange?: {
    from: Date
    to: Date
  }
}
```

### ValidationResult & ValidationError

Validation response:

```typescript
interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

interface ValidationError {
  field: string
  message: string
  code: string                        // e.g., 'REQUIRED', 'INVALID_FORMAT'
}
```

---

## Article Manager API

The Article Manager handles the complete lifecycle of blog articles: creation, publication, modification, and deletion.

### Methods

#### createDraft(metadata: ArticleMetadata, content: string): Promise<Article>

Creates a new article in Draft state with a unique identifier.

**Parameters:**
- `metadata` (ArticleMetadata): Article metadata including title (required)
- `content` (string): Article content (required, non-empty)

**Returns:** Promise resolving to the created Article

**Throws:**
- `ValidationError`: If required fields are missing or invalid

**Example:**

```typescript
const manager = new ArticleManager();

const article = await manager.createDraft(
  {
    title: 'Getting Started with TypeScript',
    description: 'A beginner\'s guide to TypeScript',
    keywords: ['typescript', 'javascript', 'tutorial'],
    author: 'Jane Doe'
  },
  'TypeScript is a typed superset of JavaScript...'
);

console.log(article.id);        // UUID
console.log(article.state);     // 'draft'
console.log(article.version);   // 1
```

---

#### publishArticle(articleId: string): Promise<Article>

Transitions a draft article to Published state and records an immutable publication timestamp.

**Parameters:**
- `articleId` (string): ID of the article to publish

**Returns:** Promise resolving to the published Article

**Throws:**
- `NotFoundError`: If article doesn't exist

**Guarantees:**
- Publication timestamp is immutable after first publish
- Idempotent: publishing an already-published article returns the same state
- Article becomes accessible through public interface

**Example:**

```typescript
const published = await manager.publishArticle(article.id);

console.log(published.state);       // 'published'
console.log(published.publishedAt); // Current timestamp (immutable)
```

---

#### modifyArticle(articleId: string, updates: ArticleUpdate): Promise<Article>

Updates article content and metadata while preserving the publication timestamp.

**Parameters:**
- `articleId` (string): ID of the article to modify
- `updates` (ArticleUpdate): Fields to update

**Returns:** Promise resolving to the modified Article

**Throws:**
- `NotFoundError`: If article doesn't exist
- `ValidationError`: If validation fails

**Guarantees:**
- Original publication timestamp remains unchanged
- Modification timestamp updates to current time
- Version number increments by exactly one
- Failed operations don't leave article in inconsistent state

**Example:**

```typescript
const modified = await manager.modifyArticle(article.id, {
  title: 'Getting Started with TypeScript - Updated',
  content: 'Updated content here...',
  tags: ['typescript', 'javascript'],
  categories: ['tutorials'],
  metadata: {
    keywords: ['typescript', 'javascript', 'tutorial', 'advanced']
  }
});

console.log(modified.version);      // 2 (incremented)
console.log(modified.modifiedAt);   // Current timestamp
console.log(modified.publishedAt);  // Original timestamp (unchanged)
```

---

#### deleteArticle(articleId: string): Promise<void>

Removes an article completely from the system.

**Parameters:**
- `articleId` (string): ID of the article to delete

**Returns:** Promise resolving when deletion is complete

**Throws:**
- `NotFoundError`: If article doesn't exist

**Guarantees:**
- Article is completely removed and inaccessible
- All associated metadata is deleted
- Idempotent: attempting to delete non-existent article returns consistent error

**Example:**

```typescript
await manager.deleteArticle(article.id);

// Attempting to retrieve deleted article throws NotFoundError
try {
  await manager.getArticle(article.id);
} catch (error) {
  console.log(error.code); // 'ARTICLE_NOT_FOUND'
}
```

---

#### getArticle(articleId: string): Promise<Article>

Retrieves a single article by ID.

**Parameters:**
- `articleId` (string): ID of the article to retrieve

**Returns:** Promise resolving to the Article

**Throws:**
- `NotFoundError`: If article doesn't exist

**Example:**

```typescript
const article = await manager.getArticle(articleId);
console.log(article.title);
console.log(article.state);
```

---

#### listArticles(filters?: ArticleFilters): Promise<Article[]>

Lists articles with optional filtering.

**Parameters:**
- `filters` (ArticleFilters, optional): Query filters

**Returns:** Promise resolving to array of matching Articles

**Supported Filters:**
- `state`: Filter by 'draft' or 'published'
- `tags`: Filter by one or more tags (OR logic)
- `categories`: Filter by one or more categories (OR logic)
- `author`: Filter by author name
- `dateRange`: Filter by publication date range

**Example:**

```typescript
// Get all published articles
const published = await manager.listArticles({ state: 'published' });

// Get articles by author
const byAuthor = await manager.listArticles({ author: 'Jane Doe' });

// Get articles with specific tags
const tagged = await manager.listArticles({ tags: ['typescript', 'javascript'] });

// Get articles in date range
const recent = await manager.listArticles({
  dateRange: {
    from: new Date('2024-01-01'),
    to: new Date('2024-12-31')
  }
});

// Combine filters
const filtered = await manager.listArticles({
  state: 'published',
  author: 'Jane Doe',
  tags: ['typescript'],
  dateRange: {
    from: new Date('2024-01-01'),
    to: new Date('2024-12-31')
  }
});
```

---

#### validateMetadata(metadata: ArticleMetadata): ValidationResult

Validates article metadata before creation or modification.

**Parameters:**
- `metadata` (ArticleMetadata): Metadata to validate

**Returns:** ValidationResult with any errors found

**Validation Rules:**
- `title` is required and non-empty

**Example:**

```typescript
const result = manager.validateMetadata({
  title: 'Valid Title',
  description: 'Description'
});

if (!result.isValid) {
  result.errors.forEach(error => {
    console.log(`${error.field}: ${error.message}`);
  });
}
```

---

## Password Protector API

The Password Protector handles password-based article protection using bcrypt hashing with cost factor 12.

### Methods

#### hashPassword(password: string): Promise<string>

Hashes a plaintext password using bcrypt.

**Parameters:**
- `password` (string): The plaintext password to hash

**Returns:** Promise resolving to the bcrypt hash

**Security Notes:**
- Uses bcrypt cost factor 12 (industry standard)
- Hash is deterministic but includes salt
- Never store plaintext passwords

**Example:**

```typescript
const protector = new PasswordProtector(repository);

const hash = await protector.hashPassword('mySecurePassword123');
console.log(hash); // $2b$12$...
```

---

#### verifyPassword(password: string, hash: string): Promise<boolean>

Verifies a plaintext password against a stored bcrypt hash.

**Parameters:**
- `password` (string): The plaintext password to verify
- `hash` (string): The bcrypt hash to compare against

**Returns:** Promise resolving to true if password matches, false otherwise

**Example:**

```typescript
const isValid = await protector.verifyPassword('mySecurePassword123', hash);
console.log(isValid); // true or false
```

---

#### protectArticle(articleId: string, password: string): Promise<void>

Protects an article with a password.

**Parameters:**
- `articleId` (string): ID of the article to protect
- `password` (string): The password to set

**Returns:** Promise resolving when protection is applied

**Throws:**
- `NotFoundError`: If article doesn't exist

**Side Effects:**
- Sets `isProtected` to true
- Stores bcrypt hash in `passwordHash`
- Updates `modifiedAt` timestamp

**Example:**

```typescript
await protector.protectArticle(article.id, 'secretPassword123');

const updated = await manager.getArticle(article.id);
console.log(updated.isProtected);   // true
console.log(updated.passwordHash);  // $2b$12$... (never plaintext)
```

---

#### unprotectArticle(articleId: string): Promise<void>

Removes password protection from an article.

**Parameters:**
- `articleId` (string): ID of the article to unprotect

**Returns:** Promise resolving when protection is removed

**Throws:**
- `NotFoundError`: If article doesn't exist

**Side Effects:**
- Sets `isProtected` to false
- Clears `passwordHash`
- Updates `modifiedAt` timestamp

**Example:**

```typescript
await protector.unprotectArticle(article.id);

const updated = await manager.getArticle(article.id);
console.log(updated.isProtected);   // false
console.log(updated.passwordHash);  // undefined
```

---

#### updatePassword(articleId: string, newPassword: string): Promise<void>

Updates the password for a protected article.

**Parameters:**
- `articleId` (string): ID of the article
- `newPassword` (string): The new password to set

**Returns:** Promise resolving when password is updated

**Throws:**
- `NotFoundError`: If article doesn't exist
- `AuthenticationError`: If article is not protected

**Guarantees:**
- Old password no longer grants access
- New password grants access immediately
- Updates `modifiedAt` timestamp

**Example:**

```typescript
await protector.updatePassword(article.id, 'newPassword456');

// Old password no longer works
const oldValid = await protector.verifyPassword('secretPassword123', article.passwordHash!);
console.log(oldValid); // false

// New password works
const newValid = await protector.verifyPassword('newPassword456', article.passwordHash!);
console.log(newValid); // true
```

---

#### canAccessArticle(articleId: string, password?: string): Promise<boolean>

Checks if a user can access an article.

**Parameters:**
- `articleId` (string): ID of the article
- `password` (string, optional): The password provided by the user

**Returns:** Promise resolving to true if access is granted, false otherwise

**Throws:**
- `NotFoundError`: If article doesn't exist

**Access Rules:**
- Unprotected articles are always accessible (password ignored)
- Protected articles require correct password
- Incorrect password returns false (no error thrown)

**Example:**

```typescript
// Unprotected article - always accessible
const unprotected = await protector.canAccessArticle(unprotectedId);
console.log(unprotected); // true

// Protected article - requires password
const withWrongPassword = await protector.canAccessArticle(protectedId, 'wrongPassword');
console.log(withWrongPassword); // false

const withCorrectPassword = await protector.canAccessArticle(protectedId, 'secretPassword123');
console.log(withCorrectPassword); // true
```

---

#### requiresAuthentication(articleId: string): Promise<boolean>

Checks if an article requires authentication.

**Parameters:**
- `articleId` (string): ID of the article

**Returns:** Promise resolving to true if article is protected, false otherwise

**Throws:**
- `NotFoundError`: If article doesn't exist

**Example:**

```typescript
const needsAuth = await protector.requiresAuthentication(article.id);
console.log(needsAuth); // true or false
```

---

## Hugo Integration API

The Hugo Integration layer converts between Article format and Hugo frontmatter format, enabling seamless integration with Hugo static site generation.

### Methods

#### toHugoFrontMatter(article: Article): string

Converts an Article to Hugo frontmatter format.

**Parameters:**
- `article` (Article): The article to convert

**Returns:** String with YAML frontmatter and content separated by `---`

**Format:**
```
---
YAML frontmatter
---

Article content
```

**Frontmatter Fields:**
- `title`: Article title
- `date`: Publication date (or creation date if not published)
- `lastmod`: Last modification date
- `draft`: Boolean indicating draft state
- `tags`: Array of tags
- `categories`: Array of categories
- `author`: Author name
- `description`: Article description
- `keywords`: Array of keywords
- Custom fields from `metadata.customFields`

**Example:**

```typescript
const hugo = HugoIntegration;

const article = await manager.createDraft(
  {
    title: 'Hugo Guide',
    description: 'Learn Hugo',
    keywords: ['hugo', 'static-site'],
    author: 'John Doe'
  },
  'Hugo is a static site generator...'
);

await manager.publishArticle(article.id);

const frontmatter = hugo.toHugoFrontMatter(article);
console.log(frontmatter);
// ---
// title: Hugo Guide
// date: 2024-01-15T10:30:00.000Z
// lastmod: 2024-01-15T10:30:00.000Z
// draft: false
// tags: []
// author: John Doe
// description: Learn Hugo
// keywords:
//   - hugo
//   - static-site
// ---
//
// Hugo is a static site generator...
```

---

#### fromHugoFrontMatter(content: string): Article

Parses Hugo frontmatter to an Article object.

**Parameters:**
- `content` (string): Hugo file content with frontmatter

**Returns:** Article object

**Throws:**
- `Error`: If frontmatter format is invalid

**Format Expected:**
```
---
YAML frontmatter
---

Article content
```

**Parsing Rules:**
- Standard fields (title, date, draft, tags, etc.) are extracted
- Custom fields are preserved in `metadata.customFields`
- Draft state is determined by `draft` field
- Dates are parsed to Date objects
- Arrays are properly handled

**Example:**

```typescript
const hugoContent = `---
title: Hugo Guide
date: 2024-01-15T10:30:00.000Z
lastmod: 2024-01-15T10:30:00.000Z
draft: false
tags:
  - hugo
  - static-site
author: John Doe
description: Learn Hugo
customField: customValue
---

Hugo is a static site generator...`;

const article = hugo.fromHugoFrontMatter(hugoContent);

console.log(article.title);                    // 'Hugo Guide'
console.log(article.state);                    // 'published'
console.log(article.tags);                     // ['hugo', 'static-site']
console.log(article.metadata.customFields);    // { customField: 'customValue' }
console.log(article.content);                  // 'Hugo is a static site generator...'
```

---

#### generateStaticFile(article: Article, outputPath: string): Promise<void>

Generates a static Hugo content file for the article.

**Parameters:**
- `article` (Article): The article to write
- `outputPath` (string): The file path where the article should be written

**Returns:** Promise resolving when file is written

**Throws:**
- `Error`: If file write fails

**Side Effects:**
- Creates directory structure if it doesn't exist
- Writes article as Hugo frontmatter format
- Overwrites existing file if present

**Example:**

```typescript
const article = await manager.createDraft(
  { title: 'My Article', author: 'Jane Doe' },
  'Article content...'
);

await manager.publishArticle(article.id);

// Generate Hugo content file
await hugo.generateStaticFile(
  article,
  './content/posts/my-article.md'
);

// File is now ready for Hugo to process
```

---

### Hugo Integration Workflow

**Template Migration Strategy:**

The Hugo Integration is designed to support template migration without code changes:

1. **Export Articles**: Export all articles in template-agnostic format
2. **Create Adapter**: Create adapter for new template format
3. **Transform Data**: Use adapter to transform articles
4. **Regenerate Site**: Hugo regenerates static site with new template
5. **No Code Changes**: Article Manager code remains unchanged

**Custom Fields Usage:**

Template-specific data is preserved in `metadata.customFields`:

```typescript
// Create article with custom fields for specific template
const article = await manager.createDraft(
  {
    title: 'Article',
    customFields: {
      heroImage: '/images/hero.jpg',
      featured: true,
      relatedPosts: ['post-1', 'post-2']
    }
  },
  'Content...'
);

// Custom fields are preserved through Hugo conversion
const frontmatter = hugo.toHugoFrontMatter(article);
// frontmatter includes heroImage, featured, relatedPosts

// Custom fields survive round-trip conversion
const parsed = hugo.fromHugoFrontMatter(frontmatter);
console.log(parsed.metadata.customFields.heroImage); // '/images/hero.jpg'
```

---

## Error Handling

### Error Codes

The system uses specific error codes for different failure scenarios:

```typescript
enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_METADATA = 'INVALID_METADATA',

  // Not found errors
  ARTICLE_NOT_FOUND = 'ARTICLE_NOT_FOUND',

  // State errors
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',

  // Authentication errors
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  INVALID_PASSWORD = 'INVALID_PASSWORD',

  // System errors
  STORAGE_ERROR = 'STORAGE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

### Error Response Format

All errors follow a consistent format:

```typescript
interface ErrorResponse {
  code: ErrorCode
  message: string                     // User-friendly message
  details?: Record<string, any>       // Additional context
  timestamp: Date
}
```

### Error Handling Examples

**Validation Errors:**

```typescript
try {
  await manager.createDraft(
    { title: '' },  // Empty title
    'Content'
  );
} catch (error) {
  console.log(error.code);     // 'VALIDATION_ERROR'
  console.log(error.message);  // 'Validation failed: Title is required'
  console.log(error.details);  // { errors: [...] }
}
```

**Not Found Errors:**

```typescript
try {
  await manager.getArticle('non-existent-id');
} catch (error) {
  console.log(error.code);     // 'ARTICLE_NOT_FOUND'
  console.log(error.message);  // 'Article not found: non-existent-id'
}
```

**Authentication Errors:**

```typescript
try {
  await protector.updatePassword(article.id, 'newPassword');
  // Article is not protected
} catch (error) {
  console.log(error.code);     // 'AUTHENTICATION_FAILED'
  console.log(error.message);  // 'Article is not protected: ...'
}
```

### Error Handling Best Practices

1. **Always check error codes**: Use error codes to determine appropriate action
2. **Never expose passwords**: Error messages never contain plaintext passwords
3. **Provide context**: Error details include field names and validation rules
4. **Log errors**: Include timestamp for debugging
5. **Retry logic**: Use error codes to determine if operation is retryable

```typescript
async function createArticleWithRetry(metadata, content, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await manager.createDraft(metadata, content);
    } catch (error) {
      if (error.code === 'VALIDATION_ERROR') {
        // Validation errors are not retryable
        throw error;
      }
      if (error.code === 'STORAGE_ERROR' && attempt < maxRetries) {
        // Storage errors may be retryable
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      throw error;
    }
  }
}
```

---

## Best Practices

### Article Lifecycle Management

1. **Create Draft First**: Always create articles in draft state before publishing
2. **Validate Before Publish**: Ensure metadata is complete before publishing
3. **Preserve Publication Timestamp**: Never modify `publishedAt` directly
4. **Track Versions**: Use version number to detect concurrent modifications

```typescript
// Good: Create, validate, then publish
const article = await manager.createDraft(metadata, content);
const published = await manager.publishArticle(article.id);

// Modify without changing publication timestamp
const modified = await manager.modifyArticle(article.id, updates);
console.log(modified.publishedAt === published.publishedAt); // true
```

### Password Protection

1. **Use Strong Passwords**: Enforce minimum password requirements
2. **Hash Before Storage**: Never store plaintext passwords
3. **Update Regularly**: Change passwords periodically
4. **Verify Access**: Always check `canAccessArticle` before granting access

```typescript
// Good: Protect article with strong password
const strongPassword = 'MySecurePass123!@#';
await protector.protectArticle(article.id, strongPassword);

// Check access before serving content
const canAccess = await protector.canAccessArticle(article.id, userPassword);
if (canAccess) {
  // Serve article content
}
```

### Hugo Integration

1. **Preserve Custom Fields**: Use `customFields` for template-specific data
2. **Validate Frontmatter**: Always validate parsed frontmatter
3. **Generate Files Atomically**: Write to temporary file then rename
4. **Maintain Metadata**: Ensure all metadata survives round-trip conversion

```typescript
// Good: Preserve template-specific data
const article = await manager.createDraft(
  {
    title: 'Article',
    customFields: {
      heroImage: '/images/hero.jpg',
      layout: 'post'
    }
  },
  'Content'
);

// Generate Hugo file
await hugo.generateStaticFile(article, './content/posts/article.md');

// Verify round-trip
const content = await fs.readFile('./content/posts/article.md', 'utf-8');
const parsed = hugo.fromHugoFrontMatter(content);
console.log(parsed.metadata.customFields.heroImage); // Preserved
```

### Error Handling

1. **Catch Specific Errors**: Handle different error codes appropriately
2. **Log with Context**: Include error code and timestamp in logs
3. **Provide User Feedback**: Return user-friendly error messages
4. **Never Expose Secrets**: Ensure passwords never appear in logs

```typescript
// Good: Specific error handling
try {
  await manager.createDraft(metadata, content);
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    // Handle validation error
    return { status: 400, errors: error.details.errors };
  } else if (error.code === 'STORAGE_ERROR') {
    // Handle storage error
    return { status: 500, message: 'Storage service unavailable' };
  }
  throw error;
}
```

---

## Setup & Testing

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Testing

Run tests in watch mode:
```bash
npm run test
```

Run tests once:
```bash
npm run test:run
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Technologies

- **TypeScript**: Strict type checking and modern JavaScript features
- **Vitest**: Fast unit testing framework
- **fast-check**: Property-based testing library
- **bcrypt**: Secure password hashing
- **uuid**: Unique identifier generation

### Requirements Covered

This documentation covers the following requirements:
- **1.1-1.4**: Article Manager API (creation, publication, modification, deletion)
- **2.1-2.3**: Article retrieval and filtering
- **3.1-3.3**: Modification tracking and versioning
- **4.1, 4.3-4.6**: Password Protector API
- **5.1-5.4**: Hugo Integration API
- **7.1**: Error handling and descriptive messages
