import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import EditorToolbar from './EditorToolbar';
import MarkdownPreview from './MarkdownPreview';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onInsertImage: () => void;
}

/**
 * MarkdownEditor - Split-pane Markdown editor with live preview
 * Requirements: 5.1-5.5, 8.1-8.4, 19.3
 * 
 * Features:
 * - Split-pane layout with CodeMirror 6 editor on left and preview on right
 * - Markdown syntax highlighting
 * - EditorToolbar with common formatting buttons and "Insert Image" button
 * - Debounced content changes (100ms) before updating preview
 * - MarkdownPreview component for rendering
 */
const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, onInsertImage }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const [previewContent, setPreviewContent] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        markdown(),
        oneDark,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
            
            // Debounce preview update (100ms)
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
              setPreviewContent(newValue);
            }, 100);
          }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editorViewRef.current) {
      const currentValue = editorViewRef.current.state.doc.toString();
      if (currentValue !== value) {
        editorViewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value
          }
        });
        setPreviewContent(value);
      }
    }
  }, [value]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px', border: '1px solid #d9d9d9' }}>
      <EditorToolbar 
        editorView={editorViewRef.current} 
        onInsertImage={onInsertImage}
      />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Editor pane */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            borderRight: '1px solid #d9d9d9'
          }}
        >
          <div ref={editorRef} style={{ height: '100%' }} />
        </div>

        {/* Preview pane */}
        <div
          style={{
            flex: 1,
            overflow: 'auto'
          }}
        >
          <MarkdownPreview content={previewContent} />
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
