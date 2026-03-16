import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { ImageMetadata } from '../../shared/types/image';

/**
 * ImageService manages image uploads and storage for the Hugo blog
 * Handles image validation, unique filename generation, and file system operations
 * 
 * Requirements:
 * - 6.1-6.6: Image upload with format validation and unique filenames
 * - 7.1-7.6: Image gallery management
 * - 8.1-8.4: Insert images into articles
 */
export class ImageService {
  private imagesPath: string;
  
  // Supported image formats
  private readonly SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  
  // MIME type mapping
  private readonly MIME_TYPES: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };

  constructor(hugoProjectPath: string) {
    this.imagesPath = path.join(hugoProjectPath, 'static', 'images');
  }

  /**
   * Update Hugo project path
   */
  updateHugoProjectPath(hugoProjectPath: string): void {
    this.imagesPath = path.join(hugoProjectPath, 'static', 'images');
    // Ensure new directory exists
    this.initialize().catch(err => {
      console.error('Failed to initialize images directory after path change:', err);
    });
  }

  /**
   * List all images in the static/images directory
   * Requirements: 7.1-7.6 - Display all uploaded images in gallery
   * 
   * @returns Promise resolving to array of image metadata
   */
  async listImages(): Promise<ImageMetadata[]> {
    try {
      // Ensure images directory exists
      await this.ensureImagesDirectory();

      // Read directory contents
      const files = await fs.readdir(this.imagesPath);

      // Filter for supported image formats and get metadata
      const imagePromises = files
        .filter(file => this.isValidImageFormat(file))
        .map(async (filename) => {
          const filePath = path.join(this.imagesPath, filename);
          const stats = await fs.stat(filePath);
          const ext = path.extname(filename).toLowerCase();

          return {
            filename,
            originalName: filename,
            size: stats.size,
            mimeType: this.MIME_TYPES[ext] || 'application/octet-stream',
            uploadedAt: stats.birthtime,
            path: `/images/${filename}`
          };
        });

      const images = await Promise.all(imagePromises);

      // Sort by upload date (newest first)
      return images.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to list images: ${message}`);
    }
  }

  /**
   * Upload an image file to the Hugo project
   * Requirements: 6.1-6.6 - Upload image with format validation and unique filename
   * 
   * @param filePath Path to the source image file
   * @param originalName Original filename
   * @returns Promise resolving to the uploaded image metadata
   */
  async uploadImage(filePath: string, originalName: string): Promise<ImageMetadata> {
    try {
      // Validate file format
      const ext = path.extname(originalName).toLowerCase();
      if (!this.isValidImageFormat(originalName)) {
        throw new Error(
          `Invalid image format. Supported formats: ${this.SUPPORTED_FORMATS.join(', ')}`
        );
      }

      // Ensure images directory exists
      await this.ensureImagesDirectory();

      // Generate unique filename
      const uniqueFilename = this.generateUniqueFilename(ext);
      const destPath = path.join(this.imagesPath, uniqueFilename);

      // Copy file to Hugo project
      await fs.copyFile(filePath, destPath);

      // Get file stats
      const stats = await fs.stat(destPath);

      // Return metadata
      return {
        filename: uniqueFilename,
        originalName,
        size: stats.size,
        mimeType: this.MIME_TYPES[ext] || 'application/octet-stream',
        uploadedAt: new Date(),
        path: `/images/${uniqueFilename}`
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload image: ${message}`);
    }
  }

  /**
   * Upload an image from base64 data
   * Requirements: 6.1-6.6 - Upload image with format validation and unique filename
   * 
   * @param base64Data Base64 encoded image data
   * @param filename Desired filename (will be made unique)
   * @returns Promise resolving to the uploaded image metadata
   */
  async uploadFromBase64(base64Data: string, filename: string): Promise<ImageMetadata> {
    try {
      // Validate file format
      const ext = path.extname(filename).toLowerCase();
      if (!this.SUPPORTED_FORMATS.includes(ext)) {
        throw new Error(
          `Invalid image format. Supported formats: ${this.SUPPORTED_FORMATS.join(', ')}`
        );
      }

      // Ensure images directory exists
      await this.ensureImagesDirectory();

      // Generate unique filename
      const uniqueFilename = this.generateUniqueFilename(ext);
      const destPath = path.join(this.imagesPath, uniqueFilename);

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // Write file to Hugo project
      await fs.writeFile(destPath, buffer);

      // Get file stats
      const stats = await fs.stat(destPath);

      // Return metadata
      return {
        filename: uniqueFilename,
        originalName: filename,
        size: stats.size,
        mimeType: this.MIME_TYPES[ext] || 'application/octet-stream',
        uploadedAt: new Date(),
        path: `/images/${uniqueFilename}`
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload image from base64: ${message}`);
    }
  }

  /**
   * Delete an image from the Hugo project
   * Requirements: 7.6 - Delete image with file system cleanup
   * 
   * @param filename Name of the image file to delete
   * @returns Promise resolving when deletion is complete
   */
  async deleteImage(filename: string): Promise<void> {
    try {
      // Validate filename to prevent directory traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new Error('Invalid filename');
      }

      const filePath = path.join(this.imagesPath, filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        throw new Error(`Image not found: ${filename}`);
      }

      // Delete the file
      await fs.unlink(filePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete image: ${message}`);
    }
  }

  /**
   * Get the file system path for an image
   * Requirements: 7.4 - Display image metadata including path
   * 
   * @param filename Name of the image file
   * @returns Full file system path to the image
   */
  getImagePath(filename: string): string {
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new Error('Invalid filename');
    }

    return path.join(this.imagesPath, filename);
  }

  /**
   * Get image as Base64 data URL for display in renderer
   * Requirements: 7.3 - Display full-size image in modal
   * 
   * @param filename Name of the image file
   * @returns Promise resolving to Base64 data URL
   */
  async getImageDataUrl(filename: string): Promise<string> {
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new Error('Invalid filename');
    }

    const filePath = path.join(this.imagesPath, filename);
    
    // Read file as buffer
    const buffer = await fs.readFile(filePath);
    
    // Get MIME type from extension
    const ext = path.extname(filename).toLowerCase();
    const mimeType = this.MIME_TYPES[ext] || 'application/octet-stream';
    
    // Convert to Base64 data URL
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Validate if a file has a supported image format
   * Requirements: 6.2 - Validate file format (PNG, JPG, JPEG, GIF, WebP)
   * 
   * @param filename Name of the file to validate
   * @returns True if the format is supported, false otherwise
   */
  private isValidImageFormat(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return this.SUPPORTED_FORMATS.includes(ext);
  }

  /**
   * Generate a unique filename using timestamp and random string
   * Requirements: 6.6 - Generate unique filenames to avoid conflicts
   * 
   * @param extension File extension (including the dot)
   * @returns Unique filename
   */
  private generateUniqueFilename(extension: string): string {
    // Use timestamp for ordering
    const timestamp = Date.now();
    
    // Generate random string for uniqueness
    const randomString = crypto.randomBytes(8).toString('hex');
    
    // Combine timestamp and random string
    return `${timestamp}-${randomString}${extension}`;
  }

  /**
   * Ensure the images directory exists
   * Creates the directory if it doesn't exist
   */
  private async ensureImagesDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.imagesPath, { recursive: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create images directory: ${message}`);
    }
  }

  /**
   * Initialize the service by ensuring the images directory exists
   */
  async initialize(): Promise<void> {
    await this.ensureImagesDirectory();
  }
}
