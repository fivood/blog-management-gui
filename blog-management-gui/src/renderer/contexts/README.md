# Renderer Contexts

This directory contains React Context providers for global state management.

## AppContext

Global application state management including:
- Current view navigation
- Notification display
- Application configuration
- Loading states

### Usage

```tsx
import { AppProvider, useApp } from './contexts';

// Wrap your app with the provider
function App() {
  return (
    <AppProvider>
      <YourApp />
    </AppProvider>
  );
}

// Use the hook in components
function MyComponent() {
  const { state, setView, showNotification } = useApp();
  
  const handleNavigate = () => {
    setView('articles');
  };
  
  const handleSuccess = () => {
    showNotification('success', 'Operation completed successfully');
  };
  
  return (
    <div>
      <p>Current view: {state.currentView}</p>
      <button onClick={handleNavigate}>Go to Articles</button>
      <button onClick={handleSuccess}>Show Success</button>
    </div>
  );
}
```

## NotificationContext

Manages notification queue with auto-dismiss functionality.

### Features

- Queue management for multiple notifications
- Auto-dismiss for success (3s), warning (5s), info (3s)
- Manual dismiss for errors
- Configurable durations
- Maximum notification limit

### Usage

```tsx
import { NotificationProvider, useNotification } from './contexts';

// Wrap your app with the provider
function App() {
  return (
    <NotificationProvider maxNotifications={3}>
      <YourApp />
    </NotificationProvider>
  );
}

// Use the hook in components
function MyComponent() {
  const { notifications, showNotification, hideNotification } = useNotification();
  
  const handleSuccess = () => {
    // Auto-dismiss after 3 seconds
    showNotification('success', 'Article saved successfully');
  };
  
  const handleError = () => {
    // Manual dismiss (no auto-close)
    showNotification('error', 'Failed to save article');
  };
  
  const handleWarning = () => {
    // Custom duration (5 seconds)
    showNotification('warning', 'Unsaved changes', true, 5000);
  };
  
  return (
    <div>
      {notifications.map(notification => (
        <div key={notification.id}>
          {notification.message}
          {!notification.autoClose && (
            <button onClick={() => hideNotification(notification.id)}>
              Close
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Notification Types and Durations

| Type    | Auto-Close | Duration | Use Case                    |
|---------|------------|----------|-----------------------------|
| success | Yes        | 3s       | Successful operations       |
| error   | No         | Manual   | Errors requiring attention  |
| warning | Yes        | 5s       | Warnings and cautions       |
| info    | Yes        | 3s       | Informational messages      |

## Best Practices

1. **Use AppContext for global state**: Navigation, config, and app-wide loading states
2. **Use NotificationContext for user feedback**: Success/error messages, warnings
3. **Keep contexts focused**: Each context should manage a specific domain
4. **Avoid prop drilling**: Use contexts to pass data deep into the component tree
5. **Memoize context values**: Use useMemo/useCallback to prevent unnecessary re-renders
