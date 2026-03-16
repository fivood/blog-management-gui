// Hugo Types

export interface HugoConfig {
  baseURL: string;
  languageCode: string;
  title: string;
  theme: string;
  params: HugoParams;
}

export interface HugoParams {
  description?: string;
  author?: string;
  ShowReadingTime?: boolean;
  ShowShareButtons?: boolean;
  ShowPostNavLinks?: boolean;
  ShowBreadCrumbs?: boolean;
  ShowCodeCopyButtons?: boolean;
  ShowWordCount?: boolean;
  ShowRssButtonInSectionTermList?: boolean;
  UseHugoToc?: boolean;
  disableSpecial1stPost?: boolean;
  disableScrollToTop?: boolean;
  comments?: boolean;
  hidemeta?: boolean;
  hideSummary?: boolean;
  showtoc?: boolean;
  tocopen?: boolean;
  [key: string]: any;
}

export interface BuildOptions {
  minify?: boolean;
  drafts?: boolean;
}

export interface BuildResult {
  success: boolean;
  output: string[];
  stats: BuildStats;
  error?: string;
}

export interface BuildStats {
  pageCount: number;
  duration: number;
  timestamp: Date;
}

export interface PreviewServer {
  url: string;
  port: number;
  isRunning: boolean;
}
