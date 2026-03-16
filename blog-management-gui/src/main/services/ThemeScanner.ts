import * as path from 'path';
import * as fs from 'fs/promises';
import { ThemeInfo } from '../../shared/types/theme';
import { GitSubmoduleManager } from './GitSubmoduleManager';

/**
 * Handles theme directory scanning, metadata extraction, and caching.
 */
export class ThemeScanner {
  private themesPath: string;
  private gitSubmoduleManager: GitSubmoduleManager;
  private cache: {
    themes: ThemeInfo[];
    timestamp: number;
    hugoProjectPath: string;
  } | null = null;
  private readonly CACHE_TTL = 30000; // 30 seconds

  constructor(hugoProjectPath: string, gitSubmoduleManager: GitSubmoduleManager) {
    this.themesPath = path.join(hugoProjectPath, 'themes');
    this.gitSubmoduleManager = gitSubmoduleManager;
  }

  updatePath(hugoProjectPath: string, gitSubmoduleManager: GitSubmoduleManager): void {
    this.themesPath = path.join(hugoProjectPath, 'themes');
    this.gitSubmoduleManager = gitSubmoduleManager;
    this.invalidateCache();
  }

  invalidateCache(): void {
    this.cache = null;
  }

  async themeExists(themeName: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.themesPath, themeName));
      return true;
    } catch {
      return false;
    }
  }

  async scanThemes(currentTheme: string): Promise<ThemeInfo[]> {
    const now = Date.now();
    if (this.cache && (now - this.cache.timestamp < this.CACHE_TTL) && this.cache.hugoProjectPath === path.dirname(this.themesPath)) {
      return this.cache.themes.map(t => ({ ...t, isActive: t.name === currentTheme }));
    }

    try {
      await fs.access(this.themesPath);
    } catch {
      return [];
    }

    const entries = await fs.readdir(this.themesPath, { withFileTypes: true });
    const themeDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
    const submodules = await this.gitSubmoduleManager.listSubmodules();

    const themes: ThemeInfo[] = await Promise.all(
      themeDirs.map(async name => {
        const metadata = await this.readThemeMetadata(name);
        const submodule = submodules.find(s => s.path === `themes/${name}`);
        
        return {
          name,
          displayName: metadata.name || name,
          description: metadata.description || '',
          author: metadata.author || '',
          version: metadata.version || '',
          isActive: name === currentTheme,
          repoUrl: submodule?.url
        };
      })
    );

    const sortedThemes = themes.sort((a, b) => a.name.localeCompare(b.name));
    this.cache = { themes: sortedThemes, timestamp: now, hugoProjectPath: path.dirname(this.themesPath) };
    return sortedThemes;
  }

  private async readThemeMetadata(themeName: string): Promise<any> {
    const themePath = path.join(this.themesPath, themeName);
    const metadataFiles = ['theme.toml', 'theme.yaml', 'theme.yml'];
    
    for (const file of metadataFiles) {
      try {
        const content = await fs.readFile(path.join(themePath, file), 'utf-8');
        const metadata: any = {};
        
        const nameMatch = content.match(/^name\s*=\s*["']([^"']+)["']/m) || content.match(/^name:\s*(.+)$/m);
        if (nameMatch) metadata.name = nameMatch[1].trim();
        
        const descMatch = content.match(/^description\s*=\s*["']([^"']+)["']/m) || content.match(/^description:\s*(.+)$/m);
        if (descMatch) metadata.description = descMatch[1].trim();
        
        const authorMatch = content.match(/^author\s*=\s*["']([^"']+)["']/m) || content.match(/^author:\s*(.+)$/m);
        if (authorMatch) metadata.author = authorMatch[1].trim();
        
        const versionMatch = content.match(/^version\s*=\s*["']([^"']+)["']/m) || content.match(/^version:\s*(.+)$/m);
        if (versionMatch) metadata.version = versionMatch[1].trim();
        
        return metadata;
      } catch (e) {}
    }
    return {};
  }
}
