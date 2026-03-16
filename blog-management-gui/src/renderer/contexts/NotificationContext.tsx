import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * NotificationContext - Manages notification queue and display
 * Requirements: 16.1-16.5
 * 
 * Features:
 * - Queue management for multiple notifications
 * - Auto-dismiss for success, warning, info
 * - Manual dismiss for errors
 * - Configurable durations
 */

// Notification type
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoClose: boolean;
  duration?: number; // milliseconds
  timestamp: number;
}

// Context type
interface NotificationContextType {
  notifications: Notification[];
  showNotification: (
    type: Notification['type'],
    message: string,
    autoClose?: boolean,
    duration?: number
  ) => void;
  hideNotification: (id: string) => void;
  clearAll: () => void;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider props
interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number; // Maximum number of notifications to show at once
}

/**
 * NotificationProvider - Provides notification queue management
 * 
 * Usage:
 * ```tsx
 * <NotificationProvider maxNotifications={3}>
 *   <App />
 * </NotificationProvider>
 * ```
 */
export function NotificationProvider({ 
  children, 
  maxNotifications = 3 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Show notification
  const showNotification = useCallback((
    type: Notification['type'],
    message: string,
    autoClose?: boolean,
    duration?: number
  ) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const timestamp = Date.now();
    
    // Determine auto-close behavior
    const shouldAutoClose = autoClose !== undefined 
      ? autoClose 
      : getDefaultAutoClose(type);
    
    // Determine duration
    const notificationDuration = duration || getDefaultDuration(type);

    const notification: Notification = {
      id,
      type,
      message,
      autoClose: shouldAutoClose,
      duration: notificationDuration,
      timestamp
    };

    // Add notification to queue
    setNotifications(prev => {
      const newNotifications = [...prev, notification];
      // Keep only the most recent notifications up to maxNotifications
      return newNotifications.slice(-maxNotifications);
    });

    // Auto-dismiss if configured
    if (shouldAutoClose && notificationDuration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, notificationDuration);
    }
  }, [maxNotifications]);

  // Hide specific notification
  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    showNotification,
    hideNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * useNotification - Hook to access notification context
 * 
 * Usage:
 * ```tsx
 * const { showNotification, hideNotification } = useNotification();
 * 
 * // Show success notification (auto-dismiss after 3s)
 * showNotification('success', 'Article saved successfully');
 * 
 * // Show error notification (manual dismiss)
 * showNotification('error', 'Failed to save article');
 * 
 * // Show warning with custom duration (auto-dismiss after 5s)
 * showNotification('warning', 'Unsaved changes', true, 5000);
 * ```
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Helper function to get default auto-close behavior
function getDefaultAutoClose(type: Notification['type']): boolean {
  switch (type) {
    case 'success':
      return true; // Auto-dismiss after 3s
    case 'error':
      return false; // Manual dismiss
    case 'warning':
      return true; // Auto-dismiss after 5s
    case 'info':
      return true; // Auto-dismiss after 3s
    default:
      return true;
  }
}

// Helper function to get default duration based on notification type
function getDefaultDuration(type: Notification['type']): number {
  switch (type) {
    case 'success':
      return 3000; // 3 seconds
    case 'error':
      return 0; // Manual dismiss (no auto-close)
    case 'warning':
      return 5000; // 5 seconds
    case 'info':
      return 3000; // 3 seconds
    default:
      return 3000;
  }
}
