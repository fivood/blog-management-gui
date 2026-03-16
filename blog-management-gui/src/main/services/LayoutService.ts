import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Manages swapping and backing up Hugo layout directories.
 */
export class LayoutService {
  private hugoProjectPath: string;

  constructor(hugoProjectPath: string) {
    this.hugoProjectPath = hugoProjectPath;
  }

  async backupCurrentLayouts(): Promise<string> {
    const layoutsPath = path.join(this.hugoProjectPath, 'layouts');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.hugoProjectPath, `layouts-backup-${timestamp}`);
    
    try {
      await fs.access(layoutsPath);
      await fs.cp(layoutsPath, backupPath, { recursive: true });
      return backupPath;
    } catch {
      return '';
    }
  }

  async switchToThemeLayouts(themeName: string): Promise<void> {
    const layoutsPath = path.join(this.hugoProjectPath, 'layouts');
    const themeLayoutsSource = path.join(this.hugoProjectPath, `layouts-${themeName}`);
    
    try {
      await fs.access(themeLayoutsSource);
      // If the source exists, we replace the current layouts with it
      await fs.rm(layoutsPath, { recursive: true, force: true });
      await fs.cp(themeLayoutsSource, layoutsPath, { recursive: true });
      console.log(`Switched layouts to ${themeName}`);
    } catch {
      console.warn(`No specific layouts found for theme ${themeName}, keeping current or default`);
    }
  }

  async restoreLayouts(backupPath: string): Promise<void> {
    if (!backupPath) return;
    const layoutsPath = path.join(this.hugoProjectPath, 'layouts');
    try {
      await fs.rm(layoutsPath, { recursive: true, force: true });
      await fs.cp(backupPath, layoutsPath, { recursive: true });
    } catch (error) {
      console.error(`Failed to restore layouts from ${backupPath}: ${error}`);
    }
  }
}
