export interface ThemeInfo {
  name: string;
  displayName: string;
  description: string;
  author: string;
  version: string;
  isActive: boolean;
  repoUrl?: string;
}

export interface ThemeConfig {
  name: string;
  minHugoVersion?: string;
  recommendedParams?: Record<string, any>;
  paramDescriptions?: Record<string, string>;
}

export interface ThemeRegistryEntry {
  name: string;
  url: string;
  description: string;
}
