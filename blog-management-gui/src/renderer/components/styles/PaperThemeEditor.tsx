import React from 'react';
import { Form, Input, Select, Card, Space, Radio, Switch } from 'antd';
import type { StyleConfiguration } from '../../../shared/types';

interface PaperThemeEditorProps {
  config?: StyleConfiguration;
  onChange?: (updates: Partial<StyleConfiguration>) => void;
}

const PaperThemeEditor: React.FC<PaperThemeEditorProps> = ({ config, onChange }) => {
  const getParam = (key: string, defaultValue: any = '') => {
    return config?.hugoConfig?.params?.[key] ?? defaultValue;
  };

  const updateParam = (key: string, value: any) => {
    if (!onChange || !config) return;
    
    onChange({
      hugoConfig: {
        ...config.hugoConfig,
        params: {
          ...(config.hugoConfig.params || {}),
          [key]: value
        }
      }
    });
  };

  const getNestedParam = (parent: string, key: string, defaultValue: any = '') => {
    return (config?.hugoConfig?.params as any)?.[parent]?.[key] ?? defaultValue;
  };

  const updateNestedParam = (parent: string, key: string, value: any) => {
    if (!onChange || !config) return;
    
    const currentParent = (config.hugoConfig.params as any)?.[parent] || {};
    
    onChange({
      hugoConfig: {
        ...config.hugoConfig,
        params: {
          ...(config.hugoConfig.params || {}),
          [parent]: {
            ...currentParent,
            [key]: value
          }
        }
      }
    });
  };

  const commentSystem = getParam('commentSystem', 'none');

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>

      <Card title="颜色主题" size="small">
        <Form layout="vertical">
          <Form.Item label="选择颜色主题">
            <Radio.Group
              value={getParam('color', 'linen')}
              onChange={(e) => updateParam('color', e.target.value)}
            >
              <Space direction="vertical">
                <Radio value="linen">Linen（米色）</Radio>
                <Radio value="wheat">Wheat（小麦色）</Radio>
                <Radio value="gray">Gray（灰色）</Radio>
                <Radio value="light">Light（浅色）</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Card>

      <Card title="个人资料" size="small">
        <Form layout="vertical">
          <Form.Item label="头像" help="Gravatar 邮箱或图片 URL">
            <Input
              value={getParam('avatar')}
              onChange={(e) => updateParam('avatar', e.target.value)}
              placeholder="email@example.com 或 /images/avatar.png"
            />
          </Form.Item>
          <Form.Item label="姓名">
            <Input
              value={getParam('name')}
              onChange={(e) => updateParam('name', e.target.value)}
              placeholder="输入姓名"
            />
          </Form.Item>
          <Form.Item label="个人简介">
            <Input.TextArea
              value={getParam('bio')}
              onChange={(e) => updateParam('bio', e.target.value)}
              placeholder="输入个人简介"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="社交链接" size="small">
        <Form layout="vertical">
          <Form.Item label="Twitter">
            <Input
              value={getParam('twitter')}
              onChange={(e) => updateParam('twitter', e.target.value)}
              placeholder="username"
              prefix="@"
            />
          </Form.Item>
          <Form.Item label="GitHub">
            <Input
              value={getParam('github')}
              onChange={(e) => updateParam('github', e.target.value)}
              placeholder="username"
            />
          </Form.Item>
          <Form.Item label="Instagram">
            <Input
              value={getParam('instagram')}
              onChange={(e) => updateParam('instagram', e.target.value)}
              placeholder="username"
              prefix="@"
            />
          </Form.Item>
          <Form.Item label="LinkedIn">
            <Input
              value={getParam('linkedin')}
              onChange={(e) => updateParam('linkedin', e.target.value)}
              placeholder="username"
            />
          </Form.Item>
          <Form.Item label="Mastodon">
            <Input
              value={getParam('mastodon')}
              onChange={(e) => updateParam('mastodon', e.target.value)}
              placeholder="https://mastodon.instance/@username"
            />
          </Form.Item>
          <Form.Item label="Threads">
            <Input
              value={getParam('threads')}
              onChange={(e) => updateParam('threads', e.target.value)}
              placeholder="@username"
              prefix="@"
            />
          </Form.Item>
          <Form.Item label="Bluesky">
            <Input
              value={getParam('bluesky')}
              onChange={(e) => updateParam('bluesky', e.target.value)}
              placeholder="username.bsky.social"
            />
          </Form.Item>
          <Form.Item label="RSS 订阅">
            <Switch
              checked={getParam('rss', false)}
              onChange={(checked) => updateParam('rss', checked)}
            />
          </Form.Item>
        </Form>
      </Card>


      <Card title="评论系统" size="small">
        <Form layout="vertical">
          <Form.Item label="选择评论系统">
            <Select
              value={commentSystem}
              onChange={(value) => updateParam('commentSystem', value)}
            >
              <Select.Option value="none">不使用</Select.Option>
              <Select.Option value="disqus">Disqus</Select.Option>
              <Select.Option value="giscus">Giscus</Select.Option>
            </Select>
          </Form.Item>

          {commentSystem === 'disqus' && (
            <Form.Item label="Disqus Shortname">
              <Input
                value={getNestedParam('services', 'disqus')}
                onChange={(e) => updateNestedParam('services', 'disqus', { shortname: e.target.value })}
                placeholder="your-shortname"
              />
            </Form.Item>
          )}

          {commentSystem === 'giscus' && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item label="Repository" help="格式: username/repo">
                <Input
                  value={getNestedParam('giscus', 'repo')}
                  onChange={(e) => updateNestedParam('giscus', 'repo', e.target.value)}
                  placeholder="username/repo"
                />
              </Form.Item>
              <Form.Item label="Repository ID">
                <Input
                  value={getNestedParam('giscus', 'repoId')}
                  onChange={(e) => updateNestedParam('giscus', 'repoId', e.target.value)}
                  placeholder="R_xxx"
                />
              </Form.Item>
              <Form.Item label="Category">
                <Input
                  value={getNestedParam('giscus', 'category')}
                  onChange={(e) => updateNestedParam('giscus', 'category', e.target.value)}
                  placeholder="Announcements"
                />
              </Form.Item>
              <Form.Item label="Category ID">
                <Input
                  value={getNestedParam('giscus', 'categoryId')}
                  onChange={(e) => updateNestedParam('giscus', 'categoryId', e.target.value)}
                  placeholder="DIC_xxx"
                />
              </Form.Item>
              <Form.Item label="Mapping">
                <Select
                  value={getNestedParam('giscus', 'mapping', 'pathname')}
                  onChange={(value) => updateNestedParam('giscus', 'mapping', value)}
                >
                  <Select.Option value="pathname">Pathname</Select.Option>
                  <Select.Option value="url">URL</Select.Option>
                  <Select.Option value="title">Title</Select.Option>
                  <Select.Option value="og:title">OG:Title</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Theme">
                <Select
                  value={getNestedParam('giscus', 'theme', 'light')}
                  onChange={(value) => updateNestedParam('giscus', 'theme', value)}
                >
                  <Select.Option value="light">Light</Select.Option>
                  <Select.Option value="dark">Dark</Select.Option>
                  <Select.Option value="preferred_color_scheme">Preferred Color Scheme</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Language">
                <Select
                  value={getNestedParam('giscus', 'lang', 'zh-CN')}
                  onChange={(value) => updateNestedParam('giscus', 'lang', value)}
                >
                  <Select.Option value="zh-CN">简体中文</Select.Option>
                  <Select.Option value="zh-TW">繁體中文</Select.Option>
                  <Select.Option value="en">English</Select.Option>
                </Select>
              </Form.Item>
            </Space>
          )}
        </Form>
      </Card>


      <Card title="功能开关" size="small">
        <Form layout="vertical">
          <Form.Item label="数学公式支持（KaTeX）">
            <Switch
              checked={getParam('math', false)}
              onChange={(checked) => updateParam('math', checked)}
            />
          </Form.Item>
          <Form.Item label="使用本地 KaTeX">
            <Switch
              checked={getParam('localKatex', false)}
              onChange={(checked) => updateParam('localKatex', checked)}
            />
          </Form.Item>
          <Form.Item label="禁用代码高亮">
            <Switch
              checked={getParam('disableHLJS', false)}
              onChange={(checked) => updateParam('disableHLJS', checked)}
            />
          </Form.Item>
          <Form.Item label="禁用文章导航">
            <Switch
              checked={getParam('disablePostNavigation', false)}
              onChange={(checked) => updateParam('disablePostNavigation', checked)}
            />
          </Form.Item>
          <Form.Item label="单色深色模式图标">
            <Switch
              checked={getParam('monoDarkIcon', false)}
              onChange={(checked) => updateParam('monoDarkIcon', checked)}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="自定义图标" size="small">
        <Form layout="vertical">
          <Form.Item label="Favicon">
            <Input
              value={getParam('favicon')}
              onChange={(e) => updateParam('favicon', e.target.value)}
              placeholder="favicon.ico"
            />
          </Form.Item>
          <Form.Item label="Apple Touch Icon">
            <Input
              value={getParam('appleTouchIcon')}
              onChange={(e) => updateParam('appleTouchIcon', e.target.value)}
              placeholder="apple-touch-icon.png"
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="文字方向" size="small">
        <Form layout="vertical">
          <Form.Item label="选择文字方向">
            <Radio.Group
              value={getParam('direction', 'ltr')}
              onChange={(e) => updateParam('direction', e.target.value)}
            >
              <Space direction="vertical">
                <Radio value="ltr">LTR（从左到右）</Radio>
                <Radio value="rtl">RTL（从右到左）</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default PaperThemeEditor;
