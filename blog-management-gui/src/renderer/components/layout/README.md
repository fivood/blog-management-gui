# Layout Components

This directory contains the core layout components for the blog management GUI application.

## Components

### AppShell
**File**: `AppShell.tsx`  
**Requirements**: 15.1-15.5

The main application shell that provides the overall layout structure.

**Features**:
- Creates layout with Sidebar and main content area
- Displays Header with app title and current view name
- Renders notification toasts using Ant Design message component
- Integrates with NotificationContext for notification management

**Usage**:
```tsx
<AppShell>
  <YourContent />
</AppShell>
```

### Header
**File**: `Header.tsx`  
**Requirements**: 15.5

The application header component displayed at the top of the main content area.

**Features**:
- Displays current view name in Chinese
- Shows loading indicator when operations are in progress
- Integrates with AppContext to access current view and loading state

**View Names**:
- `articles` → 文章管理
- `images` → 图片库
- `styles` → 样式编辑
- `build` → 构建与部署
- `settings` → 设置

### Sidebar
**File**: `Sidebar.tsx`  
**Requirements**: 15.1-15.5

The navigation sidebar component displayed on the left side of the application.

**Features**:
- Displays navigation menu with 5 main items
- Highlights active navigation item based on current view
- Handles navigation clicks to change view using AppContext
- Uses Ant Design icons for visual clarity

**Navigation Items**:
1. **文章管理** (Articles) - FileTextOutlined icon
2. **图片库** (Images) - PictureOutlined icon
3. **样式编辑** (Styles) - BgColorsOutlined icon
4. **构建与部署** (Build & Deploy) - RocketOutlined icon
5. **设置** (Settings) - SettingOutlined icon

## Architecture

The layout components follow a hierarchical structure:

```
App (Root)
└── AppProvider (Context)
    └── NotificationProvider (Context)
        └── AppContent
            └── AppShell
                ├── Sidebar (Navigation)
                ├── Layout
                │   ├── Header (Title & Loading)
                │   └── Content (View-specific content)
                └── Message (Notifications)
```

## Context Integration

### AppContext
The layout components integrate with `AppContext` to:
- Access current view state (`currentView`)
- Change views via `setView()`
- Access loading state (`isLoading`)

### NotificationContext
The AppShell component integrates with `NotificationContext` to:
- Display notifications as toast messages
- Auto-dismiss success, warning, and info notifications
- Require manual dismissal for error notifications
- Support custom durations

## Styling

All components use Ant Design's Layout system with custom styling:
- **Sidebar**: 200px width, light theme, bordered
- **Header**: White background, 24px padding, bordered bottom
- **Content**: 24px margin and padding, white background, rounded corners
- **Minimum height**: Calculated to fill viewport (100vh - header height)

## Navigation Flow

1. User clicks navigation item in Sidebar
2. Sidebar calls `setView(viewType)` from AppContext
3. AppContext updates `currentView` state
4. Header updates to show new view name
5. App component renders appropriate view content based on `currentView`

## Notification Flow

1. Component calls `showNotification()` from NotificationContext
2. Notification is added to queue
3. AppShell detects new notification via useEffect
4. Ant Design message component displays notification
5. Auto-dismiss timer starts (if applicable)
6. Notification is removed from queue after display

## Implementation Notes

- All text is in Chinese (Simplified) as per requirements
- Components use TypeScript for type safety
- Ant Design components are used for consistent UI
- Layout is responsive and adapts to window size
- Loading indicator appears in header during async operations
- Notifications support 4 types: success, error, warning, info
