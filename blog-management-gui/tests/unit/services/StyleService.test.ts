import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StyleService } from '../../../src/main/services/StyleService';
import { StyleConfiguration, ColorTheme, LayoutSettings, FontSettings } from '../../../src/shared/types/style';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
vi.mock('fs');
vi.mock('path');

describe('StyleService', () => {
  let service: StyleService;
  const mockHugoPath = '/path/to/hugo';

  beforeEach(() => {
    // Mock path.join to return predictable paths
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    vi.mocked(path.dirname).mockImplementation((p) => p.split('/').slice(0, -1).join('/'));
    
    // Mock fs.existsSync to return false by default
    vi.mocked(fs.existsSync).mockReturnValue(false);
    
    service = new StyleService(mockHugoPath);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with valid path', () => {
      expect(service).toBeInstanceOf(StyleService);
    });

    it('should load style history if exists', () => {
      const mockHistory = [
        {
          id: 'test-1',
          timestamp: new Date().toISOString(),
          description: 'Test entry',
          config: {} as StyleConfiguration
        }
      ];

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockHistory));

      const newService = new StyleService(mockHugoPath);
      const history = newService.getStyleHistory();

      expect(history).toHaveLength(1);
    });
  });

  describe('updateHugoProjectPath', () => {
    it('should update Hugo project path', () => {
      service.updateHugoProjectPath('/new/path');
      expect(() => service.updateHugoProjectPath('/new/path')).not.toThrow();
    });
  });

  describe('getStyleConfig', () => {
    it('should return default config when files do not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const config = await service.getStyleConfig();

      expect(config).toHaveProperty('version');
      expect(config).toHaveProperty('hugoConfig');
      expect(config).toHaveProperty('colorTheme');
      expect(config).toHaveProperty('layoutSettings');
      expect(config).toHaveProperty('fontSettings');
      expect(config).toHaveProperty('customCSS');
    });

    it('should read Hugo config from file', async () => {
      const mockToml = `
title = "My Blog"
theme = "PaperMod"

[params]
theme = "light"
primaryColor = "#1e90ff"
`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockToml);

      const config = await service.getStyleConfig();

      expect(config.hugoConfig.title).toBe('My Blog');
      expect(config.hugoConfig.theme).toBe('PaperMod');
    });

    it('should read custom CSS from file', async () => {
      const mockCSS = 'body { color: red; }';

      vi.mocked(fs.existsSync).mockImplementation((p: any) => {
        return p.includes('custom.css');
      });
      vi.mocked(fs.readFileSync).mockReturnValue(mockCSS);

      const config = await service.getStyleConfig();

      expect(config.customCSS).toBe(mockCSS);
    });

    it('should handle read errors', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('Read error');
      });

      await expect(service.getStyleConfig()).rejects.toThrow('Failed to get style configuration');
    });
  });

  describe('updateStyleConfig', () => {
    it('should update style configuration', async () => {
      const mockConfig: StyleConfiguration = {
        version: 1,
        hugoConfig: { title: 'Updated Blog' },
        colorTheme: {
          mode: 'dark',
          primaryColor: '#000000',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          linkColor: '#1e90ff',
          accentColor: '#ff6347'
        },
        layoutSettings: {
          homeLayout: 'card',
          showSidebar: true,
          sidebarContent: [],
          navigationMenu: []
        },
        fontSettings: {
          fontFamily: 'Arial',
          headingFontSize: 24,
          bodyFontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 0
        },
        customCSS: 'body { color: blue; }'
      };

      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      vi.mocked(fs.mkdirSync).mockImplementation(() => '');

      await service.updateStyleConfig(mockConfig);

      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should add to history when updating', async () => {
      const mockConfig: StyleConfiguration = {
        version: 1,
        hugoConfig: {},
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
          sidebarContent: [],
          navigationMenu: []
        },
        fontSettings: {
          fontFamily: 'Arial',
          headingFontSize: 24,
          bodyFontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 0
        },
        customCSS: ''
      };

      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      vi.mocked(fs.mkdirSync).mockImplementation(() => '');

      await service.updateStyleConfig(mockConfig, 'Test update');

      const history = service.getStyleHistory();
      expect(history).toHaveLength(1);
      expect(history[0].description).toBe('Test update');
    });

    it('should handle write errors', async () => {
      const mockConfig: StyleConfiguration = {
        version: 1,
        hugoConfig: {},
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
          sidebarContent: [],
          navigationMenu: []
        },
        fontSettings: {
          fontFamily: 'Arial',
          headingFontSize: 24,
          bodyFontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 0
        },
        customCSS: ''
      };

      vi.mocked(fs.writeFileSync).mockImplementation(() => {
        throw new Error('Write error');
      });

      await expect(service.updateStyleConfig(mockConfig)).rejects.toThrow('Failed to update style configuration');
    });
  });

  describe('exportStyleConfig', () => {
    it('should export configuration as JSON', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const json = await service.exportStyleConfig();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('colorTheme');
    });

    it('should handle export errors', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('Read error');
      });

      await expect(service.exportStyleConfig()).rejects.toThrow('Failed to export style configuration');
    });
  });

  describe('importStyleConfig', () => {
    it('should import valid configuration', async () => {
      const mockConfig: StyleConfiguration = {
        version: 1,
        hugoConfig: {},
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
          sidebarContent: [],
          navigationMenu: [
            { name: 'Home', url: '/', weight: 1 }
          ]
        },
        fontSettings: {
          fontFamily: 'Arial',
          headingFontSize: 24,
          bodyFontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 0
        },
        customCSS: ''
      };

      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      vi.mocked(fs.mkdirSync).mockImplementation(() => '');

      await service.importStyleConfig(JSON.stringify(mockConfig));

      const history = service.getStyleHistory();
      expect(history[0].description).toContain('Imported');
    });

    it('should reject invalid JSON', async () => {
      await expect(service.importStyleConfig('invalid json')).rejects.toThrow('Invalid JSON format');
    });

    it('should validate imported configuration', async () => {
      const invalidConfig = {
        version: 1,
        colorTheme: { mode: 'invalid' }
      };

      await expect(service.importStyleConfig(JSON.stringify(invalidConfig))).rejects.toThrow();
    });
  });

  describe('resetToDefault', () => {
    it('should reset to default configuration', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      vi.mocked(fs.mkdirSync).mockImplementation(() => '');

      await service.resetToDefault();

      const history = service.getStyleHistory();
      expect(history[0].description).toContain('Reset to default');
    });
  });

  describe('getStyleHistory', () => {
    it('should return empty array initially', () => {
      const history = service.getStyleHistory();
      expect(history).toEqual([]);
    });

    it('should return history entries', async () => {
      const mockConfig: StyleConfiguration = {
        version: 1,
        hugoConfig: {},
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
          sidebarContent: [],
          navigationMenu: []
        },
        fontSettings: {
          fontFamily: 'Arial',
          headingFontSize: 24,
          bodyFontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 0
        },
        customCSS: ''
      };

      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      vi.mocked(fs.mkdirSync).mockImplementation(() => '');

      await service.updateStyleConfig(mockConfig, 'Entry 1');
      await service.updateStyleConfig(mockConfig, 'Entry 2');

      const history = service.getStyleHistory();
      expect(history).toHaveLength(2);
      expect(history[0].description).toBe('Entry 2'); // Most recent first
    });

    it('should limit history to 20 entries', async () => {
      const mockConfig: StyleConfiguration = {
        version: 1,
        hugoConfig: {},
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
          sidebarContent: [],
          navigationMenu: []
        },
        fontSettings: {
          fontFamily: 'Arial',
          headingFontSize: 24,
          bodyFontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 0
        },
        customCSS: ''
      };

      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      vi.mocked(fs.mkdirSync).mockImplementation(() => '');

      // Add 25 entries
      for (let i = 0; i < 25; i++) {
        await service.updateStyleConfig(mockConfig, `Entry ${i}`);
      }

      const history = service.getStyleHistory();
      expect(history).toHaveLength(20);
    });
  });

  describe('restoreFromHistory', () => {
    it('should restore configuration from history', async () => {
      const mockConfig: StyleConfiguration = {
        version: 1,
        hugoConfig: { title: 'Original' },
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
          sidebarContent: [],
          navigationMenu: []
        },
        fontSettings: {
          fontFamily: 'Arial',
          headingFontSize: 24,
          bodyFontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 0
        },
        customCSS: ''
      };

      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      vi.mocked(fs.mkdirSync).mockImplementation(() => '');

      await service.updateStyleConfig(mockConfig, 'Original config');

      const history = service.getStyleHistory();
      const historyId = history[0].id;

      await service.restoreFromHistory(historyId);

      const newHistory = service.getStyleHistory();
      expect(newHistory[0].description).toContain('Restored from history');
    });

    it('should throw error for invalid history ID', async () => {
      await expect(service.restoreFromHistory('invalid-id')).rejects.toThrow('History entry not found');
    });
  });

  describe('validation', () => {
    it('should validate color theme mode', async () => {
      const invalidConfig = {
        version: 1,
        hugoConfig: {},
        colorTheme: {
          mode: 'invalid' as any,
          primaryColor: '#1e90ff',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          linkColor: '#1e90ff',
          accentColor: '#ff6347'
        },
        layoutSettings: {
          homeLayout: 'list' as const,
          showSidebar: true,
          sidebarContent: [],
          navigationMenu: []
        },
        fontSettings: {
          fontFamily: 'Arial',
          headingFontSize: 24,
          bodyFontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 0
        },
        customCSS: ''
      };

      await expect(service.importStyleConfig(JSON.stringify(invalidConfig))).rejects.toThrow('Invalid color theme mode');
    });

    it('should validate home layout mode', async () => {
      const invalidConfig = {
        version: 1,
        hugoConfig: {},
        colorTheme: {
          mode: 'light' as const,
          primaryColor: '#1e90ff',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          linkColor: '#1e90ff',
          accentColor: '#ff6347'
        },
        layoutSettings: {
          homeLayout: 'invalid' as any,
          showSidebar: true,
          sidebarContent: [],
          navigationMenu: []
        },
        fontSettings: {
          fontFamily: 'Arial',
          headingFontSize: 24,
          bodyFontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 0
        },
        customCSS: ''
      };

      await expect(service.importStyleConfig(JSON.stringify(invalidConfig))).rejects.toThrow('Invalid home layout mode');
    });

    it('should validate menu item URLs', async () => {
      const invalidConfig = {
        version: 1,
        hugoConfig: {},
        colorTheme: {
          mode: 'light' as const,
          primaryColor: '#1e90ff',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          linkColor: '#1e90ff',
          accentColor: '#ff6347'
        },
        layoutSettings: {
          homeLayout: 'list' as const,
          showSidebar: true,
          sidebarContent: [],
          navigationMenu: [
            { name: 'Invalid', url: 'invalid-url', weight: 1 }
          ]
        },
        fontSettings: {
          fontFamily: 'Arial',
          headingFontSize: 24,
          bodyFontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 0
        },
        customCSS: ''
      };

      await expect(service.importStyleConfig(JSON.stringify(invalidConfig))).rejects.toThrow('Invalid menu item URL');
    });

    it('should validate font size ranges', async () => {
      const invalidConfig = {
        version: 1,
        hugoConfig: {},
        colorTheme: {
          mode: 'light' as const,
          primaryColor: '#1e90ff',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          linkColor: '#1e90ff',
          accentColor: '#ff6347'
        },
        layoutSettings: {
          homeLayout: 'list' as const,
          showSidebar: true,
          sidebarContent: [],
          navigationMenu: []
        },
        fontSettings: {
          fontFamily: 'Arial',
          headingFontSize: 100, // Invalid: > 48
          bodyFontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 0
        },
        customCSS: ''
      };

      await expect(service.importStyleConfig(JSON.stringify(invalidConfig))).rejects.toThrow('Heading font size must be between 16 and 48');
    });
  });
});
