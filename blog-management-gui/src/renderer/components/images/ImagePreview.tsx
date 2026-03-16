import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, Typography, Descriptions, message, Spin } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ImageMetadata } from '../../../shared/types';

/**
 * ImagePreview Component
 * Requirements: 7.3, 7.4
 * 
 * Features:
 * - Display full-size image in modal
 * - Show image metadata (filename, size, upload date, dimensions)
 * - "Copy Markdown Link" and "Delete" buttons
 * - Close on outside click or ESC key
 */

const { Text } = Typography;

interface ImagePreviewProps {
  image: ImageMetadata | null;
  visible: boolean;
  onClose: () => void;
  onDelete?: (filename: string) => void;
  onCopyMarkdown?: (filename: string) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  visible,
  onClose,
  onDelete,
  onCopyMarkdown
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Load image path when modal opens
  useEffect(() => {
    if (visible && image) {
      loadImagePath();
    }
  }, [visible, image]);

  const loadImagePath = async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      // Extract filename from path
      const filename = image.path.replace('/images/', '');
      console.log('Loading image, filename:', filename);
      
      // Get Base64 data URL from main process
      const response = await window.electronAPI.image.getDataUrl(filename);
      console.log('IPC response success:', response.success);
      
      if (response.success && response.data) {
        console.log('Data URL length:', response.data.length);
        setImageUrl(response.data);
      } else {
        console.error('Failed to get image data:', response.error);
        message.error(`无法加载图片: ${response.error?.userMessage || '未知错误'}`);
      }
    } catch (error) {
      console.error('Failed to load image:', error);
      message.error('加载图片失败');
    } finally {
      setLoading(false);
    }
  };

  if (!image) return null;

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle copy Markdown link
  const handleCopyMarkdown = async () => {
    try {
      const markdownLink = `![](/images/${image.filename})`;
      await navigator.clipboard.writeText(markdownLink);
      message.success('Markdown 链接已复制到剪贴板');
      onCopyMarkdown?.(image.filename);
    } catch (error) {
      message.error('复制失败');
    }
  };

  // Handle delete
  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除图片 "${image.originalName}" 吗？此操作无法撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        onDelete?.(image.filename);
        onClose();
      }
    });
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      destroyOnClose
    >
      <div style={{ marginTop: 24 }}>
        {/* Image display */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 24,
          maxHeight: '60vh',
          overflow: 'auto',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {loading ? (
            <Spin size="large" tip="加载图片中..." />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={image.originalName}
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.error('Image load error:', e);
                message.error('图片加载失败');
              }}
            />
          ) : (
            <div>图片加载失败</div>
          )}
        </div>

        {/* Image metadata */}
        <Descriptions 
          title="图片信息" 
          column={1} 
          bordered 
          size="small"
          style={{ marginBottom: 24 }}
        >
          <Descriptions.Item label="文件名">
            <Text copyable>{image.filename}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="原始文件名">
            {image.originalName}
          </Descriptions.Item>
          <Descriptions.Item label="文件大小">
            {formatFileSize(image.size)}
          </Descriptions.Item>
          <Descriptions.Item label="上传时间">
            {formatDate(image.uploadedAt)}
          </Descriptions.Item>
          {image.width && image.height && (
            <Descriptions.Item label="尺寸">
              {image.width} × {image.height} 像素
            </Descriptions.Item>
          )}
          <Descriptions.Item label="MIME 类型">
            {image.mimeType}
          </Descriptions.Item>
        </Descriptions>

        {/* Action buttons */}
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button 
            icon={<CopyOutlined />}
            onClick={handleCopyMarkdown}
          >
            复制 Markdown 链接
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          >
            删除
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default ImagePreview;
