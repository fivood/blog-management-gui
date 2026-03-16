// Application Configuration Types

export interface AppConfig {
  version: string;
  hugoProjectPath: string;
  cloudflare: CloudflareConfig;
  editor: EditorPreferences;
  window: WindowState;
  recentProjects: string[];
}

export interface CloudflareConfig {
  apiToken: string;
  accountId: string;
  projectName: string;
}

export interface EditorPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
}

export interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
  isMaximized: boolean;
}

export interface CloudflareDeployment {
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

export interface DeployResult {
  success: boolean;
  deploymentId: string;
  url: string;
  error?: string;
}

export interface DeploymentStatus {
  id: string;
  status: 'queued' | 'building' | 'deploying' | 'success' | 'failed';
  url?: string;
}
