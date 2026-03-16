# Main Process

This directory contains the Electron main process code, which runs in Node.js and has full access to system resources.

## Architecture

The main process follows a layered architecture:

```
Main Process (index.ts)
    ↓
IPC Handlers (ipc/)
    ↓
Services (services/)
    ↓
Integrations (integrations/)
```

## Entry Point (index.ts)

The main entry point handles:

- **Window Management**: Create and manage the main application window
- **Service Initialization**: Initialize all services with configuration
- **IPC Registration**: Register all IPC handlers for renderer communication
- **Lifecycle Management**: Handle app events (ready, quit, activate)
- **Window State Persistence**: Save and restore window size/position
- **Error Handling**: Global error and rejection handlers

### Window Configuration

- Default size: 1200x800
- Minimum size: 800x600
- Restores previous size and position
- Restores maximized state
- Security: Context isolation, sandbox, no Node integration

### Service Initialization

Services are initialized in this order:
1. ConfigService - Load application configuration
2. ArticleService - Initialize with Hugo project path
3. ImageService - Initialize with Hugo project path
4. HugoService - Initialize with Hugo project path
5. DeployService - Initialize with Cloudflare config
6. StyleService - Initialize with Hugo project path

## Preload Script (preload/index.ts)

The preload script bridges the main and renderer processes securely:

### Security Features

- **Context Isolation**: Renderer has no direct access to Node.js
- **Context Bridge**: Safe API exposure via `window.electronAPI`
- **Sandbox**: Renderer runs in sandboxed environment
- **No Node Integration**: Prevents security vulnerabilities

### Exposed API

The preload script exposes a typed API to the renderer:

```typescript
window.electronAPI = {
  article: {
    list, get, create, update, delete, publish
  },
  image: {
    list, upload, delete, getPath
  },
  hugo: {
    build, previewStart, previewStop, getConfig, updateConfig,
    onBuildOutput, removeBuildOutputListener
  },
  deploy: {
    execute, validate, getStatus,
    onProgress, removeProgressListener
  },
  style: {
    get, update, export, import, reset,
    getHistory, restoreFromHistory
  },
  config: {
    get, update, getWindowState, saveWindowState
  }
}
```

### Event Listeners

The preload script provides event listeners for streaming data:

**Build Output:**
```typescript
window.electronAPI.hugo.onBuildOutput((output) => {
  console.log(output);
});
```

**Deployment Progress:**
```typescript
window.electronAPI.deploy.onProgress(({ progress, message }) => {
  console.log(`${progress}%: ${message}`);
});
```

## Directory Structure

```
src/main/
├── index.ts              # Main process entry point
├── services/             # Business logic services
│   ├── ConfigService.ts
│   ├── ArticleService.ts
│   ├── ImageService.ts
│   ├── HugoService.ts
│   ├── DeployService.ts
│   └── StyleService.ts
├── integrations/         # External API integrations
│   └── CloudflareClient.ts
└── ipc/                  # IPC handlers
    ├── article-handlers.ts
    ├── image-handlers.ts
    ├── hugo-handlers.ts
    ├── deploy-handlers.ts
    ├── style-handlers.ts
    └── config-handlers.ts

src/preload/
└── index.ts              # Preload script
```

## Development

### Running in Development

The main process automatically detects development mode and:
- Loads renderer from `http://localhost:5173` (Vite dev server)
- Opens DevTools automatically
- Enables hot module replacement

### Production Build

In production:
- Loads renderer from bundled HTML file
- DevTools disabled
- Optimized for performance

## Error Handling

### Global Error Handlers

The main process catches:
- Uncaught exceptions
- Unhandled promise rejections
- Service initialization errors

Errors are logged to console and can be sent to error reporting services.

### Graceful Shutdown

On app quit:
- Stops Hugo preview server if running
- Saves window state
- Cleans up resources

## Security Best Practices

1. **No Node Integration**: Renderer cannot access Node.js APIs
2. **Context Isolation**: Renderer and preload run in separate contexts
3. **Sandbox**: Renderer runs in Chromium sandbox
4. **Context Bridge**: Only explicitly exposed APIs are available
5. **Input Validation**: All IPC inputs are validated in handlers
6. **File System Restrictions**: Operations limited to Hugo project directory

## Configuration

The main process reads configuration from:
- `~/.config/blog-management-gui/config.json` (via electron-store)
- Environment variables for development settings

## Logging

Logs are written to:
- Console (development)
- Application log directory (production)
  - Windows: `%APPDATA%/blog-management-gui/logs`
  - macOS: `~/Library/Logs/blog-management-gui`
  - Linux: `~/.config/blog-management-gui/logs`

## Testing

Main process code should be tested with:
- Unit tests for services (Vitest)
- Integration tests for IPC handlers
- E2E tests for full application flow (Playwright)

See `tests/` directory for examples.
