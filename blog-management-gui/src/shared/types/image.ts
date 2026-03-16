// Image Types

export interface ImageMetadata {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  path: string;
  width?: number;
  height?: number;
}

export interface ImageItem {
  filename: string;
  path: string;
  size: number;
  uploadedAt: Date;
  thumbnailUrl: string;
}
