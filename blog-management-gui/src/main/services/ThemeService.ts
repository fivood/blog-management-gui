import * as path from 'path';
import * as fs from 'fs/promises';
import { ThemeInfo, ThemeConfig, ThemeRegistryEntry } from '../../shared/types/theme';
import { GitSubmoduleManager } from './GitSubmoduleManager';
import { ConfigService } from './ConfigService';
import { LayoutService } from './LayoutService';
import { ThemeScanner } from './ThemeScanner';
import { ThemeConfigHelper } from './ThemeConfigHelper';
import { ThemeParser } from './ThemeParser';
import { ThemeMigrator } from './ThemeMigrator';

export class ThemeService {
  private gitSubmoduleManager: GitSubmoduleManager;
  private configService: ConfigService;
  private layoutService: LayoutService;
  private scanner: ThemeScanner;
  private configHelper: ThemeConfigHelper;
  private parser: ThemeParser;
  private migrator: ThemeMigrator;
  private themesPath: string;
  private hugoProjectPath: string;

  constructor(configService: ConfigService, gitSubmoduleManager?: GitSubmoduleManager) {
    this.configService = configService;
    const config = this.configService.getConfig();
    this.hugoProjectPath = config.hugoProjectPath || '';
    this.themesPath = path.join(this.hugoProjectPath, 'themes');
    this.gitSubmoduleManager = gitSubmoduleManager || new GitSubmoduleManager(this.hugoProjectPath);
    this.layoutService = new LayoutService(this.hugoProjectPath);
    this.scanner = new ThemeScanner(this.hugoProjectPath, this.gitSubmoduleManager);
    this.configHelper = new ThemeConfigHelper(this.hugoProjectPath);
    this.parser = new ThemeParser();
    this.migrator = new ThemeMigrator();
  }

  updateHugoProjectPath(hugoProjectPath: string): void {
    this.hugoProjectPath = hugoProjectPath;
    this.themesPath = path.join(this.hugoProjectPath, 'themes');
    this.gitSubmoduleManager = new GitSubmoduleManager(this.hugoProjectPath);
    this.layoutService = new LayoutService(this.hugoProjectPath);
    this.scanner.updatePath(this.hugoProjectPath, this.gitSubmoduleManager);
    this.configHelper.updatePath(this.hugoProjectPath);
  }

  async getInstalledThemes(): Promise<ThemeInfo[]> {
    try {
      let currentTheme = '';
      try {
        currentTheme = await this.getCurrentTheme();
      } catch (e) {
        console.warn('[ThemeService] Could not determine current theme');
      }
      return this.scanner.scanThemes(currentTheme);
    } catch (error) {
      throw new Error(`Failed to get installed themes: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  async getCurrentTheme(): Promise<string> {
    try {
      const configContent = await this.configHelper.readConfig();
      const themeMatch = configContent.match(/^theme\s*=\s*["']([^"']+)["']/m);
      if (themeMatch) return themeMatch[1];
      return '';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown';
      throw new Error(`Failed to get current theme: ${message}`);
    }
  }

  async switchTheme(themeName: string): Promise<void> {
    this.validateThemeName(themeName);
    if (!(await this.scanner.themeExists(themeName))) throw new Error(`Theme "${themeName}" not found`);
    const backupPath = await this.configHelper.backupConfig();
    try {
      await this.updateHugoConfigTheme(themeName);
      await this.layoutService.switchToThemeLayouts(themeName);
      if ((await this.getCurrentTheme()) !== themeName) throw new Error('Theme verification failed');
      this.scanner.invalidateCache();
    } catch (error) {
      await this.configHelper.restoreConfig(backupPath);
      throw new Error(`Failed to switch theme: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  async installTheme(repoUrl: string, themeName: string): Promise<void> {
    try {
      this.validateThemeName(themeName);
      if (await this.scanner.themeExists(themeName)) throw new Error(`Theme "${themeName}" is already installed`);
      await this.gitSubmoduleManager.addSubmodule(repoUrl, `themes/${themeName}`);
      if (!(await this.scanner.themeExists(themeName))) throw new Error('Theme installation verification failed');
      this.scanner.invalidateCache();
    } catch (error) {
      try { await fs.rm(path.join(this.themesPath, themeName), { recursive: true, force: true }); } catch (e) {}
      throw new Error(`Failed to install theme: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  async uninstallTheme(themeName: string): Promise<void> {
    try {
      this.validateThemeName(themeName);
      if (!(await this.scanner.themeExists(themeName))) throw new Error(`Theme "${themeName}" not found`);
      if ((await this.getCurrentTheme()) === themeName) throw new Error('Cannot uninstall active theme');
      await this.gitSubmoduleManager.removeSubmodule(`themes/${themeName}`);
      this.scanner.invalidateCache();
    } catch (error) {
      throw new Error(`Failed to uninstall theme: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  async getThemeConfig(themeName: string): Promise<ThemeConfig | null> {
    try {
      const themePath = path.join(this.themesPath, themeName);
      let baseConfig: ThemeConfig = { name: themeName };
      try {
        const themeToml = await fs.readFile(path.join(themePath, 'theme.toml'), 'utf-8');
        baseConfig = this.parser.parseThemeToml(themeToml, themeName);
      } catch (e) {}
      const examplePaths = [
        path.join(themePath, 'exampleSite', 'config.toml'), path.join(themePath, 'exampleSite', 'hugo.toml'),
        path.join(themePath, 'exampleSite', 'config.yaml'), path.join(themePath, 'exampleSite', 'hugo.yaml'),
        path.join(themePath, 'example', 'config.toml'), path.join(themePath, 'example', 'hugo.toml')
      ];
      for (const p of examplePaths) {
        try {
          const content = await fs.readFile(p, 'utf-8');
          const isYaml = p.endsWith('.yaml') || p.endsWith('.yml');
          const exampleConfig = isYaml ? this.parser.parseExampleYaml(content, themeName) : this.parser.parseExampleToml(content, themeName);
          return { ...exampleConfig, ...baseConfig };
        } catch (e) {}
      }
      return Object.keys(baseConfig).length > 1 ? baseConfig : null;
    } catch (error) { return null; }
  }

  async analyzeConfigMigration(newThemeName: string): Promise<any> {
    try {
      const newThemeConfig = await this.getThemeConfig(newThemeName);
      const currentConfig = await this.configHelper.readConfig();
      return this.migrator.analyzeMigration(currentConfig, newThemeConfig);
    } catch (error) {
      return { hasChanges: false, suggestions: ['配置分析失败。'], newParams: {}, obsoleteParams: [] };
    }
  }

  async applyConfigMigration(themeName: string, newParams: Record<string, any>, removeObsolete: boolean = false): Promise<void> {
    const configContent = await this.configHelper.readConfig();
    const migration = await this.analyzeConfigMigration(themeName);
    const updatedConfig = this.migrator.applyMigration(configContent, newParams, migration.obsoleteParams, removeObsolete);
    await this.configHelper.writeConfig(updatedConfig);
  }

  async getThemeRegistry(): Promise<ThemeRegistryEntry[]> {
    try {
      const registryPath = path.join(__dirname, '..', 'data', 'recommended-themes.json');
      return JSON.parse(await fs.readFile(registryPath, 'utf-8'));
    } catch (error) { return []; }
  }

  private async updateHugoConfigTheme(themeName: string): Promise<void> {
    let content = await this.configHelper.readConfig();
    const themeRegex = /^theme\s*=\s*["'][^"']*["']/m;
    const newLine = `theme = "${themeName}"`;
    content = themeRegex.test(content) ? content.replace(themeRegex, newLine) : (content + `\n${newLine}\n`);
    await this.configHelper.writeConfig(content);
  }

  protected validateThemeName(themeName: string): void {
    if (!themeName || typeof themeName !== 'string') throw new Error('Theme name must be a non-empty string');
    if (themeName.includes('..') || themeName.includes('/') || themeName.includes('\\')) throw new Error('Invalid characters in theme name');
  }

  protected async themeExists(themeName: string): Promise<boolean> { return this.scanner.themeExists(themeName); }
  protected invalidateCache(): void { this.scanner.invalidateCache(); }
}
