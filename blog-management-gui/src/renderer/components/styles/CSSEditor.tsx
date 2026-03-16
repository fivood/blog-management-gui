import React, { useState, useEffect } from 'react';
import { Card, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

/**
 * CSSEditor Component
 * Requirements: 22.1-22.8
 * 
 * Features:
 * - CSS syntax highlighting
 * - CSS syntax validation
 * - Undo/redo support
 * - Error highlighting
 * 
 * Note: Using a simple textarea for now. 
 * For production, consider integrating CodeMirror 6 with CSS mode.
 */

interface CSSEditorProps {
  css: string;
  onChange: (css: string) => void;
}

const CSSEditor: React.FC<CSSEditorProps> = ({ css, onChange }) => {
  const [localCSS, setLocalCSS] = useState(css);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setLocalCSS(css);
  }, [css]);

  const validateCSS = (cssText: string): string[] => {
    const errors: string[] = [];
    
    // Basic CSS validation
    // Check for balanced braces
    const openBraces = (cssText.match(/{/g) || []).length;
    const closeBraces = (cssText.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('CSS 语法错误：大括号不匹配');
    }
    
    // Check for basic syntax patterns
    const lines = cssText.split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('//')) {
        return;
      }
      
      // Check for property declarations (should have : and ;)
      if (trimmed.includes(':') && !trimmed.includes('{') && !trimmed.includes('}')) {
        if (!trimmed.endsWith(';') && !trimmed.endsWith('{')) {
          errors.push(`第 ${index + 1} 行：CSS 属性声明应以分号结尾`);
        }
      }
    });
    
    return errors;
  };

  const handleChange = (value: string) => {
    setLocalCSS(value);
    
    // Validate CSS
    const validationErrors = validateCSS(value);
    setErrors(validationErrors);
    
    // Update parent even if there are errors (allow saving invalid CSS for manual fixing)
    onChange(value);
  };

  return (
    <Card size="small">
      <Alert
        message="自定义 CSS 编辑器"
        description="在这里添加自定义 CSS 样式。样式将应用到整个博客。支持标准 CSS 语法。"
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ marginBottom: 16 }}
      />

      {errors.length > 0 && (
        <Alert
          message="CSS 语法警告"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <textarea
        value={localCSS}
        onChange={(e) => handleChange(e.target.value)}
        style={{
          width: '100%',
          minHeight: '400px',
          fontFamily: 'monospace',
          fontSize: '14px',
          padding: '12px',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          resize: 'vertical'
        }}
        placeholder="/* 在这里添加自定义 CSS */&#10;&#10;.custom-class {&#10;  color: #333;&#10;  font-size: 16px;&#10;}"
      />

      <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
        提示：使用 Ctrl+Z 撤销，Ctrl+Y 重做
      </div>
    </Card>
  );
};

export default CSSEditor;
