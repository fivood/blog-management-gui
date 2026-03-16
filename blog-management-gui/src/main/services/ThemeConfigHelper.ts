import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Handles Hugo configuration file operations (finding, reading, writing, backup).
 */
export class ThemeConfigHelper {
  private hugoProjectPath: string;

  constructor(hugoProjectPath: string) {
    this.hugoProjectPath = hugoProjectPath;
  }

  updatePath(hugoProjectPath: string): void {
    this.hugoProjectPath = hugoProjectPath;
  }

  async findConfigFile(): Promise<string> {
    const configs = ['hugo.toml', 'config.toml', 'hugo.yaml', 'config.yaml'];
    for (const config of configs) {
      const p = path.join(this.hugoProjectPath, config);
      try {
        await fs.access(p);
        return p;
      } catch {}
    }
    throw new Error('Hugo configuration file not found');
  }

  async readConfig(): Promise<string> {
    const configPath = await this.findConfigFile();
    return fs.readFile(configPath, 'utf-8');
  }

  async writeConfig(content: string): Promise<void> {
    const configPath = await this.findConfigFile();
    const tmpPath = `${configPath}.tmp`;
    await fs.writeFile(tmpPath, content, 'utf-8');
    await fs.rename(tmpPath, configPath);
  }

  async backupConfig(): Promise<string> {
    const configPath = await this.findConfigFile();
    const backupDir = path.join(this.hugoProjectPath, '.backup', 'themes');
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${path.basename(configPath)}.${timestamp}.bak`);
    
    await fs.copyFile(configPath, backupPath);
    return backupPath;
  }

  async restoreConfig(backupPath: string): Promise<void> {
    const configPath = await this.findConfigFile();
    await fs.copyFile(backupPath, configPath);
  }
}
