import React, { useState } from 'react';
import { Button, Progress, Card, Space, message, Alert } from 'antd';
import { CloudUploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { DeployResult } from '../../../shared/types';

/**
 * DeployControls Component
 * Requirements: 12.1-12.7
 * 
 * Features:
 * - "Deploy to Cloudflare" button
 * - Show deployment progress indicator
 * - Display deployment status and website URL on success
 * - Show error message on failure
 */

const DeployControls: React.FC = () => {
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
  const [error, setError] = useState<string>('');

  // Handle deploy
  const handleDeploy = async () => {
    setDeploying(true);
    setProgress(0);
    setDeployResult(null);
    setError('');

    try {
      // Listen for progress updates
      window.electronAPI.deploy.onProgress((data) => {
        setProgress(data.progress);
        message.info(data.message);
      });

      const response = await window.electronAPI.deploy.execute();

      if (response.success && response.data) {
        setDeployResult(response.data);
        setProgress(100);
        message.success('部署成功！');
      } else {
        setError(response.error?.userMessage || '部署失败');
        message.error(`部署失败: ${response.error?.userMessage || '未知错误'}`);
      }
    } catch (error) {
      console.error('Deploy failed:', error);
      setError(String(error));
      message.error('部署失败');
    } finally {
      setDeploying(false);
      // Remove progress listener
      window.electronAPI.deploy.removeProgressListener();
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Deploy Button */}
      <Button
        type="primary"
        icon={<CloudUploadOutlined />}
        onClick={handleDeploy}
        loading={deploying}
        size="large"
      >
        部署到 Cloudflare Pages
      </Button>

      {/* Progress */}
      {deploying && (
        <Card size="small">
          <Progress 
            percent={progress} 
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <p style={{ marginTop: 8, marginBottom: 0, color: '#666' }}>
            正在部署...
          </p>
        </Card>
      )}

      {/* Success Result */}
      {deployResult && !error && (
        <Alert
          message="部署成功"
          description={
            <Space direction="vertical">
              <p>
                网站 URL: <a href={deployResult.url} target="_blank" rel="noopener noreferrer">
                  {deployResult.url}
                </a>
              </p>
              {deployResult.deploymentId && (
                <p style={{ marginBottom: 0 }}>
                  部署 ID: {deployResult.deploymentId}
                </p>
              )}
            </Space>
          }
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      )}

      {/* Error */}
      {error && (
        <Alert
          message="部署失败"
          description={error}
          type="error"
          showIcon
        />
      )}

      {/* Info */}
      {!deploying && !deployResult && !error && (
        <Alert
          message="部署前请确保"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li>已在设置中配置 Cloudflare API 凭据</li>
              <li>已成功构建网站（public 文件夹存在）</li>
              <li>Cloudflare Pages 项目已创建</li>
            </ul>
          }
          type="info"
          showIcon
        />
      )}
    </Space>
  );
};

export default DeployControls;
