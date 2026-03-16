import React, { useState } from 'react';
import { Upload, Button, Progress, message } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

/**
 * ImageUpload Component
 * Requirements: 6.1-6.6
 * 
 * Features:
 * - File input accepting image formats (PNG, JPG, JPEG, GIF, WebP)
 * - Drag-and-drop upload support
 * - Upload progress indicator
 * - Success/error notifications
 * - Refresh image list after successful upload
 */

interface ImageUploadProps {
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
  compact?: boolean; // Compact mode for toolbar integration
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  compact = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Accepted image formats
  const acceptedFormats = '.png,.jpg,.jpeg,.gif,.webp';

  // Custom upload handler
  const handleUpload = async (file: File): Promise<boolean> => {
    setUploading(true);
    setProgress(0);

    try {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        message.error('不支持的图片格式。请上传 PNG、JPG、JPEG、GIF 或 WebP 格式的图片。');
        onUploadError?.('不支持的图片格式');
        return false;
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Get file path from the file object
      // In Electron, we need to use the file path
      const filePath = (file as any).path || '';
      
      if (!filePath) {
        clearInterval(progressInterval);
        message.error('无法读取文件路径');
        onUploadError?.('无法读取文件路径');
        return false;
      }

      // Upload via IPC
      const response = await window.electronAPI.image.upload(filePath, file.name);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        message.success('图片上传成功');
        onUploadSuccess?.();
        
        // Reset progress after a short delay
        setTimeout(() => {
          setProgress(0);
        }, 1000);
        
        return true;
      } else {
        const errorMsg = response.error?.userMessage || '图片上传失败';
        message.error(errorMsg);
        onUploadError?.(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '图片上传失败';
      message.error(errorMsg);
      onUploadError?.(errorMsg);
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Upload props configuration
  const uploadProps: UploadProps = {
    name: 'file',
    accept: acceptedFormats,
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      handleUpload(file);
      return false; // Prevent default upload behavior
    }
  };

  // Compact mode (button only)
  if (compact) {
    return (
      <div>
        <Upload {...uploadProps}>
          <Button 
            icon={<UploadOutlined />} 
            loading={uploading}
            disabled={uploading}
          >
            上传图片
          </Button>
        </Upload>
        {uploading && progress > 0 && (
          <Progress 
            percent={progress} 
            size="small" 
            style={{ marginTop: 8 }}
          />
        )}
      </div>
    );
  }

  // Full mode with drag-and-drop
  return (
    <div style={{ marginBottom: 24 }}>
      <Upload.Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
        <p className="ant-upload-hint">
          支持 PNG、JPG、JPEG、GIF、WebP 格式
        </p>
      </Upload.Dragger>
      
      {uploading && progress > 0 && (
        <Progress 
          percent={progress} 
          status={progress === 100 ? 'success' : 'active'}
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default ImageUpload;
