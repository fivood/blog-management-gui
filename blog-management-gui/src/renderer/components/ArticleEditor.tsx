import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Space,
  Select,
  Switch,
  Modal
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { CreateArticleData, ArticleUpdate } from '../../shared/types/article';
import { useArticles } from '../hooks/useArticles';
import { useNotification } from '../contexts/NotificationContext';
import { MarkdownEditor } from './editor';

const { Option } = Select;

interface ArticleEditorProps {
  articleId: string | null;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * ArticleEditorView - Create and edit articles
 * Requirements: 2.1-2.9, 3.1-3.5, 20.2
 * 
 * Features:
 * - Form with title, tags, categories, password protection
 * - Markdown editor for content (currently TextArea, will be upgraded)
 * - Load existing article data for editing
 * - Validate required fields (title, content)
 * - Save with article:create or article:update IPC
 * - Success/error notifications
 * - Keyboard shortcut Ctrl/Cmd+S for save
 * - Unsaved changes warning
 */
const ArticleEditor: React.FC<ArticleEditorProps> = ({ articleId, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const { getArticle, createArticle, updateArticle, loading } = useArticles();
  const { showNotification } = useNotification();
  
  const [isDirty, setIsDirty] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load article data if editing existing article
  useEffect(() => {
    if (articleId) {
      loadArticle(articleId);
    } else {
      // Reset form for new article
      form.resetFields();
      setIsDirty(false);
      setIsPasswordProtected(false);
    }
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

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
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
          label="内容"
          name="content"
          rules={[
            { required: true, message: '请输入内容' },
            { min: 1, message: '内容不能为空' }
          ]}
        >
          <MarkdownEditor
            value={form.getFieldValue('content') || ''}
            onChange={(value) => {
              form.setFieldValue('content', value);
              handleFormChange();
            }}
            onInsertImage={() => {
              // TODO: 打开 ImageGalleryView 选择模式
              // 这将在 Task 10 中实现
              showNotification('info', '图片管理功能即将推出');
            }}
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
            >
              保存 {!isSaving && '(Ctrl+S)'}
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={isSaving}
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

export default ArticleEditor;
