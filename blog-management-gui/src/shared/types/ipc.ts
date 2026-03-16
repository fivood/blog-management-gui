// IPC Communication Types

export interface IPCRequest<T = any> {
  channel: string;
  data?: T;
  requestId: string;
}

export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  requestId: string;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'FILE_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'DISK_FULL'
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'PROCESS_ERROR'
  | 'STATE_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userMessage: string;
  suggestedAction?: string;
}
