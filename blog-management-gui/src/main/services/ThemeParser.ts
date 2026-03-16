import { ThemeConfig } from '../../shared/types/theme';

/**
 * Isolates complex TOML and YAML parsing logic for theme configurations.
 */
export class ThemeParser {
  parseThemeToml(content: string, themeName: string): ThemeConfig {
    const config: ThemeConfig = { name: themeName };
    const minVersionMatch = content.match(/^min_version\s*=\s*["']([^"']+)["']/m);
    if (minVersionMatch) config.minHugoVersion = minVersionMatch[1];
    return config;
  }

  parseExampleToml(content: string, themeName: string): ThemeConfig {
    const config: ThemeConfig = { name: themeName, recommendedParams: {}, paramDescriptions: {} };
    const paramsMatch = content.match(/\[params\]([\s\S]*?)(?=\n\[|$)/);
    if (paramsMatch) {
      const paramsContent = paramsMatch[1];
      const paramLines = paramsContent.split('\n');
      for (const line of paramLines) {
        const match = line.match(/^\s*(\w+)\s*=\s*(.*)$/);
        if (match) {
          const [, key, value] = match;
          config.recommendedParams![key] = this.stripQuotes(value.trim());
        }
      }
    }
    return config;
  }

  parseExampleYaml(content: string, themeName: string): ThemeConfig {
    const config: ThemeConfig = { name: themeName, recommendedParams: {}, paramDescriptions: {} };
    const paramsMatch = content.match(/^params:\s*([\s\S]*?)(?=\n\w+:|$)/m);
    if (paramsMatch) {
      const paramsContent = paramsMatch[1];
      const lines = paramsContent.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s{2,}(\w+):\s*(.*)$/);
        if (match) {
          const [, key, value] = match;
          config.recommendedParams![key] = this.stripQuotes(value.trim());
        }
      }
    }
    return config;
  }

  private stripQuotes(val: string): any {
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      return val.substring(1, val.length - 1);
    }
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (!isNaN(Number(val)) && val !== '') return Number(val);
    return val;
  }
}
