# Design Document: Blog Article Management

## Overview

The Blog Article Management system provides a comprehensive solution for managing blog articles in a Hugo-based blog platform. The system is designed with three core principles:

1. **Template Agnostic**: Article data and operations are completely independent of the template engine, enabling seamless migration between Hugo templates without code changes.
2. **Secure Password Protection**: Optional password-protected articles use industry-standard bcrypt hashing with no plaintext storage or transmission.
3. **Data Consistency**: All operations maintain strict data consistency guarantees, with proper error handling and recovery mechanisms.

The system manages the complete article lifecycle: creation (draft state), publication, modification, and deletion. It provides clear separation between article storage, password protection, and template rendering concerns.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Blog Article Management                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Article Manager │  │ Password         │                 │
│  │                  │  │ Protector        │                 │
│  │ - Create         │  │                  │                 │
│  │ - Publish        │  │ - Hash Password  │                 │
│  │ - Modify         │  │ - Verify Access  │                 │
│  │ - Delete         │  │ - Update Auth    │                 │
│  └────────┬─────────┘  └────────┬─────────┘                 │
│           │                     │                            │
│           └──────────┬──────────┘                            │
│                      │                                       │
│           ┌──────────▼──────────┐                            │
│           │  Article Repository │                            │
│           │  (Data Storage)     │                            │
│           └─────────────────────┘                            │
│                      │                                       │
│           ┌──────────▼──────────┐                            │
│           │  Template-Agnostic  │                            │
│           │  Data Format        │                            │
│           └─────────────────────┘                            │
│                      │                                       │
│           ┌──────────▼──────────┐                            │
│           │  Hugo Integration   │                            │
│           │  (Rendering Layer)  │                            │
│           └─────────────────────┘                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Article Manager**
- Manages article lifecycle (create, publish, modify, delete)
- Validates article metadata and content
- Records timestamps (publication, modification)
- Generates unique identifiers
- Maintains state transitions (Draft → Published)
- Ensures data consistency across operations

**Password Protector**
- Handles password hashing using bcrypt
- Verifies password authentication
- Manages password updates
- Ensures passwords are never exposed in logs or errors
- Maintains separation from article storage

**Article Repository**
- Persists article data
- Retrieves articles by ID or query criteria
- Manages article state
- Ensures durability and recovery

**Template Integration Layer**
- Converts article data to template-agnostic format
- Handles Hugo-specific rendering
- Enables template migration without affecting core logic

## Components and Interfaces

### Article Manager Component

#### Core Operations

```typescript
interface ArticleManager {
  // Create and publish
  createDraft(metadata: ArticleMetadata, content: string): Promise<Article>
  publishArticle(articleId: string): Promise<Article>
  
  // Modify
  modifyArticle(articleId: string, updates: ArticleUpdate): Promise<Article>
  
  // Delete
  deleteArticle(articleId: string): Promise<void>
  
  // Retrieve
  getArticle(articleId: string): Promise<Article>
  listArticles(filters?: ArticleFilters): Promise<Article[]>
  
  // Validation
  validateMetadata(metadata: ArticleMetadata): ValidationResult
}
```

#### Article State Machine

```
Draft ──publish──> Published
  │                   │
  └─────modify────────┘
        │
      delete
        │
        ▼
    Deleted (inaccessible)
```

### Password Protector Component

```typescript
interface PasswordProtector {
  // Password management
  hashPassword(password: string): Promise<string>
  verifyPassword(password: string, hash: string): Promise<boolean>
  
  // Article protection
  protectArticle(articleId: string, password: string): Promise<void>
  unprotectArticle(articleId: string): Promise<void>
  updatePassword(articleId: string, newPassword: string): Promise<void>
  
  // Access control
  canAccessArticle(articleId: string, password?: string): Promise<boolean>
  requiresAuthentication(articleId: string): Promise<boolean>
}
```

### Article Repository Interface

```typescript
interface ArticleRepository {
  // CRUD operations
  save(article: Article): Promise<void>
  findById(id: string): Promise<Article | null>
  findAll(filters?: ArticleFilters): Promise<Article[]>
  delete(id: string): Promise<void>
  
  // Existence checks
  exists(id: string): Promise<boolean>
  
  // Batch operations
  deleteMultiple(ids: string[]): Promise<void>
}
```

## Data Models

### Article Data Model

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
  
  // Metadata validation
  metadata: ArticleMetadata
}

interface ArticleMetadata {
  title: string                       // Required
  description?: string                // Optional
  keywords?: string[]                 // Optional
  author?: string                     // Optional
  customFields?: Record<string, any>  // Template-specific fields
}

interface ArticleUpdate {
  title?: string
  content?: string
  excerpt?: string
  tags?: string[]
  categories?: string[]
  metadata?: Partial<ArticleMetadata>
  password?: string                   // For password updates
}

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

### Validation Result Model

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

## Template-Agnostic Design

### Data Format Independence

The Article Manager stores and retrieves data in a standardized, template-independent format. This format contains:

1. **Core Fields**: title, content, metadata (always present)
2. **Standard Metadata**: tags, categories, dates, author
3. **Custom Fields**: extensible `customFields` object for template-specific data

### Template Migration Strategy

When migrating to a new Hugo template:

1. **No Core Logic Changes**: Article Manager code remains unchanged
2. **Data Transformation Layer**: A thin adapter converts between old and new template formats
3. **Custom Fields Preservation**: Template-specific data stored in `customFields` is preserved
4. **Backward Compatibility**: Old articles continue to work with new templates

### Hugo Integration Points

```typescript
interface HugoIntegration {
  // Convert Article to Hugo-compatible format
  toHugoFrontMatter(article: Article): string
  
  // Parse Hugo frontmatter to Article
  fromHugoFrontMatter(frontmatter: string): Article
  
  // Generate static files
  generateStaticFile(article: Article, templatePath: string): Promise<void>
}
```

## Password Protection Mechanism

### Security Implementation

1. **Hashing Algorithm**: bcrypt with cost factor 12 (industry standard)
2. **Storage**: Only hashed passwords stored, never plaintext
3. **Transmission**: Passwords transmitted over HTTPS only
4. **Logging**: Passwords never logged or exposed in error messages

### Access Control Flow

```
User requests article
    │
    ▼
Is article protected?
    │
    ├─ No ──> Grant access
    │
    └─ Yes ──> Prompt for password
                │
                ▼
            User provides password
                │
                ▼
            Hash provided password
                │
                ▼
            Compare with stored hash
                │
                ├─ Match ──> Grant access
                │
                └─ No match ──> Deny access, allow retry
```

### Password Update Mechanism

When a publisher updates a password:

1. Validate new password meets security requirements
2. Hash new password with bcrypt
3. Replace old hash with new hash
4. Update modification timestamp
5. Invalidate any existing sessions (if applicable)

## Error Handling and Recovery

### Error Categories

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

interface ErrorResponse {
  code: ErrorCode
  message: string                     // User-friendly message
  details?: Record<string, any>       // Additional context
  timestamp: Date
}
```

### Consistency Guarantees

**Atomicity**: All article operations are atomic. Either the entire operation succeeds or fails completely, with no partial updates.

**Durability**: Once an operation succeeds, the data is persisted and survives system failures.

**Isolation**: Concurrent operations on different articles don't interfere with each other.

**Consistency**: Failed operations never leave articles in inconsistent states.

### Recovery Mechanisms

1. **Transaction Rollback**: Failed modifications roll back to previous state
2. **Idempotent Operations**: Retrying failed operations produces same result
3. **State Validation**: System validates article state on startup
4. **Error Logging**: All errors logged with sufficient detail for debugging

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Draft Creation Invariant

*For any* article metadata and content, when an article is created, it SHALL be in Draft state with a valid unique identifier.

**Validates: Requirements 1.1, 1.6**

### Property 2: Publication State Transition

*For any* draft article, when published, the article SHALL transition to Published state and record an immutable publication timestamp.

**Validates: Requirements 1.2, 1.3**

### Property 3: Published Article Accessibility

*For any* published article, it SHALL be retrievable through the public interface and accessible without authentication (if unprotected).

**Validates: Requirements 1.4, 4.6**

### Property 4: Metadata Validation

*For any* article creation or modification attempt with missing required fields, the system SHALL reject the operation and return validation errors listing all missing fields.

**Validates: Requirements 1.5, 3.4, 3.5**

### Property 5: Article Deletion Completeness

*For any* published article, after deletion, the article SHALL not be retrievable through any interface and all associated metadata SHALL be removed.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 6: Non-Existent Article Error

*For any* deletion or retrieval attempt on a non-existent article, the system SHALL return a consistent "not found" error.

**Validates: Requirements 2.5**

### Property 7: Modification Preserves Publication Timestamp

*For any* published article, after modification, the original publication timestamp SHALL remain unchanged while the modification timestamp updates to current time.

**Validates: Requirements 3.2, 3.3**

### Property 8: Version Increment on Modification

*For any* article modification, the version number SHALL increment by exactly one.

**Validates: Requirements 3.6**

### Property 9: Password Protection Round Trip

*For any* article with a password set, providing the correct password SHALL grant access, while providing an incorrect password SHALL deny access.

**Validates: Requirements 4.1, 4.3, 4.4**

### Property 10: Password Update Effectiveness

*For any* protected article, after updating the password, the old password SHALL no longer grant access and the new password SHALL grant access.

**Validates: Requirements 4.5**

### Property 11: Template-Agnostic Data Format

*For any* article retrieved from the system, the data format SHALL be consistent and independent of template rendering, containing all required fields in standardized format.

**Validates: Requirements 5.4**

### Property 12: Metadata Preservation Round Trip

*For any* article metadata (tags, categories, custom fields), after saving and retrieving, the metadata SHALL be identical to the original.

**Validates: Requirements 6.1, 6.2, 6.4**

### Property 13: Failed Operation State Consistency

*For any* failed article operation, the article state SHALL remain unchanged from before the operation attempt.

**Validates: Requirements 7.2, 7.3**

### Property 14: Error Message Descriptiveness

*For any* failed operation, the system SHALL return an error response containing a descriptive message and error code.

**Validates: Requirements 7.1**

## Testing Strategy

### Unit Testing Approach

Unit tests verify specific examples, edge cases, and error conditions:

- **Article Creation**: Valid metadata, missing fields, invalid formats
- **State Transitions**: Draft to Published, modification of published articles
- **Password Operations**: Setting, updating, verifying passwords
- **Deletion**: Successful deletion, non-existent articles, cascade deletion
- **Error Handling**: Validation errors, not found errors, system errors
- **Metadata Management**: Valid metadata, invalid formats, custom fields

### Property-Based Testing Approach

Property-based tests verify universal properties across generated inputs using a PBT library (e.g., fast-check for JavaScript, Hypothesis for Python, QuickCheck for Haskell):

**Configuration**:
- Minimum 100 iterations per property test
- Each test references its corresponding design property
- Tag format: `Feature: blog-article-management, Property {number}: {property_text}`

**Property Test Examples**:

1. **Property 1 Test**: Generate random article metadata, create article, verify it's in Draft state with valid ID
   - Tag: `Feature: blog-article-management, Property 1: Draft Creation Invariant`

2. **Property 2 Test**: Generate random draft articles, publish them, verify Published state and timestamp immutability
   - Tag: `Feature: blog-article-management, Property 2: Publication State Transition`

3. **Property 4 Test**: Generate articles with various missing required fields, verify validation errors for each missing field
   - Tag: `Feature: blog-article-management, Property 4: Metadata Validation`

4. **Property 7 Test**: Generate published articles, modify them with random content, verify original publication timestamp unchanged
   - Tag: `Feature: blog-article-management, Property 7: Modification Preserves Publication Timestamp`

5. **Property 9 Test**: Generate articles with random passwords, verify correct password grants access and incorrect denies access
   - Tag: `Feature: blog-article-management, Property 9: Password Protection Round Trip`

6. **Property 12 Test**: Generate articles with random metadata, save and retrieve, verify metadata is identical
   - Tag: `Feature: blog-article-management, Property 12: Metadata Preservation Round Trip`

### Test Coverage Balance

- **Unit Tests**: ~30% of test suite (specific examples and edge cases)
- **Property Tests**: ~70% of test suite (universal properties with randomized inputs)

This balance ensures both concrete correctness (unit tests) and general robustness (property tests).

## Integration with Hugo

### Static Site Generation Compatibility

The system is designed to work with Hugo's static site generation model:

1. **No Runtime Dependencies**: Password protection uses client-side verification where possible
2. **Pre-built Static Files**: Articles are pre-rendered to static HTML
3. **Metadata in Frontmatter**: Article metadata stored in Hugo frontmatter format
4. **Template Independence**: Core logic doesn't depend on specific Hugo templates

### Hugo Workflow Integration

```
Article Manager
    │
    ├─> Create/Modify Article
    │       │
    │       ▼
    │   Store in Repository
    │       │
    │       ▼
    │   Generate Hugo Frontmatter
    │       │
    │       ▼
    │   Write to Content File
    │
    └─> Hugo Build Process
            │
            ▼
        Generate Static Site
            │
            ▼
        Deploy to Blog
```

### Future Template Migration

When migrating to a new Hugo template:

1. Export all articles in template-agnostic format
2. Create adapter for new template format
3. Transform articles using adapter
4. Regenerate static site with new template
5. No changes to Article Manager code required

## Security Considerations

### Password Security

- **Hashing**: bcrypt with cost factor 12
- **Storage**: Only hashes stored, never plaintext
- **Transmission**: HTTPS only
- **Logging**: Passwords never logged or exposed in errors
- **Validation**: Passwords meet minimum security requirements

### Input Validation

- All user input validated before processing
- Metadata format validation
- Content sanitization to prevent injection attacks
- File path validation to prevent directory traversal

### Access Control

- Only authorized publishers can create/modify/delete articles
- Password-protected articles require authentication
- Audit logging of all modifications
- Session management for authenticated access

## Performance Considerations

### Operation Targets

- Article publication: < 2 seconds
- Article modification: < 2 seconds
- Article deletion: < 1 second
- Password verification: < 500ms

### Optimization Strategies

- Efficient indexing for article retrieval
- Caching of frequently accessed articles
- Batch operations for multiple articles
- Lazy loading of article content
- Asynchronous password hashing

## Maintainability

### Code Organization

- Clear separation of concerns (Article Manager, Password Protector, Repository)
- Well-documented APIs
- Consistent error handling patterns
- Comprehensive logging

### Documentation

- API documentation with examples
- Architecture diagrams
- Data model specifications
- Integration guides for Hugo

### Extensibility

- Plugin architecture for custom metadata fields
- Template adapter pattern for new Hugo templates
- Custom validation rules support
- Event hooks for article lifecycle events
