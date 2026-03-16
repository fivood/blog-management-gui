import React, { useState, useEffect } from 'react';
import { Tabs, Button, Space, message, Modal, Typography } from 'antd';
import { ExportOutlined, ImportOutlined, ReloadOutlined, HistoryOutlined } from '@ant-design/icons';
import type { StyleConfiguration } from '../../../shared/types';
import ConfigEditor from './ConfigEditor';
import CSSEditor from './CSSEditor';
import PaperModEditor from './PaperModEditor';
import NeopostEditor from './NeopostEditor';
import StyleHistory from './StyleHistory';

/**
 * StyleEditorView Component
 * Requirements: 21.1-21.9, 22.1-22.8, 23.1-23.8, 24.1-24.7, 25.1-25.7, 
 *               26.1-26.6, 27.1-27.5, 28.1-28.7, 29.1-29.6, 30.1-30.7
 * 
 * Features:
 * - Tabbed interface for different style configuration sections
 * - Export/Import/Reset functionality
 * - Style history tracking
 */

const { Title } = Typography;
const { TabPane } = Tabs;

const StyleEditorView: React.FC = () => {
  const [styleConfig, setStyleConfig] = useState<StyleConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Load style configuration on mount
  useEffect(() => {
    loadStyleConfig();
  }, []);

  const loadStyleConfig = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.style.get();
      
      if (response.success && response.data) {
        setStyleConfig(response.data);
        setIsDirty(false);
      } else {
        message.error('加载样式配置失败');
      }
    } catch (error) {
      console.error('Failed to load style config:', error);
      message.error('加载样式配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (updates: Partial<StyleConfiguration>) => {
    if (styleConfig) {
      setStyleConfig({ ...styleConfig, ...updates });
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    if (!styleConfig) return;

    setSaving(true);
    try {
      const response = await window.electronAPI.style.update(styleConfig, '手动保存');
      
      if (response.success) {
        message.success('样式配置已保存');
        setIsDirty(false);
      } else {
        message.error(`保存失败: ${response.error?.userMessage || '未知错误'}`);
      }
    } catch (error) {
      console.error('Failed to save style config:', error);
      message.error('保存样式配置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await window.electronAPI.style.export();
      
      if (response.success && response.data) {
        // Create download link
        const blob = new Blob([response.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blog-style-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        message.success('样式配置已导出');
      } else {
        message.error('导出失败');
      }
    } catch (error) {
      console.error('Failed to export style config:', error);
      message.error('导出样式配置失败');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const response = await window.electronAPI.style.import(text);
        
        if (response.success) {
          message.success('样式配置已导入');
          await loadStyleConfig();
        } else {
          message.error(`导入失败: ${response.error?.userMessage || '未知错误'}`);
        }
      } catch (error) {
        console.error('Failed to import style config:', error);
        message.error('导入样式配置失败');
      }
    };
    input.click();
  };

  const handleReset = () => {
    Modal.confirm({
      title: '确认重置',
      content: '确定要重置所有样式设置到默认值吗？此操作无法撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await window.electronAPI.style.reset();
          
          if (response.success) {
            message.success('样式已重置为默认值');
            await loadStyleConfig();
          } else {
            message.error('重置失败');
          }
        } catch (error) {
          console.error('Failed to reset style config:', error);
          message.error('重置样式配置失败');
        }
      }
    });
  };

  const handleRestoreFromHistory = async (historyId: string) => {
    try {
      const response = await window.electronAPI.style.restoreFromHistory(historyId);
      
      if (response.success) {
        message.success('已恢复到历史版本');
        await loadStyleConfig();
        setShowHistory(false);
      } else {
        message.error('恢复失败');
      }
    } catch (error) {
      console.error('Failed to restore from history:', error);
      message.error('恢复历史版本失败');
    }
  };

  if (loading || !styleConfig) {
    return <div style={{ padding: '24px' }}>加载中...</div>;
  }

  return (
    <div 
      id="style-editor-container"
      style={{ 
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Full Width Editor */}
      <div style={{ 
        width: '100%',
        padding: '24px',
        overflow: 'auto'
      }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>样式编辑器</Title>
          <Space>
            <Button 
              icon={<HistoryOutlined />}
              onClick={() => setShowHistory(true)}
            >
              历史记录
            </Button>
            <Button 
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              导出配置
            </Button>
            <Button 
              icon={<ImportOutlined />}
              onClick={handleImport}
            >
              导入配置
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={handleReset}
              danger
            >
              重置为默认
            </Button>
            <Button 
              type="primary"
              onClick={handleSave}
              loading={saving}
              disabled={!isDirty}
            >
              保存更改
            </Button>
          </Space>
        </div>

        <Tabs defaultActiveKey="config">
          <TabPane tab="Hugo 配置" key="config">
            <ConfigEditor 
              config={styleConfig}
              onChange={handleConfigChange}
            />
          </TabPane>

          <TabPane tab="自定义 CSS" key="css">
            <CSSEditor 
              css={styleConfig.customCSS}
              onChange={(customCSS) => handleConfigChange({ customCSS })}
            />
          </TabPane>

          <TabPane tab="PaperMod 主题" key="papermod">
            <PaperModEditor 
              config={styleConfig}
              onChange={handleConfigChange}
            />
          </TabPane>

          <TabPane tab="Neopost 主题" key="neopost">
            <NeopostEditor 
              config={styleConfig}
              onChange={handleConfigChange}
            />
          </TabPane>
        </Tabs>
      </div>

      {/* History Modal */}
      <Modal
        title="样式历史记录"
        open={showHistory}
        onCancel={() => setShowHistory(false)}
        footer={null}
        width={800}
      >
        <StyleHistory onRestore={handleRestoreFromHistory} />
      </Modal>
    </div>
  );
};

export default StyleEditorView;
