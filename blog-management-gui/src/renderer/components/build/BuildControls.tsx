import React, { useState } from 'react';
import { Button, Space, Statistic, Row, Col, Card, message } from 'antd';
import { 
  BuildOutlined, 
  EyeOutlined, 
  StopOutlined, 
  FolderOpenOutlined 
} from '@ant-design/icons';
import type { BuildResult, PreviewServer } from '../../../shared/types';

/**
 * BuildControls Component
 * Requirements: 9.1-9.6, 10.1-10.5, 11.1-11.4, 20.3, 20.4
 * 
 * Features:
 * - "Build Website" button (keyboard shortcut Ctrl/Cmd+B)
 * - "Preview Website" button (keyboard shortcut Ctrl/Cmd+P)
 * - "Stop Preview" button
 * - "Open Public Folder" button
 * - Disable buttons based on build/preview status
 * - Show build progress indicator
 * - Display build statistics (page count, duration) on success
 */

interface BuildControlsProps {
  onBuildOutput?: (output: string) => void;
}

const BuildControls: React.FC<BuildControlsProps> = ({ onBuildOutput }) => {
  const [building, setBuilding] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [buildStats, setBuildStats] = useState<BuildResult | null>(null);

  // Handle build
  const handleBuild = async () => {
    setBuilding(true);
    setBuildStats(null);
    
    try {
      onBuildOutput?.('开始构建...\n');
      
      const response = await window.electronAPI.hugo.build();
      
      if (response.success && response.data) {
        const result = response.data;
        setBuildStats(result);
        onBuildOutput?.(`\n构建成功！\n`);
        onBuildOutput?.(`- 页面数: ${result.stats?.pageCount || 0}\n`);
        onBuildOutput?.(`- 耗时: ${result.stats?.duration || 0}ms\n`);
        message.success('构建成功');
      } else {
        onBuildOutput?.(`\n构建失败: ${response.error?.userMessage || '未知错误'}\n`);
        message.error(`构建失败: ${response.error?.userMessage || '未知错误'}`);
      }
    } catch (error) {
      console.error('Build failed:', error);
      onBuildOutput?.(`\n构建失败: ${error}\n`);
      message.error('构建失败');
    } finally {
      setBuilding(false);
    }
  };

  // Handle preview start
  const handlePreview = async () => {
    setPreviewing(true);
    
    try {
      onBuildOutput?.('启动预览服务器...\n');
      
      const response = await window.electronAPI.hugo.previewStart();
      
      if (response.success && response.data) {
        const server = response.data;
        setPreviewUrl(server.url);
        onBuildOutput?.(`\n预览服务器已启动: ${server.url}\n`);
        message.success(`预览服务器已启动: ${server.url}`);
      } else {
        setPreviewing(false);
        onBuildOutput?.(`\n启动失败: ${response.error?.userMessage || '未知错误'}\n`);
        message.error(`启动失败: ${response.error?.userMessage || '未知错误'}`);
      }
    } catch (error) {
      console.error('Preview start failed:', error);
      setPreviewing(false);
      onBuildOutput?.(`\n启动失败: ${error}\n`);
      message.error('启动预览服务器失败');
    }
  };

  // Handle preview stop
  const handleStopPreview = async () => {
    try {
      onBuildOutput?.('停止预览服务器...\n');
      
      const response = await window.electronAPI.hugo.previewStop();
      
      if (response.success) {
        setPreviewing(false);
        setPreviewUrl('');
        onBuildOutput?.('\n预览服务器已停止\n');
        message.success('预览服务器已停止');
      } else {
        onBuildOutput?.(`\n停止失败: ${response.error?.userMessage || '未知错误'}\n`);
        message.error(`停止失败: ${response.error?.userMessage || '未知错误'}`);
      }
    } catch (error) {
      console.error('Preview stop failed:', error);
      onBuildOutput?.(`\n停止失败: ${error}\n`);
      message.error('停止预览服务器失败');
    }
  };

  // Handle open public folder
  const handleOpenPublic = async () => {
    try {
      // Get Hugo project path from config
      const configResponse = await window.electronAPI.config.get();
      if (configResponse.success && configResponse.data) {
        const hugoPath = configResponse.data.hugoProjectPath;
        // Ensure absolute path with proper separators
        const publicPath = hugoPath.endsWith('\\') || hugoPath.endsWith('/') 
          ? `${hugoPath}public` 
          : `${hugoPath}\\public`;
        
        message.info(`Public 文件夹路径: ${publicPath}`);
        
        // Copy path to clipboard
        await navigator.clipboard.writeText(publicPath);
        message.success('路径已复制到剪贴板');
      }
    } catch (error) {
      console.error('Failed to get public folder path:', error);
      message.error('获取路径失败');
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Build Controls */}
      <Space wrap>
        <Button
          type="primary"
          icon={<BuildOutlined />}
          onClick={handleBuild}
          loading={building}
          disabled={previewing}
          size="large"
        >
          构建网站 (Ctrl+B)
        </Button>

        <Button
          icon={<EyeOutlined />}
          onClick={handlePreview}
          disabled={building || previewing}
          size="large"
        >
          预览网站 (Ctrl+P)
        </Button>

        {previewing && (
          <Button
            danger
            icon={<StopOutlined />}
            onClick={handleStopPreview}
            size="large"
          >
            停止预览
          </Button>
        )}

        <Button
          icon={<FolderOpenOutlined />}
          onClick={handleOpenPublic}
          disabled={building}
          size="large"
        >
          打开 Public 文件夹
        </Button>
      </Space>

      {/* Build Statistics */}
      {buildStats && (
        <Card size="small">
          <Row gutter={16}>
            <Col span={8}>
              <Statistic 
                title="页面数" 
                value={buildStats.stats?.pageCount || 0} 
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="构建时间" 
                value={buildStats.stats?.duration || 0} 
                suffix="ms"
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="状态" 
                value={buildStats.success ? '成功' : '失败'} 
                valueStyle={{ color: buildStats.success ? '#3f8600' : '#cf1322' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Preview Server Info */}
      {previewing && previewUrl && (
        <Card size="small" title="预览服务器">
          <p>
            URL: <a href={previewUrl} target="_blank" rel="noopener noreferrer">{previewUrl}</a>
          </p>
          <p style={{ color: '#52c41a', marginBottom: 0 }}>● 运行中</p>
        </Card>
      )}
    </Space>
  );
};

export default BuildControls;
