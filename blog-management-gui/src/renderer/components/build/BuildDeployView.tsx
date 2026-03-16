import React, { useState } from 'react';
import { Space, Typography, Divider } from 'antd';
import BuildControls from './BuildControls';
import DeployControls from './DeployControls';
import BuildConsole from './BuildConsole';

/**
 * BuildDeployView Component
 * Requirements: 9.1-9.6, 10.1-10.5, 11.1-11.4, 12.1-12.7
 * 
 * Features:
 * - Display BuildControls and DeployControls components
 * - Display BuildConsole component for output logs
 * - Show build status and statistics
 * - Show preview server status and URL
 * - Show deployment status and URL
 */

const { Title } = Typography;

const BuildDeployView: React.FC = () => {
  const [buildOutput, setBuildOutput] = useState<string[]>([]);

  const handleBuildOutput = (output: string) => {
    setBuildOutput(prev => [...prev, output]);
  };

  return (
    <div style={{ 
      padding: '24px',
      height: 'calc(100vh - 64px)',
      overflow: 'auto'
    }}>
      <Title level={2}>构建与部署</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Build Section */}
        <BuildControls onBuildOutput={handleBuildOutput} />

        {/* Build Console */}
        <BuildConsole output={buildOutput} title="构建输出" />

        <Divider />

        {/* Deploy Section */}
        <DeployControls />
      </Space>
    </div>
  );
};

export default BuildDeployView;
