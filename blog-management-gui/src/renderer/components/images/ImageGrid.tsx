import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, Typography, Tooltip, Modal, message, Spin } from 'antd';
import { CopyOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ImageMetadata } from '../../../shared/types';

/**
 * ImageGrid Component
 * Requirements: 7.1-7.6
 * 
 * Features:
 * - Display image thumbnails in responsive grid
 * - Show filename, size, upload date for each image
 * - "Copy Markdown Link" button for each image
 * - "Delete" button with confirmation dialog
 * - Handle image selection in selection mode
 */

const { Text } = Typography;

interface ImageGridProps {
  images: ImageMetadata[];
  loading?: boolean;
  selectionMode?: boolean;
  onImageClick?: (image: ImageMetadata) => void;
  onImageSelect?: (image: ImageMetadata) => void;
  onDelete?: (filename: string) => void;
}

/**
 * ImageCard Component - Displays a single image with lazy-loaded thumbnail
 */
const ImageCard: React.FC<{
  image: ImageMetadata;
  selectionMode: boolean;
  onImageClick?: (image: ImageMetadata) => void;
  onImageSelect?: (image: ImageMetadata) => void;
  onDelete?: (filename: string) => void;
}> = ({ image, selectionMode, onImageClick, onImageSelect, onDelete }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load image data URL when component mounts
  useEffect(() => {
    loadImageData();
  }, [image.filename]);

  const loadImageData = async () => {
    try {
      const filename = image.path.replace('/images/', '');
      const response = await window.electronAPI.image.getDataUrl(filename);
      
      if (response.success && response.data) {
        setImageUrl(response.data);
      } else {
        console.error('Failed to load image:', response.error);
      }
    } catch (error) {
      console.error('Failed to load image:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Handle copy Markdown link
  const handleCopyMarkdown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const markdownLink = `![](/images/${image.filename})`;
      await navigator.clipboard.writeText(markdownLink);
      message.success('Markdown 链接已复制到剪贴板');
    } catch (error) {
      message.error('复制失败');
    }
  };

  // Handle delete with confirmation
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除图片 "${image.originalName}" 吗？此操作无法撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        onDelete?.(image.filename);
      }
    });
  };

  // Handle image click
  const handleImageClick = () => {
    if (selectionMode) {
      onImageSelect?.(image);
    } else {
      onImageClick?.(image);
    }
  };

  return (
    <Card
      hoverable
      cover={
        <div
          style={{
            height: 200,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer'
          }}
          onClick={handleImageClick}
        >
          {loading ? (
            <Spin />
          ) : imageUrl ? (
            <img
              alt={image.originalName}
              src={imageUrl}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          ) : (
            <div style={{ color: '#999' }}>加载失败</div>
          )}
        </div>
      }
      actions={[
        <Tooltip title="预览">
          <EyeOutlined 
            key="preview" 
            onClick={handleImageClick}
          />
        </Tooltip>,
        <Tooltip title="复制 Markdown 链接">
          <CopyOutlined 
            key="copy" 
            onClick={handleCopyMarkdown}
          />
        </Tooltip>,
        <Tooltip title="删除">
          <DeleteOutlined 
            key="delete" 
            onClick={handleDelete}
            style={{ color: '#ff4d4f' }}
          />
        </Tooltip>
      ]}
      style={{ height: '100%' }}
    >
      <Card.Meta
        title={
          <Tooltip title={image.originalName}>
            <Text ellipsis style={{ fontSize: 14 }}>
              {image.originalName}
            </Text>
          </Tooltip>
        }
        description={
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatFileSize(image.size)}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatDate(image.uploadedAt)}
            </Text>
          </Space>
        }
      />
    </Card>
  );
};

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  loading = false,
  selectionMode = false,
  onImageClick,
  onImageSelect,
  onDelete
}) => {
  if (images.length === 0 && !loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '48px 0',
        color: '#999'
      }}>
        <p>暂无图片</p>
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {images.map((image) => (
        <Col 
          key={image.filename} 
          xs={24} 
          sm={12} 
          md={8} 
          lg={6} 
          xl={4}
        >
          <ImageCard
            image={image}
            selectionMode={selectionMode}
            onImageClick={onImageClick}
            onImageSelect={onImageSelect}
            onDelete={onDelete}
          />
        </Col>
      ))}
    </Row>
  );
};

export default ImageGrid;
