# 博客管理 GUI

一个基于 Electron + React + TypeScript 的跨平台桌面应用，用于管理 Hugo 博客。

## ✨ 功能特性

- 📝 **文章管理**: 创建、编辑、删除博客文章
- 🖼️ **图片管理**: 上传、管理博客图片
- ✏️ **Markdown 编辑器**: 实时预览、语法高亮
- 🎨 **样式编辑**: 自定义博客主题和样式
- 🚀 **构建与部署**: Hugo 构建和 Cloudflare Pages 部署
- 🔒 **密码保护**: 为文章添加密码保护
- ⚙️ **配置管理**: 持久化配置存储

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Hugo (用于博客构建)
- Git

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd blog-management-gui

# 安装依赖
npm install
```

### 开发模式

```bash
# 启动开发服务器
npm run dev

# 或使用启动脚本（Windows）
start-dev.bat
```

### 生产构建

```bash
# 构建应用
npm run build

# 打包为可执行文件
npm run package:win   # Windows
npm run package:mac   # macOS
npm run package:linux # Linux
```

## 📖 文档

- [测试指南](TESTING_GUIDE.md) - 详细的功能测试步骤
- [应用状态](APPLICATION_STATUS.md) - 当前应用状态和已知问题
- [启动修复总结](STARTUP_FIX_SUMMARY.md) - 已解决的技术问题

## 🏗️ 技术栈

### 前端
- **框架**: React 18
- **UI 库**: Ant Design 5
- **编辑器**: CodeMirror 6
- **Markdown**: marked.js + highlight.js
- **构建工具**: Vite

### 后端（主进程）
- **运行时**: Electron 28
- **语言**: TypeScript
- **配置存储**: electron-store
- **密码加密**: bcrypt

### 测试
- **测试框架**: Vitest
- **属性测试**: fast-check
- **E2E 测试**: Playwright

## 📁 项目结构

```
blog-management-gui/
├── src/
│   ├── main/           # Electron 主进程
│   │   ├── services/   # 业务服务层
│   │   ├── ipc/        # IPC 处理器
│   │   └── index.ts    # 主进程入口
│   ├── preload/        # 预加载脚本
│   ├── renderer/       # React 渲染进程
│   │   ├── components/ # React 组件
│   │   ├── contexts/   # React Context
│   │   ├── hooks/      # 自定义 Hooks
│   │   └── styles/     # 样式文件
│   └── shared/         # 共享类型和常量
├── tests/              # 测试文件
├── dist-electron/      # 构建输出
└── package.json
```

## 🔧 配置

### Hugo 项目路径

首次启动时，应用会使用默认路径 `~/hugo-blog`。你可以在设置中修改为实际的 Hugo 项目路径。

### Cloudflare 部署

要使用 Cloudflare Pages 部署功能，需要在设置中配置：
- API Token
- Account ID
- Project Name

## 🧪 测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 测试覆盖率
npm run test:coverage

# UI 模式
npm run test:ui
```

## 📝 开发指南

### 添加新功能

1. 在 `src/main/services/` 中实现业务逻辑
2. 在 `src/main/ipc/` 中添加 IPC 处理器
3. 在 `src/renderer/components/` 中创建 UI 组件
4. 在 `src/renderer/hooks/` 中添加自定义 Hook
5. 编写测试

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 编写单元测试

## 🐛 故障排除

### 端口被占用

如果 5173 端口被占用，Vite 会自动使用其他端口。你也可以手动关闭占用端口的进程：

```bash
# 查找占用端口的进程
netstat -ano | findstr "5173"

# 关闭进程
taskkill /F /PID <PID>
```

### 应用无法启动

1. 清理依赖并重新安装:
```bash
rm -rf node_modules
npm install
```

2. 清理构建缓存:
```bash
rm -rf dist-electron
npm run build
```

### 查看日志

- **主进程日志**: 在终端中查看
- **渲染进程日志**: 打开开发者工具（Ctrl+Shift+I）

## 📊 性能

- **主进程**: ~107 KB
- **预加载脚本**: ~4 KB
- **渲染进程**: ~5 MB
- **启动时间**: <1 秒

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Ant Design](https://ant.design/)
- [Hugo](https://gohugo.io/)
- [CodeMirror](https://codemirror.net/)

---

**状态**: ✅ 可以开始使用和测试

如有问题，请查看 [测试指南](TESTING_GUIDE.md) 或 [应用状态](APPLICATION_STATUS.md)。
