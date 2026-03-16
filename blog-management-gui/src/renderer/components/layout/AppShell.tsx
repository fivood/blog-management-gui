import React from 'react';
import { Layout, message } from 'antd';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../contexts/AppContext';
import { useNotification } from '../../contexts/NotificationContext';

const { Content } = Layout;

/**
 * AppShell Component
 * Requirements: 15.1-15.5
 * 
 * Features:
 * - Create layout with Sidebar and main content area
 * - Display Header with app title and current view name
 * - Render notification toasts
 */

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { state } = useApp();
  const { notifications, hideNotification } = useNotification();
  const [messageApi, contextHolder] = message.useMessage();

  // Display notifications using Ant Design message component
  React.useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      
      const config = {
        content: latestNotification.message,
        duration: latestNotification.autoClose 
          ? (latestNotification.duration || 3000) / 1000 
          : 0,
        onClose: () => hideNotification(latestNotification.id)
      };

      switch (latestNotification.type) {
        case 'success':
          messageApi.success(config);
          break;
        case 'error':
          messageApi.error(config);
          break;
        case 'warning':
          messageApi.warning(config);
          break;
        case 'info':
          messageApi.info(config);
          break;
      }
    }
  }, [notifications, messageApi, hideNotification]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <Sidebar />
      <Layout>
        <Header />
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 112px)'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
