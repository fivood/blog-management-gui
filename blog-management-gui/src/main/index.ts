import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { ConfigService } from './services/ConfigService';
import { ArticleService } from './services/ArticleService';
import { ImageService } from './services/ImageService';
import { HugoService } from './services/HugoService';
import { DeployService } from './services/DeployService';
import { StyleService } from './services/StyleService';
import {
  registerArticleHandlers,
  registerImageHandlers,
  registerHugoHandlers,
  registerDeployHandlers,
  registerStyleHandlers,
  registerConfigHandlers
} from './ipc';

/**
 * Main process entry point
 * Requirements: 14.1-14.5, 17.3
 */

let mainWindow: BrowserWindow | null = null;
let configService: ConfigService;
let articleService: ArticleService;
let imageService: ImageService;
let hugoService: HugoService;
let deployService: DeployService;
let styleService: StyleService;

/**
 * Create main application window
 */
function createWindow(): void {
  // Get saved window state or use defaults
  const windowState = configService.getWindowState();
  
  // Create browser window
  mainWindow = new BrowserWindow({
    width: windowState.width || 1200,
    height: windowState.height || 800,
    minWidth: 800,
    minHeight: 600,
    x: windowState.x,
    y: windowState.y,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    show: false // Don't show until ready
  });

  // Restore maximized state
  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Load renderer
  if (process.env.NODE_ENV === 'development') {
    // Use VITE_DEV_SERVER_URL if available, otherwise default to 5173
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    console.log('Loading dev server from:', devServerUrl);
    mainWindow.loadURL(devServerUrl).catch(err => {
      console.error('Failed to load dev server:', err);
    });
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html')).catch(err => {
      console.error('Failed to load renderer:', err);
    });
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow?.show();
  });

  // Handle load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load page:', errorCode, errorDescription);
  });

  // Handle renderer process crashes
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process gone:', details);
  });

  // Handle console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer console [${level}]:`, message, `(${sourceId}:${line})`);
  });

  // Save window state on close
  mainWindow.on('close', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      const isMaximized = mainWindow.isMaximized();
      
      configService.saveWindowState({
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        isMaximized
      });
    }
  });

  // Clean up on closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}


/**
 * Initialize services
 */
function initializeServices(): void {
  try {
    console.log('Initializing services...');
    
    // Initialize config service
    configService = new ConfigService();
    console.log('ConfigService initialized');
    
    // Get configuration
    const config = configService.getConfig();
    // Use the blog directory in the parent folder as fallback
    const defaultPath = path.join(app.getAppPath(), '..', 'blog');
    const hugoProjectPath = config.hugoProjectPath || defaultPath;
    console.log('Hugo project path:', hugoProjectPath);
    
    // Initialize services with Hugo project path
    articleService = new ArticleService(hugoProjectPath);
    console.log('ArticleService created');
    
    imageService = new ImageService(hugoProjectPath);
    console.log('ImageService created');
    
    hugoService = new HugoService(hugoProjectPath);
    console.log('HugoService created');
    
    styleService = new StyleService(hugoProjectPath);
    console.log('StyleService created');
    
    // Initialize deploy service with Cloudflare config
    deployService = new DeployService(config.cloudflare, hugoProjectPath);
    console.log('DeployService created');
    
    // Initialize article and image services
    articleService.initialize().catch(err => {
      console.error('Failed to initialize ArticleService:', err);
    });
    
    imageService.initialize().catch(err => {
      console.error('Failed to initialize ImageService:', err);
    });
    
    console.log('Services initialization complete');
  } catch (error) {
    console.error('Fatal error during service initialization:', error);
    throw error;
  }
}

/**
 * Register all IPC handlers
 */
function registerIPCHandlers(): void {
  if (!mainWindow) {
    throw new Error('Main window not initialized');
  }
  
  registerArticleHandlers(articleService);
  registerImageHandlers(imageService);
  registerHugoHandlers(hugoService, mainWindow);
  registerDeployHandlers(deployService, mainWindow, configService);
  registerStyleHandlers(styleService);
  registerConfigHandlers(configService, deployService, articleService, imageService, hugoService, styleService);
}

/**
 * App ready event
 */
app.whenReady().then(() => {
  console.log('App is ready');
  
  try {
    // Initialize services
    initializeServices();
    
    // Create window
    createWindow();
    
    // Register IPC handlers
    registerIPCHandlers();
    
    console.log('Application started successfully');
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
  
  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch(error => {
  console.error('App ready failed:', error);
  app.quit();
});

/**
 * Quit when all windows are closed (except on macOS)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Handle app quit
 */
app.on('before-quit', () => {
  // Stop Hugo preview server if running
  if (hugoService.isPreviewServerRunning()) {
    hugoService.stopPreviewServer().catch(err => {
      console.error('Failed to stop preview server:', err);
    });
  }
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Log to file or error reporting service
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // Log to file or error reporting service
});
