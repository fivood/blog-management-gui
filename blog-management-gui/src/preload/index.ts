import { contextBridge, ipcRenderer } from 'electron';
import {
  ARTICLE_LIST,
  ARTICLE_GET,
  ARTICLE_CREATE,
  ARTICLE_UPDATE,
  ARTICLE_DELETE,
  ARTICLE_PUBLISH,
  IMAGE_LIST,
  IMAGE_UPLOAD,
  IMAGE_DELETE,
  IMAGE_GET_PATH,
  HUGO_BUILD,
  HUGO_PREVIEW_START,
  HUGO_PREVIEW_STOP,
  HUGO_CONFIG_GET,
  HUGO_CONFIG_UPDATE,
  DEPLOY_EXECUTE,
  DEPLOY_VALIDATE,
  DEPLOY_STATUS,
  STYLE_GET,
  STYLE_UPDATE,
  STYLE_EXPORT,
  STYLE_IMPORT,
  STYLE_RESET,
  STYLE_HISTORY_GET,
  STYLE_HISTORY_RESTORE,
  CONFIG_GET,
  CONFIG_UPDATE,
  CONFIG_WINDOW_GET,
  CONFIG_WINDOW_SAVE
} from '../shared/constants/ipc-channels';

/**
 * Preload script - Exposes safe IPC API to renderer
 * Requirements: All IPC requirements
 * 
 * Security:
 * - Uses contextBridge for secure API exposure
 * - No direct Node.js access in renderer
 * - Context isolation enabled
 * - Sandbox enabled
 */

// Article API
const articleAPI = {
  list: (filters?: any) => ipcRenderer.invoke(ARTICLE_LIST, filters),
  get: (articleId: string) => ipcRenderer.invoke(ARTICLE_GET, articleId),
  create: (data: any) => ipcRenderer.invoke(ARTICLE_CREATE, data),
  update: (articleId: string, updates: any) => ipcRenderer.invoke(ARTICLE_UPDATE, articleId, updates),
  delete: (articleId: string) => ipcRenderer.invoke(ARTICLE_DELETE, articleId),
  publish: (articleId: string) => ipcRenderer.invoke(ARTICLE_PUBLISH, articleId)
};

// Image API
const imageAPI = {
  list: () => ipcRenderer.invoke(IMAGE_LIST),
  upload: (sourcePath: string, originalName: string) => ipcRenderer.invoke(IMAGE_UPLOAD, sourcePath, originalName),
  uploadBase64: (base64Data: string, filename: string) => ipcRenderer.invoke('image:upload-base64', base64Data, filename),
  delete: (filename: string) => ipcRenderer.invoke(IMAGE_DELETE, filename),
  getPath: (filename: string) => ipcRenderer.invoke(IMAGE_GET_PATH, filename),
  getDataUrl: (filename: string) => ipcRenderer.invoke('image:get-data-url', filename)
};

// Hugo API
const hugoAPI = {
  build: (options?: any) => ipcRenderer.invoke(HUGO_BUILD, options),
  previewStart: (port?: number) => ipcRenderer.invoke(HUGO_PREVIEW_START, port),
  previewStop: () => ipcRenderer.invoke(HUGO_PREVIEW_STOP),
  getConfig: () => ipcRenderer.invoke(HUGO_CONFIG_GET),
  updateConfig: (updates: any) => ipcRenderer.invoke(HUGO_CONFIG_UPDATE, updates),
  onBuildOutput: (callback: (output: string) => void) => {
    ipcRenderer.on('hugo:build-output', (_event, output) => callback(output));
  },
  removeBuildOutputListener: () => {
    ipcRenderer.removeAllListeners('hugo:build-output');
  }
};


// Deploy API
const deployAPI = {
  execute: () => ipcRenderer.invoke(DEPLOY_EXECUTE),
  validate: () => ipcRenderer.invoke(DEPLOY_VALIDATE),
  getStatus: (deploymentId: string) => ipcRenderer.invoke(DEPLOY_STATUS, deploymentId),
  onProgress: (callback: (data: { progress: number; message: string }) => void) => {
    ipcRenderer.on('deploy:progress', (_event, data) => callback(data));
  },
  removeProgressListener: () => {
    ipcRenderer.removeAllListeners('deploy:progress');
  }
};

// Style API
const styleAPI = {
  get: () => ipcRenderer.invoke(STYLE_GET),
  update: (config: any, description?: string) => ipcRenderer.invoke(STYLE_UPDATE, config, description),
  export: () => ipcRenderer.invoke(STYLE_EXPORT),
  import: (jsonString: string) => ipcRenderer.invoke(STYLE_IMPORT, jsonString),
  reset: () => ipcRenderer.invoke(STYLE_RESET),
  getHistory: () => ipcRenderer.invoke(STYLE_HISTORY_GET),
  restoreFromHistory: (historyId: string) => ipcRenderer.invoke(STYLE_HISTORY_RESTORE, historyId)
};

// Config API
const configAPI = {
  get: () => ipcRenderer.invoke(CONFIG_GET),
  update: (updates: any) => ipcRenderer.invoke(CONFIG_UPDATE, updates),
  getWindowState: () => ipcRenderer.invoke(CONFIG_WINDOW_GET),
  saveWindowState: (state: any) => ipcRenderer.invoke(CONFIG_WINDOW_SAVE, state)
};

// Expose API to renderer via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  article: articleAPI,
  image: imageAPI,
  hugo: hugoAPI,
  deploy: deployAPI,
  style: styleAPI,
  config: configAPI
});

// Type definitions for renderer
export interface ElectronAPI {
  article: typeof articleAPI;
  image: typeof imageAPI;
  hugo: typeof hugoAPI;
  deploy: typeof deployAPI;
  style: typeof styleAPI;
  config: typeof configAPI;
}

// Extend Window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
