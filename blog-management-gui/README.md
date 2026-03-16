# Blog Management GUI

一个基于 Electron + React + TypeScript 的 Hugo 博客管理桌面应用程序。

## 功能特性

### ✅ 已实现功能

#### 文章管理
- 📝 创建、编辑、删除文章
- 🏷️ 标签系统（可自定义）
- 📂 分类系统（长篇/短篇/随笔等，可自定义）
- 🔒 密码保护（bcrypt 加密）
- 🔍 搜索和筛选（按标题、标签、分类）
- 💾 自动保存提示和离开确认
- 📋 文章列表展示

#### 站点设置
- 🌐 编辑站点名称
- 📄 编辑站点描述
- ✍️ 编辑作者信息

#### Hugo 集成
- 🔧 自动生成 Hugo frontmatter 文件
- 📁 文章保存到 `content/posts/` 目录
- ⚙️ Hugo 配置管理

#### 数据安全
- 🆔 每篇文章唯一 ID，不会覆盖
- 🔐 密码加密存储
- ✅ 所有操作都有错误处理

## 技术栈

### 后端（Main Process）
- **Electron** - 桌面应用框架
- **TypeScript** - 类型安全
- **Node.js** - 运行环境
- **electron-store** - 配置持久化
- **bcrypt** - 密码加密

### 前端（Renderer Process）
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Ant Design** - UI 组件库
- **Vite** - 构建工具

### 测试
- **Vitest** - 单元测试
- **169 个测试用例** - 全部通过 ✓

## 项目结构

```
blog-management-gui/
├── src/
│   ├── main/                    # 主进程
│   │   ├── index.ts            # 入口文件
│   │   ├── services/           # 业务逻辑服务（7个）
│   │   ├── integrations/       # 外部集成（Cloudflare）
│   │   └── ipc/                # IPC 处理器（6个）
│   ├── preload/                # 预加载脚本
│   │   └── index.ts            # IPC API 桥接
│   ├── renderer/               # 渲染进程
│   │   ├── App.tsx             # 主应用
│   │   ├── components/         # React 组件
│   │   │   ├── ArticleList.tsx
│   │   │   ├── ArticleEditor.tsx
│   │   │   └── SiteSettings.tsx
│   │   └── index.tsx           # 入口文件
│   └── shared/                 # 共享类型和常量
│       ├── types/              # TypeScript 类型定义
│       └── constants/          # IPC 通道常量
├── tests/                      # 测试文件
│   └── unit/                   # 单元测试（169个）
└── package.json
```

## 快速开始

### 安装依赖

```bash
cd blog-management-gui
npm install
```

### 开发模式

```bash
npm run dev
```

这会启动：
- Vite 开发服务器（端口 5173）
- Electron 应用（自动打开）

### 构建应用

```bash
npm run build
```

生成的应用程序在 `dist/` 目录。

### 运行测试

```bash
npm test
```

## 使用指南

### 1. 首次使用

启动应用后，需要配置 Hugo 项目路径：
- 默认路径：`~/hugo-blog`
- 可在配置中修改

### 2. 创建文章

1. 点击侧边栏"新建文章"
2. 填写标题（必填）
3. 选择分类：
   - 长篇
   - 短篇
   - 随笔
   - 或输入自定义分类
4. 添加标签（可选）
5. 输入 Markdown 内容（必填）
6. 如需密码保护：
   - 打开"密码保护"开关
   - 输入密码
7. 点击"保存"

### 3. 编辑文章

1. 在文章列表中点击"编辑"
2. 修改内容
3. 点击"保存"
4. 如有未保存更改，离开时会提示确认

### 4. 管理文章

**搜索**：在搜索框输入关键词，搜索标题或标签

**筛选**：
- 按分类筛选（可多选）
- 按标签筛选（可多选）

**删除**：点击"删除"按钮，确认后删除

### 5. 站点设置

1. 点击侧边栏"站点设置"
2. 修改站点名称、描述、作者
3. 点击"保存设置"

## 功能说明

### 分类系统

使用 `categories` 字段，用于文章类型分类：
- **长篇**：长篇文章
- **短篇**：短篇文章
- **随笔**：随笔类文章
- 可以自定义其他分类

分类可以用作 Hugo 导航菜单。

### 标签系统

使用 `tags` 字段，用于内容标记：
- 技术
- 生活
- 旅行
- 等等...

标签用于搜索和筛选文章。

### 密码保护

- 使用 bcrypt 加密存储
- 密码无法恢复，请妥善保管
- 可以随时启用/禁用
- 可以修改密码

### 数据安全

- 每篇文章有唯一 ID（UUID）
- 新文章不会覆盖旧文章
- 文章保存到 `content/posts/{id}.md`
- 所有操作都有错误处理和提示

## API 文档

### IPC 通信

应用使用 IPC 在主进程和渲染进程之间通信：

```typescript
// 文章操作
window.electronAPI.article.list(filters)
window.electronAPI.article.get(articleId)
window.electronAPI.article.create(data)
window.electronAPI.article.update(articleId, updates)
window.electronAPI.article.delete(articleId)
window.electronAPI.article.publish(articleId)

// Hugo 配置
window.electronAPI.hugo.getConfig()
window.electronAPI.hugo.updateConfig(updates)
window.electronAPI.hugo.build(options)
window.electronAPI.hugo.previewStart(port)
window.electronAPI.hugo.previewStop()

// 站点配置
window.electronAPI.config.get()
window.electronAPI.config.update(updates)
```

### 服务层

后端服务层提供业务逻辑：

1. **ConfigService** - 应用配置管理
2. **ArticleService** - 文章 CRUD 操作
3. **ImageService** - 图片管理
4. **HugoService** - Hugo 构建和预览
5. **DeployService** - Cloudflare Pages 部署
6. **StyleService** - 样式配置管理
7. **CloudflareClient** - Cloudflare API 集成

## 测试

项目包含 169 个单元测试，覆盖所有核心功能：

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- tests/unit/services/ArticleService.test.ts

# 查看测试覆盖率
npm test -- --coverage
```

## 开发说明

### 添加新功能

1. **后端服务**：在 `src/main/services/` 添加服务类
2. **IPC 处理器**：在 `src/main/ipc/` 添加处理器
3. **前端组件**：在 `src/renderer/components/` 添加组件
4. **类型定义**：在 `src/shared/types/` 添加类型

### 调试

**主进程**：
```bash
# 查看主进程日志
console.log() 输出到终端
```

**渲染进程**：
```bash
# 打开开发者工具
Ctrl+Shift+I (Windows/Linux)
Cmd+Option+I (macOS)
```

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 所有函数都有 JSDoc 注释
- 所有服务都有单元测试

## 已知问题

1. **Markdown 编辑器**：当前使用简单文本框，后续可以升级为富文本编辑器
2. **图片管理**：UI 尚未实现，但后端已支持
3. **发文时间**：UI 尚未添加日期选择器
4. **预览功能**：Hugo 预览服务器已实现，但 UI 未集成

## 后续计划

### 短期计划
- [ ] Markdown 编辑器增强（实时预览、工具栏）
- [ ] 图片管理 UI
- [ ] 发文时间自定义
- [ ] 文章排序功能

### 长期计划
- [ ] Hugo 站点预览集成
- [ ] Cloudflare Pages 部署 UI
- [ ] 样式编辑器
- [ ] 批量操作
- [ ] 导入导出功能

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue。

---

**版本**: 1.0.0  
**最后更新**: 2024-01-01
