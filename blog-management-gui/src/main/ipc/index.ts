/**
 * IPC Handlers Index
 * 
 * This module exports all IPC handler registration functions.
 * Import and call these functions in the main process to set up IPC communication.
 */

export { registerArticleHandlers } from './article-handlers';
export { registerImageHandlers } from './image-handlers';
export { registerHugoHandlers } from './hugo-handlers';
export { registerDeployHandlers } from './deploy-handlers';
export { registerStyleHandlers } from './style-handlers';
export { registerConfigHandlers } from './config-handlers';
