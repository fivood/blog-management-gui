import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ConfigService } from '../../../src/main/services/ConfigService';
import { WindowState, CloudflareConfig, EditorPreferences } from '../../../src/shared/types/config';

// Mock electron modules
vi.mock('electron', () => ({
  app: {
    getName: () => 'blog-management-gui',
    getVersion: () => '1.0.0',
    getPath: (name: string) => `/mock/path/${name}`
  }
}));

// Mock electron-store
vi.mock('electron-store', () => {
  return {
    default: class MockStore {
      private data: any = {};
      public path = '/mock/config/path';

      constructor(options: any) {
        this.data = options.defaults || {};
      }

      get store() {
        return this.data;
      }

      set store(value: any) {
        this.data = value;
      }

      clear() {
        this.data = {};
      }
    }
  };
});

describe('ConfigService', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should return default configuration on first load', () => {
      const config = configService.getConfig();

      expect(config).toBeDefined();
      expect(config.version).toBe('1.0.0');
      expect(config.hugoProjectPath).toBe('');
      expect(config.cloudflare.apiToken).toBe('');
      expect(config.editor.theme).toBe('light');
      expect(config.window.width).toBe(1200);
      expect(config.window.height).toBe(800);
      expect(config.recentProjects).toEqual([]);
    });

    it('should return configuration with all required fields', () => {
      const config = configService.getConfig();

      // Check top-level fields
      expect(config).toHaveProperty('version');
      expect(config).toHaveProperty('hugoProjectPath');
      expect(config).toHaveProperty('cloudflare');
      expect(config).toHaveProperty('editor');
      expect(config).toHaveProperty('window');
      expect(config).toHaveProperty('recentProjects');

      // Check nested fields
      expect(config.cloudflare).toHaveProperty('apiToken');
      expect(config.cloudflare).toHaveProperty('accountId');
      expect(config.cloudflare).toHaveProperty('projectName');

      expect(config.editor).toHaveProperty('theme');
      expect(config.editor).toHaveProperty('fontSize');
      expect(config.editor).toHaveProperty('tabSize');

      expect(config.window).toHaveProperty('width');
      expect(config.window).toHaveProperty('height');
      expect(config.window).toHaveProperty('x');
      expect(config.window).toHaveProperty('y');
      expect(config.window).toHaveProperty('isMaximized');
    });
  });

  describe('updateConfig', () => {
    it('should update Hugo project path', () => {
      const newPath = '/path/to/hugo/project';
      configService.updateConfig({ hugoProjectPath: newPath });

      const config = configService.getConfig();
      expect(config.hugoProjectPath).toBe(newPath);
    });

    it('should update Cloudflare configuration', () => {
      const cloudflareConfig: CloudflareConfig = {
        apiToken: 'test-token',
        accountId: 'test-account',
        projectName: 'test-project'
      };

      configService.updateConfig({ cloudflare: cloudflareConfig });

      const config = configService.getConfig();
      expect(config.cloudflare).toEqual(cloudflareConfig);
    });

    it('should update editor preferences', () => {
      const editorPrefs: EditorPreferences = {
        theme: 'dark',
        fontSize: 16,
        tabSize: 4,
        wordWrap: false,
        showLineNumbers: false,
        autoSave: false,
        autoSaveDelay: 3000
      };

      configService.updateConfig({ editor: editorPrefs });

      const config = configService.getConfig();
      expect(config.editor).toEqual(editorPrefs);
    });

    it('should partially update nested configuration', () => {
      // Update only some Cloudflare fields
      configService.updateConfig({
        cloudflare: {
          apiToken: 'new-token',
          accountId: '',
          projectName: ''
        }
      });

      const config = configService.getConfig();
      expect(config.cloudflare.apiToken).toBe('new-token');
      expect(config.cloudflare.accountId).toBe('');
    });

    it('should preserve other fields when updating', () => {
      // Set initial values
      configService.updateConfig({ hugoProjectPath: '/initial/path' });
      
      // Update different field
      configService.updateConfig({
        cloudflare: {
          apiToken: 'token',
          accountId: 'account',
          projectName: 'project'
        }
      });

      const config = configService.getConfig();
      expect(config.hugoProjectPath).toBe('/initial/path');
      expect(config.cloudflare.apiToken).toBe('token');
    });
  });

  describe('getWindowState', () => {
    it('should return default window state initially', () => {
      const windowState = configService.getWindowState();

      expect(windowState.width).toBe(1200);
      expect(windowState.height).toBe(800);
      expect(windowState.x).toBe(0);
      expect(windowState.y).toBe(0);
      expect(windowState.isMaximized).toBe(false);
    });

    it('should return saved window state', () => {
      const newState: WindowState = {
        width: 1600,
        height: 900,
        x: 100,
        y: 50,
        isMaximized: true
      };

      configService.saveWindowState(newState);
      const windowState = configService.getWindowState();

      expect(windowState).toEqual(newState);
    });
  });

  describe('saveWindowState', () => {
    it('should save window state', () => {
      const windowState: WindowState = {
        width: 1400,
        height: 1000,
        x: 200,
        y: 100,
        isMaximized: false
      };

      configService.saveWindowState(windowState);
      const savedState = configService.getWindowState();

      expect(savedState).toEqual(windowState);
    });

    it('should update only window state without affecting other config', () => {
      // Set Hugo project path
      configService.updateConfig({ hugoProjectPath: '/test/path' });

      // Update window state
      const windowState: WindowState = {
        width: 1500,
        height: 950,
        x: 50,
        y: 25,
        isMaximized: true
      };
      configService.saveWindowState(windowState);

      const config = configService.getConfig();
      expect(config.hugoProjectPath).toBe('/test/path');
      expect(config.window).toEqual(windowState);
    });
  });

  describe('updateCloudflareConfig', () => {
    it('should update Cloudflare configuration', () => {
      const cloudflareConfig: CloudflareConfig = {
        apiToken: 'my-api-token',
        accountId: 'my-account-id',
        projectName: 'my-project'
      };

      configService.updateCloudflareConfig(cloudflareConfig);
      const config = configService.getConfig();

      expect(config.cloudflare).toEqual(cloudflareConfig);
    });

    it('should partially update Cloudflare configuration', () => {
      // Set initial config
      configService.updateCloudflareConfig({
        apiToken: 'token1',
        accountId: 'account1',
        projectName: 'project1'
      });

      // Update only API token
      configService.updateCloudflareConfig({
        apiToken: 'token2',
        accountId: 'account1',
        projectName: 'project1'
      });

      const config = configService.getConfig();
      expect(config.cloudflare.apiToken).toBe('token2');
      expect(config.cloudflare.accountId).toBe('account1');
      expect(config.cloudflare.projectName).toBe('project1');
    });
  });

  describe('updateEditorPreferences', () => {
    it('should update editor preferences', () => {
      const editorPrefs: EditorPreferences = {
        theme: 'dark',
        fontSize: 18,
        tabSize: 4,
        wordWrap: false,
        showLineNumbers: true,
        autoSave: true,
        autoSaveDelay: 5000
      };

      configService.updateEditorPreferences(editorPrefs);
      const config = configService.getConfig();

      expect(config.editor).toEqual(editorPrefs);
    });

    it('should partially update editor preferences', () => {
      // Update only theme
      configService.updateEditorPreferences({ theme: 'dark' } as EditorPreferences);

      const config = configService.getConfig();
      expect(config.editor.theme).toBe('dark');
      expect(config.editor.fontSize).toBe(14); // Default value preserved
    });
  });

  describe('addRecentProject', () => {
    it('should add project to recent projects list', () => {
      configService.addRecentProject('/path/to/project1');

      const config = configService.getConfig();
      expect(config.recentProjects).toContain('/path/to/project1');
      expect(config.recentProjects.length).toBe(1);
    });

    it('should add multiple projects in order', () => {
      configService.addRecentProject('/path/to/project1');
      configService.addRecentProject('/path/to/project2');
      configService.addRecentProject('/path/to/project3');

      const config = configService.getConfig();
      expect(config.recentProjects).toEqual([
        '/path/to/project3',
        '/path/to/project2',
        '/path/to/project1'
      ]);
    });

    it('should move existing project to top when added again', () => {
      configService.addRecentProject('/path/to/project1');
      configService.addRecentProject('/path/to/project2');
      configService.addRecentProject('/path/to/project1'); // Add again

      const config = configService.getConfig();
      expect(config.recentProjects).toEqual([
        '/path/to/project1',
        '/path/to/project2'
      ]);
    });

    it('should limit recent projects to 10 items', () => {
      // Add 12 projects
      for (let i = 1; i <= 12; i++) {
        configService.addRecentProject(`/path/to/project${i}`);
      }

      const config = configService.getConfig();
      expect(config.recentProjects.length).toBe(10);
      expect(config.recentProjects[0]).toBe('/path/to/project12');
      expect(config.recentProjects[9]).toBe('/path/to/project3');
    });
  });

  describe('resetConfig', () => {
    it('should reset configuration to defaults', () => {
      // Modify configuration
      configService.updateConfig({
        hugoProjectPath: '/custom/path',
        cloudflare: {
          apiToken: 'token',
          accountId: 'account',
          projectName: 'project'
        }
      });

      // Reset
      configService.resetConfig();

      const config = configService.getConfig();
      expect(config.hugoProjectPath).toBe('');
      expect(config.cloudflare.apiToken).toBe('');
      expect(config.cloudflare.accountId).toBe('');
      expect(config.cloudflare.projectName).toBe('');
    });
  });

  describe('getConfigPath', () => {
    it('should return configuration file path', () => {
      const path = configService.getConfigPath();
      expect(path).toBeDefined();
      expect(typeof path).toBe('string');
    });
  });
});
