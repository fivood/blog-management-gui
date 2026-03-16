import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppShell } from './components/layout';
import ArticleList from './components/ArticleList';
import ArticleEditorSimple from './components/ArticleEditorSimple';
import SiteSettings from './components/SiteSettings';
import { ImageGalleryView } from './components/images';
import BuildDeployView from './components/build/BuildDeployView';
import SettingsView from './components/settings/SettingsView';
import StyleEditorView from './components/styles/StyleEditorView';
import { Empty } from 'antd';
import './App.css';

/**
 * App Root Component
 * Requirements: 15.1-15.5
 * 
 * Features:
 * - Set up AppProvider and routing
 * - Render AppShell with current view
 * - Handle global error boundary
 */

// Main app content component
const AppContent: React.FC = () => {
  const { state, setConfig } = useApp();
  const { currentView } = state;
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load initial config on mount
  useEffect(() => {
    console.log('AppContent: Loading initial config');
    const loadConfig = async () => {
      try {
        const response = await window.electronAPI.config.get();
        if (response.success) {
          console.log('AppContent: Initial config loaded', response.data);
          setConfig(response.data);
        } else {
          console.error('AppContent: Failed to load initial config', response.error);
        }
      } catch (err) {
        console.error('AppContent: Error loading initial config', err);
      }
    };
    loadConfig();
  }, [setConfig]);

  // Reset editing state when view changes
  useEffect(() => {
    if (currentView !== 'articles') {
      setEditingArticleId(null);
      setIsEditing(false);
    }
  }, [currentView]);

  // Handle article editing
  const handleEditArticle = (articleId: string) => {
    setEditingArticleId(articleId);
    setIsEditing(true);
  };

  const handleNewArticle = () => {
    setEditingArticleId(null);
    setIsEditing(true);
  };

  const handleSaveComplete = () => {
    setEditingArticleId(null);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditingArticleId(null);
    setIsEditing(false);
  };

  // Render current view based on state
  const renderView = () => {
    console.log('AppContent: Rendering view', currentView);
    switch (currentView) {
      case 'articles':
        // Show editor if in editing mode, otherwise show list
        if (isEditing) {
          return (
            <ArticleEditorSimple
              articleId={editingArticleId}
              onSave={handleSaveComplete}
              onCancel={handleCancelEdit}
            />
          );
        }
        return (
          <ArticleList
            onEdit={handleEditArticle}
            onNew={handleNewArticle}
          />
        );
      
      case 'images':
        return <ImageGalleryView />;
      
      case 'styles':
        return <StyleEditorView />;
      
      case 'build':
        return <BuildDeployView />;
      
      case 'settings':
        return <SettingsView />;
      
      default:
        return <Empty description="未知视图" />;
    }
  };

  return (
    <AppShell>
      {renderView()}
    </AppShell>
  );
};

// Root App component with providers
const App: React.FC = () => {
  return (
    <AppProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AppProvider>
  );
};

export default App;
