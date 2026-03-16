import React, { useEffect, useState, useCallback } from 'react';
import { Card, Spin, Empty, Space, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useImages } from '../../hooks/useImages';
import { useNotification } from '../../contexts/NotificationContext';
import ImageGrid from './ImageGrid';
import ImageUpload from './ImageUpload';
import ImagePreview from './ImagePreview';
import type { ImageMetadata } from '../../../shared/types';

/**
 * ImageGalleryView Component
 * Requirements: 6.1-6.6, 7.1-7.6, 8.1-8.4, 19.4
 * 
 * Features:
 * - Display images using ImageGrid component in grid layout
 * - ImageUpload component for uploading new images
 * - Support selection mode (selectionMode prop) for inserting into editor
 * - Load images using useImages hook on mount
 * - Show ImagePreview modal when clicking an image
 * - Implement lazy loading for performance
 */

interface ImageGalleryViewProps {
  selectionMode?: boolean;
  onSelectImage?: (imagePath: string) => void;
}

const ImageGalleryView: React.FC<ImageGalleryViewProps> = ({
  selectionMode = false,
  onSelectImage
}) => {
  const { 
    images, 
    loading, 
    error, 
    loadImages, 
    deleteImage 
  } = useImages();
  
  const { showNotification } = useNotification();
  
  const [previewImage, setPreviewImage] = useState<ImageMetadata | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Load images on mount
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Show error notification if loading fails
  useEffect(() => {
    if (error) {
      showNotification('error', error);
    }
  }, [error, showNotification]);

  // Handle image click - show preview
  const handleImageClick = useCallback((image: ImageMetadata) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  }, []);

  // Handle image selection (in selection mode)
  const handleImageSelect = useCallback((image: ImageMetadata) => {
    if (selectionMode && onSelectImage) {
      const imagePath = `/images/${image.filename}`;
      onSelectImage(imagePath);
      showNotification('success', '图片已插入到编辑器');
    }
  }, [selectionMode, onSelectImage, showNotification]);

  // Handle upload success
  const handleUploadSuccess = useCallback(() => {
    showNotification('success', '图片上传成功');
    loadImages(); // Refresh image list
  }, [showNotification, loadImages]);

  // Handle upload error
  const handleUploadError = useCallback((errorMsg: string) => {
    showNotification('error', errorMsg);
  }, [showNotification]);

  // Handle delete
  const handleDelete = useCallback(async (filename: string) => {
    const success = await deleteImage(filename);
    if (success) {
      showNotification('success', '图片已删除');
    } else {
      showNotification('error', '删除图片失败');
    }
  }, [deleteImage, showNotification]);

  // Handle preview close
  const handlePreviewClose = useCallback(() => {
    setPreviewVisible(false);
    setPreviewImage(null);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadImages();
  }, [loadImages]);

  return (
    <div style={{ 
      padding: 24,
      height: 'calc(100vh - 64px)',
      overflow: 'auto'
    }}>
      <Card
        title={
          <Space>
            <span>{selectionMode ? '选择图片' : '图片库'}</span>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              size="small"
            >
              刷新
            </Button>
          </Space>
        }
        extra={
          selectionMode && (
            <span style={{ fontSize: 14, color: '#999' }}>
              点击图片插入到编辑器
            </span>
          )
        }
      >
        {/* Upload section */}
        <ImageUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />

        {/* Loading state */}
        {loading && images.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        )}

        {/* Empty state */}
        {!loading && images.length === 0 && (
          <Empty
            description="暂无图片，请上传图片"
            style={{ padding: '48px 0' }}
          />
        )}

        {/* Image grid */}
        {images.length > 0 && (
          <ImageGrid
            images={images}
            loading={loading}
            selectionMode={selectionMode}
            onImageClick={handleImageClick}
            onImageSelect={handleImageSelect}
            onDelete={handleDelete}
          />
        )}
      </Card>

      {/* Image preview modal */}
      <ImagePreview
        image={previewImage}
        visible={previewVisible}
        onClose={handlePreviewClose}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ImageGalleryView;
