import React from 'react';
import { Form, Input, Select, Card, Space } from 'antd';
import type { StyleConfiguration } from '../../../shared/types';

/**
 * NeopostEditor Component
 * 
 * Features:
 * - Edit Neopost theme-specific parameters
 * - Configure bio, avatar, social links, theme colors
 */

interface NeopostEditorProps {
  config: StyleConfiguration;
  onChange: (updates: Partial<StyleConfiguration>) => void;
}

const NeopostEditor: React.FC<NeopostEditorProps> = ({ config, onChange }) => {
  const handleParamsChange = (field: string, value: any) => {
    onChange({
      hugoConfig: {
        ...config.hugoConfig,
        params: {
          ...(config.hugoConfig.params || {}),
          [field]: value
        }
      }
    });
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="Neopost 主题配置" size="small">
        <div style={{ 
          marginBottom: 16, 
          padding: '8px 12px', 
          backgroundColor: '#e6f7ff', 
          border: '1px solid #91d5ff',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <strong>提示：</strong>这些配置仅在使用 Neopost 主题时生效。
        </div>
        <Form layout="vertical">
          <Form.Item label="个人简介">
            <Input.TextArea
              value={config.hugoConfig.params?.bio || ''}
              onChange={(e) => handleParamsChange('bio', e.target.value)}
              placeholder="输入个人简介"
              rows={3}
            />
          </Form.Item>

          <Form.Item label="头像 URL">
            <Input
              value={config.hugoConfig.params?.avatar || ''}
              onChange={(e) => handleParamsChange('avatar', e.target.value)}
              placeholder="输入头像图片 URL"
            />
          </Form.Item>

          <Form.Item label="主题颜色">
            <Select
              value={config.hugoConfig.params?.color || 'orange'}
              onChange={(value) => handleParamsChange('color', value)}
            >
              <Select.Option value="orange">橙色</Select.Option>
              <Select.Option value="blue">蓝色</Select.Option>
              <Select.Option value="green">绿色</Select.Option>
              <Select.Option value="red">红色</Select.Option>
              <Select.Option value="purple">紫色</Select.Option>
              <Select.Option value="pink">粉色</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="主题变体">
            <Select
              value={config.hugoConfig.params?.theme || 'gray-green'}
              onChange={(value) => handleParamsChange('theme', value)}
            >
              <Select.Option value="gray-green">灰绿</Select.Option>
              <Select.Option value="gray-blue">灰蓝</Select.Option>
              <Select.Option value="dark">深色</Select.Option>
              <Select.Option value="light">浅色</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card title="社交链接" size="small">
        <Form layout="vertical">
          <Form.Item label="Instagram">
            <Input
              value={config.hugoConfig.params?.instagram || ''}
              onChange={(e) => handleParamsChange('instagram', e.target.value)}
              placeholder="输入 Instagram 用户名或链接"
            />
          </Form.Item>

          <Form.Item label="GitHub">
            <Input
              value={config.hugoConfig.params?.github || ''}
              onChange={(e) => handleParamsChange('github', e.target.value)}
              placeholder="输入 GitHub 用户名或链接"
            />
          </Form.Item>

          <Form.Item label="Twitter">
            <Input
              value={config.hugoConfig.params?.twitter || ''}
              onChange={(e) => handleParamsChange('twitter', e.target.value)}
              placeholder="输入 Twitter 用户名或链接"
            />
          </Form.Item>

          <Form.Item label="LinkedIn">
            <Input
              value={config.hugoConfig.params?.linkedin || ''}
              onChange={(e) => handleParamsChange('linkedin', e.target.value)}
              placeholder="输入 LinkedIn 用户名或链接"
            />
          </Form.Item>

          <Form.Item label="Email">
            <Input
              value={config.hugoConfig.params?.email || ''}
              onChange={(e) => handleParamsChange('email', e.target.value)}
              placeholder="输入邮箱地址"
            />
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default NeopostEditor;
