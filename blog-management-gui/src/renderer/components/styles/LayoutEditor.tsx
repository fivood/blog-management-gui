import React from 'react';
import { Form, Select, Checkbox, Card, Space, Button, Input, List, message } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { LayoutSettings, MenuItem } from '../../../shared/types';

/**
 * LayoutEditor Component
 * Requirements: 24.1-24.7
 * 
 * Features:
 * - Home layout mode selector (list/card)
 * - Sidebar content configuration
 * - Navigation menu editor with add/remove/reorder
 * - Menu item URL validation
 */

interface LayoutEditorProps {
  layoutSettings: LayoutSettings;
  onChange: (layoutSettings: LayoutSettings) => void;
}

const LayoutEditor: React.FC<LayoutEditorProps> = ({ layoutSettings, onChange }) => {
  const handleLayoutModeChange = (homeLayout: 'list' | 'card') => {
    onChange({ ...layoutSettings, homeLayout });
  };

  const handleSidebarToggle = (checked: boolean) => {
    onChange({ ...layoutSettings, showSidebar: checked });
  };

  const handleSidebarContentChange = (checkedValues: string[]) => {
    onChange({ ...layoutSettings, sidebarContent: checkedValues });
  };

  const handleAddMenuItem = () => {
    const newItem: MenuItem = {
      name: '新菜单项',
      url: '/',
      weight: layoutSettings.navigationMenu.length + 1
    };
    onChange({
      ...layoutSettings,
      navigationMenu: [...layoutSettings.navigationMenu, newItem]
    });
  };

  const handleRemoveMenuItem = (index: number) => {
    const newMenu = layoutSettings.navigationMenu.filter((_, i) => i !== index);
    onChange({ ...layoutSettings, navigationMenu: newMenu });
  };

  const handleMoveMenuItem = (index: number, direction: 'up' | 'down') => {
    const newMenu = [...layoutSettings.navigationMenu];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newMenu.length) return;
    
    [newMenu[index], newMenu[targetIndex]] = [newMenu[targetIndex], newMenu[index]];
    
    // Update weights
    newMenu.forEach((item, i) => {
      item.weight = i + 1;
    });
    
    onChange({ ...layoutSettings, navigationMenu: newMenu });
  };

  const handleMenuItemChange = (index: number, field: keyof MenuItem, value: string | number) => {
    const newMenu = [...layoutSettings.navigationMenu];
    newMenu[index] = { ...newMenu[index], [field]: value };
    
    // Validate URL format
    if (field === 'url') {
      const url = value as string;
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
        message.warning('URL 必须以 http://、https:// 或 / 开头');
      }
    }
    
    onChange({ ...layoutSettings, navigationMenu: newMenu });
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="首页布局" size="small">
        <Form layout="vertical">
          <Form.Item label="布局模式">
            <Select
              value={layoutSettings.homeLayout}
              onChange={handleLayoutModeChange}
              style={{ width: '100%' }}
            >
              <Select.Option value="list">列表模式</Select.Option>
              <Select.Option value="card">卡片模式</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card title="侧边栏设置" size="small">
        <Form layout="vertical">
          <Form.Item>
            <Checkbox
              checked={layoutSettings.showSidebar}
              onChange={(e) => handleSidebarToggle(e.target.checked)}
            >
              显示侧边栏
            </Checkbox>
          </Form.Item>

          {layoutSettings.showSidebar && (
            <Form.Item label="侧边栏内容">
              <Checkbox.Group
                value={layoutSettings.sidebarContent}
                onChange={handleSidebarContentChange as any}
              >
                <Space direction="vertical">
                  <Checkbox value="recent">最近文章</Checkbox>
                  <Checkbox value="tags">标签云</Checkbox>
                  <Checkbox value="categories">分类列表</Checkbox>
                  <Checkbox value="archive">归档</Checkbox>
                </Space>
              </Checkbox.Group>
            </Form.Item>
          )}
        </Form>
      </Card>

      <Card 
        title="导航菜单" 
        size="small"
        extra={
          <Button 
            type="primary" 
            size="small" 
            icon={<PlusOutlined />}
            onClick={handleAddMenuItem}
          >
            添加菜单项
          </Button>
        }
      >
        <List
          dataSource={layoutSettings.navigationMenu}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button
                  size="small"
                  icon={<ArrowUpOutlined />}
                  onClick={() => handleMoveMenuItem(index, 'up')}
                  disabled={index === 0}
                />,
                <Button
                  size="small"
                  icon={<ArrowDownOutlined />}
                  onClick={() => handleMoveMenuItem(index, 'down')}
                  disabled={index === layoutSettings.navigationMenu.length - 1}
                />,
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveMenuItem(index)}
                />
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="菜单名称"
                  value={item.name}
                  onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="链接 URL (http://, https://, 或 /)"
                  value={item.url}
                  onChange={(e) => handleMenuItemChange(index, 'url', e.target.value)}
                />
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
};

export default LayoutEditor;
