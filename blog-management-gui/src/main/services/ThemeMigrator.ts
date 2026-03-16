import { ThemeConfig } from '../../shared/types/theme';

/**
 * Handles configuration comparison and migration logic.
 */
export class ThemeMigrator {
  analyzeMigration(currentConfig: string, newThemeConfig: ThemeConfig | null): {
    hasChanges: boolean;
    suggestions: string[];
    newParams: Record<string, any>;
    obsoleteParams: string[];
  } {
    const suggestions: string[] = [];
    const newParams: Record<string, any> = {};
    const obsoleteParams: string[] = [];

    if (!newThemeConfig) {
      return { hasChanges: false, suggestions: ['未找到新主题的配置示例，建议手动检查。'], newParams: {}, obsoleteParams: [] };
    }

    const currentParams = this.extractParams(currentConfig);
    const recommended = newThemeConfig.recommendedParams || {};

    for (const [key, value] of Object.entries(recommended)) {
      if (!(key in currentParams)) {
        newParams[key] = value;
        suggestions.push(`添加新参数: ${key} = ${JSON.stringify(value)}`);
      } else if (currentParams[key] !== value) {
        suggestions.push(`参数 ${key} 在新主题中推荐值为 ${JSON.stringify(value)}，当前值为 ${JSON.stringify(currentParams[key])}`);
      }
    }

    for (const key of Object.keys(currentParams)) {
      if (!(key in recommended)) {
        obsoleteParams.push(key);
        suggestions.push(`参数 ${key} 可能在新主题中已废弃`);
      }
    }

    return {
      hasChanges: Object.keys(newParams).length > 0 || obsoleteParams.length > 0,
      suggestions,
      newParams,
      obsoleteParams
    };
  }

  applyMigration(configContent: string, newParams: Record<string, any>, obsoleteParams: string[], removeObsolete: boolean): string {
    let lines = configContent.split('\n');
    const paramsIndex = lines.findIndex(l => l.trim() === '[params]');
    
    if (paramsIndex === -1 && Object.keys(newParams).length > 0) {
      lines.push('', '[params]');
    }

    if (removeObsolete) {
      lines = lines.filter(line => {
        const match = line.match(/^\s*(\w+)\s*=/);
        return !match || !obsoleteParams.includes(match[1]);
      });
    }

    const insertIdx = lines.findIndex(l => l.trim() === '[params]') + 1;
    for (const [key, value] of Object.entries(newParams)) {
      lines.splice(insertIdx, 0, `${key} = ${JSON.stringify(value)}`);
    }

    return lines.join('\n');
  }

  private extractParams(content: string): Record<string, any> {
    const params: Record<string, any> = {};
    const match = content.match(/\[params\]([\s\S]*?)(?=\n\[|$)/);
    if (match) {
      const lines = match[1].split('\n');
      for (const line of lines) {
        const m = line.match(/^\s*(\w+)\s*=\s*(.*)$/);
        if (m) params[m[1]] = m[2].trim();
      }
    }
    return params;
  }
}
