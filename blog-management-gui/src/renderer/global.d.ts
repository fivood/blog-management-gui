/**
 * Global type definitions for renderer process
 * Extends Window interface with electronAPI
 */

import type { 
  ArticleListItem, 
  Article, 
  CreateArticleData, 
  ArticleUpdate, 
  ArticleFilters,
  ImageMetadata,
  HugoConfig,
  BuildOptions,
  BuildResult,
  PreviewServer,
  DeployResult,
  DeploymentStatus,
  StyleConfiguration,
  IPCResponse
} from '../shared/types';

declare global {
  interface Window {
    electronAPI: {
      article: {
        list: (filters?: ArticleFilters) => Promise<IPCResponse<ArticleListItem[]>>;
        get: (articleId: string) => Promise<IPCResponse<Article>>;
        create: (data: CreateArticleData) => Promise<IPCResponse<Article>>;
        update: (articleId: string, updates: ArticleUpdate) => Promise<IPCResponse<Article>>;
        delete: (articleId: string) => Promise<IPCResponse<void>>;
        publish: (articleId: string) => Promise<IPCResponse<Article>>;
      };
      image: {
        list: () => Promise<IPCResponse<ImageMetadata[]>>;
        upload: (sourcePath: string, originalName: string) => Promise<IPCResponse<ImageMetadata>>;
        delete: (filename: string) => Promise<IPCResponse<void>>;
        getPath: (filename: string) => Promise<IPCResponse<string>>;
        getDataUrl: (filename: string) => Promise<IPCResponse<string>>;
      };
      hugo: {
        build: (options?: BuildOptions) => Promise<IPCResponse<BuildResult>>;
        previewStart: (port?: number) => Promise<IPCResponse<PreviewServer>>;
        previewStop: () => Promise<IPCResponse<void>>;
        getConfig: () => Promise<IPCResponse<HugoConfig>>;
        updateConfig: (updates: Partial<HugoConfig>) => Promise<IPCResponse<void>>;
        onBuildOutput: (callback: (output: string) => void) => void;
        removeBuildOutputListener: () => void;
      };
      deploy: {
        execute: () => Promise<IPCResponse<DeployResult>>;
        validate: () => Promise<IPCResponse<boolean>>;
        getStatus: (deploymentId: string) => Promise<IPCResponse<DeploymentStatus>>;
        onProgress: (callback: (data: { progress: number; message: string }) => void) => void;
        removeProgressListener: () => void;
      };
      style: {
        get: () => Promise<IPCResponse<StyleConfiguration>>;
        update: (config: Partial<StyleConfiguration>, description?: string) => Promise<IPCResponse<void>>;
        export: () => Promise<IPCResponse<string>>;
        import: (jsonString: string) => Promise<IPCResponse<void>>;
        reset: () => Promise<IPCResponse<void>>;
        getHistory: () => Promise<IPCResponse<any[]>>;
        restoreFromHistory: (historyId: string) => Promise<IPCResponse<void>>;
      };
      config: {
        get: () => Promise<IPCResponse<any>>;
        update: (updates: any) => Promise<IPCResponse<void>>;
        getWindowState: () => Promise<IPCResponse<any>>;
        saveWindowState: (state: any) => Promise<IPCResponse<void>>;
      };
    };
  }
}

export {};
