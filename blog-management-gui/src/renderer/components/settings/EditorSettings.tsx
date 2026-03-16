import React from 'react';
import { Form, Input, Select, Checkbox, Typography } from 'antd';

/**
 * EditorSettings Component
 * Requirements: 17.1-17.5
 * 
 * Features:
 * - Add theme selector (light/dark)
 * - Add number inputs for font size, tab size
 * - Add checkboxes for word wrap, line numbers, auto-save
 * - Add number input for auto-save delay
 */

const { Text } = Typography;
const { Option } = Select;

const EditorSettings: React.FC = () => {
  return (
    <>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        配置编辑器的外观和行为设置。
      </Text>

      <Form.Item
        label="主题"
        name={['editor', 'theme']}
      >
        <Select placeholder="选择主题">
          <Option value="light">浅色</Option>
          <Option value="dark">深色</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="字体大小"
        name={['editor', 'fontSize']}
        extra="编辑器字体大小（像素）"
      >
        <Input type="number" min={10} max={24} placeholder="14" />
      </Form.Item>

      <Form.Item
        label="Tab 大小"
        name={['editor', 'tabSize']}
        extra="Tab 键对应的空格数"
      >
        <Input type="number" min={2} max={8} placeholder="2" />
      </Form.Item>

      <Form.Item
        name={['editor', 'wordWrap']}
        valuePropName="checked"
      >
        <Checkbox>自动换行</Checkbox>
      </Form.Item>

      <Form.Item
        name={['editor', 'lineNumbers']}
        valuePropName="checked"
      >
        <Checkbox>显示行号</Checkbox>
      </Form.Item>

      <Form.Item
        name={['editor', 'autoSave']}
        valuePropName="checked"
      >
        <Checkbox>自动保存</Checkbox>
      </Form.Item>

      <Form.Item
        label="自动保存延迟"
        name={['editor', 'autoSaveDelay']}
        extra="自动保存的延迟时间（毫秒）"
      >
        <Input type="number" min={500} max={5000} placeholder="1000" />
      </Form.Item>
    </>
  );
};

export default EditorSettings;
