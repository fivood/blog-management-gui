import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import 'highlight.js/styles/github.css';

interface MarkdownPreviewProps {
  content: string;
}

/**
 * MarkdownPreview - Renders Markdown content with syntax highlighting
 * Requirements: 5.1-5.5
 * 
 * Features:
 * - Parse Markdown using marked.js
 * - Apply syntax highlighting with highlight.js
 * - Sanitize HTML output with DOMPurify
 * - Render sanitized HTML
 */
const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewRef.current) return;

    // Configure marked with highlight.js
    marked.setOptions({
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (err) {
            console.error('Highlight error:', err);
          }
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true
    });

    // Parse Markdown to HTML
    const rawHtml = marked.parse(content) as string;

    // Sanitize HTML with DOMPurify
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'em', 'u', 's', 'code', 'pre',
        'a', 'img',
        'ul', 'ol', 'li',
        'blockquote',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id']
    });

    // Render sanitized HTML
    previewRef.current.innerHTML = cleanHtml;
  }, [content]);

  return (
    <div
      ref={previewRef}
      className="markdown-preview"
      style={{
        padding: '16px',
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#24292e'
      }}
    />
  );
};

export default MarkdownPreview;
