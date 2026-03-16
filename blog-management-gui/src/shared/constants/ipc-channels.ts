// IPC Channel Constants
// Article channels
export const ARTICLE_LIST = 'article:list';
export const ARTICLE_GET = 'article:get';
export const ARTICLE_CREATE = 'article:create';
export const ARTICLE_UPDATE = 'article:update';
export const ARTICLE_DELETE = 'article:delete';
export const ARTICLE_PUBLISH = 'article:publish';

// Image channels
export const IMAGE_LIST = 'image:list';
export const IMAGE_UPLOAD = 'image:upload';
export const IMAGE_DELETE = 'image:delete';
export const IMAGE_GET_PATH = 'image:get-path';

// Hugo channels
export const HUGO_BUILD = 'hugo:build';
export const HUGO_PREVIEW_START = 'hugo:preview-start';
export const HUGO_PREVIEW_STOP = 'hugo:preview-stop';
export const HUGO_CONFIG_GET = 'hugo:config-get';
export const HUGO_CONFIG_UPDATE = 'hugo:config-update';

// Deploy channels
export const DEPLOY_EXECUTE = 'deploy:execute';
export const DEPLOY_VALIDATE = 'deploy:validate';
export const DEPLOY_STATUS = 'deploy:status';

// Style channels
export const STYLE_GET = 'style:get';
export const STYLE_UPDATE = 'style:update';
export const STYLE_EXPORT = 'style:export';
export const STYLE_IMPORT = 'style:import';
export const STYLE_RESET = 'style:reset';
export const STYLE_HISTORY_GET = 'style:history-get';
export const STYLE_HISTORY_RESTORE = 'style:history-restore';

// Config channels
export const CONFIG_GET = 'config:get';
export const CONFIG_UPDATE = 'config:update';
export const CONFIG_WINDOW_GET = 'config:window-get';
export const CONFIG_WINDOW_SAVE = 'config:window-save';
