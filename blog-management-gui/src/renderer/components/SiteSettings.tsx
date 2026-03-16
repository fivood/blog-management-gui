import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useApp } from '../contexts/AppContext';

const { TextArea } = Input;

const SiteSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { state } = useApp();
  const { config } = state;

  useEffect(() => {
    loadConfig();
  }, [config?.hugoProjectPath]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.hugo.getConfig();
      if (response.success) {
        const config = response.data;
        form.setFieldsValue({
          title: config.title || '',
          description: config.params?.description || '',
          author: config.params?.author || ''
        });
      } else {
        message.error(response.error?.userMessage || '加载配置失败');
      }
    } catch (error) {
      message.error('加载配置失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const updates = {
        title: values.title,
        params: {
          description: values.description,
          author: values.author
        }
      };

      const response = await window.electronAPI.hugo.updateConfig(updates);
      if (response.success) {
        message.success('保存成功');
      } else {
        message.error(response.error?.userMessage || '保存失败');
      }
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请填写必填字段');
      } else {
        message.error('保存失败');
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 600,
      padding: '24px',
      height: 'calc(100vh - 64px)',
      overflow: 'auto'
    }}>
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="站点名称"
          name="title"
          rules={[{ required: true, message: '请输入站点名称' }]}
        >
          <Input placeholder="请输入站点名称" size="large" />
        </Form.Item>

        <Form.Item
          label="站点描述"
          name="description"
        >
          <TextArea
            placeholder="请输入站点描述"
            rows={4}
          />
        </Form.Item>

        <Form.Item
          label="作者"
          name="author"
        >
          <Input placeholder="请输入作者名称" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              保存设置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SiteSettings;
