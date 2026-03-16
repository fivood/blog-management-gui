# Layout Architecture

## Component Tree

```
App (Root Component)
│
├─ AppProvider (Global State)
│  │
│  └─ NotificationProvider (Notification Queue)
│     │
│     └─ AppContent (View Router)
│        │
│        └─ AppShell (Layout Container)
│           │
│           ├─ Sidebar (Navigation)
│           │  │
│           │  ├─ Title: "博客管理系统"
│           │  │
│           │  └─ Menu
│           │     ├─ 文章管理 (articles)
│           │     ├─ 图片库 (images)
│           │     ├─ 样式编辑 (styles)
│           │     ├─ 构建与部署 (build)
│           │     └─ 设置 (settings)
│           │
│           └─ Layout
│              │
│              ├─ Header
│              │  ├─ View Name (dynamic)
│              │  └─ Loading Indicator (conditional)
│              │
│              └─ Content
│                 └─ Current View Component
│                    ├─ ArticleList / ArticleEditor (articles)
│                    ├─ ImagesView (images)
│                    ├─ StylesView (styles)
│                    ├─ BuildView (build)
│                    └─ SiteSettings (settings)
```

## Data Flow

### Navigation Flow
```
User Click on Sidebar Item
    ↓
Sidebar.handleMenuClick()
    ↓
AppContext.setView(viewType)
    ↓
AppContext.dispatch({ type: 'SET_VIEW', payload: viewType })
    ↓
AppState.currentView updated
    ↓
Header re-renders with new view name
    ↓
AppContent.renderView() switches view
    ↓
New view component rendered in Content area
```

### Notification Flow
```
Component calls showNotification()
    ↓
NotificationContext.showNotification()
    ↓
Notification added to queue
    ↓
AppShell detects new notification (useEffect)
    ↓
Ant Design message.{type}() called
    ↓
Toast notification displayed
    ↓
Auto-dismiss timer starts (if applicable)
    ↓
hideNotification() called after duration
    ↓
Notification removed from queue
```

### Loading State Flow
```
Component starts async operation
    ↓
AppContext.setLoading(true)
    ↓
AppState.isLoading = true
    ↓
Header shows loading spinner
    ↓
Async operation completes
    ↓
AppContext.setLoading(false)
    ↓
AppState.isLoading = false
    ↓
Header hides loading spinner
```

## State Management

### AppContext State
```typescript
interface AppState {
  currentView: ViewType;        // Current active view
  notification: Notification | null;  // Legacy (use NotificationContext)
  config: AppConfig | null;     // Application configuration
  isLoading: boolean;           // Global loading state
}
```

### NotificationContext State
```typescript
interface NotificationState {
  notifications: Notification[];  // Queue of notifications
}
```

## View Types

```typescript
type ViewType = 
  | 'articles'   // Article management (list + editor)
  | 'images'     // Image gallery and upload
  | 'styles'     // Style editor with preview
  | 'build'      // Build and deploy controls
  | 'settings';  // Application settings
```

## Layout Dimensions

```
┌─────────────────────────────────────────────────────────┐
│                    Window (100vh)                        │
│  ┌────────┬──────────────────────────────────────────┐  │
│  │        │              Header (64px)                │  │
│  │        ├──────────────────────────────────────────┤  │
│  │ Sidebar│                                           │  │
│  │ (200px)│                                           │  │
│  │        │          Content Area                     │  │
│  │        │      (calc(100vh - 112px))                │  │
│  │        │                                           │  │
│  │        │      Margin: 24px                         │  │
│  │        │      Padding: 24px                        │  │
│  │        │      Background: white                    │  │
│  │        │      Border-radius: 8px                   │  │
│  │        │                                           │  │
│  └────────┴──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Styling Strategy

### Colors
- **Background**: `#fff` (white)
- **Border**: `#f0f0f0` (light gray)
- **Text**: Default Ant Design colors

### Spacing
- **Sidebar width**: 200px
- **Header height**: 64px (Ant Design default)
- **Content margin**: 24px
- **Content padding**: 24px
- **Border radius**: 8px

### Typography
- **App title**: 18px, bold, centered
- **View name**: 18px, font-weight 500
- **Menu items**: Ant Design default

## Responsive Behavior

The layout is designed to be responsive:
- Minimum window size: 800x600 (from requirements)
- Sidebar: Fixed 200px width
- Content: Flexible width (fills remaining space)
- Header: Full width of content area
- Content area: Minimum height calculated to fill viewport

## Accessibility

- Semantic HTML structure with Ant Design Layout components
- Keyboard navigation supported through Ant Design Menu
- ARIA labels provided by Ant Design components
- Loading indicator with descriptive text
- Clear visual hierarchy

## Performance Considerations

- React.memo not needed yet (components are lightweight)
- useCallback used in NotificationContext for stable references
- Debouncing not needed for navigation (instant response desired)
- Lazy loading not implemented yet (will be added for heavy views)

## Future Enhancements

1. **Breadcrumb navigation** for nested views
2. **Keyboard shortcuts** for view switching (Ctrl+1, Ctrl+2, etc.)
3. **View history** with back/forward navigation
4. **Collapsible sidebar** for more content space
5. **Theme switching** (light/dark mode)
6. **Customizable sidebar** (reorder, hide items)
7. **Multiple notification display** (stack or queue)
8. **Notification history** panel
