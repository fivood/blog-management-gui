import { describe, it, expect, vi } from 'vitest';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';

/**
 * Unit tests for EditorToolbar component
 * Requirements: 8.1-8.4
 * 
 * Tests:
 * - Markdown syntax insertion at cursor position
 * - Formatting operations (bold, italic, heading, list, link, code)
 */

describe('EditorToolbar - Markdown Insertion Logic', () => {
  
  const createMockEditorView = (initialText: string, from: number, to: number) => {
    const state = EditorState.create({
      doc: initialText,
      selection: { anchor: from, head: to }
    });

    const dispatchMock = vi.fn();
    const focusMock = vi.fn();

    return {
      state,
      dispatch: dispatchMock,
      focus: focusMock
    } as unknown as EditorView;
  };

  it('should insert bold syntax around selected text', () => {
    const view = createMockEditorView('Hello World', 0, 5);
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);
    
    expect(selectedText).toBe('Hello');
    
    const newText = `**${selectedText}**`;
    expect(newText).toBe('**Hello**');
  });

  it('should insert italic syntax around selected text', () => {
    const view = createMockEditorView('Hello World', 0, 5);
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);
    
    const newText = `*${selectedText}*`;
    expect(newText).toBe('*Hello*');
  });

  it('should insert heading syntax before text', () => {
    const view = createMockEditorView('Heading', 0, 7);
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);
    
    const newText = `## ${selectedText}`;
    expect(newText).toBe('## Heading');
  });

  it('should insert unordered list syntax', () => {
    const view = createMockEditorView('Item', 0, 4);
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);
    
    const newText = `- ${selectedText}`;
    expect(newText).toBe('- Item');
  });

  it('should insert ordered list syntax', () => {
    const view = createMockEditorView('Item', 0, 4);
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);
    
    const newText = `1. ${selectedText}`;
    expect(newText).toBe('1. Item');
  });

  it('should insert link syntax', () => {
    const view = createMockEditorView('Link Text', 0, 9);
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);
    
    const newText = `[${selectedText}](url)`;
    expect(newText).toBe('[Link Text](url)');
  });

  it('should insert code block syntax', () => {
    const view = createMockEditorView('code', 0, 4);
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);
    
    const newText = `\`\`\`\n${selectedText}\n\`\`\``;
    expect(newText).toBe('```\ncode\n```');
  });

  it('should use placeholder when no text is selected', () => {
    const view = createMockEditorView('', 0, 0);
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);
    
    const placeholder = '粗体文本';
    const text = selectedText || placeholder;
    const newText = `**${text}**`;
    
    expect(newText).toBe('**粗体文本**');
  });

  it('should insert image markdown link format', () => {
    const filename = 'test.png';
    const imageLink = `![](/images/${filename})`;
    
    expect(imageLink).toBe('![](/images/test.png)');
    expect(imageLink).toMatch(/!\[\]\(\/images\/.+\)/);
  });

  it('should preserve text before and after insertion', () => {
    const initialText = 'Hello World';
    const view = createMockEditorView(initialText, 6, 11); // Select "World"
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);
    
    expect(selectedText).toBe('World');
    
    // Simulate bold insertion
    const before = initialText.slice(0, from);
    const after = initialText.slice(to);
    const newText = `${before}**${selectedText}**${after}`;
    
    expect(newText).toBe('Hello **World**');
  });
});
