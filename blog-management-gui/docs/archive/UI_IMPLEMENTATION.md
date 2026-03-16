# UI 实现说明

## 已实现的功能

### 1. 文章列表页面 ✓
**文件**: `src/renderer/components/ArticleList.tsx`

**功能**:
- 显示所有文章（标题、分类、标签、创建时间、修改时间）
- 密码保护标识（锁图标）
- 草稿/已发布状态标识
- 搜索功能（按标题或标签）
- 分类筛选（多选）
- 标签筛选（多选）
- 编辑按钮
- 删除按钮（带确认）
- 新建文章按钮

### 2. 文章编辑器 ✓
**文件**: `src/renderer/components/ArticleEditor.tsx`

**功能**:
- 标题输入
- 分类选择（支持多选和自定义输入）
  - 预设选项：长篇、短篇、随笔
  - 可以输入自定义分类
- 标签选择（支持多选和自定义输入）
- Markdown 内容编辑（大文本框）
- 密码保护开关
- 密码输入（启用密码保护时显示）
- 保存按钮
- 取消按钮
- 未保存提示（显示"有未保存的更改"）
- 离开确认（有未保存更改时弹出确认对话框）

### 3. 站点设置页面 ✓
**文件**: `src/renderer/components/SiteSettings.tsx`

**功能**:
- 站点名称输入
- 站点描述输入
- 作者名称输入
- 保存按钮

### 4. 主应用框架 ✓
**文件**: `src/renderer/App.tsx`

**功能**:
- 侧边栏导航
  - 文章列表
  - 新建文章
  - 站点设置
- 顶部标题栏
- 内容区域
- 路由切换

## 使用方法

### 启动应用

```bash
cd blog-management-gui
npm run dev
```

### 新建文章

1. 点击侧边栏"新建文章"或文章列表中的"新建文章"按钮
2. 填写标题（必填）
3. 选择或输入分类（如：长篇、短篇、随笔）
4. 选择或输入标签
5. 输入 Markdown 内容（必填）
6. 如需密码保护，打开开关并输入密码
7. 点击"保存"按钮

### 编辑文章

1. 在文章列表中点击"编辑"按钮
2. 修改内容
3. 点击"保存"按钮
4. 如有未保存更改，点击"取消"会弹出确认对话框

### 删除文章

1. 在文章列表中点击"删除"按钮
2. 确认删除

### 筛选文章

1. 使用搜索框搜索标题或标签
2. 使用分类下拉框筛选（可多选）
3. 使用标签下拉框筛选（可多选）

### 编辑站点信息

1. 点击侧边栏"站点设置"
2. 修改站点名称、描述、作者
3. 点击"保存设置"按钮

## 技术实现

### 使用的组件库
- **Ant Design** - UI 组件库
- **React** - 前端框架
- **TypeScript** - 类型安全

### 状态管理
- 使用 React Hooks (useState, useEffect)
- 表单管理使用 Ant Design Form

### IPC 通信
通过 `window.electronAPI` 与主进程通信：

```typescript
// 文章操作
window.electronAPI.article.list(filters)
window.electronAPI.article.get(articleId)
window.electronAPI.article.create(data)
window.electronAPI.article.update(articleId, updates)
window.electronAPI.article.delete(articleId)

// Hugo 配置
window.electronAPI.hugo.getConfig()
window.electronAPI.hugo.updateConfig(updates)
```

### 数据流

```
用户操作 → React 组件 → IPC 调用 → 主进程服务 → 文件系统/数据库
                                                    ↓
用户界面 ← React 组件 ← IPC 响应 ← 主进程服务 ← 数据返回
```

## 功能特点

### 1. 分类系统
- 使用 `categories` 字段
- 支持自定义分类
- 预设：长篇、短篇、随笔
- 可以添加多个分类

### 2. 标签系统
- 使用 `tags` 字段
- 支持自定义标签
- 可以添加多个标签
- 用于内容标记和搜索

### 3. 密码保护
- 使用 bcrypt 加密
- 密码存储在文章元数据中
- 可以随时启用/禁用
- 可以修改密码

### 4. 保存提示
- 检测表单更改
- 显示"有未保存的更改"提示
- 离开时弹出确认对话框
- 防止意外丢失数据

### 5. 数据安全
- 每篇文章有唯一 ID
- 新文章不会覆盖旧文章
- 删除操作需要确认
- 所有操作都有错误处理

## 待优化功能

以下功能可以在后续版本中添加：

1. **Markdown 编辑器增强**
   - 实时预览
   - 语法高亮
   - 工具栏（加粗、斜体、插入图片等）
   - 代码块支持

2. **图片管理**
   - 图片上传
   - 图片库
   - 插入图片到文章

3. **发文时间自定义**
   - 添加日期选择器
   - 支持修改发布时间

4. **文章排序**
   - 按创建时间排序
   - 按修改时间排序
   - 按标题排序

5. **批量操作**
   - 批量删除
   - 批量修改分类/标签

6. **导入导出**
   - 导出为 Markdown
   - 从 Markdown 导入

7. **预览功能**
   - 文章预览
   - Hugo 站点预览

8. **部署功能**
   - 一键部署到 Cloudflare Pages
   - 部署状态显示

## 注意事项

1. **Hugo 项目路径**: 需要在配置中设置正确的 Hugo 项目路径
2. **文章 ID**: 由系统自动生成，不要手动修改
3. **密码安全**: 密码使用 bcrypt 加密，无法恢复，请妥善保管
4. **分类命名**: 建议使用简短、有意义的名称
5. **标签使用**: 标签用于内容标记，分类用于文章类型

## 开发说明

### 添加新功能

1. 在 `src/renderer/components/` 创建新组件
2. 在 `App.tsx` 中添加路由
3. 使用 `window.electronAPI` 调用后端功能
4. 使用 Ant Design 组件保持 UI 一致性

### 调试

1. 打开开发者工具：`Ctrl+Shift+I` (Windows/Linux) 或 `Cmd+Option+I` (macOS)
2. 查看 Console 中的错误信息
3. 使用 React DevTools 检查组件状态

### 构建

```bash
npm run build
```

生成的应用程序将在 `dist/` 目录中。
