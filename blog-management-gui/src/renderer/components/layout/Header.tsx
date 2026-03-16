import React from 'react';
import { Layout, Spin } from 'antd';
import { useApp } from '../../contexts/AppContext';
import { ProjectSwitcher } from './ProjectSwitcher';

const { Header: AntHeader } = Layout;

/**
 * Header Component
 * Requirements: 15.5
 * 
 * Features:
 * - Display application title and current view name
 * - Show loading indicator when operations in progress
 */

// View name mapping (Chinese)
const VIEW_NAMES: Record<string, string> = {
  articles: '文章管理',
  images: '图片库',
  styles: '样式编辑',
  build: '构建与部署',
  settings: '设置'
};

export const Header: React.FC = () => {
  const { state } = useApp();
  const { currentView, isLoading } = state;

  const viewName = VIEW_NAMES[currentView] || '博客管理';

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0'
      }}
    >
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500 }}>
        {viewName}
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ProjectSwitcher />
        {isLoading && (
          <Spin size="small" tip="加载中..." />
        )}
      </div>
    </AntHeader>
  );
};
