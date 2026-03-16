# Design Document: Blog Management GUI

## Overview

The Blog Management GUI is a cross-platform desktop application built with Electron that provides a graphical interface for managing Hugo-based blogs. It integrates with the existing TypeScript blog article management backend to offer a complete solution for creating, editing, and publishing blog content, managing images, customizing blog styles, and deploying to Cloudflare Pages.

### Key Features

- Article management with Markdown editor and live preview
- Image upload and gallery management
- Hugo integration for static site generation
- Direct deployment to Cloudflare Pages via API
- Comprehensive blog style editor with live preview
- Cross-platform support (Windows, macOS, Linux)

### Technology Stack

- **Desktop Framework**: Electron (latest stable)
- **Frontend Framework**: React with TypeScript
- **UI Components**: Material-UI (MUI) or Ant Design
- **Markdown Editor**: CodeMirror 6 or Monaco Editor
- **Markdown Rendering**: marked.js with syntax highlighting (highlight.js)
- **State Management**: React Context API + hooks
- **Backend Integration**: Existing TypeScript blog management modules
- **Build Tool**: Vite
- **Testing**: Vitest for unit tests, fast-check for property-based tests

## Architecture

### System Architecture

The application follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (React Components, UI Views, User Interactions)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  (State Management, Business Logic, Validation)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  (Article Service, Image Service, Hugo Service,             │
│   Deploy Service, Style Service)                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Integration Layer                          │
│  (ArticleManager, HugoIntegration, PasswordProtector,       │
│   Cloudflare API Client)                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Persistence Layer                         │
│  (File System, Configuration Storage, Hugo Project Files)   │
└─────────────────────────────────────────────────────────────┘
```

### Process Architecture

The Electron application consists of two main processes:

1. **Main Process**: Node.js environment handling system operations
   - File system operations
   - Hugo command execution
   - Cloudflare API communication
   - Configuration management
   - IPC communication with renderer

2. **Renderer Process**: Chromium environment for UI
   - React application
   - User interface rendering
   - User interaction handling
   - IPC communication with main process

### Communication Flow

```
User Action → React Component → IPC Message → Main Process → Backend Module
                    ↑                                              │
                    └──────────── IPC Response ←──────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. Application Shell

**Component**: `App`
- Root component managing application layout
- Provides navigation sidebar
- Manages global state and routing

**Props**: None (root component)

**State**:
```typescript
interface AppState {
  currentView: ViewType;
  isLoading: boolean;
  notification: Notification | null;
}

type ViewType = 'articles' | 'images' | 'styles' | 'build' | 'settings';

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
  autoClose: boolean;
}
```

#### 2. Article List View

**Component**: `ArticleListView`
- Displays all articles in a table/grid
- Supports sorting, filtering, and searching
- Provides actions for create, edit, delete

**Props**:
```typescript
interface ArticleListViewProps {
  onCreateArticle: () => void;
  onEditArticle: (articleId: string) => void;
  onDeleteArticle: (articleId: string) => void;
}
```

**State**:
```typescript
interface ArticleListState {
  articles: ArticleListItem[];
  sortBy: 'title' | 'createdAt' | 'modifiedAt';
  sortOrder: 'asc' | 'desc';
  filterText: string;
  selectedTags: string[];
  selectedCategories: string[];
}

interface ArticleListItem {
  id: string;
  title: string;
  createdAt: Date;
  modifiedAt: Date;
  tags: string[];
  categories: string[];
  isProtected: boolean;
  state: 'draft' | 'published';
}
```

#### 3. Article Editor View

**Component**: `ArticleEditorView`
- Provides form for article metadata
- Integrates Markdown editor with live preview
- Handles article creation and updates

**Props**:
```typescript
interface ArticleEditorViewProps {
  articleId?: string; // undefined for new article
  onSave: () => void;
  onCancel: () => void;
}
```

**State**:
```typescript
interface ArticleEditorState {
  title: string;
  content: string;
  tags: string[];
  categories: string[];
  password: string;
  isProtected: boolean;
  isDirty: boolean;
  isSaving: boolean;
}
```

#### 4. Markdown Editor

**Component**: `MarkdownEditor`
- Split-pane editor with live preview
- Syntax highlighting
- Toolbar for common Markdown operations

**Props**:
```typescript
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onInsertImage: () => void;
}
```

#### 5. Image Gallery View

**Component**: `ImageGalleryView`
- Grid display of uploaded images
- Image preview and metadata
- Upload and delete operations

**Props**:
```typescript
interface ImageGalleryViewProps {
  selectionMode?: boolean;
  onSelectImage?: (imagePath: string) => void;
}
```

**State**:
```typescript
interface ImageGalleryState {
  images: ImageItem[];
  selectedImage: ImageItem | null;
  isUploading: boolean;
}

interface ImageItem {
  filename: string;
  path: string;
  size: number;
  uploadedAt: Date;
  thumbnailUrl: string;
}
```

#### 6. Style Editor View

**Component**: `StyleEditorView`
- Tabbed interface for different style settings
- Live preview panel
- Import/export functionality

**Props**: None

**State**:
```typescript
interface StyleEditorState {
  activeTab: 'config' | 'colors' | 'layout' | 'fonts' | 'css';
  styleConfig: StyleConfiguration;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  previewPageType: 'home' | 'article' | 'list';
  isDirty: boolean;
}

interface StyleConfiguration {
  hugoConfig: HugoConfigData;
  colorTheme: ColorTheme;
  layoutSettings: LayoutSettings;
  fontSettings: FontSettings;
  customCSS: string;
}
```

#### 7. Build and Deploy View

**Component**: `BuildDeployView`
- Build controls and status
- Console output display
- Preview and deploy buttons

**Props**: None

**State**:
```typescript
interface BuildDeployState {
  buildStatus: 'idle' | 'building' | 'success' | 'error';
  buildOutput: string[];
  buildStats: BuildStats | null;
  previewServerRunning: boolean;
  previewUrl: string | null;
  deployStatus: 'idle' | 'deploying' | 'success' | 'error';
}

interface BuildStats {
  pageCount: number;
  duration: number;
  timestamp: Date;
}
```

#### 8. Settings View

**Component**: `SettingsView`
- Application configuration
- Cloudflare credentials
- Hugo project path

**Props**: None

**State**:
```typescript
interface SettingsState {
  hugoProjectPath: string;
  cloudflareConfig: CloudflareConfig;
  editorPreferences: EditorPreferences;
}

interface CloudflareConfig {
  apiToken: string;
  accountId: string;
  projectName: string;
}

interface EditorPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: number;
}
```

### Backend Services (Main Process)

#### 1. Article Service

**Interface**:
```typescript
interface IArticleService {
  listArticles(filters?: ArticleFilters): Promise<Article[]>;
  getArticle(articleId: string): Promise<Article>;
  createArticle(data: CreateArticleData): Promise<Article>;
  updateArticle(articleId: string, updates: ArticleUpdate): Promise<Article>;
  deleteArticle(articleId: string): Promise<void>;
  publishArticle(articleId: string): Promise<Article>;
}

interface CreateArticleData {
  title: string;
  content: string;
  tags?: string[];
  categories?: string[];
  password?: string;
}
```

**Implementation**: Wraps `ArticleManager` and `HugoIntegration` from existing backend

#### 2. Image Service

**Interface**:
```typescript
interface IImageService {
  listImages(): Promise<ImageMetadata[]>;
  uploadImage(file: File): Promise<ImageMetadata>;
  deleteImage(filename: string): Promise<void>;
  getImagePath(filename: string): string;
}

interface ImageMetadata {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  path: string;
}
```

#### 3. Hugo Service

**Interface**:
```typescript
interface IHugoService {
  build(options?: BuildOptions): Promise<BuildResult>;
  startPreviewServer(): Promise<PreviewServer>;
  stopPreviewServer(): Promise<void>;
  getConfig(): Promise<HugoConfig>;
  updateConfig(config: Partial<HugoConfig>): Promise<void>;
}

interface BuildOptions {
  minify?: boolean;
  drafts?: boolean;
}

interface BuildResult {
  success: boolean;
  output: string[];
  stats: BuildStats;
  error?: string;
}

interface PreviewServer {
  url: string;
  port: number;
  stop: () => Promise<void>;
}
```

#### 4. Deploy Service

**Interface**:
```typescript
interface IDeployService {
  deploy(publicDir: string): Promise<DeployResult>;
  validateCredentials(): Promise<boolean>;
  getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>;
}

interface DeployResult {
  success: boolean;
  deploymentId: string;
  url: string;
  error?: string;
}

interface DeploymentStatus {
  id: string;
  status: 'queued' | 'building' | 'deploying' | 'success' | 'failed';
  url?: string;
}
```

#### 5. Style Service

**Interface**:
```typescript
interface IStyleService {
  getStyleConfig(): Promise<StyleConfiguration>;
  updateStyleConfig(config: Partial<StyleConfiguration>): Promise<void>;
  exportStyleConfig(): Promise<string>;
  importStyleConfig(json: string): Promise<StyleConfiguration>;
  resetToDefault(): Promise<StyleConfiguration>;
  getStyleHistory(): Promise<StyleHistoryEntry[]>;
  restoreFromHistory(entryId: string): Promise<StyleConfiguration>;
}

interface StyleHistoryEntry {
  id: string;
  timestamp: Date;
  description: string;
  config: StyleConfiguration;
}
```

#### 6. Configuration Service

**Interface**:
```typescript
interface IConfigService {
  getConfig(): Promise<AppConfig>;
  updateConfig(config: Partial<AppConfig>): Promise<void>;
  getWindowState(): Promise<WindowState>;
  saveWindowState(state: WindowState): Promise<void>;
}

interface AppConfig {
  hugoProjectPath: string;
  cloudflare: CloudflareConfig;
  editor: EditorPreferences;
  window: WindowState;
}

interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
  isMaximized: boolean;
}
```

### IPC Communication

#### IPC Channels

All IPC communication follows a request-response pattern:

**Channel Naming Convention**: `{domain}:{action}`

**Article Channels**:
- `article:list` - List articles with optional filters
- `article:get` - Get single article by ID
- `article:create` - Create new article
- `article:update` - Update existing article
- `article:delete` - Delete article
- `article:publish` - Publish draft article

**Image Channels**:
- `image:list` - List all images
- `image:upload` - Upload new image
- `image:delete` - Delete image
- `image:get-path` - Get file system path for image

**Hugo Channels**:
- `hugo:build` - Build static site
- `hugo:preview-start` - Start preview server
- `hugo:preview-stop` - Stop preview server
- `hugo:config-get` - Get Hugo configuration
- `hugo:config-update` - Update Hugo configuration

**Deploy Channels**:
- `deploy:execute` - Deploy to Cloudflare Pages
- `deploy:validate` - Validate Cloudflare credentials
- `deploy:status` - Get deployment status

**Style Channels**:
- `style:get` - Get style configuration
- `style:update` - Update style configuration
- `style:export` - Export style configuration
- `style:import` - Import style configuration
- `style:reset` - Reset to default styles
- `style:history-get` - Get style history
- `style:history-restore` - Restore from history

**Config Channels**:
- `config:get` - Get application configuration
- `config:update` - Update application configuration
- `config:window-get` - Get window state
- `config:window-save` - Save window state

#### IPC Message Format

**Request**:
```typescript
interface IPCRequest<T = any> {
  channel: string;
  data?: T;
  requestId: string;
}
```

**Response**:
```typescript
interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  requestId: string;
}
```

## Data Models

### Article Data Model

```typescript
interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  categories: string[];
  author?: string;
  state: 'draft' | 'published';
  createdAt: Date;
  publishedAt?: Date;
  modifiedAt: Date;
  version: number;
  isProtected: boolean;
  passwordHash?: string;
  metadata: ArticleMetadata;
}

interface ArticleMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  author?: string;
  customFields?: Record<string, any>;
}
```

### Image Data Model

```typescript
interface ImageMetadata {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  path: string;
  width?: number;
  height?: number;
}
```

### Hugo Configuration Model

```typescript
interface HugoConfig {
  baseURL: string;
  languageCode: string;
  title: string;
  theme: string;
  params: HugoParams;
}

interface HugoParams {
  description?: string;
  author?: string;
  ShowReadingTime?: boolean;
  ShowShareButtons?: boolean;
  ShowPostNavLinks?: boolean;
  ShowBreadCrumbs?: boolean;
  ShowCodeCopyButtons?: boolean;
  ShowWordCount?: boolean;
  ShowRssButtonInSectionTermList?: boolean;
  UseHugoToc?: boolean;
  disableSpecial1stPost?: boolean;
  disableScrollToTop?: boolean;
  comments?: boolean;
  hidemeta?: boolean;
  hideSummary?: boolean;
  showtoc?: boolean;
  tocopen?: boolean;
  [key: string]: any;
}
```

### Style Configuration Model

```typescript
interface StyleConfiguration {
  version: number;
  hugoConfig: Partial<HugoConfig>;
  colorTheme: ColorTheme;
  layoutSettings: LayoutSettings;
  fontSettings: FontSettings;
  customCSS: string;
}

interface ColorTheme {
  mode: 'light' | 'dark';
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  accentColor: string;
}

interface LayoutSettings {
  homeLayout: 'list' | 'card';
  showSidebar: boolean;
  sidebarContent: string[];
  navigationMenu: MenuItem[];
}

interface MenuItem {
  name: string;
  url: string;
  weight: number;
}

interface FontSettings {
  fontFamily: string;
  headingFontSize: number;
  bodyFontSize: number;
  lineHeight: number;
  letterSpacing: number;
}
```

### Cloudflare Configuration Model

```typescript
interface CloudflareConfig {
  apiToken: string;
  accountId: string;
  projectName: string;
}

interface CloudflareDeployment {
  id: string;
  url: string;
  environment: string;
  createdOn: Date;
  modifiedOn: Date;
  latestStage: {
    name: string;
    status: string;
    startedOn: Date;
    endedOn?: Date;
  };
}
```

### Application Configuration Model

```typescript
interface AppConfig {
  version: string;
  hugoProjectPath: string;
  cloudflare: CloudflareConfig;
  editor: EditorPreferences;
  window: WindowState;
  recentProjects: string[];
}

interface EditorPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
}

interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
  isMaximized: boolean;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all 30 requirements with 100+ acceptance criteria, I identified the following categories of testable properties:

1. **Data Operations**: Article CRUD, image management, configuration management
2. **Serialization**: Hugo frontmatter, JSON config, style export/import
3. **Validation**: File formats, configuration validity, CSS syntax
4. **UI State**: Sorting, filtering, display formatting
5. **File Operations**: Unique filenames, file copying, directory creation

Many UI-specific criteria (button clicks, dialog displays, visual feedback) are better suited for integration tests rather than property-based tests. The properties below focus on core business logic and data transformations that can be universally quantified.

### Property 1: Article List Display Completeness

*For any* article in the system, when displayed in the article list view, the rendered item must include the article's title, creation date, modification date, tags, and categories.

**Validates: Requirements 1.2**

### Property 2: Article List Sorting Correctness

*For any* list of articles and any sort criterion (title, createdAt, modifiedAt), sorting the list by that criterion in ascending order should result in a list where each element is less than or equal to the next element according to that criterion.

**Validates: Requirements 1.3**

### Property 3: Article List Filtering Correctness

*For any* list of articles and any filter text, all articles in the filtered result must have either their title or at least one tag containing the filter text (case-insensitive).

**Validates: Requirements 1.4**

### Property 4: Password Protection Indicator Display

*For any* article where `isProtected` is true, the rendered list item must include a password protection indicator.

**Validates: Requirements 1.5**

### Property 5: Article Editor Field Population

*For any* existing article loaded into the editor, all editable fields (title, content, tags, categories, password protection status) must be populated with the article's current values.

**Validates: Requirements 3.2**

### Property 6: Article Creation Persistence

*For any* valid article data (non-empty title and content), creating an article should result in a Hugo frontmatter file that, when parsed, produces an article with equivalent title and content.

**Validates: Requirements 2.7**

### Property 7: Article Update Preservation

*For any* existing article and any valid updates, updating the article should preserve the original publication timestamp if the article was already published.

**Validates: Requirements 3.3**

### Property 8: Article Deletion Completeness

*For any* article that exists in the system, deleting it should result in the article no longer appearing in the article list and its file being removed from the file system.

**Validates: Requirements 4.2**

### Property 9: Markdown Preview Synchronization

*For any* Markdown content change in the editor, the preview pane should update to reflect the new content within the specified time threshold.

**Validates: Requirements 5.2**

### Property 10: Markdown Rendering Correctness

*For any* standard Markdown syntax element (headers, lists, links, bold, italic, code), the rendered HTML output should correctly represent that element according to CommonMark specification.

**Validates: Requirements 5.3**

### Property 11: Image Format Validation

*For any* file with extension in {.png, .jpg, .jpeg, .gif, .webp}, the image validation should accept it; for any file with extension not in that set, the validation should reject it.

**Validates: Requirements 6.2**

### Property 12: Image Upload File Creation

*For any* valid image file uploaded, the image should be copied to the Hugo project's static/images directory and be accessible at that location.

**Validates: Requirements 6.3**

### Property 13: Image Filename Uniqueness

*For any* set of uploaded images, all generated filenames must be unique (no two images should have the same filename).

**Validates: Requirements 6.6**

### Property 14: Image Metadata Display

*For any* image in the gallery, the displayed metadata must include the filename, file size, and upload date.

**Validates: Requirements 7.4**

### Property 15: Markdown Image Link Format

*For any* image filename, the generated Markdown link must match the format `![alt text](/images/{filename})` where {filename} is the actual image filename.

**Validates: Requirements 8.3**

### Property 16: Image Link Insertion Position

*For any* cursor position in the editor and any image selection, inserting the image link should place the Markdown link text at the cursor position without modifying other content.

**Validates: Requirements 8.2**

### Property 17: Hugo Build Output Generation

*For any* successful Hugo build, the public folder must be created and contain at least an index.html file.

**Validates: Requirements 11.1, 11.2**

### Property 18: Cloudflare Configuration Validation

*For any* Cloudflare configuration with non-empty apiToken, accountId, and projectName, the configuration should be considered valid; otherwise invalid.

**Validates: Requirements 13.7**

### Property 19: Window State Persistence Round-Trip

*For any* window state (width, height, x, y, isMaximized), saving the state and then loading it should produce an equivalent window state.

**Validates: Requirements 14.3, 17.1, 17.3, 17.4**

### Property 20: Configuration Serialization Round-Trip

*For any* valid application configuration, serializing it to JSON and then deserializing should produce an equivalent configuration object.

**Validates: Requirements 17.2, 17.5**

### Property 21: Hugo Config Validation

*For any* Hugo configuration object, if all required fields (baseURL, languageCode, title, theme) are present and non-empty, the configuration should be valid; otherwise invalid.

**Validates: Requirements 21.7**

### Property 22: CSS Syntax Validation

*For any* CSS string, if it can be parsed without syntax errors by a CSS parser, it should be considered valid; otherwise invalid.

**Validates: Requirements 22.5**

### Property 23: Color Theme CSS Generation

*For any* color theme configuration, the generated CSS should contain CSS custom properties for each color (--primary-color, --background-color, --text-color, --link-color, --accent-color) with the specified color values.

**Validates: Requirements 23.7, 23.8**

### Property 24: Font Settings CSS Generation

*For any* font settings configuration, the generated CSS should contain rules for font-family, font-size (for headings and body), line-height, and letter-spacing with the specified values.

**Validates: Requirements 25.7**

### Property 25: Navigation Menu Validation

*For any* menu item, if the URL field is non-empty, it must be either a valid absolute URL (starting with http:// or https://) or a valid relative path (starting with /).

**Validates: Requirements 24.7**

### Property 26: Style Configuration Export-Import Round-Trip

*For any* valid style configuration, exporting it to JSON and then importing should produce an equivalent style configuration.

**Validates: Requirements 28.2, 28.3, 28.6**

### Property 27: Style History Entry Uniqueness

*For any* style history, all history entry IDs must be unique (no two entries should have the same ID).

**Validates: Requirements 30.1, 30.2**

### Property 28: Style History Restoration

*For any* style history entry, restoring from that entry should result in the style configuration matching the configuration stored in that history entry.

**Validates: Requirements 30.6, 30.7**

### Property 29: Hugo Frontmatter Round-Trip

*For any* article object, converting it to Hugo frontmatter format and then parsing it back should produce an article with equivalent title, content, tags, categories, and metadata.

**Validates: Requirements 2.7, 3.3** (implicitly validates serialization correctness)

### Property 30: Image Markdown Link Copy Correctness

*For any* image with filename F, copying the Markdown link should produce a string in the format `![](images/F)` that can be directly inserted into Markdown content.

**Validates: Requirements 7.5**

## Error Handling

### Error Categories

The application handles errors in the following categories:

1. **Validation Errors**: Invalid input data, missing required fields
2. **File System Errors**: File not found, permission denied, disk full
3. **Network Errors**: Cloudflare API failures, connection timeouts
4. **Process Errors**: Hugo build failures, command execution errors
5. **State Errors**: Invalid state transitions, concurrent modification

### Error Handling Strategy

**Validation Errors**:
- Validate input at the UI layer before sending to backend
- Display inline validation messages near the relevant input fields
- Prevent form submission until all validation errors are resolved
- Provide clear, actionable error messages

**File System Errors**:
- Catch all file system exceptions in the service layer
- Log detailed error information for debugging
- Display user-friendly error messages with suggested actions
- Implement retry logic for transient errors (e.g., temporary file locks)

**Network Errors**:
- Implement exponential backoff for API retries
- Display progress indicators during network operations
- Provide clear error messages for different failure scenarios
- Allow users to retry failed operations
- Cache Cloudflare credentials validation results

**Process Errors**:
- Capture stdout and stderr from Hugo process
- Parse Hugo error messages to extract relevant information
- Display build errors in the console with syntax highlighting
- Provide links to Hugo documentation for common errors

**State Errors**:
- Implement optimistic locking for concurrent modifications
- Refresh UI state after failed operations
- Provide clear feedback when operations cannot be performed
- Log state errors for debugging

### Error Response Format

All errors follow a consistent format:

```typescript
interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userMessage: string; // User-friendly message
  suggestedAction?: string; // What the user can do
}
```

### Error Logging

- All errors are logged to a rotating log file
- Log entries include timestamp, error code, message, stack trace, and context
- Log files are stored in the application data directory
- Maximum log file size: 10MB, keep last 5 files
- Sensitive information (passwords, API tokens) is redacted from logs

### User Feedback

**Success Messages**:
- Display as toast notifications
- Auto-dismiss after 3 seconds
- Green color scheme
- Include success icon

**Error Messages**:
- Display as modal dialogs or persistent toast notifications
- Require user acknowledgment (manual dismiss)
- Red color scheme
- Include error icon and suggested action

**Warning Messages**:
- Display as toast notifications
- Auto-dismiss after 5 seconds
- Yellow/orange color scheme
- Include warning icon

**Info Messages**:
- Display as toast notifications
- Auto-dismiss after 3 seconds
- Blue color scheme
- Include info icon

## Testing Strategy

### Dual Testing Approach

The application requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**:
- Specific examples demonstrating correct behavior
- Edge cases and boundary conditions
- Error handling scenarios
- Integration points between components
- UI component rendering and interactions

**Property-Based Tests**:
- Universal properties that hold for all inputs
- Data transformation correctness (serialization, parsing)
- Validation logic across input space
- Sorting and filtering algorithms
- State management invariants

### Property-Based Testing Configuration

**Library**: fast-check (TypeScript/JavaScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: blog-management-gui, Property {N}: {property description}`

**Example Property Test Structure**:

```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Feature: blog-management-gui, Property 1: Article List Display Completeness', () => {
  it('should display all required fields for any article', () => {
    fc.assert(
      fc.property(
        articleArbitrary(),
        (article) => {
          const rendered = renderArticleListItem(article);
          expect(rendered).toContain(article.title);
          expect(rendered).toContain(formatDate(article.createdAt));
          expect(rendered).toContain(formatDate(article.modifiedAt));
          article.tags.forEach(tag => {
            expect(rendered).toContain(tag);
          });
          article.categories.forEach(cat => {
            expect(rendered).toContain(cat);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 30 correctness properties implemented
- **Integration Test Coverage**: Critical user workflows (create article, build, deploy)
- **E2E Test Coverage**: Main application flows using Playwright

### Testing Layers

**1. Unit Tests (Vitest)**:
- Service layer functions
- Data transformation utilities
- Validation logic
- State management reducers
- UI component rendering

**2. Property-Based Tests (fast-check)**:
- All 30 correctness properties
- Serialization round-trips
- Sorting and filtering algorithms
- Validation functions
- Data model invariants

**3. Integration Tests (Vitest)**:
- IPC communication between main and renderer
- File system operations
- Hugo command execution
- Cloudflare API integration
- Configuration persistence

**4. E2E Tests (Playwright)**:
- Complete user workflows
- Cross-component interactions
- Error handling flows
- Performance benchmarks

### Test Data Generation

**Arbitraries for Property Tests**:

```typescript
// Article arbitrary
const articleArbitrary = () => fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  content: fc.string({ minLength: 1, maxLength: 10000 }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
  categories: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }),
  createdAt: fc.date(),
  modifiedAt: fc.date(),
  state: fc.constantFrom('draft', 'published'),
  isProtected: fc.boolean(),
  // ... other fields
});

// Image metadata arbitrary
const imageMetadataArbitrary = () => fc.record({
  filename: fc.string({ minLength: 1, maxLength: 100 }).map(s => s + '.jpg'),
  size: fc.integer({ min: 1, max: 10000000 }),
  uploadedAt: fc.date(),
  // ... other fields
});

// Style configuration arbitrary
const styleConfigArbitrary = () => fc.record({
  colorTheme: fc.record({
    mode: fc.constantFrom('light', 'dark'),
    primaryColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
    // ... other colors
  }),
  // ... other settings
});
```

### Continuous Integration

- Run all tests on every commit
- Fail build if any test fails
- Generate coverage reports
- Run property tests with increased iterations (1000) in CI
- Performance regression tests on main branch

### Test Organization

```
tests/
├── unit/
│   ├── services/
│   │   ├── ArticleService.test.ts
│   │   ├── ImageService.test.ts
│   │   ├── HugoService.test.ts
│   │   ├── DeployService.test.ts
│   │   └── StyleService.test.ts
│   ├── components/
│   │   ├── ArticleListView.test.tsx
│   │   ├── ArticleEditorView.test.tsx
│   │   ├── MarkdownEditor.test.tsx
│   │   └── ImageGalleryView.test.tsx
│   └── utils/
│       ├── validation.test.ts
│       ├── formatting.test.ts
│       └── serialization.test.ts
├── property/
│   ├── article-operations.property.test.ts
│   ├── image-operations.property.test.ts
│   ├── serialization.property.test.ts
│   ├── validation.property.test.ts
│   ├── style-config.property.test.ts
│   └── ui-state.property.test.ts
├── integration/
│   ├── ipc-communication.test.ts
│   ├── file-operations.test.ts
│   ├── hugo-integration.test.ts
│   └── cloudflare-integration.test.ts
└── e2e/
    ├── article-workflow.spec.ts
    ├── image-workflow.spec.ts
    ├── style-workflow.spec.ts
    └── build-deploy-workflow.spec.ts
```


## Implementation Details

### Technology Choices

**Electron Framework**:
- Version: Latest stable (v28+)
- Provides cross-platform desktop application capabilities
- Enables Node.js integration for file system and process operations
- Supports IPC for main-renderer communication

**React Frontend**:
- Version: 18+
- TypeScript for type safety
- Functional components with hooks
- Context API for state management (avoid Redux complexity)

**UI Component Library**:
- Ant Design (antd) recommended for comprehensive component set
- Provides professional desktop application aesthetics
- Built-in form validation and data display components
- Good TypeScript support

**Markdown Editor**:
- CodeMirror 6 recommended
- Excellent performance with large documents
- Extensible with plugins
- Built-in syntax highlighting
- Split-pane view support

**Markdown Rendering**:
- marked.js for parsing
- highlight.js for code syntax highlighting
- DOMPurify for XSS protection
- Custom renderer for Hugo-specific shortcodes

**Build Tool**:
- Vite for fast development and optimized builds
- electron-vite for Electron-specific configuration
- Hot module replacement for rapid development

### Project Structure

```
blog-management-gui/
├── src/
│   ├── main/                    # Main process (Node.js)
│   │   ├── index.ts            # Main process entry point
│   │   ├── ipc/                # IPC handlers
│   │   │   ├── article.ts
│   │   │   ├── image.ts
│   │   │   ├── hugo.ts
│   │   │   ├── deploy.ts
│   │   │   ├── style.ts
│   │   │   └── config.ts
│   │   ├── services/           # Business logic services
│   │   │   ├── ArticleService.ts
│   │   │   ├── ImageService.ts
│   │   │   ├── HugoService.ts
│   │   │   ├── DeployService.ts
│   │   │   ├── StyleService.ts
│   │   │   └── ConfigService.ts
│   │   ├── integrations/       # External integrations
│   │   │   ├── ArticleManager.ts    # From existing backend
│   │   │   ├── HugoIntegration.ts   # From existing backend
│   │   │   ├── PasswordProtector.ts # From existing backend
│   │   │   └── CloudflareClient.ts  # New
│   │   └── utils/              # Utility functions
│   │       ├── file.ts
│   │       ├── process.ts
│   │       └── crypto.ts
│   ├── renderer/               # Renderer process (React)
│   │   ├── index.tsx          # Renderer entry point
│   │   ├── App.tsx            # Root component
│   │   ├── components/        # React components
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Header.tsx
│   │   │   ├── articles/
│   │   │   │   ├── ArticleListView.tsx
│   │   │   │   ├── ArticleEditorView.tsx
│   │   │   │   ├── ArticleListItem.tsx
│   │   │   │   └── ArticleFilters.tsx
│   │   │   ├── editor/
│   │   │   │   ├── MarkdownEditor.tsx
│   │   │   │   ├── EditorToolbar.tsx
│   │   │   │   └── MarkdownPreview.tsx
│   │   │   ├── images/
│   │   │   │   ├── ImageGalleryView.tsx
│   │   │   │   ├── ImageGrid.tsx
│   │   │   │   ├── ImageUpload.tsx
│   │   │   │   └── ImagePreview.tsx
│   │   │   ├── styles/
│   │   │   │   ├── StyleEditorView.tsx
│   │   │   │   ├── ConfigEditor.tsx
│   │   │   │   ├── ColorThemeEditor.tsx
│   │   │   │   ├── LayoutEditor.tsx
│   │   │   │   ├── FontEditor.tsx
│   │   │   │   ├── CSSEditor.tsx
│   │   │   │   ├── StylePreview.tsx
│   │   │   │   └── StyleHistory.tsx
│   │   │   ├── build/
│   │   │   │   ├── BuildDeployView.tsx
│   │   │   │   ├── BuildConsole.tsx
│   │   │   │   ├── BuildControls.tsx
│   │   │   │   └── DeployControls.tsx
│   │   │   ├── settings/
│   │   │   │   ├── SettingsView.tsx
│   │   │   │   ├── CloudflareSettings.tsx
│   │   │   │   └── EditorSettings.tsx
│   │   │   └── common/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Notification.tsx
│   │   │       └── Loading.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useArticles.ts
│   │   │   ├── useImages.ts
│   │   │   ├── useHugo.ts
│   │   │   ├── useDeploy.ts
│   │   │   ├── useStyles.ts
│   │   │   └── useIPC.ts
│   │   ├── contexts/          # React contexts
│   │   │   ├── AppContext.tsx
│   │   │   ├── NotificationContext.tsx
│   │   │   └── ConfigContext.tsx
│   │   ├── utils/             # Utility functions
│   │   │   ├── formatting.ts
│   │   │   ├── validation.ts
│   │   │   └── markdown.ts
│   │   └── styles/            # Global styles
│   │       ├── global.css
│   │       └── themes.css
│   ├── shared/                # Shared between main and renderer
│   │   ├── types/            # TypeScript type definitions
│   │   │   ├── article.ts
│   │   │   ├── image.ts
│   │   │   ├── hugo.ts
│   │   │   ├── style.ts
│   │   │   ├── config.ts
│   │   │   └── ipc.ts
│   │   └── constants/        # Shared constants
│   │       ├── ipc-channels.ts
│   │       └── defaults.ts
│   └── preload/              # Preload scripts
│       └── index.ts          # Exposes IPC to renderer
├── tests/                    # Test files (as described above)
├── resources/                # Application resources
│   ├── icons/               # Application icons
│   └── templates/           # Default templates
├── electron.vite.config.ts  # Vite configuration
├── package.json
├── tsconfig.json
└── README.md
```

### Key Implementation Patterns

#### 1. IPC Communication Pattern

**Main Process Handler**:
```typescript
// src/main/ipc/article.ts
import { ipcMain } from 'electron';
import { ArticleService } from '../services/ArticleService';

export function registerArticleHandlers(articleService: ArticleService) {
  ipcMain.handle('article:list', async (event, filters) => {
    try {
      const articles = await articleService.listArticles(filters);
      return { success: true, data: articles };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      };
    }
  });
  
  // ... other handlers
}
```

**Preload Script**:
```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  article: {
    list: (filters) => ipcRenderer.invoke('article:list', filters),
    get: (id) => ipcRenderer.invoke('article:get', id),
    create: (data) => ipcRenderer.invoke('article:create', data),
    update: (id, updates) => ipcRenderer.invoke('article:update', id, updates),
    delete: (id) => ipcRenderer.invoke('article:delete', id),
  },
  // ... other APIs
});
```

**Renderer Hook**:
```typescript
// src/renderer/hooks/useArticles.ts
export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadArticles = async (filters?: ArticleFilters) => {
    setLoading(true);
    try {
      const response = await window.electronAPI.article.list(filters);
      if (response.success) {
        setArticles(response.data);
      } else {
        throw new Error(response.error.message);
      }
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  
  return { articles, loading, loadArticles };
}
```

#### 2. Service Layer Pattern

```typescript
// src/main/services/ArticleService.ts
export class ArticleService {
  private articleManager: ArticleManager;
  private hugoIntegration: HugoIntegration;
  private passwordProtector: PasswordProtector;
  private hugoProjectPath: string;
  
  constructor(config: ServiceConfig) {
    this.articleManager = new ArticleManager();
    this.hugoIntegration = new HugoIntegration();
    this.passwordProtector = new PasswordProtector(/* repository */);
    this.hugoProjectPath = config.hugoProjectPath;
  }
  
  async createArticle(data: CreateArticleData): Promise<Article> {
    // Create article using ArticleManager
    const article = await this.articleManager.createDraft(
      { title: data.title },
      data.content
    );
    
    // Apply tags and categories
    if (data.tags || data.categories) {
      await this.articleManager.modifyArticle(article.id, {
        tags: data.tags,
        categories: data.categories
      });
    }
    
    // Apply password protection if specified
    if (data.password) {
      await this.passwordProtector.protectArticle(article.id, data.password);
    }
    
    // Generate Hugo file
    const filePath = path.join(
      this.hugoProjectPath,
      'content',
      'posts',
      `${article.id}.md`
    );
    await this.hugoIntegration.generateStaticFile(article, filePath);
    
    return article;
  }
  
  // ... other methods
}
```

#### 3. State Management Pattern

```typescript
// src/renderer/contexts/AppContext.tsx
interface AppState {
  currentView: ViewType;
  notification: Notification | null;
  config: AppConfig | null;
}

type AppAction =
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SHOW_NOTIFICATION'; payload: Notification }
  | { type: 'HIDE_NOTIFICATION' }
  | { type: 'SET_CONFIG'; payload: AppConfig };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SHOW_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'HIDE_NOTIFICATION':
      return { ...state, notification: null };
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
```

### Security Considerations

**1. API Token Storage**:
- Encrypt Cloudflare API tokens using electron-store with encryption
- Never log or display API tokens in plain text
- Clear tokens from memory after use

**2. XSS Prevention**:
- Sanitize all Markdown content before rendering with DOMPurify
- Use React's built-in XSS protection (JSX escaping)
- Validate and sanitize user input

**3. File System Access**:
- Validate all file paths to prevent directory traversal
- Restrict file operations to Hugo project directory
- Validate file types before processing

**4. Process Execution**:
- Sanitize all command arguments
- Use spawn instead of exec to prevent command injection
- Set appropriate timeouts for child processes

**5. IPC Security**:
- Validate all IPC messages
- Use contextBridge to expose limited API surface
- Disable Node.js integration in renderer (use preload script)

### Performance Optimizations

**1. Lazy Loading**:
- Load images in gallery using intersection observer
- Lazy load editor components
- Code split routes

**2. Debouncing**:
- Debounce Markdown preview updates (100ms)
- Debounce search/filter operations (300ms)
- Debounce auto-save (2000ms)

**3. Virtualization**:
- Use virtual scrolling for large article lists
- Virtualize image gallery for many images

**4. Caching**:
- Cache rendered Markdown
- Cache image thumbnails
- Cache Hugo configuration

**5. Background Processing**:
- Run Hugo builds in separate process
- Process image uploads asynchronously
- Generate thumbnails in background

### Deployment and Distribution

**Build Process**:
```bash
# Development
npm run dev

# Build for production
npm run build

# Package for distribution
npm run package:win   # Windows
npm run package:mac   # macOS
npm run package:linux # Linux
```

**Distribution Formats**:
- Windows: NSIS installer (.exe)
- macOS: DMG image (.dmg) and Apple Silicon support
- Linux: AppImage (.appimage), deb, and rpm packages

**Auto-Update**:
- Implement electron-updater for automatic updates
- Check for updates on application start
- Download and install updates in background
- Notify user when update is ready

**Code Signing**:
- Sign Windows executables with code signing certificate
- Sign macOS applications for Gatekeeper
- Notarize macOS applications for distribution

### Accessibility

**Keyboard Navigation**:
- All interactive elements accessible via keyboard
- Logical tab order throughout application
- Keyboard shortcuts for common actions
- Focus indicators visible

**Screen Reader Support**:
- Semantic HTML elements
- ARIA labels for custom components
- ARIA live regions for dynamic content
- Alt text for images

**Visual Accessibility**:
- Sufficient color contrast (WCAG AA)
- Resizable text
- No information conveyed by color alone
- Focus indicators

### Internationalization (Future)

While the initial version focuses on Chinese and English, the architecture supports future internationalization:

- Use i18next for translations
- Separate UI strings into translation files
- Support RTL languages in layout
- Format dates and numbers according to locale

### Monitoring and Logging

**Application Logs**:
- Rotating log files in application data directory
- Log levels: error, warn, info, debug
- Structured logging with context
- Redact sensitive information

**Error Reporting**:
- Catch and log unhandled exceptions
- Capture renderer process errors
- Optional crash reporting (with user consent)
- Include system information in error reports

**Analytics** (Optional):
- Track feature usage (with user consent)
- Monitor performance metrics
- Identify common error patterns
- Privacy-focused analytics

## Conclusion

This design document provides a comprehensive blueprint for implementing the Blog Management GUI application. The architecture emphasizes:

- **Separation of concerns** through layered architecture
- **Type safety** with TypeScript throughout
- **Testability** with property-based and unit testing
- **Maintainability** through clear patterns and structure
- **Security** with proper input validation and token encryption
- **Performance** through optimization techniques
- **User experience** with responsive UI and clear feedback

The implementation will reuse the existing TypeScript blog management backend while providing a modern, cross-platform desktop interface for managing Hugo blogs with comprehensive style editing and Cloudflare Pages deployment capabilities.

