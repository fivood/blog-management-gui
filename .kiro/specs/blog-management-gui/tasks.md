# Implementation Plan: Blog Management GUI

## Overview

This plan implements a cross-platform Electron desktop application for managing Hugo-based blogs. The application provides a React-based GUI for article management, image handling, style customization, Hugo site building, and Cloudflare Pages deployment. The implementation reuses existing TypeScript backend modules (ArticleManager, HugoIntegration, PasswordProtector) and follows a layered architecture with IPC communication between main and renderer processes.

## Tasks

- [x] 1. Project setup and infrastructure
  - Initialize Electron + Vite + React + TypeScript project structure
  - Configure electron-vite with main, renderer, and preload configurations
  - Set up TypeScript configurations for each process
  - Install core dependencies: Electron, React 18+, Ant Design, CodeMirror 6, marked.js, highlight.js, DOMPurify
  - Install testing dependencies: Vitest, fast-check, Playwright
  - Create project directory structure as defined in design
  - Set up build scripts for development and production
  - _Requirements: 18.1, 18.2, 18.3_

- [x] 2. Shared types and constants
  - [x] 2.1 Define shared TypeScript types
    - Create article types (Article, ArticleListItem, CreateArticleData, ArticleUpdate, ArticleFilters, ArticleMetadata)
    - Create image types (ImageMetadata, ImageItem)
    - Create Hugo types (HugoConfig, HugoParams, BuildOptions, BuildResult, BuildStats, PreviewServer)
    - Create style types (StyleConfiguration, ColorTheme, LayoutSettings, FontSettings, MenuItem)
    - Create config types (AppConfig, CloudflareConfig, EditorPreferences, WindowState)
    - Create IPC types (IPCRequest, IPCResponse, ErrorResponse)
    - _Requirements: 1.2, 2.2-2.6, 6.2, 9.5, 13.2-13.4, 14.1-14.4, 17.2, 21.2-21.6, 23.2-23.5, 25.2-25.5_
  
  - [ ]* 2.2 Write property test for configuration serialization
    - **Property 20: Configuration Serialization Round-Trip**
    - **Validates: Requirements 17.2, 17.5**
  
  - [x] 2.3 Define IPC channel constants
    - Create constants for all article, image, hugo, deploy, style, and config channels
    - _Requirements: All IPC communication requirements_

- [ ] 3. Main process: Service layer implementation
  - [x] 3.1 Implement ConfigService
    - Create ConfigService class with getConfig, updateConfig, getWindowState, saveWindowState methods
    - Use electron-store for persistent configuration storage with encryption for sensitive data
    - Implement default configuration values
    - _Requirements: 13.5, 14.3, 17.1-17.5_
  
  - [ ]* 3.2 Write property test for window state persistence
    - **Property 19: Window State Persistence Round-Trip**
    - **Validates: Requirements 14.3, 17.1, 17.3, 17.4**
  
  - [x] 3.3 Implement ArticleService
    - Create ArticleService class wrapping ArticleManager and HugoIntegration
    - Implement listArticles with filtering support
    - Implement getArticle, createArticle, updateArticle, deleteArticle methods
    - Integrate PasswordProtector for password-protected articles
    - Generate Hugo frontmatter files in content/posts directory
    - _Requirements: 1.1-1.5, 2.1-2.9, 3.1-3.5, 4.1-4.4_
  
  - [ ]* 3.4 Write property tests for article operations
    - **Property 6: Article Creation Persistence**
    - **Validates: Requirements 2.7**
    - **Property 7: Article Update Preservation**
    - **Validates: Requirements 3.3**
    - **Property 8: Article Deletion Completeness**
    - **Validates: Requirements 4.2**
    - **Property 29: Hugo Frontmatter Round-Trip**
    - **Validates: Requirements 2.7, 3.3**
  
  - [x] 3.5 Implement ImageService
    - Create ImageService class for image management
    - Implement listImages to scan static/images directory
    - Implement uploadImage with format validation (PNG, JPG, JPEG, GIF, WebP)
    - Generate unique filenames using timestamp + random string
    - Copy images to Hugo project static/images directory
    - Implement deleteImage with file system cleanup
    - _Requirements: 6.1-6.6, 7.1-7.6, 8.1-8.4_
  
  - [ ]* 3.6 Write property tests for image operations
    - **Property 11: Image Format Validation**
    - **Validates: Requirements 6.2**
    - **Property 12: Image Upload File Creation**
    - **Validates: Requirements 6.3**
    - **Property 13: Image Filename Uniqueness**
    - **Validates: Requirements 6.6**
  
  - [x] 3.7 Implement HugoService
    - Create HugoService class for Hugo operations
    - Implement build method executing `hugo --minify` command with child_process.spawn
    - Capture stdout/stderr and parse build output
    - Implement startPreviewServer executing `hugo server` command
    - Implement stopPreviewServer to kill preview process
    - Implement getConfig to read hugo.toml file
    - Implement updateConfig to write hugo.toml file with validation
    - _Requirements: 9.1-9.6, 10.1-10.5, 11.1-11.4, 21.1-21.9_
  
  - [ ]* 3.8 Write property tests for Hugo operations
    - **Property 17: Hugo Build Output Generation**
    - **Validates: Requirements 11.1, 11.2**
    - **Property 21: Hugo Config Validation**
    - **Validates: Requirements 21.7**
  
  - [x] 3.9 Implement CloudflareClient
    - Create CloudflareClient class for Cloudflare Pages API integration
    - Implement authentication with API token
    - Implement uploadFiles method to deploy public folder contents
    - Implement getDeploymentStatus method
    - Implement validateCredentials method
    - Handle API errors and rate limiting
    - _Requirements: 12.1-12.7, 13.1-13.7_
  
  - [ ]* 3.10 Write property test for Cloudflare configuration
    - **Property 18: Cloudflare Configuration Validation**
    - **Validates: Requirements 13.7**
  
  - [x] 3.11 Implement DeployService
    - Create DeployService class wrapping CloudflareClient
    - Implement deploy method coordinating upload and status checking
    - Implement progress tracking for deployment
    - _Requirements: 12.1-12.7_
  
  - [x] 3.12 Implement StyleService
    - Create StyleService class for style configuration management
    - Implement getStyleConfig to read current configuration
    - Implement updateStyleConfig to write hugo.toml and custom CSS
    - Generate CSS from color theme settings (CSS custom properties)
    - Generate CSS from font settings
    - Implement exportStyleConfig to JSON
    - Implement importStyleConfig from JSON with validation
    - Implement resetToDefault to restore PaperMod defaults
    - Implement style history tracking (last 20 changes)
    - Implement getStyleHistory and restoreFromHistory methods
    - _Requirements: 21.1-21.9, 22.1-22.8, 23.1-23.8, 24.1-24.7, 25.1-25.7, 28.1-28.7, 29.1-29.6, 30.1-30.7_
  
  - [ ]* 3.13 Write property tests for style operations
    - **Property 23: Color Theme CSS Generation**
    - **Validates: Requirements 23.7, 23.8**
    - **Property 24: Font Settings CSS Generation**
    - **Validates: Requirements 25.7**
    - **Property 25: Navigation Menu Validation**
    - **Validates: Requirements 24.7**
    - **Property 26: Style Configuration Export-Import Round-Trip**
    - **Validates: Requirements 28.2, 28.3, 28.6**
    - **Property 27: Style History Entry Uniqueness**
    - **Validates: Requirements 30.1, 30.2**
    - **Property 28: Style History Restoration**
    - **Validates: Requirements 30.6, 30.7**
    - **Property 22: CSS Syntax Validation**
    - **Validates: Requirements 22.5**

- [ ] 4. Main process: IPC handlers
  - [x] 4.1 Implement article IPC handlers
    - Register handlers for article:list, article:get, article:create, article:update, article:delete
    - Wrap service calls with try-catch and return IPCResponse format
    - _Requirements: 1.1-1.5, 2.1-2.9, 3.1-3.5, 4.1-4.4_
  
  - [x] 4.2 Implement image IPC handlers
    - Register handlers for image:list, image:upload, image:delete, image:get-path
    - Handle file upload from renderer process
    - _Requirements: 6.1-6.6, 7.1-7.6_
  
  - [x] 4.3 Implement Hugo IPC handlers
    - Register handlers for hugo:build, hugo:preview-start, hugo:preview-stop, hugo:config-get, hugo:config-update
    - Stream build output to renderer using IPC events
    - _Requirements: 9.1-9.6, 10.1-10.5, 11.1-11.4, 21.1-21.9_
  
  - [x] 4.4 Implement deploy IPC handlers
    - Register handlers for deploy:execute, deploy:validate, deploy:status
    - Stream deployment progress to renderer
    - _Requirements: 12.1-12.7, 13.1-13.7_
  
  - [x] 4.5 Implement style IPC handlers
    - Register handlers for style:get, style:update, style:export, style:import, style:reset, style:history-get, style:history-restore
    - _Requirements: 21.1-21.9, 22.1-22.8, 23.1-23.8, 24.1-24.7, 25.1-25.7, 28.1-28.7, 29.1-29.6, 30.1-30.7_
  
  - [x] 4.6 Implement config IPC handlers
    - Register handlers for config:get, config:update, config:window-get, config:window-save
    - _Requirements: 13.1-13.7, 14.1-14.5, 17.1-17.5_

- [ ] 5. Main process: Application window and lifecycle
  - [x] 5.1 Implement main process entry point
    - Create BrowserWindow with default size 1200x800 and minimum size 800x600
    - Load renderer HTML
    - Register all IPC handlers
    - Initialize services with configuration
    - Handle app lifecycle events (ready, window-all-closed, activate)
    - Restore window state from configuration
    - Save window state on close
    - _Requirements: 14.1-14.5, 17.3_
  
  - [x] 5.2 Implement preload script
    - Use contextBridge to expose electronAPI to renderer
    - Create API objects for article, image, hugo, deploy, style, config
    - Disable Node.js integration in renderer for security
    - _Requirements: All IPC requirements_

- [x] 6. Renderer: Context and state management
  - [x] 6.1 Create AppContext
    - Define AppState with currentView, notification, config
    - Implement appReducer for state transitions
    - Create AppProvider component
    - _Requirements: 15.1-15.5, 16.1-16.5_
  
  - [x] 6.2 Create NotificationContext
    - Implement notification queue management
    - Support success (3s auto-dismiss), error (manual dismiss), warning (5s), info (3s) types
    - _Requirements: 16.1-16.5_
  
  - [x] 6.3 Create custom hooks
    - Implement useArticles hook for article operations
    - Implement useImages hook for image operations
    - Implement useHugo hook for build operations
    - Implement useDeploy hook for deployment operations
    - Implement useStyles hook for style operations
    - Implement useIPC hook for generic IPC communication
    - _Requirements: All feature requirements_

- [x] 7. Renderer: Layout components
  - [x] 7.1 Implement App root component
    - Set up AppProvider and routing
    - Render AppShell with current view
    - Handle global error boundary
    - _Requirements: 15.1-15.5_
  
  - [x] 7.2 Implement AppShell component
    - Create layout with Sidebar and main content area
    - Display Header with app title and current view name
    - Render notification toasts
    - _Requirements: 15.1-15.5_
  
  - [x] 7.3 Implement Sidebar component
    - Display navigation menu with items: Articles, Images, Styles, Build & Deploy, Settings
    - Highlight active navigation item
    - Handle navigation clicks to change view
    - _Requirements: 15.1-15.5_
  
  - [x] 7.4 Implement Header component
    - Display application title and current view name
    - Show loading indicator when operations in progress
    - _Requirements: 15.5_

- [x] 8. Renderer: Article management components
  - [x] 8.1 Implement ArticleListView component
    - Display articles in table with columns: title, created date, modified date, tags, categories, protected indicator
    - Implement sort controls for title, createdAt, modifiedAt (ascending/descending)
    - Implement search/filter input for title and tags
    - Implement tag and category filter dropdowns
    - Add "New Article" button
    - Add edit and delete action buttons for each article
    - Load articles on mount using useArticles hook
    - _Requirements: 1.1-1.5, 2.1, 4.1_
  
  - [ ]* 8.2 Write property tests for article list operations
    - **Property 1: Article List Display Completeness**
    - **Validates: Requirements 1.2**
    - **Property 2: Article List Sorting Correctness**
    - **Validates: Requirements 1.3**
    - **Property 3: Article List Filtering Correctness**
    - **Validates: Requirements 1.4**
    - **Property 4: Password Protection Indicator Display**
    - **Validates: Requirements 1.5**
  
  - [x] 8.3 Implement ArticleEditorView component
    - Create form with title input, tags input (multi-select), categories dropdown, password protection checkbox and password input
    - Integrate MarkdownEditor component for content editing
    - Add Save and Cancel buttons
    - Load article data if editing existing article (articleId prop provided)
    - Validate required fields (title, content) before save
    - Call article:create or article:update IPC based on mode
    - Show success notification and navigate back to list on save
    - Show error notification on failure
    - Implement keyboard shortcut Ctrl/Cmd+S for save
    - _Requirements: 2.1-2.9, 3.1-3.5, 20.2_
  
  - [ ]* 8.4 Write property test for article editor
    - **Property 5: Article Editor Field Population**
    - **Validates: Requirements 3.2**

- [x] 9. Renderer: Markdown editor components
  - [x] 9.1 Implement MarkdownEditor component
    - Create split-pane layout with CodeMirror 6 editor on left and preview on right
    - Configure CodeMirror with Markdown syntax highlighting
    - Add EditorToolbar with common formatting buttons and "Insert Image" button
    - Debounce content changes (100ms) before updating preview
    - Render preview using MarkdownPreview component
    - _Requirements: 5.1-5.5, 8.1-8.4, 19.3_
  
  - [ ]* 9.2 Write property tests for Markdown operations
    - **Property 9: Markdown Preview Synchronization**
    - **Validates: Requirements 5.2**
    - **Property 10: Markdown Rendering Correctness**
    - **Validates: Requirements 5.3**
    - **Property 16: Image Link Insertion Position**
    - **Validates: Requirements 8.2**
  
  - [x] 9.3 Implement MarkdownPreview component
    - Parse Markdown using marked.js
    - Apply syntax highlighting with highlight.js
    - Sanitize HTML output with DOMPurify
    - Render sanitized HTML
    - _Requirements: 5.1-5.5_
  
  - [x] 9.4 Implement EditorToolbar component
    - Add buttons for bold, italic, heading, list, link, code block
    - Add "Insert Image" button that opens ImageGalleryView in selection mode
    - Apply formatting by inserting Markdown syntax at cursor position
    - _Requirements: 8.1-8.4_

- [x] 10. Renderer: Image management components
  - [x] 10.1 Implement ImageGalleryView component
    - Display images in grid layout using ImageGrid component
    - Add ImageUpload component for uploading new images
    - Support selection mode (selectionMode prop) for inserting into editor
    - Load images on mount using useImages hook
    - Show ImagePreview modal when image clicked
    - Implement lazy loading for performance
    - _Requirements: 6.1-6.6, 7.1-7.6, 8.1-8.4, 19.4_
  
  - [ ]* 10.2 Write property tests for image operations
    - **Property 14: Image Metadata Display**
    - **Validates: Requirements 7.4**
    - **Property 15: Markdown Image Link Format**
    - **Validates: Requirements 8.3**
    - **Property 30: Image Markdown Link Copy Correctness**
    - **Validates: Requirements 7.5**
  
  - [x] 10.3 Implement ImageGrid component
    - Display images as thumbnails in responsive grid
    - Show filename, size, upload date for each image
    - Add "Copy Markdown Link" button for each image
    - Add "Delete" button for each image with confirmation dialog
    - Handle image selection in selection mode
    - _Requirements: 7.1-7.6_
  
  - [x] 10.4 Implement ImageUpload component
    - Create file input accepting image formats (PNG, JPG, JPEG, GIF, WebP)
    - Support drag-and-drop upload
    - Show upload progress indicator
    - Call image:upload IPC on file selection
    - Show success/error notification
    - Refresh image list after successful upload
    - _Requirements: 6.1-6.6_
  
  - [x] 10.5 Implement ImagePreview component
    - Display full-size image in modal
    - Show image metadata (filename, size, upload date, dimensions)
    - Add "Copy Markdown Link" and "Delete" buttons
    - Close modal on outside click or ESC key
    - _Requirements: 7.3, 7.4_

- [x] 11. Renderer: Style editor components
  - [x] 11.1 Implement StyleEditorView component
    - Create tabbed interface with tabs: Config, Colors, Layout, Fonts, Custom CSS
    - Display StylePreview component in side panel
    - Add device mode switcher (desktop/tablet/mobile) for preview
    - Add page type switcher (home/article/list) for preview
    - Add "Export Config", "Import Config", "Reset to Default" buttons
    - Load style configuration on mount using useStyles hook
    - Track isDirty state for unsaved changes
    - _Requirements: 21.1-21.9, 22.1-22.8, 23.1-23.8, 24.1-24.7, 25.1-25.7, 26.1-26.6, 27.1-27.5, 28.1-28.7, 29.1-29.6, 30.1-30.7_
  
  - [x] 11.2 Implement ConfigEditor component (Hugo config tab)
    - Add inputs for site title, description, author, language
    - Add inputs for PaperMod theme parameters
    - Validate required fields
    - Update styleConfig state on changes
    - _Requirements: 21.1-21.9_
  
  - [x] 11.3 Implement ColorThemeEditor component
    - Add preset theme selector (light/dark)
    - Add color pickers for primary, background, text, link, accent colors
    - Update styleConfig.colorTheme on changes
    - Debounce updates to preview (500ms)
    - _Requirements: 23.1-23.8, 26.2_
  
  - [x] 11.4 Implement LayoutEditor component
    - Add home layout mode selector (list/card)
    - Add sidebar content configuration checkboxes
    - Add navigation menu editor with add/remove/reorder functionality
    - Validate menu item URLs (must start with http://, https://, or /)
    - Update styleConfig.layoutSettings on changes
    - _Requirements: 24.1-24.7_
  
  - [x] 11.5 Implement FontEditor component
    - Add font family dropdown with common web fonts
    - Add sliders for heading font size (16-48px), body font size (12-24px), line height (1.0-2.5), letter spacing (-0.05em to 0.2em)
    - Display current values next to sliders
    - Update styleConfig.fontSettings on changes
    - _Requirements: 25.1-25.7_
  
  - [x] 11.6 Implement CSSEditor component
    - Integrate CodeMirror 6 with CSS syntax highlighting
    - Add CSS syntax validation
    - Highlight syntax errors
    - Support undo/redo
    - Update styleConfig.customCSS on changes
    - _Requirements: 22.1-22.8_
  
  - [x] 11.7 Implement StylePreview component
    - Render iframe with Hugo preview
    - Apply current style configuration to preview
    - Support device mode switching (1200px/768px/375px width)
    - Support page type switching (load different sample content)
    - Animate width transitions (300ms)
    - Update preview when styleConfig changes (debounced 500ms)
    - _Requirements: 26.1-26.6, 27.1-27.5_
  
  - [x] 11.8 Implement StyleHistory component
    - Display list of last 20 style changes with timestamp and description
    - Show preview of selected history entry
    - Add "Restore to This Version" button
    - Call style:history-restore IPC on restore
    - _Requirements: 30.1-30.7_
  
  - [x] 11.9 Implement style save/export/import/reset functionality
    - Save button calls style:update IPC with current styleConfig
    - Export button calls style:export IPC and downloads JSON file
    - Import button opens file dialog, reads JSON, validates, calls style:import IPC
    - Reset button shows confirmation dialog, calls style:reset IPC
    - Show success/error notifications for all operations
    - _Requirements: 21.8-21.9, 22.6-22.7, 23.8, 25.7, 28.1-28.7, 29.1-29.6_

- [x] 12. Renderer: Build and deploy components
  - [x] 12.1 Implement BuildDeployView component
    - Display BuildControls and DeployControls components
    - Display BuildConsole component for output logs
    - Show build status and statistics
    - Show preview server status and URL
    - Show deployment status and URL
    - _Requirements: 9.1-9.6, 10.1-10.5, 11.1-11.4, 12.1-12.7_
  
  - [x] 12.2 Implement BuildControls component
    - Add "Build Website" button (keyboard shortcut Ctrl/Cmd+B)
    - Add "Preview Website" button (keyboard shortcut Ctrl/Cmd+P)
    - Add "Stop Preview" button
    - Add "Open Public Folder" button
    - Disable buttons appropriately based on build/preview status
    - Call hugo:build, hugo:preview-start, hugo:preview-stop IPCs
    - Show build progress indicator
    - Display build statistics (page count, duration) on success
    - _Requirements: 9.1-9.6, 10.1-10.5, 11.1-11.4, 20.3, 20.4_
  
  - [x] 12.3 Implement BuildConsole component
    - Display build output logs in scrollable text area
    - Apply syntax highlighting to error messages
    - Auto-scroll to bottom as new logs arrive
    - Highlight error lines in red
    - _Requirements: 9.4, 9.6_
  
  - [x] 12.4 Implement DeployControls component
    - Add "Deploy to Cloudflare" button
    - Show deployment progress indicator
    - Display deployment status and website URL on success
    - Call deploy:execute IPC
    - Show error message on failure
    - _Requirements: 12.1-12.7_

- [x] 13. Renderer: Settings components
  - [x] 13.1 Implement SettingsView component
    - Create form sections for Hugo project path, Cloudflare credentials, editor preferences
    - Add CloudflareSettings and EditorSettings components
    - Load configuration on mount
    - Save configuration on changes
    - _Requirements: 13.1-13.7, 14.1-14.5, 17.1-17.5, 20.5_
  
  - [x] 13.2 Implement CloudflareSettings component
    - Add inputs for API token (password field), account ID, project name
    - Add "Validate Credentials" button
    - Call deploy:validate IPC on validate
    - Show validation result
    - Call config:update IPC on save
    - _Requirements: 13.1-13.7_
  
  - [x] 13.3 Implement EditorSettings component
    - Add theme selector (light/dark)
    - Add number inputs for font size, tab size
    - Add checkboxes for word wrap, line numbers, auto-save
    - Add number input for auto-save delay
    - Call config:update IPC on changes
    - _Requirements: 17.1-17.5_

- [ ] 14. Renderer: Common components and utilities
  - [ ] 14.1 Implement common UI components
    - Create reusable Button, Input, Modal, Loading components
    - Ensure keyboard accessibility and ARIA labels
    - _Requirements: 16.1-16.5_
  
  - [ ] 14.2 Implement utility functions
    - Create formatting utilities (formatDate, formatFileSize)
    - Create validation utilities (validateEmail, validateURL, validateCSS)
    - Create Markdown utilities (parseMarkdown, sanitizeHTML)
    - _Requirements: Various validation and display requirements_
  
  - [ ] 14.3 Implement keyboard shortcut handling
    - Register global keyboard shortcuts (Ctrl/Cmd+N, S, B, P, ,)
    - Handle shortcuts in appropriate contexts
    - Display shortcut hints in UI
    - _Requirements: 20.1-20.6_
  
  - [ ] 14.4 Implement error handling and logging
    - Create error boundary component
    - Implement client-side error logging
    - Format error messages for display
    - _Requirements: 16.1-16.5_

- [ ] 15. Integration and wiring
  - [ ] 15.1 Wire all components together
    - Connect all views to AppShell routing
    - Ensure IPC communication works end-to-end
    - Test all user workflows
    - _Requirements: All requirements_
  
  - [ ] 15.2 Implement application initialization
    - Load configuration on startup
    - Restore window state
    - Initialize all services
    - Handle first-run setup
    - _Requirements: 14.3, 17.3, 19.5_
  
  - [ ] 15.3 Implement error recovery
    - Handle service initialization failures
    - Provide fallback for missing Hugo project
    - Handle network failures gracefully
    - _Requirements: 16.1-16.5_
  
  - [ ]* 15.4 Write integration tests
    - Test IPC communication between main and renderer
    - Test file system operations
    - Test Hugo integration
    - Test Cloudflare API integration

- [ ] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Build and packaging setup
  - [ ] 17.1 Configure electron-builder
    - Set up build configuration for Windows (NSIS), macOS (DMG), Linux (AppImage, deb, rpm)
    - Configure code signing for Windows and macOS
    - Set up auto-updater with electron-updater
    - _Requirements: 18.1-18.5_
  
  - [ ] 17.2 Create application icons
    - Design and create icons for all platforms
    - Generate icon files in required formats
    - _Requirements: 18.1-18.5_
  
  - [ ] 17.3 Test builds on all platforms
    - Build and test Windows installer
    - Build and test macOS DMG (Intel and Apple Silicon)
    - Build and test Linux packages
    - _Requirements: 18.1-18.5_

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- The implementation reuses existing TypeScript backend modules (ArticleManager, HugoIntegration, PasswordProtector)
- All IPC communication follows the request-response pattern defined in the design
- Security considerations include API token encryption, XSS prevention, and file system access validation
- Performance optimizations include debouncing, lazy loading, and virtualization
