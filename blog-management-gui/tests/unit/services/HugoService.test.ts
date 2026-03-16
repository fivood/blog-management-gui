import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HugoService } from '../../../src/main/services/HugoService';
import * as fs from 'fs/promises';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import * as path from 'path';

// Mock modules
vi.mock('fs/promises');
vi.mock('child_process');

describe('HugoService', () => {
  let hugoService: HugoService;
  const testProjectPath = '/test/hugo/project';
  const testConfigPath = '/test/hugo/project/hugo.toml';

  beforeEach(() => {
    hugoService = new HugoService(testProjectPath);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up any running preview servers
    if (hugoService.isPreviewServerRunning()) {
      await hugoService.stopPreviewServer();
    }
  });

  describe('build', () => {
    it('should execute hugo build command with minify by default', async () => {
      // Mock spawn to simulate successful build
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      // Simulate Hugo output
      setTimeout(() => {
        mockProcess.stdout?.emit('data', Buffer.from('Building sites...\n'));
        mockProcess.stdout?.emit('data', Buffer.from('Pages | 42\n'));
        mockProcess.stdout?.emit('data', Buffer.from('Total in 123 ms\n'));
        mockProcess.emit('close', 0);
      }, 10);

      const result = await hugoService.build();

      expect(spawn).toHaveBeenCalledWith(
        'hugo',
        ['--minify'],
        expect.objectContaining({
          cwd: testProjectPath,
          shell: true
        })
      );
      expect(result.success).toBe(true);
      expect(result.output.length).toBeGreaterThan(0);
      expect(result.stats.pageCount).toBe(42);
    });

    it('should include --buildDrafts flag when drafts option is true', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      setTimeout(() => {
        mockProcess.stdout?.emit('data', Buffer.from('Building sites...\n'));
        mockProcess.emit('close', 0);
      }, 10);

      await hugoService.build({ drafts: true });

      expect(spawn).toHaveBeenCalledWith(
        'hugo',
        ['--minify', '--buildDrafts'],
        expect.any(Object)
      );
    });

    it('should not include --minify flag when minify option is false', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      setTimeout(() => {
        mockProcess.stdout?.emit('data', Buffer.from('Building sites...\n'));
        mockProcess.emit('close', 0);
      }, 10);

      await hugoService.build({ minify: false });

      expect(spawn).toHaveBeenCalledWith(
        'hugo',
        [],
        expect.any(Object)
      );
    });

    it('should capture stdout and stderr output', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      setTimeout(() => {
        mockProcess.stdout?.emit('data', Buffer.from('Building sites...\n'));
        mockProcess.stderr?.emit('data', Buffer.from('Warning: something\n'));
        mockProcess.emit('close', 0);
      }, 10);

      const result = await hugoService.build();

      expect(result.output).toContain('Building sites...');
      expect(result.output).toContain('Warning: something');
    });

    it('should return error result when build fails', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      setTimeout(() => {
        mockProcess.stderr?.emit('data', Buffer.from('Error: build failed\n'));
        mockProcess.emit('close', 1);
      }, 10);

      const result = await hugoService.build();

      expect(result.success).toBe(false);
      expect(result.error).toContain('build failed');
      expect(result.stats.pageCount).toBe(0);
    });

    it('should parse page count from Hugo output', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      setTimeout(() => {
        mockProcess.stdout?.emit('data', Buffer.from('Pages | 123\n'));
        mockProcess.emit('close', 0);
      }, 10);

      const result = await hugoService.build();

      expect(result.stats.pageCount).toBe(123);
    });

    it('should calculate build duration', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      setTimeout(() => {
        mockProcess.stdout?.emit('data', Buffer.from('Building sites...\n'));
        mockProcess.emit('close', 0);
      }, 50);

      const result = await hugoService.build();

      expect(result.stats.duration).toBeGreaterThanOrEqual(40);
      expect(result.stats.timestamp).toBeInstanceOf(Date);
    });

    it('should handle spawn errors gracefully', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      setTimeout(() => {
        mockProcess.emit('error', new Error('Command not found'));
      }, 10);

      const result = await hugoService.build();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Command not found');
    });
  });

  describe('startPreviewServer', () => {
    it('should start hugo server on default port', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      setTimeout(() => {
        mockProcess.stdout?.emit('data', Buffer.from('Web Server is available at http://localhost:1313\n'));
      }, 10);

      const server = await hugoService.startPreviewServer();

      expect(spawn).toHaveBeenCalledWith(
        'hugo',
        ['server', '--port', '1313'],
        expect.objectContaining({
          cwd: testProjectPath,
          shell: true
        })
      );
      expect(server.url).toBe('http://localhost:1313');
      expect(server.port).toBe(1313);
      expect(typeof server.stop).toBe('function');
    });

    it('should stop existing preview server before starting new one', async () => {
      const mockProcess1 = createMockProcess();
      const mockProcess2 = createMockProcess();
      
      vi.mocked(spawn)
        .mockReturnValueOnce(mockProcess1 as any)
        .mockReturnValueOnce(mockProcess2 as any);

      // Start first server
      setTimeout(() => {
        mockProcess1.stdout?.emit('data', Buffer.from('Web Server is available at localhost:1313\n'));
      }, 10);
      await hugoService.startPreviewServer();

      // Mock the kill method to emit close event for both processes
      mockProcess1.kill = vi.fn().mockImplementation(() => {
        setTimeout(() => mockProcess1.emit('close', 0), 10);
        return true;
      });
      
      mockProcess2.kill = vi.fn().mockImplementation(() => {
        setTimeout(() => mockProcess2.emit('close', 0), 10);
        return true;
      });

      // Start second server (should stop first)
      setTimeout(() => {
        mockProcess2.stdout?.emit('data', Buffer.from('Web Server is available at localhost:1313\n'));
      }, 30);
      await hugoService.startPreviewServer();

      expect(mockProcess1.kill).toHaveBeenCalled();
    });

    it('should reject if server fails to start within timeout', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      // Don't emit server ready message

      await expect(hugoService.startPreviewServer()).rejects.toThrow('timeout');
    }, 15000);

    it('should reject if process exits before starting', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      setTimeout(() => {
        mockProcess.emit('close', 1);
      }, 10);

      await expect(hugoService.startPreviewServer()).rejects.toThrow('exited');
    });

    it('should reject if process emits error', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      setTimeout(() => {
        mockProcess.emit('error', new Error('Failed to start'));
      }, 10);

      await expect(hugoService.startPreviewServer()).rejects.toThrow('Failed to start');
    });
  });

  describe('stopPreviewServer', () => {
    it('should stop running preview server', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      // Start server
      setTimeout(() => {
        mockProcess.stdout?.emit('data', Buffer.from('Web Server is available at localhost:1313\n'));
      }, 10);
      await hugoService.startPreviewServer();

      // Stop server
      const stopPromise = hugoService.stopPreviewServer();
      
      // Simulate process close
      setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      await stopPromise;

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
      expect(hugoService.isPreviewServerRunning()).toBe(false);
    });

    it('should do nothing if no server is running', async () => {
      await expect(hugoService.stopPreviewServer()).resolves.toBeUndefined();
    });

    it('should force kill if process does not stop gracefully', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      // Start server
      setTimeout(() => {
        mockProcess.stdout?.emit('data', Buffer.from('Web Server is available at localhost:1313\n'));
      }, 10);
      await hugoService.startPreviewServer();

      // Stop server but don't emit close event
      const stopPromise = hugoService.stopPreviewServer();

      // Wait for force kill timeout
      await stopPromise;

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
      // Force kill should be called after timeout
      expect(mockProcess.kill).toHaveBeenCalledWith('SIGKILL');
    }, 10000);
  });

  describe('getConfig', () => {
    it('should read and parse hugo.toml file', async () => {
      const tomlContent = `
baseURL = "https://example.com"
languageCode = "en-us"
title = "My Blog"
theme = "PaperMod"

[params]
description = "A blog about things"
author = "John Doe"
ShowReadingTime = true
`;
      vi.mocked(fs.readFile).mockResolvedValue(tomlContent);

      const config = await hugoService.getConfig();

      expect(fs.readFile).toHaveBeenCalled();
      expect(config.baseURL).toBe('https://example.com');
      expect(config.languageCode).toBe('en-us');
      expect(config.title).toBe('My Blog');
      expect(config.theme).toBe('PaperMod');
      expect(config.params.description).toBe('A blog about things');
      expect(config.params.author).toBe('John Doe');
      expect(config.params.ShowReadingTime).toBe(true);
    });

    it('should handle missing optional fields with defaults', async () => {
      const tomlContent = `
title = "My Blog"
`;
      vi.mocked(fs.readFile).mockResolvedValue(tomlContent);

      const config = await hugoService.getConfig();

      expect(config.baseURL).toBe('');
      expect(config.languageCode).toBe('en-us');
      expect(config.title).toBe('My Blog');
      expect(config.theme).toBe('');
      expect(config.params).toEqual({});
    });

    it('should throw error if file cannot be read', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      await expect(hugoService.getConfig()).rejects.toThrow('Failed to read Hugo configuration');
    });

    it('should throw error if TOML is invalid', async () => {
      const invalidToml = 'invalid toml content [[[';
      vi.mocked(fs.readFile).mockResolvedValue(invalidToml);

      await expect(hugoService.getConfig()).rejects.toThrow();
    });
  });

  describe('updateConfig', () => {
    it('should update hugo.toml file with new configuration', async () => {
      const existingConfig = `
baseURL = "https://example.com"
languageCode = "en-us"
title = "My Blog"
theme = "PaperMod"

[params]
description = "Old description"
`;
      vi.mocked(fs.readFile).mockResolvedValue(existingConfig);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await hugoService.updateConfig({
        title: 'Updated Blog Title',
        params: {
          description: 'New description'
        }
      });

      expect(fs.writeFile).toHaveBeenCalled();
      const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
      const writtenContent = writeCall[1] as string;
      expect(writtenContent).toContain('Updated Blog Title');
      expect(writtenContent).toContain('New description');
    });

    it('should merge params with existing configuration', async () => {
      const existingConfig = `
baseURL = "https://example.com"
title = "My Blog"

[params]
author = "John Doe"
ShowReadingTime = true
`;
      vi.mocked(fs.readFile).mockResolvedValue(existingConfig);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await hugoService.updateConfig({
        params: {
          description: 'New description'
        }
      });

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
      const writtenContent = writeCall[1] as string;

      // Should preserve existing params
      expect(writtenContent).toContain('author');
      expect(writtenContent).toContain('ShowReadingTime');
      // Should add new param
      expect(writtenContent).toContain('description');
    });

    it('should validate baseURL format', async () => {
      const existingConfig = 'title = "My Blog"';
      vi.mocked(fs.readFile).mockResolvedValue(existingConfig);

      await expect(
        hugoService.updateConfig({ baseURL: 'not-a-valid-url' })
      ).rejects.toThrow('baseURL must be a valid URL');
    });

    it('should validate title is a string', async () => {
      const existingConfig = 'title = "My Blog"';
      vi.mocked(fs.readFile).mockResolvedValue(existingConfig);

      await expect(
        hugoService.updateConfig({ title: 123 as any })
      ).rejects.toThrow('title must be a string');
    });

    it('should validate languageCode is a string', async () => {
      const existingConfig = 'title = "My Blog"';
      vi.mocked(fs.readFile).mockResolvedValue(existingConfig);

      await expect(
        hugoService.updateConfig({ languageCode: true as any })
      ).rejects.toThrow('languageCode must be a string');
    });

    it('should validate theme is a string', async () => {
      const existingConfig = 'title = "My Blog"';
      vi.mocked(fs.readFile).mockResolvedValue(existingConfig);

      await expect(
        hugoService.updateConfig({ theme: [] as any })
      ).rejects.toThrow('theme must be a string');
    });

    it('should validate params is an object', async () => {
      const existingConfig = 'title = "My Blog"';
      vi.mocked(fs.readFile).mockResolvedValue(existingConfig);

      await expect(
        hugoService.updateConfig({ params: 'not an object' as any })
      ).rejects.toThrow('params must be an object');
    });

    it('should allow empty baseURL', async () => {
      const existingConfig = 'title = "My Blog"';
      vi.mocked(fs.readFile).mockResolvedValue(existingConfig);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await expect(
        hugoService.updateConfig({ baseURL: '' })
      ).resolves.toBeUndefined();
    });

    it('should throw error if write fails', async () => {
      const existingConfig = 'title = "My Blog"';
      vi.mocked(fs.readFile).mockResolvedValue(existingConfig);
      vi.mocked(fs.writeFile).mockRejectedValue(new Error('Permission denied'));

      await expect(
        hugoService.updateConfig({ title: 'New Title' })
      ).rejects.toThrow('Failed to update Hugo configuration');
    });
  });

  describe('isPreviewServerRunning', () => {
    it('should return false when no server is running', () => {
      expect(hugoService.isPreviewServerRunning()).toBe(false);
    });

    it('should return true when server is running', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      setTimeout(() => {
        mockProcess.stdout?.emit('data', Buffer.from('Web Server is available at localhost:1313\n'));
      }, 10);

      await hugoService.startPreviewServer();

      expect(hugoService.isPreviewServerRunning()).toBe(true);
    });

    it('should return false after server is stopped', async () => {
      const mockProcess = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      setTimeout(() => {
        mockProcess.stdout?.emit('data', Buffer.from('Web Server is available at localhost:1313\n'));
      }, 10);

      await hugoService.startPreviewServer();

      const stopPromise = hugoService.stopPreviewServer();
      setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);
      await stopPromise;

      expect(hugoService.isPreviewServerRunning()).toBe(false);
    });
  });

  describe('getPublicFolderPath', () => {
    it('should return path to public folder', () => {
      const publicPath = hugoService.getPublicFolderPath();
      expect(publicPath).toContain('public');
      expect(publicPath).toContain(testProjectPath.replace(/\//g, path.sep));
    });
  });
});

/**
 * Create a mock child process with EventEmitter capabilities
 */
function createMockProcess() {
  const process = new EventEmitter() as any;
  process.stdout = new EventEmitter();
  process.stderr = new EventEmitter();
  process.kill = vi.fn();
  process.killed = false;
  return process;
}
