# Services Layer

This directory contains the main business logic services for the Blog Management GUI application.

## ArticleService

The `ArticleService` wraps the existing backend modules (`ArticleManager`, `HugoIntegration`, `PasswordProtector`) to provide article CRUD operations with Hugo frontmatter file generation.

### Features

- **Create Articles**: Create new draft articles with metadata, tags, categories, and optional password protection
- **List Articles**: Retrieve all articles with filtering support (search text, tags, categories, state)
- **Get Article**: Retrieve a single article by ID
- **Update Articles**: Modify article content, metadata, and password protection
- **Delete Articles**: Remove articles and their Hugo frontmatter files
- **Publish Articles**: Transition articles from draft to published state
- **Hugo Integration**: Automatically generates Hugo frontmatter files in `content/posts/` directory

### Usage Example

```typescript
import { ArticleService } from './services/ArticleService';

// Initialize service with Hugo project path
const articleService = new ArticleService('/path/to/hugo/project');
await articleService.initialize();

// Create a new article
const article = await articleService.createArticle({
  title: 'My First Post',
  content: '# Hello World\n\nThis is my first blog post.',
  tags: ['introduction', 'blog'],
  categories: ['general'],
  password: 'secret123' // Optional password protection
});

// List all articles
const articles = await articleService.listArticles();

// Filter articles by search text
const filtered = await articleService.listArticles({
  searchText: 'typescript'
});

// Get a specific article
const retrieved = await articleService.getArticle(article.id);

// Update an article
const updated = await articleService.updateArticle(article.id, {
  title: 'Updated Title',
  tags: ['updated', 'blog']
});

// Publish a draft article
const published = await articleService.publishArticle(article.id);

// Delete an article
await articleService.deleteArticle(article.id);
```

### Requirements Validation

The ArticleService implements the following requirements:

- **1.1-1.5**: Article list display with filtering support
- **2.1-2.9**: Create new articles with metadata and password protection
- **3.1-3.5**: Edit existing articles
- **4.1-4.4**: Delete articles and Hugo files

### Hugo File Generation

The service automatically generates Hugo frontmatter files in the `content/posts/` directory with the following format:

```markdown
---
title: Article Title
date: 2024-01-01T00:00:00.000Z
lastmod: 2024-01-01T00:00:00.000Z
draft: false
tags:
  - tag1
  - tag2
categories:
  - category1
author: Author Name
description: Article description
---

Article content goes here...
```

### Password Protection

Articles can be password-protected using bcrypt hashing:

```typescript
// Create with password
const article = await articleService.createArticle({
  title: 'Secret Post',
  content: 'Confidential content',
  password: 'mysecret'
});

// Add password to existing article
await articleService.updateArticle(article.id, {
  password: 'newsecret'
});

// Remove password protection
await articleService.updateArticle(article.id, {
  password: '',
  isProtected: false
});
```

### Error Handling

The service throws descriptive errors for common failure scenarios:

- **Validation Errors**: Empty title or content
- **Not Found Errors**: Article ID doesn't exist
- **File System Errors**: Failed to create/update Hugo files

All errors include the original error message for debugging.

## ConfigService

The `ConfigService` manages application configuration with persistent storage using `electron-store`.

### Features

- **Persistent Storage**: Configuration saved to disk with encryption for sensitive data
- **Window State**: Remember window size and position
- **Cloudflare Config**: Store API credentials securely
- **Editor Preferences**: Theme, font size, auto-save settings
- **Recent Projects**: Track recently opened Hugo projects

See `ConfigService.ts` for detailed documentation.

## ImageService

The `ImageService` manages image uploads and storage for the Hugo blog, handling image validation, unique filename generation, and file system operations.

### Features

- **List Images**: Scan and retrieve all images from `static/images` directory
- **Upload Images**: Upload images with format validation (PNG, JPG, JPEG, GIF, WebP)
- **Delete Images**: Remove images with file system cleanup
- **Unique Filenames**: Generate unique filenames using timestamp + random string
- **Format Validation**: Validate image formats before upload
- **Security**: Prevent directory traversal attacks

### Usage Example

```typescript
import { ImageService } from './services/ImageService';

// Initialize service with Hugo project path
const imageService = new ImageService('/path/to/hugo/project');
await imageService.initialize();

// List all images
const images = await imageService.listImages();
console.log(`Found ${images.length} images`);

// Upload an image
const metadata = await imageService.uploadImage(
  '/path/to/source/image.png',
  'myimage.png'
);
console.log(`Uploaded as: ${metadata.filename}`);
console.log(`Access at: ${metadata.path}`);

// Get image file system path
const imagePath = imageService.getImagePath(metadata.filename);

// Delete an image
await imageService.deleteImage(metadata.filename);
```

### Requirements Validation

The ImageService implements the following requirements:

- **6.1-6.6**: Image upload with format validation and unique filenames
- **7.1-7.6**: Image gallery management
- **8.1-8.4**: Insert images into articles

### Supported Formats

The service validates and accepts the following image formats:

- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- GIF (`.gif`)
- WebP (`.webp`)

All other formats are rejected with a descriptive error message.

### Unique Filename Generation

Uploaded images are automatically renamed using a unique pattern:

```
{timestamp}-{randomhex}.{extension}
```

Example: `1704067200000-a1b2c3d4e5f6g7h8.png`

This ensures:
- No filename conflicts
- Chronological ordering by timestamp
- Uniqueness through random component
- Original extension preservation

### Image Metadata

Each image includes the following metadata:

```typescript
interface ImageMetadata {
  filename: string;        // Generated unique filename
  originalName: string;    // Original uploaded filename
  size: number;           // File size in bytes
  mimeType: string;       // MIME type (e.g., 'image/png')
  uploadedAt: Date;       // Upload timestamp
  path: string;           // Hugo path (e.g., '/images/filename.png')
  width?: number;         // Optional: image width
  height?: number;        // Optional: image height
}
```

### Security Features

The service includes security measures to prevent common attacks:

- **Directory Traversal Prevention**: Validates filenames to reject paths like `../../../etc/passwd`
- **Format Validation**: Only accepts whitelisted image formats
- **Path Sanitization**: Ensures all operations stay within the images directory

### Error Handling

The service throws descriptive errors for common failure scenarios:

- **Invalid Format**: File extension not in supported formats list
- **Image Not Found**: Attempting to delete non-existent image
- **Invalid Filename**: Directory traversal or invalid characters detected
- **File System Errors**: Failed to read/write/delete files

All errors include the original error message for debugging.

## StyleService

The `StyleService` manages blog style configuration including Hugo settings, color themes, layout, fonts, and custom CSS.

### Features

- **Get Style Config**: Read current style configuration from Hugo files
- **Update Style Config**: Update Hugo config, CSS, and theme settings
- **Export/Import**: Export configuration to JSON and import from JSON
- **Reset to Default**: Restore PaperMod default styles
- **Style History**: Track last 20 style changes with restore capability
- **CSS Generation**: Auto-generate CSS from color theme and font settings
- **Validation**: Validate configuration before applying

### Usage Example

```typescript
import { StyleService } from './services/StyleService';

// Initialize service with Hugo project path
const styleService = new StyleService('/path/to/hugo/project');

// Get current style configuration
const config = await styleService.getStyleConfig();
console.log(`Current theme: ${config.colorTheme.mode}`);

// Update style configuration
config.colorTheme.primaryColor = '#ff0000';
config.fontSettings.bodyFontSize = 18;
await styleService.updateStyleConfig(config, 'Updated colors and fonts');

// Export configuration
const json = await styleService.exportStyleConfig();
fs.writeFileSync('my-theme.json', json);

// Import configuration
const importedJson = fs.readFileSync('my-theme.json', 'utf-8');
await styleService.importStyleConfig(importedJson);

// Reset to defaults
await styleService.resetToDefault();

// Get style history
const history = styleService.getStyleHistory();
console.log(`${history.length} changes in history`);

// Restore from history
await styleService.restoreFromHistory(history[0].id);
```

### Requirements Validation

The StyleService implements the following requirements:

- **21.1-21.9**: Hugo configuration management
- **22.1-22.8**: Custom CSS editing
- **23.1-23.8**: Color theme customization
- **24.1-24.7**: Layout configuration
- **25.1-25.7**: Font settings
- **28.1-28.7**: Export/import style configuration
- **29.1-29.6**: Reset to default styles
- **30.1-30.7**: Style history tracking

### Style Configuration Structure

```typescript
interface StyleConfiguration {
  version: number;
  hugoConfig: Partial<HugoConfig>;
  colorTheme: ColorTheme;
  layoutSettings: LayoutSettings;
  fontSettings: FontSettings;
  customCSS: string;
}
```

### Color Theme

Customize blog colors with CSS custom properties:

```typescript
colorTheme: {
  mode: 'light' | 'dark',
  primaryColor: '#1e90ff',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  linkColor: '#1e90ff',
  accentColor: '#ff6347'
}
```

### Layout Settings

Configure home page layout and navigation:

```typescript
layoutSettings: {
  homeLayout: 'list' | 'card',
  showSidebar: boolean,
  sidebarContent: string[],
  navigationMenu: MenuItem[]
}
```

### Font Settings

Customize typography:

```typescript
fontSettings: {
  fontFamily: string,
  headingFontSize: number,  // 16-48px
  bodyFontSize: number,      // 12-24px
  lineHeight: number,        // 1.0-2.5
  letterSpacing: number      // -0.05em to 0.2em
}
```

### Style History

The service automatically tracks the last 20 style changes:

- Each change includes timestamp, description, and full configuration
- History is saved to `.kiro/style-history.json` in Hugo project
- Restore any previous configuration with one method call

### Validation

The service validates all configuration before applying:

- Color theme mode must be 'light' or 'dark'
- Home layout must be 'list' or 'card'
- Menu URLs must start with http://, https://, or /
- Font sizes must be within valid ranges
- Line height and letter spacing must be within bounds

### CSS Generation

The service auto-generates CSS from theme settings:

- Creates CSS custom properties for colors
- Applies font settings to body and headings
- Writes to `assets/css/extended/theme.css`
- Custom CSS is written to `assets/css/extended/custom.css`

### Error Handling

The service handles various error scenarios:

- **Read Errors**: Returns default config if files don't exist
- **Write Errors**: Throws descriptive error messages
- **Validation Errors**: Rejects invalid configurations
- **Import Errors**: Validates JSON format and structure

### Testing

The StyleService includes comprehensive unit tests covering:

- Configuration reading and writing
- Export and import functionality
- Style history management
- Validation rules
- Error handling
- Edge cases

Run tests:
```bash
npm test tests/unit/services/StyleService.test.ts
```


## DeployService

The `DeployService` manages deployment operations to Cloudflare Pages, coordinating file uploads and monitoring deployment status.

### Features

- **Credential Validation**: Verify Cloudflare API credentials before deployment
- **File Upload**: Upload Hugo public folder contents to Cloudflare Pages
- **Progress Tracking**: Monitor deployment progress with callback support
- **Status Polling**: Track deployment status until completion
- **Error Handling**: Graceful error handling with descriptive messages
- **Cancellation Support**: Cancel deployment monitoring

### Usage Example

```typescript
import { DeployService } from './services/DeployService';

// Initialize service with Cloudflare config and Hugo project path
const deployService = new DeployService(
  {
    apiToken: 'your-api-token',
    accountId: 'your-account-id',
    projectName: 'your-project-name'
  },
  '/path/to/hugo/project'
);

// Set progress callback
deployService.setProgressCallback((progress, message) => {
  console.log(`${progress}%: ${message}`);
});

// Validate credentials before deployment
const isValid = await deployService.validateCredentials();
if (!isValid) {
  console.error('Invalid Cloudflare credentials');
  return;
}

// Deploy website
const result = await deployService.deploy();
if (result.success) {
  console.log(`Deployed successfully to ${result.url}`);
} else {
  console.error(`Deployment failed: ${result.error}`);
}

// Check deployment status
const status = await deployService.getDeploymentStatus(result.deploymentId);
console.log(`Status: ${status.status}`);

// Cancel deployment monitoring
deployService.cancelDeployment();
```

### Requirements Validation

The DeployService implements the following requirements:

- **12.1**: Deploy website to Cloudflare Pages
- **12.2**: Validate Cloudflare credentials before deployment
- **12.3**: Upload public folder contents
- **12.4**: Track deployment progress
- **12.5**: Display deployment status and URL
- **12.6**: Handle deployment errors
- **12.7**: Support deployment cancellation

### Deployment Flow

1. **Starting**: Initialize deployment process
2. **Uploading**: Upload files to Cloudflare (20% progress)
3. **Monitoring**: Poll deployment status (50% progress)
4. **Building**: Cloudflare builds the site (60% progress)
5. **Deploying**: Deploy to CDN (80% progress)
6. **Complete**: Deployment finished (100% progress)

### Progress Callback

The progress callback receives two parameters:

```typescript
(progress: number, message: string) => void
```

- `progress`: Percentage complete (0-100)
- `message`: Human-readable status message

Example messages:
- "Starting deployment..."
- "Uploading files to Cloudflare..."
- "Building website..."
- "Deploying to Cloudflare Pages..."
- "Deployment completed successfully!"

### Deployment Status

The service tracks the following deployment statuses:

- `queued`: Deployment is queued
- `building`: Website is being built
- `deploying`: Deploying to Cloudflare Pages
- `success`: Deployment completed successfully
- `failed`: Deployment failed

### Error Handling

The service handles various error scenarios:

- **Invalid Credentials**: Returns error if API token is invalid
- **Upload Failures**: Catches and reports file upload errors
- **Network Errors**: Handles network connectivity issues
- **Timeout**: Stops polling after 5 minutes (60 attempts × 5s)
- **Cancellation**: Gracefully handles user-initiated cancellation

All errors are returned in the `DeployResult` with descriptive messages.

### Configuration Updates

Update Cloudflare configuration or Hugo project path at runtime:

```typescript
// Update Cloudflare config
deployService.updateConfig({
  apiToken: 'new-token',
  accountId: 'new-account',
  projectName: 'new-project'
});

// Update Hugo project path
deployService.updateHugoProjectPath('/new/path/to/hugo');
```

### Testing

The DeployService includes comprehensive unit tests covering:

- Configuration management
- Credential validation
- Successful deployments
- Error handling
- Progress tracking
- Status polling
- Deployment cancellation
- Edge cases

Run tests:
```bash
npm test tests/unit/services/DeployService.test.ts
```
