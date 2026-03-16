import React from 'react';
import { Form, Select, Card, Space, ColorPicker } from 'antd';
import type { ColorTheme } from '../../../shared/types';
import type { Color } from 'antd/es/color-picker';

/**
 * ColorThemeEditor Component
 * Requirements: 23.1-23.8, 26.2
 * 
 * Features:
 * - Preset theme selector (light/dark)
 * - Color pickers for primary, background, text, link, accent colors
 * - Real-time preview updates (debounced 500ms)
 */

interface ColorThemeEditorProps {
  colorTheme: ColorTheme;
  onChange: (colorTheme: ColorTheme) => void;
}

const ColorThemeEditor: React.FC<ColorThemeEditorProps> = ({ colorTheme, onChange }) => {
  const handleModeChange = (mode: 'light' | 'dark') => {
    // Apply preset colors based on mode
    const presetColors: Record<'light' | 'dark', Omit<ColorTheme, 'mode'>> = {
      light: {
        primaryColor: '#1890ff',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        linkColor: '#1890ff',
        accentColor: '#52c41a'
      },
      dark: {
        primaryColor: '#177ddc',
        backgroundColor: '#141414',
        textColor: '#ffffff',
        linkColor: '#177ddc',
        accentColor: '#49aa19'
      }
    };

    onChange({
      mode,
      ...presetColors[mode]
    });
  };

  const handleColorChange = (field: keyof Omit<ColorTheme, 'mode'>, color: Color) => {
    onChange({
      ...colorTheme,
      [field]: color.toHexString()
    });
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="预设主题" size="small">
        <Form layout="vertical">
          <Form.Item label="主题模式">
            <Select
              value={colorTheme.mode}
              onChange={handleModeChange}
              style={{ width: '100%' }}
            >
              <Select.Option value="light">亮色主题</Select.Option>
              <Select.Option value="dark">暗色主题</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card title="自定义颜色" size="small">
        <Form layout="vertical">
          <Form.Item label="主色调">
            <ColorPicker
              value={colorTheme.primaryColor}
              onChange={(color) => handleColorChange('primaryColor', color)}
              showText
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="背景色">
            <ColorPicker
              value={colorTheme.backgroundColor}
              onChange={(color) => handleColorChange('backgroundColor', color)}
              showText
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="文字颜色">
            <ColorPicker
              value={colorTheme.textColor}
              onChange={(color) => handleColorChange('textColor', color)}
              showText
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="链接颜色">
            <ColorPicker
              value={colorTheme.linkColor}
              onChange={(color) => handleColorChange('linkColor', color)}
              showText
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="强调色">
            <ColorPicker
              value={colorTheme.accentColor}
              onChange={(color) => handleColorChange('accentColor', color)}
              showText
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="颜色预览" size="small">
        <div style={{ 
          padding: '16px',
          backgroundColor: colorTheme.backgroundColor,
          color: colorTheme.textColor,
          borderRadius: '4px'
        }}>
          <h3 style={{ color: colorTheme.primaryColor }}>标题示例</h3>
          <p>这是一段示例文本，用于预览文字颜色效果。</p>
          <a href="#" style={{ color: colorTheme.linkColor }}>这是一个链接示例</a>
          <div style={{ 
            marginTop: '8px',
            padding: '8px',
            backgroundColor: colorTheme.accentColor,
            color: '#fff',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            强调色示例
          </div>
        </div>
      </Card>
    </Space>
  );
};

export default ColorThemeEditor;
