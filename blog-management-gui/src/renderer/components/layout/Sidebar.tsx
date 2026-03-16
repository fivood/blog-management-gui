import React from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  FileTextOutlined,
  PictureOutlined,
  BgColorsOutlined,
  RocketOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useApp, ViewType } from '../../contexts/AppContext';

const { Sider } = Layout;

/**
 * Sidebar Component
 * Requirements: 15.1-15.5
 * 
 * Features:
 * - Display navigation menu with items (Articles, Images, Styles, Build & Deploy, Settings)
 * - Highlight active navigation item
 * - Handle navigation clicks to change view
 */

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: 'articles',
    icon: <FileTextOutlined />,
    label: '文章管理'
  },
  {
    key: 'images',
    icon: <PictureOutlined />,
    label: '图片库'
  },
  {
    key: 'styles',
    icon: <BgColorsOutlined />,
    label: '样式编辑'
  },
  {
    key: 'build',
    icon: <RocketOutlined />,
    label: '构建与部署'
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '设置'
  }
];

export const Sidebar: React.FC = () => {
  const { state, setView } = useApp();
  const { currentView } = state;

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setView(key as ViewType);
  };

  return (
    <Sider width={200} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
      <div
        style={{
          padding: '16px',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        博客管理系统
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentView]}
        onClick={handleMenuClick}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};
