import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { AppConfig } from '../../shared/types';

/**
 * AppContext - Global application state management
 * Requirements: 15.1-15.5, 16.1-16.5
 * 
 * Manages:
 * - Current view navigation
 * - Notification display
 * - Application configuration
 */

// View types
export type ViewType = 'articles' | 'images' | 'styles' | 'build' | 'settings';

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoClose: boolean;
  duration?: number; // milliseconds
}

// Application state
export interface AppState {
  currentView: ViewType;
  notification: Notification | null;
  config: AppConfig | null;
  isLoading: boolean;
}

// Action types
export type AppAction =
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SHOW_NOTIFICATION'; payload: Notification }
  | { type: 'HIDE_NOTIFICATION' }
  | { type: 'SET_CONFIG'; payload: AppConfig }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AppState = {
  currentView: 'articles',
  notification: null,
  config: null,
  isLoading: false
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'SHOW_NOTIFICATION':
      return { ...state, notification: action.payload };
    
    case 'HIDE_NOTIFICATION':
      return { ...state, notification: null };
    
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  setView: (view: ViewType) => void;
  showNotification: (
    type: Notification['type'],
    message: string,
    autoClose?: boolean,
    duration?: number
  ) => void;
  hideNotification: () => void;
  setConfig: (config: AppConfig) => void;
  setLoading: (loading: boolean) => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider props
interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider - Provides global application state
 * 
 * Usage:
 * ```tsx
 * <AppProvider>
 *   <App />
 * </AppProvider>
 * ```
 */
export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper function to set view
  const setView = React.useCallback((view: ViewType) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  // Helper function to show notification
  const showNotification = React.useCallback((
    type: Notification['type'],
    message: string,
    autoClose: boolean = true,
    duration?: number
  ) => {
    const notification: Notification = {
      id: `notification-${Date.now()}`,
      type,
      message,
      autoClose,
      duration: duration || getDefaultDuration(type)
    };
    dispatch({ type: 'SHOW_NOTIFICATION', payload: notification });

    // Auto-dismiss if configured
    if (autoClose && notification.duration) {
      setTimeout(() => {
        dispatch({ type: 'HIDE_NOTIFICATION' });
      }, notification.duration);
    }
  }, []);

  // Helper function to hide notification
  const hideNotification = React.useCallback(() => {
    dispatch({ type: 'HIDE_NOTIFICATION' });
  }, []);

  // Helper function to set config
  const setConfig = React.useCallback((config: AppConfig) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
  }, []);

  // Helper function to set loading
  const setLoading = React.useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    setView,
    showNotification,
    hideNotification,
    setConfig,
    setLoading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * useApp - Hook to access app context
 * 
 * Usage:
 * ```tsx
 * const { state, setView, showNotification } = useApp();
 * ```
 */
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Helper function to get default duration based on notification type
function getDefaultDuration(type: Notification['type']): number {
  switch (type) {
    case 'success':
      return 3000; // 3 seconds
    case 'error':
      return 0; // Manual dismiss
    case 'warning':
      return 5000; // 5 seconds
    case 'info':
      return 3000; // 3 seconds
    default:
      return 3000;
  }
}
