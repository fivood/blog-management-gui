import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Space, Typography, message, Divider } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useApp } from '../../contexts/AppContext';

/**
 * SettingsView Component
 * Requirements: 13.1-13.7, 14.1-14.5, 17.1-17.5, 20.5
 * 
 * Features:
 * - Form sections for Hugo project path, Cloudflare credentials, editor preferences
 * - Load configuration on mount
 * - Save configuration on changes
 */

const { Title, Text } = Typography;

interface AppConfig {
  hugoProjectPath: string;
  cloudflare?: {
    apiToken: string;
    accountId: string;
    projectName: string;
  };
  editor?: {
    theme: 'light' | 'dark';
    fontSize: number;
    tabSize: number;
    wordWrap: boolean;
    lineNumbers: boolean;
    autoSave: boolean;
    autoSaveDelay: number;
  };
}

const SettingsView: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);

  const { state } = useApp();
  const { config } = state;

  // Load configuration on mount or project path change
  useEffect(() => {
    loadConfig();
  }, [config?.hugoProjectPath]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.config.get();
      
      if (response.success && response.data) {
        form.setFieldsValue(response.data);
      } else {
        message.error('加载配置失败');
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      message.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: AppConfig) => {
    setSaving(true);
    try {
      const response = await window.electronAPI.config.update(values);
      
      if (response.success) {
        message.success('配置已保存');
      } else {
        message.error(`保存失败: ${response.error?.userMessage || '未知错误'}`);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      message.error('保存配置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleValidateCloudflare = async () => {
    setValidating(true);
    try {
      console.log('Starting Cloudflare validation...');
      
      // First, save the current form values to ensure DeployService has the latest config
      const formValues = form.getFieldsValue();
      console.log('Saving config before validation...');
      const saveResponse = await window.electronAPI.config.update(formValues);
      
      if (!saveResponse.success) {
        message.error('保存配置失败，无法验证');
        return;
      }
      
      console.log('Config saved, now validating...');
      
      // Now validate with the updated config
      const response = await window.electronAPI.deploy.validate();
      console.log('Validation response:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Response data value:', response.data);
      
      if (response.success) {
        // Handle both boolean and object responses for backward compatibility
        let isValid = false;
        if (typeof response.data === 'boolean') {
          isValid = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          isValid = (response.data as any).isValid === true;
        }
        
        console.log('Final isValid:', isValid);
        
        if (isValid) {
          message.success('Cloudflare 凭据验证成功！API Token 有效。');
        } else {
          message.error('Cloudflare 凭据验证失败：API Token 无效或没有权限');
          console.error('Validation returned false, data:', response.data);
        }
      } else {
        const errorMsg = response.error?.message || response.error?.userMessage || '未知错误';
        message.error(`验证失败: ${errorMsg}`);
        console.error('Validation error:', response.error);
      }
    } catch (error) {
      console.error('Failed to validate credentials:', error);
      message.error('验证失败：无法连接到 Cloudflare API');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '800px', 
      margin: '0 auto',
      height: 'calc(100vh - 64px)',
      overflow: 'auto'
    }}>
      <Title level={2}>设置</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          editor: {
            theme: 'light',
            fontSize: 14,
            tabSize: 2,
            wordWrap: true,
            lineNumbers: true,
            autoSave: true,
            autoSaveDelay: 1000
          }
        }}
      >
        {/* Hugo Project Settings */}
        <Card title="Hugo 项目设置" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Hugo 项目路径"
            name="hugoProjectPath"
            rules={[{ required: true, message: '请输入 Hugo 项目路径' }]}
            extra="Hugo 项目的根目录路径"
          >
            <Input placeholder="例如: C:\Users\username\my-blog" />
          </Form.Item>
        </Card>

        {/* Cloudflare Settings */}
        <Card title="Cloudflare Pages 设置" style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">
              配置 Cloudflare Pages 部署凭据。你可以在 Cloudflare 控制台获取这些信息。
            </Text>
            
            <Form.Item
              label="API Token"
              name={['cloudflare', 'apiToken']}
              extra="Cloudflare API Token（需要 Pages 权限）"
            >
              <Input.Password placeholder="输入 API Token" />
            </Form.Item>

            <Form.Item
              label="Account ID"
              name={['cloudflare', 'accountId']}
              extra="Cloudflare Account ID"
            >
              <Input placeholder="输入 Account ID" />
            </Form.Item>

            <Form.Item
              label="Project Name"
              name={['cloudflare', 'projectName']}
              extra="Cloudflare Pages 项目名称"
            >
              <Input placeholder="输入项目名称" />
            </Form.Item>

            <Button 
              onClick={handleValidateCloudflare}
              loading={validating}
            >
              验证凭据
            </Button>
          </Space>
        </Card>

        {/* Editor Settings */}
        <Card title="编辑器设置" style={{ marginBottom: 24 }}>
          <Form.Item
            label="主题"
            name={['editor', 'theme']}
          >
            <Input placeholder="light 或 dark" />
          </Form.Item>

          <Form.Item
            label="字体大小"
            name={['editor', 'fontSize']}
          >
            <Input type="number" min={10} max={24} />
          </Form.Item>

          <Form.Item
            label="Tab 大小"
            name={['editor', 'tabSize']}
          >
            <Input type="number" min={2} max={8} />
          </Form.Item>

          <Form.Item
            label="自动保存延迟（毫秒）"
            name={['editor', 'autoSaveDelay']}
          >
            <Input type="number" min={500} max={5000} />
          </Form.Item>
        </Card>

        {/* Save Button */}
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />}
            loading={saving}
            size="large"
          >
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SettingsView;
