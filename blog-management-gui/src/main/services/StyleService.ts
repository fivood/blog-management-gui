import * as fs from 'fs';
import * as path from 'path';
import { StyleConfiguration, ColorTheme, LayoutSettings, FontSettings, MenuItem, StyleHistoryEntry } from '../../shared/types/style';
import { HugoConfig } from '../../shared/types/hugo';
import * as toml from '@iarna/toml';

/**
 * StyleService manages blog style configuration
 * 
 * Requirements:
 * - 21.1-21.9: Hugo configuration management
 * - 22.1-22.8: Custom CSS editing
 * - 23.1-23.8: Color theme customization
 * - 24.1-24.7: Layout configuration
 * - 25.1-25.7: Font settings
 * - 28.1-28.7: Export/import style configuration
 * - 29.1-29.6: Reset to default styles
 * - 30.1-30.7: Style history tracking
 */
export class StyleService {
  private hugoProjectPath: string;
  private styleHistory: StyleHistoryEntry[] = [];
  private readonly maxHistoryEntries = 20;

  constructor(hugoProjectPath: string) {
    this.hugoProjectPath = hugoProjectPath;
    this.loadStyleHistory();
  }

  /**
   * Update Hugo project path
   */
  updateHugoProjectPath(hugoProjectPath: string): void {
    this.hugoProjectPath = hugoProjectPath;
    this.loadStyleHistory();
  }

  /**
   * Get current style configuration
   * Requirements: 21.1, 22.1, 23.1, 24.1, 25.1
   */
  async getStyleConfig(): Promise<StyleConfiguration> {
    try {
      // Read Hugo config
      const hugoConfig = await this.readHugoConfig();
      
      // Read custom CSS
      const customCSS = await this.readCustomCSS();
      
      // Extract style settings from Hugo config
      const colorTheme = this.extractColorTheme(hugoConfig);
      const layoutSettings = this.extractLayoutSettings(hugoConfig);
      const fontSettings = this.extractFontSettings(hugoConfig);

      return {
        version: 1,
        hugoConfig,
        colorTheme,
        layoutSettings,
        fontSettings,
        customCSS
      };
    } catch (error) {
      throw new Error(`Failed to get style configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update style configuration
   * Requirements: 21.8, 22.6, 23.8, 25.7, 30.1
   */
  async updateStyleConfig(config: StyleConfiguration, description?: string): Promise<void> {
    try {
      // Update Hugo config
      await this.updateHugoConfig(config);
      
      // Update custom CSS
      await this.writeCustomCSS(config.customCSS);
      
      // Generate and write CSS from theme settings
      await this.generateThemeCSS(config.colorTheme, config.fontSettings);
      
      // Add to history
      this.addToHistory(config, description || 'Style configuration updated');
    } catch (error) {
      throw new Error(`Failed to update style configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export style configuration to JSON
   * Requirements: 28.1, 28.2
   */
  async exportStyleConfig(): Promise<string> {
    try {
      const config = await this.getStyleConfig();
      return JSON.stringify(config, null, 2);
    } catch (error) {
      throw new Error(`Failed to export style configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import style configuration from JSON
   * Requirements: 28.3, 28.4, 28.5, 28.6
   */
  async importStyleConfig(jsonString: string): Promise<void> {
    try {
      // Parse JSON
      const config = JSON.parse(jsonString) as StyleConfiguration;
      
      // Validate configuration
      this.validateStyleConfig(config);
      
      // Apply configuration
      await this.updateStyleConfig(config, 'Imported style configuration');
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format');
      }
      throw new Error(`Failed to import style configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reset to default PaperMod styles
   * Requirements: 29.1, 29.2, 29.3
   */
  async resetToDefault(): Promise<void> {
    try {
      const defaultConfig = this.getDefaultStyleConfig();
      await this.updateStyleConfig(defaultConfig, 'Reset to default styles');
    } catch (error) {
      throw new Error(`Failed to reset to default: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get style history
   * Requirements: 30.3, 30.4
   */
  getStyleHistory(): StyleHistoryEntry[] {
    return [...this.styleHistory];
  }

  /**
   * Restore from history
   * Requirements: 30.6, 30.7
   */
  async restoreFromHistory(historyId: string): Promise<void> {
    try {
      const entry = this.styleHistory.find(h => h.id === historyId);
      if (!entry) {
        throw new Error('History entry not found');
      }
      
      await this.updateStyleConfig(entry.config, `Restored from history: ${entry.description}`);
    } catch (error) {
      throw new Error(`Failed to restore from history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Read Hugo configuration file
   */
  private async readHugoConfig(): Promise<Partial<HugoConfig>> {
    const configPath = path.join(this.hugoProjectPath, 'hugo.toml');
    
    if (!fs.existsSync(configPath)) {
      return {};
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    try {
      return toml.parse(content) as any;
    } catch (error) {
      console.error('Failed to parse hugo.toml:', error);
      return {};
    }
  }


  /**
   * Update Hugo configuration file
   */
  private async updateHugoConfig(config: StyleConfiguration): Promise<void> {
    const configPath = path.join(this.hugoProjectPath, 'hugo.toml');
    
    // Read existing config
    const existingConfig = await this.readHugoConfig();
    
    // Merge with new config (deep merge for params)
    const mergedConfig: any = {
      ...existingConfig,
      ...config.hugoConfig
    };
    
    // Deep merge params section
    if (existingConfig.params && config.hugoConfig.params) {
      mergedConfig.params = {
        ...existingConfig.params,
        ...config.hugoConfig.params
      };
    }
    
    // Generate TOML content using @iarna/toml library
    const tomlContent = toml.stringify(mergedConfig);
    fs.writeFileSync(configPath, tomlContent, 'utf-8');
  }

  /**
   * Read custom CSS file
   */
  private async readCustomCSS(): Promise<string> {
    const cssPath = path.join(this.hugoProjectPath, 'assets', 'css', 'extended', 'custom.css');
    
    if (!fs.existsSync(cssPath)) {
      return '';
    }
    
    return fs.readFileSync(cssPath, 'utf-8');
  }

  /**
   * Write custom CSS file
   */
  private async writeCustomCSS(css: string): Promise<void> {
    const cssDir = path.join(this.hugoProjectPath, 'assets', 'css', 'extended');
    const cssPath = path.join(cssDir, 'custom.css');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(cssDir)) {
      fs.mkdirSync(cssDir, { recursive: true });
    }
    
    fs.writeFileSync(cssPath, css, 'utf-8');
  }

  /**
   * Generate CSS from theme settings
   * Requirements: 23.7, 25.7
   */
  private async generateThemeCSS(colorTheme: ColorTheme, fontSettings: FontSettings): Promise<void> {
    let css = '/* Auto-generated theme CSS */\n\n';
    
    // Color theme CSS variables
    css += ':root {\n';
    css += `  --primary-color: ${colorTheme.primaryColor};\n`;
    css += `  --background-color: ${colorTheme.backgroundColor};\n`;
    css += `  --text-color: ${colorTheme.textColor};\n`;
    css += `  --link-color: ${colorTheme.linkColor};\n`;
    css += `  --accent-color: ${colorTheme.accentColor};\n`;
    css += '}\n\n';
    
    // Font settings
    css += 'body {\n';
    css += `  font-family: ${fontSettings.fontFamily};\n`;
    css += `  font-size: ${fontSettings.bodyFontSize}px;\n`;
    css += `  line-height: ${fontSettings.lineHeight};\n`;
    css += `  letter-spacing: ${fontSettings.letterSpacing}em;\n`;
    css += '}\n\n';
    
    css += 'h1, h2, h3, h4, h5, h6 {\n';
    css += `  font-size: ${fontSettings.headingFontSize}px;\n`;
    css += '}\n';
    
    const themeCssPath = path.join(this.hugoProjectPath, 'assets', 'css', 'extended', 'theme.css');
    const cssDir = path.dirname(themeCssPath);
    
    if (!fs.existsSync(cssDir)) {
      fs.mkdirSync(cssDir, { recursive: true });
    }
    
    fs.writeFileSync(themeCssPath, css, 'utf-8');
  }

  /**
   * Extract color theme from Hugo config
   */
  private extractColorTheme(hugoConfig: Partial<HugoConfig>): ColorTheme {
    const params = (hugoConfig as any).params || {};
    
    return {
      mode: params.theme || 'light',
      primaryColor: params.primaryColor || '#1e90ff',
      backgroundColor: params.backgroundColor || '#ffffff',
      textColor: params.textColor || '#333333',
      linkColor: params.linkColor || '#1e90ff',
      accentColor: params.accentColor || '#ff6347'
    };
  }

  /**
   * Extract layout settings from Hugo config
   */
  private extractLayoutSettings(hugoConfig: Partial<HugoConfig>): LayoutSettings {
    const params = (hugoConfig as any).params || {};
    const menu = (hugoConfig as any).menu || {};
    
    return {
      homeLayout: params.homeLayout || 'list',
      showSidebar: params.showSidebar !== false,
      sidebarContent: params.sidebarContent || [],
      navigationMenu: this.extractNavigationMenu(menu)
    };
  }

  /**
   * Extract navigation menu from Hugo config
   */
  private extractNavigationMenu(menu: any): MenuItem[] {
    const mainMenu = menu.main || [];
    
    if (Array.isArray(mainMenu)) {
      return mainMenu.map((item: any, index: number) => ({
        name: item.name || '',
        url: item.url || '',
        weight: item.weight || index
      }));
    }
    
    return [];
  }

  /**
   * Extract font settings from Hugo config
   */
  private extractFontSettings(hugoConfig: Partial<HugoConfig>): FontSettings {
    const params = (hugoConfig as any).params || {};
    
    return {
      fontFamily: params.fontFamily || 'system-ui, -apple-system, sans-serif',
      headingFontSize: params.headingFontSize || 32,
      bodyFontSize: params.bodyFontSize || 16,
      lineHeight: params.lineHeight || 1.6,
      letterSpacing: params.letterSpacing || 0
    };
  }

  /**
   * Validate style configuration
   * Requirements: 28.5
   */
  private validateStyleConfig(config: StyleConfiguration): void {
    if (!config.version) {
      throw new Error('Missing version field');
    }
    
    if (!config.colorTheme) {
      throw new Error('Missing colorTheme field');
    }
    
    if (!config.layoutSettings) {
      throw new Error('Missing layoutSettings field');
    }
    
    if (!config.fontSettings) {
      throw new Error('Missing fontSettings field');
    }
    
    // Validate color theme
    if (!['light', 'dark'].includes(config.colorTheme.mode)) {
      throw new Error('Invalid color theme mode');
    }
    
    // Validate layout settings
    if (!['list', 'card'].includes(config.layoutSettings.homeLayout)) {
      throw new Error('Invalid home layout mode');
    }
    
    // Validate navigation menu URLs
    for (const item of config.layoutSettings.navigationMenu) {
      if (!item.url.startsWith('http://') && !item.url.startsWith('https://') && !item.url.startsWith('/')) {
        throw new Error(`Invalid menu item URL: ${item.url}`);
      }
    }
    
    // Validate font settings
    if (config.fontSettings.headingFontSize < 16 || config.fontSettings.headingFontSize > 48) {
      throw new Error('Heading font size must be between 16 and 48');
    }
    
    if (config.fontSettings.bodyFontSize < 12 || config.fontSettings.bodyFontSize > 24) {
      throw new Error('Body font size must be between 12 and 24');
    }
    
    if (config.fontSettings.lineHeight < 1.0 || config.fontSettings.lineHeight > 2.5) {
      throw new Error('Line height must be between 1.0 and 2.5');
    }
    
    if (config.fontSettings.letterSpacing < -0.05 || config.fontSettings.letterSpacing > 0.2) {
      throw new Error('Letter spacing must be between -0.05 and 0.2');
    }
  }

  /**
   * Get default style configuration
   * Requirements: 29.4, 29.5
   */
  private getDefaultStyleConfig(): StyleConfiguration {
    return {
      version: 1,
      hugoConfig: {
        title: 'My Blog',
        theme: 'PaperMod'
      },
      colorTheme: {
        mode: 'light',
        primaryColor: '#1e90ff',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        linkColor: '#1e90ff',
        accentColor: '#ff6347'
      },
      layoutSettings: {
        homeLayout: 'list',
        showSidebar: true,
        sidebarContent: ['recent', 'tags', 'categories'],
        navigationMenu: [
          { name: 'Home', url: '/', weight: 1 },
          { name: 'About', url: '/about', weight: 2 }
        ]
      },
      fontSettings: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        headingFontSize: 32,
        bodyFontSize: 16,
        lineHeight: 1.6,
        letterSpacing: 0
      },
      customCSS: ''
    };
  }

  /**
   * Add configuration to history
   * Requirements: 30.1, 30.2
   */
  private addToHistory(config: StyleConfiguration, description: string): void {
    const entry: StyleHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      description,
      config: JSON.parse(JSON.stringify(config)) // Deep clone
    };
    
    // Add to beginning of array
    this.styleHistory.unshift(entry);
    
    // Keep only last N entries
    if (this.styleHistory.length > this.maxHistoryEntries) {
      this.styleHistory = this.styleHistory.slice(0, this.maxHistoryEntries);
    }
    
    // Save history to disk
    this.saveStyleHistory();
  }

  /**
   * Load style history from disk
   */
  private loadStyleHistory(): void {
    try {
      const historyPath = path.join(this.hugoProjectPath, '.kiro', 'style-history.json');
      
      if (fs.existsSync(historyPath)) {
        const content = fs.readFileSync(historyPath, 'utf-8');
        const history = JSON.parse(content);
        
        // Convert timestamp strings back to Date objects
        this.styleHistory = history.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load style history:', error);
      this.styleHistory = [];
    }
  }

  /**
   * Save style history to disk
   */
  private saveStyleHistory(): void {
    try {
      const historyDir = path.join(this.hugoProjectPath, '.kiro');
      const historyPath = path.join(historyDir, 'style-history.json');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true });
      }
      
      fs.writeFileSync(historyPath, JSON.stringify(this.styleHistory, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save style history:', error);
    }
  }
}
