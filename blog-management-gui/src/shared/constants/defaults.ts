// Default configuration values
export const DEFAULT_WINDOW_WIDTH = 1200;
export const DEFAULT_WINDOW_HEIGHT = 800;
export const MIN_WINDOW_WIDTH = 800;
export const MIN_WINDOW_HEIGHT = 600;

// Notification durations (ms)
export const SUCCESS_NOTIFICATION_DURATION = 3000;
export const ERROR_NOTIFICATION_DURATION = 0; // Manual dismiss
export const WARNING_NOTIFICATION_DURATION = 5000;
export const INFO_NOTIFICATION_DURATION = 3000;

// Debounce delays (ms)
export const MARKDOWN_PREVIEW_DEBOUNCE = 100;
export const SEARCH_FILTER_DEBOUNCE = 300;
export const AUTO_SAVE_DEBOUNCE = 2000;
export const STYLE_PREVIEW_DEBOUNCE = 500;

// Image formats
export const SUPPORTED_IMAGE_FORMATS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
export const SUPPORTED_IMAGE_MIMETYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp'
];

// Style history
export const MAX_STYLE_HISTORY_ENTRIES = 20;

// Font size ranges
export const MIN_HEADING_FONT_SIZE = 16;
export const MAX_HEADING_FONT_SIZE = 48;
export const MIN_BODY_FONT_SIZE = 12;
export const MAX_BODY_FONT_SIZE = 24;
export const MIN_LINE_HEIGHT = 1.0;
export const MAX_LINE_HEIGHT = 2.5;
export const MIN_LETTER_SPACING = -0.05;
export const MAX_LETTER_SPACING = 0.2;

// Preview device widths
export const DESKTOP_WIDTH = 1200;
export const TABLET_WIDTH = 768;
export const MOBILE_WIDTH = 375;

// Performance
export const MAX_LOG_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_LOG_FILES = 5;
export const ARTICLE_LIST_LOAD_TIMEOUT = 1000; // 1 second
export const ARTICLE_EDITOR_LOAD_TIMEOUT = 500; // 500ms
export const APP_STARTUP_TIMEOUT = 3000; // 3 seconds
