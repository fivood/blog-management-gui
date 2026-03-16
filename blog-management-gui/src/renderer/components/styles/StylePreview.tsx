import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Segmented, Typography, Alert, Spin } from 'antd';
import { DesktopOutlined, TabletOutlined, MobileOutlined, ReloadOutlined } from '@ant-design/icons';
import type { StyleConfiguration } from '../../../shared/types';

/**
 * StylePreview Component
 * Requirements: 26.1-26.6, 27.1-27.5
 * 
 * Features:
 * - Real-time preview with iframe showing Hugo preview server
 * - Device mode switching (desktop/tablet/mobile)
 * - Page type switching (home/article/list)
 * - Animated width transitions (300ms)
 * - Debounced updates (500ms)
 */

const { Title, Text } = Typography;

type DeviceMode = 'desktop' | 'tablet' | 'mobile';
type PageType = 'home' | 'article' | 'list';

interface StylePreviewProps {
  styleConfig: StyleConfiguration;
  deviceMode: DeviceMode;
  pageType: PageType;
  onDeviceModeChange: (mode: DeviceMode) => void;
  onPageTypeChange: (type: PageType) => void;
}

const deviceWidths: Record<DeviceMode, number> = {
  desktop: 1200,
  tablet: 768,
  mobile: 375
};

const pageUrls: Record<PageType, string> = {
  home: '/',
  article: '/posts/first-post/',
  list: '/posts/'
};

const StylePreview: React.FC<StylePreviewProps> = ({
  styleConfig,
  deviceMode,
  pageType,
  onDeviceModeChange,
  onPageTypeChange
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string>('');
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    checkPreviewServer();
    
    // Check server status periodically
    const interval = setInterval(() => {
      checkPreviewServer();
    }, 3000); // Check every 3 seconds
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isServerRunning) {
      // Update iframe URL when page type changes
      setPreviewUrl(`http://localhost:1314${pageUrls[pageType]}`);
    }
  }, [pageType, isServerRunning]);

  const checkPreviewServer = async () => {
    try {
      // Try to fetch from preview server
      const response = await fetch('http://localhost:1314/', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      if (response.ok) {
        if (!isServerRunning) {
          setIsServerRunning(true);
          setPreviewUrl(`http://localhost:1314${pageUrls[pageType]}`);
          setError('');
        }
      } else {
        if (isServerRunning) {
          setIsServerRunning(false);
        }
      }
    } catch (err) {
      if (isServerRunning) {
        setIsServerRunning(false);
      }
    }
  };

  const startPreviewServer = async () => {
    setIsStarting(true);
    setError('');
    
    try {
      const response = await window.electronAPI.hugo.startPreview();
      
      if (response.success && response.data) {
        setIsServerRunning(true);
        setPreviewUrl(`http://localhost:1314${pageUrls[pageType]}`);
        
        // Wait a bit for server to fully start
        setTimeout(() => {
          setIframeKey(prev => prev + 1);
        }, 1000);
      } else {
        setError(response.error?.userMessage || '启动预览服务器失败');
      }
    } catch (err) {
      setError('启动预览服务器失败');
    } finally {
      setIsStarting(false);
    }
  };

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '24px',
      overflow: 'hidden'
    }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3}>实时预览</Title>
          {isServerRunning && (
            <Button 
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              size="small"
            >
              刷新
            </Button>
          )}
        </div>
        
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>设备模式：</Text>
            <Space style={{ marginLeft: 8 }}>
              <Button
                type={deviceMode === 'desktop' ? 'primary' : 'default'}
                icon={<DesktopOutlined />}
                onClick={() => onDeviceModeChange('desktop')}
                size="small"
              >
                桌面
              </Button>
              <Button
                type={deviceMode === 'tablet' ? 'primary' : 'default'}
                icon={<TabletOutlined />}
                onClick={() => onDeviceModeChange('tablet')}
                size="small"
              >
                平板
              </Button>
              <Button
                type={deviceMode === 'mobile' ? 'primary' : 'default'}
                icon={<MobileOutlined />}
                onClick={() => onDeviceModeChange('mobile')}
                size="small"
              >
                手机
              </Button>
            </Space>
          </div>

          <div>
            <Text strong>页面类型：</Text>
            <Segmented
              value={pageType}
              onChange={(value) => onPageTypeChange(value as PageType)}
              options={[
                { label: '首页', value: 'home' },
                { label: '文章页', value: 'article' },
                { label: '列表页', value: 'list' }
              ]}
              size="small"
              style={{ marginLeft: 8 }}
            />
          </div>
        </Space>
      </div>

      {error && (
        <Alert
          message="预览错误"
          description={error}
          type="error"
          closable
          onClose={() => setError('')}
          style={{ marginBottom: 16 }}
        />
      )}

      {!isServerRunning && !isStarting && (
        <Alert
          message="预览服务器未运行"
          description={
            <div>
              <p>需要启动 Hugo 预览服务器才能查看实时预览。</p>
              <Button type="primary" onClick={startPreviewServer}>
                启动预览服务器
              </Button>
            </div>
          }
          type="info"
          style={{ marginBottom: 16 }}
        />
      )}

      {isStarting && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>正在启动预览服务器...</p>
        </div>
      )}

      {isServerRunning && (
        <Card 
          size="small" 
          style={{ 
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '20px',
            backgroundColor: '#f5f5f5'
          }}
        >
          <div
            style={{
              width: `${deviceWidths[deviceMode]}px`,
              maxWidth: '100%',
              transition: 'width 300ms ease-in-out',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minHeight: '100%'
            }}
          >
            <iframe
              key={iframeKey}
              src={previewUrl}
              style={{
                width: '100%',
                minHeight: '800px',
                height: '100%',
                border: 'none',
                display: 'block'
              }}
              title="Hugo Preview"
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default StylePreview;
