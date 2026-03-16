import { useState, useCallback } from 'react';
import type { ImageMetadata } from '../../shared/types';

/**
 * useImages - Hook for image operations
 * Requirements: 6.1-6.6, 7.1-7.6, 8.1-8.4
 * 
 * Provides:
 * - List images
 * - Upload image
 * - Delete image
 * - Get image path
 * - Generate Markdown link
 * 
 * Usage:
 * ```tsx
 * const { images, loading, loadImages, uploadImage, deleteImage } = useImages();
 * 
 * useEffect(() => {
 *   loadImages();
 * }, []);
 * ```
 */
export function useImages() {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Load images list
  const loadImages = useCallback(async (): Promise<ImageMetadata[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.image.list();
      
      if (response.success && response.data) {
        setImages(response.data);
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to load images';
        setError(errorMessage);
        return [];
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load images';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload image
  const uploadImage = useCallback(async (
    sourcePath: string, 
    originalName: string
  ): Promise<ImageMetadata | null> => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress (since we don't have real progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await window.electronAPI.image.upload(sourcePath, originalName);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success && response.data) {
        // Refresh images list
        await loadImages();
        setUploadProgress(0);
        return response.data;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to upload image';
        setError(errorMessage);
        setUploadProgress(0);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      setUploadProgress(0);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadImages]);

  // Delete image
  const deleteImage = useCallback(async (filename: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.electronAPI.image.delete(filename);
      
      if (response.success) {
        // Refresh images list
        await loadImages();
        return true;
      } else {
        const errorMessage = response.error?.userMessage || 'Failed to delete image';
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete image';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadImages]);

  // Get image path
  const getImagePath = useCallback(async (filename: string): Promise<string | null> => {
    try {
      const response = await window.electronAPI.image.getPath(filename);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }, []);

  // Generate Markdown link for image
  const getMarkdownLink = useCallback((filename: string, altText: string = ''): string => {
    return `![${altText}](/images/${filename})`;
  }, []);

  // Copy Markdown link to clipboard
  const copyMarkdownLink = useCallback(async (
    filename: string, 
    altText: string = ''
  ): Promise<boolean> => {
    try {
      const markdownLink = getMarkdownLink(filename, altText);
      await navigator.clipboard.writeText(markdownLink);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }, [getMarkdownLink]);

  return {
    images,
    loading,
    error,
    uploadProgress,
    loadImages,
    uploadImage,
    deleteImage,
    getImagePath,
    getMarkdownLink,
    copyMarkdownLink
  };
}
