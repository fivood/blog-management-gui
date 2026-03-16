# IPC Handlers

This directory contains all IPC (Inter-Process Communication) handlers for the Electron main process. These handlers enable communication between the main process (Node.js) and the renderer process (browser/React).

## Architecture

Each handler module follows a consistent pattern:
1. Register handlers using `ipcMain.handle()` for request-response communication
2. Wrap service calls in try-catch blocks
3. Return standardized `IPCResponse` objects
4. Map errors to appropriate error codes with user-friendly messages

## Handler Modules

### article-handlers.ts
Handles article CRUD operations.

**Channels:**
- `article:list` - List articles with optional filters
- `article:get` - Get single article by ID
- `article:create` - Create new article
- `article:update` - Update existing article
- `article:delete` - Delete article
- `article:publish` - Publish draft article

**Requirements:** 1.1-1.5, 2.1-2.9, 3.1-3.5, 4.1-4.4

### image-handlers.ts
Handles image upload and management.

**Channels:**
- `image:list` - List all images
- `image:upload` - Upload new image
- `image:delete` - Delete image
- `image:get-path` - Get image file path

**Requirements:** 6.1-6.6, 7.1-7.6

### hugo-handlers.ts
Handles Hugo site building and preview.

**Channels:**
- `hugo:build` - Build Hugo site (streams output)
- `hugo:preview-start` - Start preview server
- `hugo:preview-stop` - Stop preview server
- `hugo:config-get` - Get Hugo configuration
- `hugo:config-update` - Update Hugo configuration

**Special Features:**
- Streams build output to renderer via `hugo:build-output` event

**Requirements:** 9.1-9.6, 10.1-10.5, 11.1-11.4, 21.1-21.9

### deploy-handlers.ts
Handles Cloudflare Pages deployment.

**Channels:**
- `deploy:execute` - Execute deployment (streams progress)
- `deploy:validate` - Validate Cloudflare credentials
- `deploy:status` - Get deployment status

**Special Features:**
- Streams deployment progress to renderer via `deploy:progress` event

**Requirements:** 12.1-12.7, 13.1-13.7

### style-handlers.ts
Handles blog style configuration.

**Channels:**
- `style:get` - Get style configuration
- `style:update` - Update style configuration
- `style:export` - Export configuration to JSON
- `style:import` - Import configuration from JSON
- `style:reset` - Reset to default styles
- `style:history-get` - Get style history
- `style:history-restore` - Restore from history

**Requirements:** 21.1-21.9, 22.1-22.8, 23.1-23.8, 24.1-24.7, 25.1-25.7, 28.1-28.7, 29.1-29.6, 30.1-30.7

### config-handlers.ts
Handles application configuration.

**Channels:**
- `config:get` - Get application configuration
- `config:update` - Update configuration
- `config:window-get` - Get window state
- `config:window-save` - Save window state

**Requirements:** 13.1-13.7, 14.1-14.5, 17.1-17.5

## Usage

Import and register all handlers in your main process:

```typescript
import { BrowserWindow } from 'electron';
import {
  registerArticleHandlers,
  registerImageHandlers,
  registerHugoHandlers,
  registerDeployHandlers,
  registerStyleHandlers,
  registerConfigHandlers
} from './ipc';

// Initialize services
const configService = new ConfigService();
const articleService = new ArticleService(hugoProjectPath);
const imageService = new ImageService(hugoProjectPath);
const hugoService = new HugoService(hugoProjectPath);
const deployService = new DeployService(cloudflareConfig, hugoProjectPath);
const styleService = new StyleService(hugoProjectPath);

// Register handlers
registerArticleHandlers(articleService);
registerImageHandlers(imageService);
registerHugoHandlers(hugoService, mainWindow);
registerDeployHandlers(deployService, mainWindow);
registerStyleHandlers(styleService);
registerConfigHandlers(configService);
```

## Response Format

All handlers return a standardized `IPCResponse`:

```typescript
interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  requestId: string;
}
```

### Success Response
```typescript
{
  success: true,
  data: { /* result data */ },
  requestId: "1234567890-abc123"
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Title is required",
    timestamp: "2024-01-01T00:00:00.000Z",
    userMessage: "Invalid article data provided",
    suggestedAction: "Please check all required fields and try again"
  },
  requestId: "1234567890-abc123"
}
```

## Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `FILE_NOT_FOUND` - Requested file/resource not found
- `PERMISSION_DENIED` - Insufficient permissions
- `DISK_FULL` - Not enough disk space
- `NETWORK_ERROR` - Network connectivity issue
- `API_ERROR` - External API error
- `PROCESS_ERROR` - Process execution failed
- `STATE_ERROR` - Invalid application state
- `UNKNOWN_ERROR` - Unexpected error

## Event Streaming

Some handlers stream events to the renderer:

### Build Output Streaming
```typescript
// Main process sends
mainWindow.webContents.send('hugo:build-output', outputLine);

// Renderer receives
window.electronAPI.on('hugo:build-output', (output) => {
  console.log(output);
});
```

### Deployment Progress Streaming
```typescript
// Main process sends
mainWindow.webContents.send('deploy:progress', { progress: 50, message: 'Uploading...' });

// Renderer receives
window.electronAPI.on('deploy:progress', ({ progress, message }) => {
  console.log(`${progress}%: ${message}`);
});
```

## Security

- All handlers validate input data
- File system operations are restricted to Hugo project directory
- API credentials are encrypted in storage
- No direct file system access from renderer
- All operations go through service layer

## Testing

IPC handlers should be tested through integration tests that verify:
- Correct service method calls
- Proper error handling
- Response format compliance
- Event streaming functionality

See `tests/integration/ipc/` for examples.
