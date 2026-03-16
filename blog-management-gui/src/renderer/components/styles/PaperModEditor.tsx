import React from 'react';
import { Form, Select, Card, Space } from 'antd';
import type { StyleConfiguration } from '../../../shared/types';

/**
 * PaperModEditor Component
 * 
 * Features:
 * - Edit PaperMod theme-specific parameters
 * - Separated from general Hugo configuration
 */

interface PaperModEditorProps {
  config: StyleConfiguration;
  onChange: (updates: Partial<StyleConfiguration>) => void;
}

const PaperModEditor: React.FC<PaperModEditorProps> = ({ config, onChange }) => {
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
      <Card title="PaperMod 主题配置" size="small">
        <div style={{ 
          marginBottom: 16, 
          padding: '8px 12px', 
          backgroundColor: '#e6f7ff', 
          border: '1px solid #91d5ff',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <strong>提示：</strong>这些配置仅在使用 PaperMod 主题时生效。
        </div>
        <Form layout="vertical">
          <Form.Item label="显示阅读时间">
            <Select
              value={config.hugoConfig.params?.ShowReadingTime ? 'true' : 'false'}
              onChange={(value) => handleParamsChange('ShowReadingTime', value === 'true')}
            >
              <Select.Option value="true">是</Select.Option>
              <Select.Option value="false">否</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="显示分享按钮">
            <Select
              value={config.hugoConfig.params?.ShowShareButtons ? 'true' : 'false'}
              onChange={(value) => handleParamsChange('ShowShareButtons', value === 'true')}
            >
              <Select.Option value="true">是</Select.Option>
              <Select.Option value="false">否</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="显示文章导航">
            <Select
              value={config.hugoConfig.params?.ShowPostNavLinks ? 'true' : 'false'}
              onChange={(value) => handleParamsChange('ShowPostNavLinks', value === 'true')}
            >
              <Select.Option value="true">是</Select.Option>
              <Select.Option value="false">否</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="显示面包屑导航">
            <Select
              value={config.hugoConfig.params?.ShowBreadCrumbs ? 'true' : 'false'}
              onChange={(value) => handleParamsChange('ShowBreadCrumbs', value === 'true')}
            >
              <Select.Option value="true">是</Select.Option>
              <Select.Option value="false">否</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="显示代码复制按钮">
            <Select
              value={config.hugoConfig.params?.ShowCodeCopyButtons ? 'true' : 'false'}
              onChange={(value) => handleParamsChange('ShowCodeCopyButtons', value === 'true')}
            >
              <Select.Option value="true">是</Select.Option>
              <Select.Option value="false">否</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="显示目录">
            <Select
              value={config.hugoConfig.params?.ShowToc ? 'true' : 'false'}
              onChange={(value) => handleParamsChange('ShowToc', value === 'true')}
            >
              <Select.Option value="true">是</Select.Option>
              <Select.Option value="false">否</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="默认展开目录">
            <Select
              value={config.hugoConfig.params?.TocOpen ? 'true' : 'false'}
              onChange={(value) => handleParamsChange('TocOpen', value === 'true')}
            >
              <Select.Option value="true">是</Select.Option>
              <Select.Option value="false">否</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="默认主题">
            <Select
              value={config.hugoConfig.params?.defaultTheme || 'auto'}
              onChange={(value) => handleParamsChange('defaultTheme', value)}
            >
              <Select.Option value="light">浅色</Select.Option>
              <Select.Option value="dark">深色</Select.Option>
              <Select.Option value="auto">自动</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="禁用主题切换">
            <Select
              value={config.hugoConfig.params?.disableThemeToggle ? 'true' : 'false'}
              onChange={(value) => handleParamsChange('disableThemeToggle', value === 'true')}
            >
              <Select.Option value="true">是</Select.Option>
              <Select.Option value="false">否</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="RSS 显示全文">
            <Select
              value={config.hugoConfig.params?.ShowFullTextinRSS ? 'true' : 'false'}
              onChange={(value) => handleParamsChange('ShowFullTextinRSS', value === 'true')}
            >
              <Select.Option value="true">是</Select.Option>
              <Select.Option value="false">否</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="分类/标签页显示 RSS 按钮">
            <Select
              value={config.hugoConfig.params?.ShowRssButtonInSectionTermList ? 'true' : 'false'}
              onChange={(value) => handleParamsChange('ShowRssButtonInSectionTermList', value === 'true')}
            >
              <Select.Option value="true">是</Select.Option>
              <Select.Option value="false">否</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default PaperModEditor;
