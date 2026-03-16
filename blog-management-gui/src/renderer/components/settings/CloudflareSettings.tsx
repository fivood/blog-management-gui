import React, { useState } from 'react';
import { Form, Input, Button, Space, Typography, message } from 'antd';

/**
 * CloudflareSettings Component
 * Requirements: 13.1-13.7
 * 
 * Features:
 * - Add inputs for API token (password field), account ID, project name
 * - Add "Validate Credentials" button
 * - Call deploy:validate IPC on validate
 * - Show validation result
 */

const { Text } = Typography;

interface CloudflareSettingsProps {
  form: any;
}

const CloudflareSettings: React.FC<CloudflareSettingsProps> = ({ form }) => {
  const [validating, setValidating] = useState(false);

  const handleValidate = async () => {
    setValidating(true);
    try {
      // Save current form values first
      const formValues = form.getFieldsValue();
      const saveResponse = await window.electronAPI.config.update(formValues);
      
      if (!saveResponse.success) {
        message.error('保存配置失败，无法验证');
        return;
      }
      
      // Validate credentials
      const response = await window.electronAPI.deploy.validate();
      
      if (response.success) {
        let isValid = false;
        if (typeof response.data === 'boolean') {
          isValid = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          isValid = (response.data as any).isValid === true;
        }
        
        if (isValid) {
          message.success('Cloudflare 凭据验证成功！');
        } else {
          message.error('Cloudflare 凭据验证失败：API Token 无效或没有权限');
        }
      } else {
        const errorMsg = response.error?.message || response.error?.userMessage || '未知错误';
        message.error(`验证失败: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Failed to validate credentials:', error);
      message.error('验证失败：无法连接到 Cloudflare API');
    } finally {
      setValidating(false);
    }
  };

  return (
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
        onClick={handleValidate}
        loading={validating}
      >
        验证凭据
      </Button>
    </Space>
  );
};

export default CloudflareSettings;
