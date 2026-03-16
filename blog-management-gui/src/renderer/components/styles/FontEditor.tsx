import React from 'react';
import { Form, Select, Slider, Card, Space, Typography } from 'antd';
import type { FontSettings } from '../../../shared/types';

/**
 * FontEditor Component
 * Requirements: 25.1-25.7
 * 
 * Features:
 * - Font family selector with common web fonts
 * - Sliders for heading font size (16-48px)
 * - Sliders for body font size (12-24px)
 * - Sliders for line height (1.0-2.5)
 * - Sliders for letter spacing (-0.05em to 0.2em)
 * - Display current values
 */

const { Text } = Typography;

interface FontEditorProps {
  fontSettings: FontSettings;
  onChange: (fontSettings: FontSettings) => void;
}

const FontEditor: React.FC<FontEditorProps> = ({ fontSettings, onChange }) => {
  const handleChange = (field: keyof FontSettings, value: string | number) => {
    onChange({ ...fontSettings, [field]: value });
  };

  const commonFonts = [
    { label: '系统默认', value: 'system-ui, -apple-system, sans-serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Courier New', value: '"Courier New", Courier, monospace' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Open Sans', value: '"Open Sans", sans-serif' },
    { label: 'Lato', value: 'Lato, sans-serif' },
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: '微软雅黑', value: '"Microsoft YaHei", sans-serif' },
    { label: '苹方', value: '"PingFang SC", sans-serif' },
    { label: '思源黑体', value: '"Source Han Sans SC", sans-serif' }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="字体设置" size="small">
        <Form layout="vertical">
          <Form.Item label="字体系列">
            <Select
              value={fontSettings.fontFamily}
              onChange={(value) => handleChange('fontFamily', value)}
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="label"
              options={commonFonts}
            />
          </Form.Item>

          <Form.Item label={`标题字体大小: ${fontSettings.headingFontSize}px`}>
            <Slider
              min={16}
              max={48}
              value={fontSettings.headingFontSize}
              onChange={(value) => handleChange('headingFontSize', value)}
              marks={{
                16: '16px',
                24: '24px',
                32: '32px',
                40: '40px',
                48: '48px'
              }}
            />
          </Form.Item>

          <Form.Item label={`正文字体大小: ${fontSettings.bodyFontSize}px`}>
            <Slider
              min={12}
              max={24}
              value={fontSettings.bodyFontSize}
              onChange={(value) => handleChange('bodyFontSize', value)}
              marks={{
                12: '12px',
                14: '14px',
                16: '16px',
                18: '18px',
                20: '20px',
                24: '24px'
              }}
            />
          </Form.Item>

          <Form.Item label={`行高: ${fontSettings.lineHeight.toFixed(1)}`}>
            <Slider
              min={1.0}
              max={2.5}
              step={0.1}
              value={fontSettings.lineHeight}
              onChange={(value) => handleChange('lineHeight', value)}
              marks={{
                1.0: '1.0',
                1.5: '1.5',
                2.0: '2.0',
                2.5: '2.5'
              }}
            />
          </Form.Item>

          <Form.Item label={`字间距: ${fontSettings.letterSpacing.toFixed(2)}em`}>
            <Slider
              min={-0.05}
              max={0.2}
              step={0.01}
              value={fontSettings.letterSpacing}
              onChange={(value) => handleChange('letterSpacing', value)}
              marks={{
                '-0.05': '-0.05em',
                0: '0',
                0.1: '0.1em',
                0.2: '0.2em'
              }}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="字体预览" size="small">
        <div style={{ 
          fontFamily: fontSettings.fontFamily,
          lineHeight: fontSettings.lineHeight,
          letterSpacing: `${fontSettings.letterSpacing}em`
        }}>
          <h1 style={{ fontSize: `${fontSettings.headingFontSize}px` }}>
            一级标题示例 Heading 1
          </h1>
          <h2 style={{ fontSize: `${fontSettings.headingFontSize * 0.875}px` }}>
            二级标题示例 Heading 2
          </h2>
          <h3 style={{ fontSize: `${fontSettings.headingFontSize * 0.75}px` }}>
            三级标题示例 Heading 3
          </h3>
          <p style={{ fontSize: `${fontSettings.bodyFontSize}px` }}>
            这是一段示例正文文本，用于预览字体效果。The quick brown fox jumps over the lazy dog. 
            这段文字包含中英文混排，可以帮助你更好地预览字体的实际显示效果。
          </p>
          <p style={{ fontSize: `${fontSettings.bodyFontSize}px` }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </Card>
    </Space>
  );
};

export default FontEditor;
