import React, { useEffect, useRef } from 'react';
import { Card } from 'antd';

/**
 * BuildConsole Component
 * Requirements: 9.4, 9.6
 * 
 * Features:
 * - Display build output logs in scrollable text area
 * - Apply syntax highlighting to error messages
 * - Auto-scroll to bottom as new logs arrive
 * - Highlight error lines in red
 */

interface BuildConsoleProps {
  output: string[];
  title?: string;
}

const BuildConsole: React.FC<BuildConsoleProps> = ({ output, title = '构建输出' }) => {
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output]);

  const formatLine = (line: string, index: number) => {
    // Check if line contains error keywords
    const isError = /error|failed|fatal|exception/i.test(line);
    const isWarning = /warning|warn/i.test(line);
    const isSuccess = /success|complete|done|built/i.test(line);

    let className = 'console-line';
    if (isError) {
      className += ' console-line-error';
    } else if (isWarning) {
      className += ' console-line-warning';
    } else if (isSuccess) {
      className += ' console-line-success';
    }

    return (
      <div key={index} className={className}>
        {line}
      </div>
    );
  };

  return (
    <Card 
      title={title}
      style={{ marginTop: 16 }}
      bodyStyle={{ padding: 0 }}
    >
      <div
        ref={consoleRef}
        style={{
          height: '300px',
          overflow: 'auto',
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: '13px',
          padding: '12px',
          lineHeight: '1.5'
        }}
      >
        {output.length === 0 ? (
          <div style={{ color: '#888' }}>等待构建输出...</div>
        ) : (
          output.map((line, index) => formatLine(line, index))
        )}
      </div>
      <style>{`
        .console-line {
          white-space: pre-wrap;
          word-break: break-all;
        }
        .console-line-error {
          color: #f48771;
          font-weight: 500;
        }
        .console-line-warning {
          color: #dcdcaa;
        }
        .console-line-success {
          color: #4ec9b0;
        }
      `}</style>
    </Card>
  );
};

export default BuildConsole;
