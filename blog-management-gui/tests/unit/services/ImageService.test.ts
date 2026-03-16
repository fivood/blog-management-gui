import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ImageService } from '../../../src/main/services/ImageService';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('ImageService', () => {
  let imageService: ImageService;
  let testHugoPath: string;
  let testImagesPath: string;

  beforeEach(async () => {
    // Create a temporary directory for testing
    testHugoPath = await fs.mkdtemp(path.join(os.tmpdir(), 'hugo-test-'));
    testImagesPath = path.join(testHugoPath, 'static', 'images');
    
    imageService = new ImageService(testHugoPath);
    await imageService.initialize();
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(testHugoPath, { recursive: true, force: true });
    } catch (error) {
      console.error('Failed to clean up test directory:', error);
    }
  });

  describe('initialize', () => {
    it('should create the images directory', async () => {
      const stats = await fs.stat(testImagesPath);
      expect(stats.isDirectory()).toBe(true);
    });
  });

  describe('listImages', () => {
    it('should return an empty array when no images exist', async () => {
      const images = await imageService.listImages();
      expect(images).toEqual([]);
    });

    it('should list all valid image files', async () => {
      // Create test image files
      const testFiles = [
        'test1.png',
        'test2.jpg',
        'test3.jpeg',
        'test4.gif',
        'test5.webp'
      ];

      for (const filename of testFiles) {
        const filePath = path.join(testImagesPath, filename);
        await fs.writeFile(filePath, 'fake image data');
      }

      const images = await imageService.listImages();
      
      expect(images).toHaveLength(5);
      expect(images.every(img => testFiles.includes(img.filename))).toBe(true);
    });

    it('should filter out non-image files', async () => {
      // Create mixed files
      await fs.writeFile(path.join(testImagesPath, 'image.png'), 'data');
      await fs.writeFile(path.join(testImagesPath, 'document.txt'), 'data');
      await fs.writeFile(path.join(testImagesPath, 'script.js'), 'data');

      const images = await imageService.listImages();
      
      expect(images).toHaveLength(1);
      expect(images[0].filename).toBe('image.png');
    });

    it('should include correct metadata for each image', async () => {
      const filename = 'test.png';
      const filePath = path.join(testImagesPath, filename);
      await fs.writeFile(filePath, 'test data');

      const images = await imageService.listImages();
      
      expect(images).toHaveLength(1);
      expect(images[0]).toMatchObject({
        filename: 'test.png',
        originalName: 'test.png',
        mimeType: 'image/png',
        path: '/images/test.png'
      });
      expect(images[0].size).toBeGreaterThan(0);
      expect(images[0].uploadedAt).toBeInstanceOf(Date);
    });

    it('should sort images by upload date (newest first)', async () => {
      // Create files with delays to ensure different timestamps
      await fs.writeFile(path.join(testImagesPath, 'old.png'), 'data');
      await new Promise(resolve => setTimeout(resolve, 10));
      await fs.writeFile(path.join(testImagesPath, 'new.png'), 'data');

      const images = await imageService.listImages();
      
      expect(images[0].filename).toBe('new.png');
      expect(images[1].filename).toBe('old.png');
    });
  });

  describe('uploadImage', () => {
    it('should upload a valid PNG image', async () => {
      // Create a temporary source file
      const sourcePath = path.join(os.tmpdir(), 'source.png');
      await fs.writeFile(sourcePath, 'test image data');

      try {
        const metadata = await imageService.uploadImage(sourcePath, 'myimage.png');

        expect(metadata.originalName).toBe('myimage.png');
        expect(metadata.mimeType).toBe('image/png');
        expect(metadata.size).toBeGreaterThan(0);
        expect(metadata.filename).toMatch(/^\d+-[a-f0-9]+\.png$/);
        expect(metadata.path).toBe(`/images/${metadata.filename}`);

        // Verify file was copied
        const destPath = path.join(testImagesPath, metadata.filename);
        const exists = await fs.access(destPath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      } finally {
        await fs.unlink(sourcePath).catch(() => {});
      }
    });

    it('should upload images with different formats', async () => {
      const formats = [
        { ext: '.jpg', mime: 'image/jpeg' },
        { ext: '.jpeg', mime: 'image/jpeg' },
        { ext: '.gif', mime: 'image/gif' },
        { ext: '.webp', mime: 'image/webp' }
      ];

      for (const format of formats) {
        const sourcePath = path.join(os.tmpdir(), `source${format.ext}`);
        await fs.writeFile(sourcePath, 'test data');

        try {
          const metadata = await imageService.uploadImage(
            sourcePath,
            `image${format.ext}`
          );

          expect(metadata.mimeType).toBe(format.mime);
          expect(metadata.filename).toMatch(new RegExp(`\\${format.ext}$`));
        } finally {
          await fs.unlink(sourcePath).catch(() => {});
        }
      }
    });

    it('should reject invalid image formats', async () => {
      const sourcePath = path.join(os.tmpdir(), 'document.txt');
      await fs.writeFile(sourcePath, 'not an image');

      try {
        await expect(
          imageService.uploadImage(sourcePath, 'document.txt')
        ).rejects.toThrow('Invalid image format');
      } finally {
        await fs.unlink(sourcePath).catch(() => {});
      }
    });

    it('should generate unique filenames for multiple uploads', async () => {
      const sourcePath = path.join(os.tmpdir(), 'source.png');
      await fs.writeFile(sourcePath, 'test data');

      try {
        const metadata1 = await imageService.uploadImage(sourcePath, 'image.png');
        const metadata2 = await imageService.uploadImage(sourcePath, 'image.png');
        const metadata3 = await imageService.uploadImage(sourcePath, 'image.png');

        // All filenames should be different
        expect(metadata1.filename).not.toBe(metadata2.filename);
        expect(metadata2.filename).not.toBe(metadata3.filename);
        expect(metadata1.filename).not.toBe(metadata3.filename);

        // All files should exist
        const images = await imageService.listImages();
        expect(images).toHaveLength(3);
      } finally {
        await fs.unlink(sourcePath).catch(() => {});
      }
    });

    it('should handle case-insensitive file extensions', async () => {
      const sourcePath = path.join(os.tmpdir(), 'source.PNG');
      await fs.writeFile(sourcePath, 'test data');

      try {
        const metadata = await imageService.uploadImage(sourcePath, 'IMAGE.PNG');
        
        expect(metadata.mimeType).toBe('image/png');
        expect(metadata.filename).toMatch(/\.png$/i);
      } finally {
        await fs.unlink(sourcePath).catch(() => {});
      }
    });
  });

  describe('deleteImage', () => {
    it('should delete an existing image', async () => {
      // Create a test image
      const filename = 'test-delete.png';
      const filePath = path.join(testImagesPath, filename);
      await fs.writeFile(filePath, 'test data');

      // Verify it exists
      let images = await imageService.listImages();
      expect(images).toHaveLength(1);

      // Delete it
      await imageService.deleteImage(filename);

      // Verify it's gone
      images = await imageService.listImages();
      expect(images).toHaveLength(0);
    });

    it('should throw error when deleting non-existent image', async () => {
      await expect(
        imageService.deleteImage('nonexistent.png')
      ).rejects.toThrow('Image not found');
    });

    it('should reject filenames with directory traversal attempts', async () => {
      await expect(
        imageService.deleteImage('../../../etc/passwd')
      ).rejects.toThrow('Invalid filename');

      await expect(
        imageService.deleteImage('..\\..\\windows\\system32')
      ).rejects.toThrow('Invalid filename');

      await expect(
        imageService.deleteImage('subdir/image.png')
      ).rejects.toThrow('Invalid filename');
    });
  });

  describe('getImagePath', () => {
    it('should return correct file system path', () => {
      const filename = 'test.png';
      const imagePath = imageService.getImagePath(filename);
      
      expect(imagePath).toBe(path.join(testImagesPath, filename));
    });

    it('should reject filenames with directory traversal attempts', () => {
      expect(() => imageService.getImagePath('../../../etc/passwd')).toThrow('Invalid filename');
      expect(() => imageService.getImagePath('..\\..\\windows\\system32')).toThrow('Invalid filename');
      expect(() => imageService.getImagePath('subdir/image.png')).toThrow('Invalid filename');
    });
  });

  describe('format validation', () => {
    it('should accept all supported formats', async () => {
      const supportedFormats = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
      
      for (const ext of supportedFormats) {
        const sourcePath = path.join(os.tmpdir(), `test${ext}`);
        await fs.writeFile(sourcePath, 'data');

        try {
          await expect(
            imageService.uploadImage(sourcePath, `image${ext}`)
          ).resolves.toBeDefined();
        } finally {
          await fs.unlink(sourcePath).catch(() => {});
        }
      }
    });

    it('should reject unsupported formats', async () => {
      const unsupportedFormats = ['.bmp', '.tiff', '.svg', '.pdf', '.txt'];
      
      for (const ext of unsupportedFormats) {
        const sourcePath = path.join(os.tmpdir(), `test${ext}`);
        await fs.writeFile(sourcePath, 'data');

        try {
          await expect(
            imageService.uploadImage(sourcePath, `file${ext}`)
          ).rejects.toThrow('Invalid image format');
        } finally {
          await fs.unlink(sourcePath).catch(() => {});
        }
      }
    });
  });

  describe('filename uniqueness', () => {
    it('should generate filenames with timestamp and random components', async () => {
      const sourcePath = path.join(os.tmpdir(), 'source.png');
      await fs.writeFile(sourcePath, 'data');

      try {
        const metadata = await imageService.uploadImage(sourcePath, 'test.png');
        
        // Filename should match pattern: timestamp-randomhex.ext
        expect(metadata.filename).toMatch(/^\d{13}-[a-f0-9]{16}\.png$/);
      } finally {
        await fs.unlink(sourcePath).catch(() => {});
      }
    });

    it('should preserve file extension in generated filename', async () => {
      const formats = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
      
      for (const ext of formats) {
        const sourcePath = path.join(os.tmpdir(), `source${ext}`);
        await fs.writeFile(sourcePath, 'data');

        try {
          const metadata = await imageService.uploadImage(sourcePath, `image${ext}`);
          expect(metadata.filename).toMatch(new RegExp(`\\${ext}$`));
        } finally {
          await fs.unlink(sourcePath).catch(() => {});
        }
      }
    });
  });
});
