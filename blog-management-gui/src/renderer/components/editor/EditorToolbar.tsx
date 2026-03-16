import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  CodeOutlined,
  PictureOutlined,
  FontSizeOutlined
} from '@ant-design/icons';
import type { EditorView } from '@codemirror/view';

interface EditorToolbarProps {
  editorView: EditorView | null;
  onInsertImage: () => void;
}

/**
 * EditorToolbar - Toolbar with formatting buttons for Markdown editor
 * Requirements: 8.1-8.4
 * 
 * Features:
 * - Buttons for bold, italic, heading, list, link, code block
 * - "Insert Image" button that opens ImageGalleryView in selection mode
 * - Insert Markdown syntax at cursor position
 */
const EditorToolbar: React.FC<EditorToolbarProps> = ({ editorView, onInsertImage }) => {
  
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    if (!editorView) return;

    const { state } = editorView;
    const { from, to } = state.selection.main;
    const selectedText = state.sliceDoc(from, to);
    
    const text = selectedText || placeholder;
    const newText = `${before}${text}${after}`;
    
    editorView.dispatch({
      changes: { from, to, insert: newText },
      selection: { 
        anchor: from + before.length, 
        head: from + before.length + text.length 
      }
    });
    
    editorView.focus();
  };

  const handleBold = () => {
    insertText('**', '**', '粗体文本');
  };

  const handleItalic = () => {
    insertText('*', '*', '斜体文本');
  };

  const handleHeading = () => {
    insertText('## ', '', '标题');
  };

  const handleUnorderedList = () => {
    insertText('- ', '', '列表项');
  };

  const handleOrderedList = () => {
    insertText('1. ', '', '列表项');
  };

  const handleLink = () => {
    insertText('[', '](url)', '链接文本');
  };

  const handleCodeBlock = () => {
    insertText('```\n', '\n```', '代码');
  };

  return (
    <div
      style={{
        padding: '8px 16px',
        borderBottom: '1px solid #d9d9d9',
        backgroundColor: '#fafafa'
      }}
    >
      <Space>
        <Tooltip title="粗体 (Ctrl+B)">
          <Button
            icon={<BoldOutlined />}
            onClick={handleBold}
            size="small"
          />
        </Tooltip>

        <Tooltip title="斜体 (Ctrl+I)">
          <Button
            icon={<ItalicOutlined />}
            onClick={handleItalic}
            size="small"
          />
        </Tooltip>

        <Tooltip title="标题">
          <Button
            icon={<FontSizeOutlined />}
            onClick={handleHeading}
            size="small"
          />
        </Tooltip>

        <Tooltip title="无序列表">
          <Button
            icon={<UnorderedListOutlined />}
            onClick={handleUnorderedList}
            size="small"
          />
        </Tooltip>

        <Tooltip title="有序列表">
          <Button
            icon={<OrderedListOutlined />}
            onClick={handleOrderedList}
            size="small"
          />
        </Tooltip>

        <Tooltip title="链接">
          <Button
            icon={<LinkOutlined />}
            onClick={handleLink}
            size="small"
          />
        </Tooltip>

        <Tooltip title="代码块">
          <Button
            icon={<CodeOutlined />}
            onClick={handleCodeBlock}
            size="small"
          />
        </Tooltip>

        <Tooltip title="插入图片">
          <Button
            icon={<PictureOutlined />}
            onClick={onInsertImage}
            size="small"
            type="primary"
          />
        </Tooltip>
      </Space>
    </div>
  );
};

export default EditorToolbar;
