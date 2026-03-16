import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

/**
 * Manages Git submodule operations for Hugo themes.
 */
export class GitSubmoduleManager {
  private cwd: string;

  constructor(cwd: string) {
    this.cwd = cwd;
  }

  async addSubmodule(repoUrl: string, path: string): Promise<void> {
    try {
      await execAsync(`git submodule add ${repoUrl} ${path}`, { cwd: this.cwd });
    } catch (error) {
      console.error(`Failed to add submodule: ${error}`);
      throw error;
    }
  }

  async removeSubmodule(path: string): Promise<void> {
    try {
      await execAsync(`git submodule deinit -f ${path}`, { cwd: this.cwd });
      await execAsync(`git rm -f ${path}`, { cwd: this.cwd });
      // .git/modules directory cleanup is optional but recommended
    } catch (error) {
      console.error(`Failed to remove submodule: ${error}`);
      throw error;
    }
  }

  async listSubmodules(): Promise<{name: string, path: string, url: string, commit: string}[]> {
    try {
      const { stdout } = await execAsync('git submodule status', { cwd: this.cwd });
      return stdout.trim().split('\n').filter(Boolean).map(line => {
        const parts = line.trim().split(' ');
        // Status might start with - (not initialized) or + (mismatched)
        const pathMatch = line.match(/\s(\S+)\s\(/);
        const p = pathMatch ? pathMatch[1] : parts[1];
        return {
          name: p.split('/').pop() || '',
          path: p,
          url: '', // Git submodule status doesn't show URL directly
          commit: parts[0].replace(/[+-]/, '')
        };
      });
    } catch {
      return [];
    }
  }
}
