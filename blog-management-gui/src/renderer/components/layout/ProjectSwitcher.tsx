import React from 'react';
import { Select, Space, Typography } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import { useApp } from '../../contexts/AppContext';

const { Text } = Typography;

/**
 * ProjectSwitcher Component
 * Allows switching between recent Hugo projects
 */
export const ProjectSwitcher: React.FC = () => {
  const { state, setConfig } = useApp();
  const { config } = state;

  if (!config || !config.recentProjects || config.recentProjects.length === 0) {
    return null;
  }

  const handleProjectChange = async (path: string) => {
    console.log('ProjectSwitcher: Switching to', path);
    try {
      const response = await window.electronAPI.config.update({
        hugoProjectPath: path
      });

      if (response.success) {
        console.log('ProjectSwitcher: Config update success');
        // Fetch fresh config to update global state
        const configResponse = await window.electronAPI.config.get();
        if (configResponse.success) {
          console.log('ProjectSwitcher: Fresh config loaded', configResponse.data);
          setConfig(configResponse.data);
        }
      } else {
        console.error('ProjectSwitcher: Config update failed', response.error);
      }
    } catch (error) {
      console.error('Failed to switch project:', error);
    }
  };

  const getProjectLabel = (projectPath: string) => {
    const lower = projectPath.toLowerCase();
    const name = lower.includes('fukkiorg')
      ? '有空写点'
      : lower.includes('blog')
        ? '废物德森林'
        : (projectPath.split(/[\\/]/).pop() || projectPath);

    const segments = projectPath.split(/[\\/]/).filter(Boolean);
    const parent = segments.length >= 2 ? segments[segments.length - 2] : '';
    const suffix = parent ? ` (${parent})` : '';
    const display = `${name}${suffix}`;

    return <Text title={projectPath}>{display}</Text>;
  };

  const options = config.recentProjects.map(projectPath => ({
    label: getProjectLabel(projectPath),
    value: projectPath
  }));

  return (
    <Space size="small">
      <FolderOutlined style={{ color: '#8c8c8c' }} />
      <Select
        value={config.hugoProjectPath}
        onChange={handleProjectChange}
        options={options}
        style={{ width: 160 }}
        size="small"
        placeholder="选择项目"
        dropdownMatchSelectWidth={false}
      />
    </Space>
  );
};
