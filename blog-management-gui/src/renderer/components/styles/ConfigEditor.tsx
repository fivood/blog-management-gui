import React from 'react';
import { Form, Input, Select, Card, Space, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { StyleConfiguration } from '../../../shared/types';

/**
 * ConfigEditor Component
 * Requirements: 21.1-21.9
 * 
 * Features:
 * - Edit Hugo configuration (site title, description, author, language)
 * - Edit PaperMod theme parameters
 * - Edit home page info (title, content)
 * - Edit social icons
 * - Validate required fields
 */

interface SocialIcon {
  name: string;
  url: string;
}

interface ConfigEditorProps {
  config: StyleConfiguration;
  onChange: (updates: Partial<StyleConfiguration>) => void;
}

const ConfigEditor: React.FC<ConfigEditorProps> = ({ config, onChange }) => {
  const handleHugoConfigChange = (field: string, value: any) => {
    onChange({
      hugoConfig: {
        ...config.hugoConfig,
        [field]: value
      }
    });
  };

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

  const handleHomeInfoChange = (field: string, value: any) => {
    onChange({
      hugoConfig: {
        ...config.hugoConfig,
        params: {
          ...(config.hugoConfig.params || {}),
          homeInfoParams: {
            ...((config.hugoConfig.params as any)?.homeInfoParams || {}),
            [field]: value
          }
        }
      }
    });
  };

  const handleSocialIconsChange = (icons: SocialIcon[]) => {
    onChange({
      hugoConfig: {
        ...config.hugoConfig,
        params: {
          ...(config.hugoConfig.params || {}),
          socialIcons: icons
        }
      }
    });
  };

  const addSocialIcon = () => {
    const currentIcons = ((config.hugoConfig.params as any)?.socialIcons || []) as SocialIcon[];
    handleSocialIconsChange([...currentIcons, { name: '', url: '' }]);
  };

  const updateSocialIcon = (index: number, field: 'name' | 'url', value: string) => {
    const currentIcons = ((config.hugoConfig.params as any)?.socialIcons || []) as SocialIcon[];
    const newIcons = [...currentIcons];
    newIcons[index] = { ...newIcons[index], [field]: value };
    handleSocialIconsChange(newIcons);
  };

  const removeSocialIcon = (index: number) => {
    const currentIcons = ((config.hugoConfig.params as any)?.socialIcons || []) as SocialIcon[];
    handleSocialIconsChange(currentIcons.filter((_, i) => i !== index));
  };

  const socialIcons = ((config.hugoConfig.params as any)?.socialIcons || []) as SocialIcon[];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="网站基本信息" size="small">
        <Form layout="vertical">
          <Form.Item label="网站标题" required>
            <Input
              value={config.hugoConfig.title || ''}
              onChange={(e) => handleHugoConfigChange('title', e.target.value)}
              placeholder="输入网站标题"
            />
          </Form.Item>

          <Form.Item label="网站描述">
            <Input.TextArea
              value={config.hugoConfig.params?.description || ''}
              onChange={(e) => handleParamsChange('description', e.target.value)}
              placeholder="输入网站描述"
              rows={3}
            />
          </Form.Item>

          <Form.Item label="作者">
            <Input
              value={config.hugoConfig.params?.author || ''}
              onChange={(e) => handleParamsChange('author', e.target.value)}
              placeholder="输入作者名称"
            />
          </Form.Item>

          <Form.Item label="语言">
            <Select
              value={config.hugoConfig.languageCode || 'zh-cn'}
              onChange={(value) => handleHugoConfigChange('languageCode', value)}
            >
              <Select.Option value="zh-cn">简体中文</Select.Option>
              <Select.Option value="zh-tw">繁體中文</Select.Option>
              <Select.Option value="en">English</Select.Option>
              <Select.Option value="ja">日本語</Select.Option>
              <Select.Option value="ko">한국어</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card title="首页信息" size="small">
        <div style={{ 
          marginBottom: 16, 
          padding: '8px 12px', 
          backgroundColor: '#e6f7ff', 
          border: '1px solid #91d5ff',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <strong>提示：</strong>设置首页标题和内容后，首页顶部将显示个人简介卡片，
          下方会继续显示最新文章列表。
        </div>
        <Form layout="vertical">
          <Form.Item label="首页标题">
            <Input
              value={((config.hugoConfig.params as any)?.homeInfoParams?.Title) || ''}
              onChange={(e) => handleHomeInfoChange('Title', e.target.value)}
              placeholder="例如: 别被算法绑架"
            />
          </Form.Item>

          <Form.Item label="首页内容">
            <Input.TextArea
              value={((config.hugoConfig.params as any)?.homeInfoParams?.Content) || ''}
              onChange={(e) => handleHomeInfoChange('Content', e.target.value)}
              placeholder="例如: 保持活人感的自留地"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card 
        title="自定义链接" 
        size="small"
        extra={
          <Button 
            type="link" 
            icon={<PlusOutlined />} 
            onClick={addSocialIcon}
            size="small"
          >
            添加链接
          </Button>
        }
      >
        <div style={{ 
          marginBottom: 16, 
          padding: '8px 12px', 
          backgroundColor: '#fff7e6', 
          border: '1px solid #ffd591',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <div><strong>图标说明：</strong></div>
          <div style={{ marginTop: 4 }}>
            <strong>内置图标名称：</strong>github, twitter, facebook, instagram, linkedin, youtube, email, rss, link, stackoverflow, gitlab, mastodon, discord, telegram, reddit, codepen, dev, medium 等
          </div>
          <div style={{ marginTop: 8, color: '#fa8c16' }}>
            ⚠️ 注意：PaperMod 主题只支持内置图标名称，不支持自定义 SVG 文件。请从上面的列表中选择图标名称。
          </div>
        </div>
        <Space direction="vertical" style={{ width: '100%' }}>
          {socialIcons.length === 0 ? (
            <div style={{ color: '#999', textAlign: 'center', padding: '20px 0' }}>
              暂无自定义链接，点击"添加链接"按钮添加
            </div>
          ) : (
            socialIcons.map((icon, index) => (
              <Card key={index} size="small" style={{ marginBottom: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item label="链接名称" style={{ marginBottom: 8 }}>
                    <Input
                      value={icon.name}
                      onChange={(e) => updateSocialIcon(index, 'name', e.target.value)}
                      placeholder="例如: GitHub, 博客, 邮箱"
                    />
                  </Form.Item>
                  <Form.Item label="图标" style={{ marginBottom: 8 }}>
                    <Input
                      value={(icon as any).icon || ''}
                      onChange={(e) => {
                        const currentIcons = ((config.hugoConfig.params as any)?.socialIcons || []) as SocialIcon[];
                        const newIcons = [...currentIcons];
                        newIcons[index] = { ...newIcons[index], icon: e.target.value } as any;
                        handleSocialIconsChange(newIcons);
                      }}
                      placeholder="输入内置图标名，如: github, email, link"
                    />
                  </Form.Item>
                  <Form.Item label="链接地址" style={{ marginBottom: 8 }}>
                    <Input
                      value={icon.url}
                      onChange={(e) => updateSocialIcon(index, 'url', e.target.value)}
                      placeholder="例如: https://github.com/username"
                    />
                  </Form.Item>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => removeSocialIcon(index)}
                    size="small"
                  >
                    删除
                  </Button>
                </Space>
              </Card>
            ))
          )}
        </Space>
      </Card>

      <Card 
        title="导航菜单" 
        size="small"
        extra={
          <Button 
            type="link" 
            icon={<PlusOutlined />} 
            onClick={() => {
              const currentMenu = ((config.hugoConfig as any)?.menu?.main || []);
              onChange({
                hugoConfig: {
                  ...config.hugoConfig,
                  menu: {
                    main: [...currentMenu, { name: '', url: '', weight: currentMenu.length + 1 }]
                  }
                }
              });
            }}
            size="small"
          >
            添加菜单项
          </Button>
        }
      >
        <div style={{ 
          marginBottom: 16, 
          padding: '8px 12px', 
          backgroundColor: '#e6f7ff', 
          border: '1px solid #91d5ff',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <div><strong>提示：</strong>weight 值越小，菜单项越靠前。</div>
          <div style={{ marginTop: 8 }}><strong>常见路径：</strong></div>
          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
            <li>首页：<code>/</code></li>
            <li>所有文章：<code>/posts/</code></li>
            <li>所有标签：<code>/tags/</code></li>
            <li>所有分类：<code>/categories/</code></li>
            <li>归档页：<code>/archives/</code></li>
            <li>搜索页：<code>/search/</code></li>
            <li>关于页：<code>/about/</code> 或 <code>/pages/about/</code></li>
            <li>特定标签：<code>/tags/标签名/</code>（如 <code>/tags/长篇/</code>）</li>
            <li>特定分类：<code>/categories/分类名/</code>（如 <code>/categories/随笔/</code>）</li>
          </ul>
          <div style={{ marginTop: 8 }}><strong>创建子菜单示例：</strong></div>
          <ol style={{ margin: '4px 0', paddingLeft: '20px' }}>
            <li>创建父菜单：名称"文章"，链接"/posts/"，父菜单留空</li>
            <li>创建子菜单1：名称"长篇"，链接"/tags/长篇/"，父菜单填"文章"</li>
            <li>创建子菜单2：名称"短篇"，链接"/tags/短篇/"，父菜单填"文章"</li>
            <li>创建子菜单3：名称"随笔"，链接"/tags/随笔/"，父菜单填"文章"</li>
          </ol>
          <div style={{ marginTop: 8, color: '#1890ff' }}>💡 多个菜单项的"父菜单"字段填写相同的名称，它们就会都显示在该父菜单下</div>
        </div>
        <Space direction="vertical" style={{ width: '100%' }}>
          {(!config.hugoConfig.menu?.main || (config.hugoConfig.menu.main as any[]).length === 0) ? (
            <div style={{ color: '#999', textAlign: 'center', padding: '20px 0' }}>
              暂无导航菜单，点击"添加菜单项"按钮添加
            </div>
          ) : (
            ((config.hugoConfig.menu?.main || []) as any[]).map((item, index) => (
              <Card key={index} size="small" style={{ marginBottom: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item label="菜单名称" style={{ marginBottom: 8 }}>
                    <Input
                      value={item.name}
                      onChange={(e) => {
                        const currentMenu = [...((config.hugoConfig as any)?.menu?.main || [])];
                        currentMenu[index] = { ...currentMenu[index], name: e.target.value };
                        onChange({
                          hugoConfig: {
                            ...config.hugoConfig,
                            menu: { main: currentMenu }
                          }
                        });
                      }}
                      placeholder="例如: 首页, 文章, 关于"
                    />
                  </Form.Item>
                  <Form.Item label="父菜单（可选，用于创建子菜单）" style={{ marginBottom: 8 }}>
                    <Input
                      value={item.parent || ''}
                      onChange={(e) => {
                        const currentMenu = [...((config.hugoConfig as any)?.menu?.main || [])];
                        currentMenu[index] = { ...currentMenu[index], parent: e.target.value };
                        onChange({
                          hugoConfig: {
                            ...config.hugoConfig,
                            menu: { main: currentMenu }
                          }
                        });
                      }}
                      placeholder="例如: 文章（留空表示顶级菜单）"
                    />
                  </Form.Item>
                  <Form.Item label="链接地址" style={{ marginBottom: 8 }}>
                    <Input
                      value={item.url}
                      onChange={(e) => {
                        const currentMenu = [...((config.hugoConfig as any)?.menu?.main || [])];
                        currentMenu[index] = { ...currentMenu[index], url: e.target.value };
                        onChange({
                          hugoConfig: {
                            ...config.hugoConfig,
                            menu: { main: currentMenu }
                          }
                        });
                      }}
                      placeholder="例如: /, /posts/, /about/"
                    />
                  </Form.Item>
                  <Form.Item label="排序权重" style={{ marginBottom: 8 }}>
                    <Input
                      type="number"
                      value={item.weight}
                      onChange={(e) => {
                        const currentMenu = [...((config.hugoConfig as any)?.menu?.main || [])];
                        currentMenu[index] = { ...currentMenu[index], weight: parseInt(e.target.value) || 0 };
                        onChange({
                          hugoConfig: {
                            ...config.hugoConfig,
                            menu: { main: currentMenu }
                          }
                        });
                      }}
                      placeholder="数字越小越靠前"
                    />
                  </Form.Item>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => {
                      const currentMenu = [...((config.hugoConfig as any)?.menu?.main || [])];
                      currentMenu.splice(index, 1);
                      onChange({
                        hugoConfig: {
                          ...config.hugoConfig,
                          menu: { main: currentMenu }
                        }
                      });
                    }}
                    size="small"
                  >
                    删除
                  </Button>
                </Space>
              </Card>
            ))
          )}
        </Space>
      </Card>

      <Card title="PaperMod 主题参数" size="small">
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
        </Form>
      </Card>
    </Space>
  );
};

export default ConfigEditor;
