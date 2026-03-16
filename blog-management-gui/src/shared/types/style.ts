// Style Configuration Types

export interface StyleConfiguration {
  version: number;
  hugoConfig: Partial<import('./hugo').HugoConfig>;
  colorTheme: ColorTheme;
  layoutSettings: LayoutSettings;
  fontSettings: FontSettings;
  customCSS: string;
}

export interface ColorTheme {
  mode: 'light' | 'dark';
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  accentColor: string;
}

export interface LayoutSettings {
  homeLayout: 'list' | 'card';
  showSidebar: boolean;
  sidebarContent: string[];
  navigationMenu: MenuItem[];
}

export interface MenuItem {
  name: string;
  url: string;
  weight: number;
}

export interface FontSettings {
  fontFamily: string;
  headingFontSize: number;
  bodyFontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface StyleHistoryEntry {
  id: string;
  timestamp: Date;
  description: string;
  config: StyleConfiguration;
}
