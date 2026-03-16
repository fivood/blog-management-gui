import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Space,
  Select,
  Switch,
  Modal,
  Spin
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { CreateArticleData, ArticleUpdate } from '../../shared/types/article';
import { useArticles } from '../hooks/useArticles';
import { useNotification } from '../contexts/NotificationContext';

const { Option } = Select;
const { TextArea } = Input;

interface ArticleEditorProps {
  articleId: string | null;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * ArticleEditorSimple - Simplified version using TextArea instead of CodeMirror
 * This is a temporary solution for the blank page issue
 */
const ArticleEditorSimple: React.FC<ArticleEditorProps> = ({ articleId, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const { getArticle, createArticle, updateArticle, loading } = useArticles();
  const { showNotification } = useNotification();
  
  const [isDirty, setIsDirty] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load article data if editing existing article
  useEffect(() => {
    const initialize = async () => {
      setIsInitializing(true);
      if (articleId) {
        await loadArticle(articleId);
      } else {
        // Reset form for new article
        form.resetFields();
        setIsDirty(false);
        setIsPasswordProtected(false);
      }
      setIsInitializing(false);
    };
    
    initialize();
  }, [articleId]);

  // Keyboard shortcut for save (Ctrl/Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [articleId, isPasswordProtected, isDirty]);

  const loadArticle = async (id: string) => {
    try {
      const article = await getArticle(id);
      if (article) {
        form.setFieldsValue({
          title: article.title,
          content: article.content,
          tags: article.tags,
          categories: article.categories,
          password: '' // Don't populate password for security
        });
        setIsPasswordProtected(article.isProtected);
        setIsDirty(false);
      } else {
        showNotification('error', '加载文章失败');
      }
    } catch (error) {
      console.error('Load article error:', error);
      showNotification('error', '加载文章失败');
    }
  };

  const handleSave = async () => {
    try {
      // Validate form fields
      const values = await form.validateFields();
      setIsSaving(true);

      // Create or update article
      let result;
      if (articleId) {
        // Prepare update data (all fields optional)
        const updateData: ArticleUpdate = {
          title: values.title.trim(),
          content: values.content.trim(),
          tags: values.tags || [],
          categories: values.categories || [],
          password: isPasswordProtected ? values.password : undefined
        };
        result = await updateArticle(articleId, updateData);
      } else {
        // Prepare create data (title and content required)
        const createData: CreateArticleData = {
          title: values.title.trim(),
          content: values.content.trim(),
          tags: values.tags || [],
          categories: values.categories || [],
          password: isPasswordProtected ? values.password : undefined
        };
        result = await createArticle(createData);
      }

      if (result) {
        showNotification('success', articleId ? '文章保存成功' : '文章创建成功');
        setIsDirty(false);
        onSave();
      } else {
        showNotification('error', articleId ? '保存文章失败' : '创建文章失败');
      }
    } catch (error: any) {
      if (error.errorFields) {
        showNotification('error', '请填写所有必填字段');
      } else {
        showNotification('error', '保存失败，请重试');
        console.error('Save error:', error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      Modal.confirm({
        title: '确认离开',
        content: '您有未保存的更改，确定要离开吗？',
        okText: '离开',
        cancelText: '取消',
        onOk: onCancel
      });
    } else {
      onCancel();
    }
  };

  const handleFormChange = () => {
    setIsDirty(true);
  };

  const handlePasswordProtectionChange = (checked: boolean) => {
    setIsPasswordProtected(checked);
    if (!checked) {
      // Clear password field when disabling protection
      form.setFieldValue('password', undefined);
    }
    setIsDirty(true);
  };

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      height: 'calc(100vh - 64px)', // 减去 header 高度
      overflow: 'auto' // 添加滚动条
    }}>
      <h2 style={{ marginBottom: 24 }}>
        {articleId ? '编辑文章' : '新建文章'}
      </h2>
      
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
      >
        <Form.Item
          label="标题"
          name="title"
          rules={[
            { required: true, message: '请输入标题' },
            { max: 200, message: '标题不能超过200个字符' }
          ]}
        >
          <Input 
            placeholder="请输入文章标题" 
            size="large"
            disabled={loading || isSaving}
          />
        </Form.Item>

        <Form.Item
          label="分类"
          name="categories"
          tooltip="用于文章类型分类，如：长篇、短篇、随笔等"
        >
          <Select
            mode="tags"
            placeholder="选择或输入分类（如：长篇、短篇、随笔）"
            style={{ width: '100%' }}
            disabled={loading || isSaving}
          >
            <Option value="长篇">长篇</Option>
            <Option value="短篇">短篇</Option>
            <Option value="随笔">随笔</Option>
            <Option value="技术">技术</Option>
            <Option value="生活">生活</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="标签"
          name="tags"
          tooltip="用于内容标记，如：技术、生活、旅行等"
        >
          <Select
            mode="tags"
            placeholder="选择或输入标签"
            style={{ width: '100%' }}
            disabled={loading || isSaving}
          />
        </Form.Item>

        <Form.Item
          label="内容（支持 Markdown 格式）"
          name="content"
          rules={[
            { required: true, message: '请输入内容' },
            { min: 1, message: '内容不能为空' }
          ]}
        >
          <TextArea
            rows={20}
            placeholder="请输入文章内容，支持 Markdown 格式&#10;&#10;示例：&#10;# 标题&#10;&#10;这是一段文字。&#10;&#10;**粗体** 和 *斜体*&#10;&#10;- 列表项 1&#10;- 列表项 2"
            disabled={loading || isSaving}
            style={{ fontFamily: 'monospace', fontSize: 14 }}
          />
        </Form.Item>

        <Form.Item label="密码保护">
          <Space>
            <Switch
              checked={isPasswordProtected}
              onChange={handlePasswordProtectionChange}
              disabled={loading || isSaving}
            />
            <span>{isPasswordProtected ? '已启用' : '未启用'}</span>
          </Space>
        </Form.Item>

        {isPasswordProtected && (
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 4, message: '密码至少4个字符' }
            ]}
          >
            <Input.Password 
              placeholder="请输入文章密码（至少4个字符）"
              disabled={loading || isSaving}
            />
          </Form.Item>
        )}

        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={isSaving}
              disabled={loading}
              size="large"
            >
              保存 {!isSaving && '(Ctrl+S)'}
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={isSaving}
              size="large"
            >
              取消
            </Button>
            {isDirty && (
              <span style={{ color: '#faad14', marginLeft: 8 }}>
                ● 有未保存的更改
              </span>
            )}
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ArticleEditorSimple;
