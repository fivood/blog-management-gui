import React, { useState, useEffect } from 'react';
import { List, Button, Typography, Space, message, Empty } from 'antd';
import { HistoryOutlined, RollbackOutlined } from '@ant-design/icons';
import type { StyleHistoryEntry } from '../../../shared/types';

/**
 * StyleHistory Component
 * Requirements: 30.1-30.7
 * 
 * Features:
 * - Display last 20 style changes with timestamp and description
 * - Show preview of selected history entry
 * - Restore to selected version
 */

const { Text } = Typography;

interface StyleHistoryProps {
  onRestore: (historyId: string) => void;
}

const StyleHistory: React.FC<StyleHistoryProps> = ({ onRestore }) => {
  const [history, setHistory] = useState<StyleHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.style.getHistory();
      
      if (response.success && response.data) {
        setHistory(response.data);
      } else {
        message.error('加载历史记录失败');
      }
    } catch (error) {
      console.error('Failed to load style history:', error);
      message.error('加载历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (historyId: string) => {
    onRestore(historyId);
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (history.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无历史记录"
      />
    );
  }

  return (
    <List
      dataSource={history}
      renderItem={(item) => (
        <List.Item
          key={item.id}
          style={{
            backgroundColor: selectedId === item.id ? '#f0f0f0' : 'transparent',
            padding: '12px',
            cursor: 'pointer'
          }}
          onClick={() => setSelectedId(item.id)}
          actions={[
            <Button
              type="primary"
              size="small"
              icon={<RollbackOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleRestore(item.id);
              }}
            >
              恢复
            </Button>
          ]}
        >
          <List.Item.Meta
            avatar={<HistoryOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
            title={item.description}
            description={
              <Space direction="vertical" size="small">
                <Text type="secondary">{formatDate(item.timestamp)}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ID: {item.id.substring(0, 8)}...
                </Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default StyleHistory;
