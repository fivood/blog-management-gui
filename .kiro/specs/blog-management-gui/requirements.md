# Requirements Document

## Introduction

本文档定义了博客管理 GUI 工具的需求。该工具是一个跨平台桌面应用程序，为现有的 TypeScript 博客管理后端和 Hugo 博客系统提供图形化用户界面。用户可以通过直观的界面创建、编辑、删除文章，管理图片资源，构建静态网站，并部署到 Cloudflare Pages。

## Glossary

- **GUI_Application**: 基于 Electron 的跨平台桌面应用程序
- **Article_Manager**: 负责文章增删改查操作的后端模块
- **Hugo_Builder**: 负责调用 Hugo 命令构建静态网站的模块
- **Image_Manager**: 负责图片上传、存储和管理的模块
- **Markdown_Editor**: 支持实时预览的 Markdown 编辑器组件
- **Deploy_Manager**: 负责部署到 Cloudflare Pages 的模块
- **Article_List_View**: 显示所有文章列表的界面组件
- **Article_Editor_View**: 文章编辑界面组件
- **Build_Console**: 显示 Hugo 构建日志的控制台组件
- **Image_Gallery**: 图片库界面组件
- **Frontend_Framework**: React 或 Vue 前端框架
- **Backend_API**: 现有的 TypeScript 博客管理后端 API
- **Hugo_Project**: 使用 PaperMod 主题的 Hugo 博客项目
- **Public_Folder**: Hugo 构建生成的静态网站文件夹
- **Cloudflare_Pages**: Cloudflare 的静态网站托管服务
- **Style_Editor**: 博客样式编辑器组件
- **Theme_Config_Editor**: Hugo 主题配置编辑器
- **CSS_Editor**: 自定义 CSS 编辑器组件
- **Color_Picker**: 可视化颜色选择器组件
- **Style_Preview**: 样式实时预览组件
- **Hugo_Config_File**: Hugo 配置文件（hugo.toml）
- **Custom_CSS_File**: 自定义 CSS 样式文件
- **PaperMod_Theme**: Hugo PaperMod 主题

## Requirements

### Requirement 1: 文章列表显示

**User Story:** 作为博客作者，我想查看所有文章的列表，以便快速浏览和管理我的博客内容。

#### Acceptance Criteria

1. WHEN THE GUI_Application 启动时，THE Article_List_View SHALL 显示所有现有文章
2. THE Article_List_View SHALL 显示每篇文章的标题、创建日期、修改日期、标签和分类
3. THE Article_List_View SHALL 支持按标题、日期、标签或分类进行排序
4. THE Article_List_View SHALL 支持按标题或标签进行搜索过滤
5. WHEN 文章有密码保护时，THE Article_List_View SHALL 显示密码保护标识图标

### Requirement 2: 创建新文章

**User Story:** 作为博客作者，我想创建新文章，以便发布新的博客内容。

#### Acceptance Criteria

1. WHEN 用户点击"新建文章"按钮时，THE GUI_Application SHALL 打开 Article_Editor_View
2. THE Article_Editor_View SHALL 提供标题输入字段
3. THE Article_Editor_View SHALL 提供 Markdown_Editor 用于编辑文章内容
4. THE Article_Editor_View SHALL 提供标签输入字段（支持多个标签）
5. THE Article_Editor_View SHALL 提供分类选择下拉菜单
6. THE Article_Editor_View SHALL 提供密码保护选项（可选密码输入）
7. WHEN 用户点击"保存"按钮时，THE Article_Manager SHALL 创建新文章并保存到 Hugo_Project
8. WHEN 文章保存成功时，THE GUI_Application SHALL 显示成功提示并返回 Article_List_View
9. IF 保存失败，THEN THE GUI_Application SHALL 显示错误信息并保持在编辑界面

### Requirement 3: 编辑现有文章

**User Story:** 作为博客作者，我想编辑现有文章，以便更新或修正博客内容。

#### Acceptance Criteria

1. WHEN 用户在 Article_List_View 中选择一篇文章时，THE GUI_Application SHALL 打开 Article_Editor_View 并加载文章内容
2. THE Article_Editor_View SHALL 预填充文章的标题、内容、标签、分类和密码保护设置
3. WHEN 用户修改文章并点击"保存"按钮时，THE Article_Manager SHALL 更新文章内容
4. WHEN 文章更新成功时，THE GUI_Application SHALL 显示成功提示并刷新 Article_List_View
5. IF 更新失败，THEN THE GUI_Application SHALL 显示错误信息并保持编辑状态

### Requirement 4: 删除文章

**User Story:** 作为博客作者，我想删除不需要的文章，以便清理博客内容。

#### Acceptance Criteria

1. WHEN 用户在 Article_List_View 中选择删除操作时，THE GUI_Application SHALL 显示确认对话框
2. WHEN 用户确认删除时，THE Article_Manager SHALL 删除选定的文章
3. WHEN 文章删除成功时，THE GUI_Application SHALL 从 Article_List_View 中移除该文章并显示成功提示
4. IF 删除失败，THEN THE GUI_Application SHALL 显示错误信息并保持文章在列表中

### Requirement 5: Markdown 实时预览

**User Story:** 作为博客作者，我想在编辑时实时预览 Markdown 渲染效果，以便确保文章格式正确。

#### Acceptance Criteria

1. THE Markdown_Editor SHALL 提供分屏视图，左侧为编辑区，右侧为预览区
2. WHEN 用户在编辑区输入或修改内容时，THE Markdown_Editor SHALL 在预览区实时渲染 Markdown
3. THE Markdown_Editor SHALL 支持标准 Markdown 语法
4. THE Markdown_Editor SHALL 支持代码高亮显示
5. THE Markdown_Editor SHALL 支持表格、列表和引用块的渲染

### Requirement 6: 图片上传

**User Story:** 作为博客作者，我想上传图片到博客，以便在文章中使用图片。

#### Acceptance Criteria

1. THE GUI_Application SHALL 提供图片上传功能入口
2. WHEN 用户选择图片文件时，THE Image_Manager SHALL 验证文件格式（支持 PNG、JPG、JPEG、GIF、WebP）
3. WHEN 图片格式有效时，THE Image_Manager SHALL 将图片复制到 Hugo_Project 的 static 目录
4. WHEN 图片上传成功时，THE GUI_Application SHALL 显示成功提示并在 Image_Gallery 中显示该图片
5. IF 图片格式无效或上传失败，THEN THE GUI_Application SHALL 显示错误信息
6. THE Image_Manager SHALL 为每个上传的图片生成唯一的文件名以避免冲突

### Requirement 7: 图片库管理

**User Story:** 作为博客作者，我想查看和管理已上传的图片，以便复用图片资源。

#### Acceptance Criteria

1. THE GUI_Application SHALL 提供 Image_Gallery 界面
2. THE Image_Gallery SHALL 以缩略图形式显示所有已上传的图片
3. WHEN 用户点击图片时，THE Image_Gallery SHALL 显示图片的完整预览
4. THE Image_Gallery SHALL 显示每张图片的文件名、大小和上传日期
5. THE Image_Gallery SHALL 提供复制图片 Markdown 链接的功能
6. THE Image_Gallery SHALL 提供删除图片的功能（需确认）

### Requirement 8: 插入图片到文章

**User Story:** 作为博客作者，我想在编辑文章时插入图片，以便丰富文章内容。

#### Acceptance Criteria

1. WHEN 用户在 Article_Editor_View 中点击"插入图片"按钮时，THE GUI_Application SHALL 打开 Image_Gallery
2. WHEN 用户在 Image_Gallery 中选择一张图片时，THE Markdown_Editor SHALL 在光标位置插入图片的 Markdown 链接
3. THE Markdown_Editor SHALL 插入的图片链接格式为 `![alt text](/images/filename.ext)`
4. WHEN 图片插入后，THE Markdown_Editor SHALL 在预览区显示该图片

### Requirement 9: Hugo 网站构建

**User Story:** 作为博客作者，我想一键构建静态网站，以便生成可部署的网站文件。

#### Acceptance Criteria

1. THE GUI_Application SHALL 提供"构建网站"按钮
2. WHEN 用户点击"构建网站"按钮时，THE Hugo_Builder SHALL 执行 `hugo --minify` 命令
3. WHILE Hugo_Builder 正在构建时，THE GUI_Application SHALL 显示构建进度指示器
4. THE Build_Console SHALL 实时显示 Hugo 构建过程的输出日志
5. WHEN 构建成功时，THE GUI_Application SHALL 显示成功提示并显示构建统计信息（页面数、耗时等）
6. IF 构建失败，THEN THE GUI_Application SHALL 在 Build_Console 中显示错误信息并高亮错误行

### Requirement 10: 构建结果预览

**User Story:** 作为博客作者，我想预览构建后的网站，以便在部署前检查效果。

#### Acceptance Criteria

1. WHEN 构建成功后，THE GUI_Application SHALL 提供"预览网站"按钮
2. WHEN 用户点击"预览网站"按钮时，THE Hugo_Builder SHALL 启动本地预览服务器
3. THE GUI_Application SHALL 在内置浏览器或系统默认浏览器中打开预览地址
4. THE GUI_Application SHALL 显示预览服务器的运行状态和访问地址
5. THE GUI_Application SHALL 提供停止预览服务器的功能

### Requirement 11: 生成部署文件

**User Story:** 作为博客作者，我想生成可部署的网站文件，以便手动上传到托管服务。

#### Acceptance Criteria

1. WHEN Hugo 构建成功后，THE Hugo_Builder SHALL 在 Hugo_Project 目录下生成 Public_Folder
2. THE Public_Folder SHALL 包含所有静态网站文件（HTML、CSS、JS、图片等）
3. THE GUI_Application SHALL 显示 Public_Folder 的路径
4. THE GUI_Application SHALL 提供"打开文件夹"按钮以在文件管理器中打开 Public_Folder

### Requirement 12: Cloudflare Pages 部署

**User Story:** 作为博客作者，我想直接部署到 Cloudflare Pages，以便快速发布网站更新。

#### Acceptance Criteria

1. WHERE Cloudflare Pages 集成已配置，THE GUI_Application SHALL 提供"部署到 Cloudflare"按钮
2. WHEN 用户点击"部署到 Cloudflare"按钮时，THE Deploy_Manager SHALL 验证 Cloudflare API 凭证
3. WHEN 凭证有效时，THE Deploy_Manager SHALL 将 Public_Folder 内容上传到 Cloudflare Pages
4. WHILE Deploy_Manager 正在部署时，THE GUI_Application SHALL 显示部署进度
5. WHEN 部署成功时，THE GUI_Application SHALL 显示成功提示和网站访问链接
6. IF 部署失败，THEN THE GUI_Application SHALL 显示错误信息和失败原因

### Requirement 13: Cloudflare 配置管理

**User Story:** 作为博客作者，我想配置 Cloudflare Pages 连接信息，以便使用自动部署功能。

#### Acceptance Criteria

1. THE GUI_Application SHALL 提供设置界面用于配置 Cloudflare 连接
2. THE 设置界面 SHALL 提供 Cloudflare API Token 输入字段
3. THE 设置界面 SHALL 提供 Cloudflare Account ID 输入字段
4. THE 设置界面 SHALL 提供 Cloudflare Project Name 输入字段
5. WHEN 用户保存配置时，THE GUI_Application SHALL 加密存储敏感信息（API Token）
6. WHEN 用户保存配置时，THE Deploy_Manager SHALL 验证配置的有效性
7. IF 配置无效，THEN THE GUI_Application SHALL 显示错误信息并阻止保存

### Requirement 14: 应用程序窗口管理

**User Story:** 作为用户，我想要一个响应式的应用程序窗口，以便在不同屏幕尺寸下舒适使用。

#### Acceptance Criteria

1. THE GUI_Application SHALL 以默认尺寸 1200x800 像素启动
2. THE GUI_Application SHALL 支持窗口最小化、最大化和关闭操作
3. THE GUI_Application SHALL 记住用户上次关闭时的窗口尺寸和位置
4. THE GUI_Application SHALL 设置最小窗口尺寸为 800x600 像素
5. WHEN 窗口尺寸改变时，THE GUI_Application SHALL 自动调整界面布局以适应新尺寸

### Requirement 15: 导航和布局

**User Story:** 作为用户，我想要清晰的导航结构，以便快速访问不同功能。

#### Acceptance Criteria

1. THE GUI_Application SHALL 提供侧边栏导航菜单
2. THE 侧边栏 SHALL 包含以下导航项：文章管理、图片库、样式编辑、构建与部署、设置
3. WHEN 用户点击导航项时，THE GUI_Application SHALL 切换到对应的功能视图
4. THE GUI_Application SHALL 高亮显示当前活动的导航项
5. THE GUI_Application SHALL 在顶部显示应用标题和当前视图名称

### Requirement 16: 错误处理和用户反馈

**User Story:** 作为用户，我想获得清晰的错误提示和操作反馈，以便了解应用程序状态。

#### Acceptance Criteria

1. WHEN 任何操作成功时，THE GUI_Application SHALL 显示成功提示消息（3 秒后自动消失）
2. IF 任何操作失败，THEN THE GUI_Application SHALL 显示错误提示消息（需用户手动关闭）
3. THE 错误提示 SHALL 包含错误的具体描述和可能的解决方案
4. WHILE 执行耗时操作时，THE GUI_Application SHALL 显示加载指示器
5. THE GUI_Application SHALL 记录所有错误到日志文件以便调试

### Requirement 17: 数据持久化

**User Story:** 作为用户，我想应用程序记住我的设置和偏好，以便下次使用时保持一致。

#### Acceptance Criteria

1. THE GUI_Application SHALL 将用户设置存储在本地配置文件中
2. THE 配置文件 SHALL 包含 Cloudflare 配置、窗口尺寸、主题偏好等信息
3. WHEN GUI_Application 启动时，THE GUI_Application SHALL 加载保存的配置
4. WHEN 用户修改设置时，THE GUI_Application SHALL 立即保存到配置文件
5. THE GUI_Application SHALL 使用 JSON 格式存储配置文件

### Requirement 18: 跨平台兼容性

**User Story:** 作为用户，我想在 Windows、macOS 和 Linux 上使用该应用程序，以便在不同操作系统上管理博客。

#### Acceptance Criteria

1. THE GUI_Application SHALL 在 Windows 10 及以上版本上运行
2. THE GUI_Application SHALL 在 macOS 10.14 及以上版本上运行
3. THE GUI_Application SHALL 在主流 Linux 发行版（Ubuntu、Fedora、Debian）上运行
4. THE GUI_Application SHALL 使用操作系统原生的文件对话框
5. THE GUI_Application SHALL 适配不同操作系统的快捷键约定（如 Ctrl/Cmd）

### Requirement 19: 性能要求

**User Story:** 作为用户，我想要流畅的应用程序响应速度，以便高效工作。

#### Acceptance Criteria

1. WHEN 加载文章列表时，THE Article_List_View SHALL 在 1 秒内显示所有文章
2. WHEN 打开文章编辑器时，THE Article_Editor_View SHALL 在 500 毫秒内加载文章内容
3. WHEN 用户在 Markdown_Editor 中输入时，THE Markdown_Editor SHALL 在 100 毫秒内更新预览
4. WHEN 加载图片库时，THE Image_Gallery SHALL 使用懒加载技术以提高性能
5. THE GUI_Application SHALL 在启动后 3 秒内显示主界面

### Requirement 20: 键盘快捷键支持

**User Story:** 作为高效用户，我想使用键盘快捷键，以便快速执行常用操作。

#### Acceptance Criteria

1. THE GUI_Application SHALL 支持 Ctrl/Cmd+N 创建新文章
2. THE GUI_Application SHALL 支持 Ctrl/Cmd+S 保存当前文章
3. THE GUI_Application SHALL 支持 Ctrl/Cmd+B 触发网站构建
4. THE GUI_Application SHALL 支持 Ctrl/Cmd+P 预览网站
5. THE GUI_Application SHALL 支持 Ctrl/Cmd+, 打开设置界面
6. THE GUI_Application SHALL 在界面上显示可用的快捷键提示

### Requirement 21: Hugo 配置文件编辑

**User Story:** 作为博客作者，我想编辑 Hugo 配置文件，以便自定义网站的基本信息和主题参数。

#### Acceptance Criteria

1. THE GUI_Application SHALL 提供 Theme_Config_Editor 界面用于编辑 Hugo_Config_File
2. THE Theme_Config_Editor SHALL 提供网站标题输入字段
3. THE Theme_Config_Editor SHALL 提供网站描述输入字段
4. THE Theme_Config_Editor SHALL 提供作者信息输入字段
5. THE Theme_Config_Editor SHALL 提供语言设置选择器
6. THE Theme_Config_Editor SHALL 提供 PaperMod_Theme 参数编辑区域
7. WHEN 用户保存配置时，THE Theme_Config_Editor SHALL 验证配置格式的有效性
8. WHEN 配置有效时，THE Theme_Config_Editor SHALL 将更改写入 Hugo_Config_File
9. IF 配置格式无效，THEN THE GUI_Application SHALL 显示错误信息并阻止保存

### Requirement 22: 自定义 CSS 编辑

**User Story:** 作为博客作者，我想添加和编辑自定义 CSS 样式，以便个性化博客外观。

#### Acceptance Criteria

1. THE GUI_Application SHALL 提供 CSS_Editor 界面用于编辑 Custom_CSS_File
2. THE CSS_Editor SHALL 提供语法高亮显示
3. THE CSS_Editor SHALL 提供代码自动补全功能
4. THE CSS_Editor SHALL 提供 CSS 语法错误检测
5. WHEN 用户保存 CSS 时，THE CSS_Editor SHALL 验证 CSS 语法
6. WHEN CSS 语法有效时，THE CSS_Editor SHALL 将样式保存到 Custom_CSS_File
7. IF CSS 语法无效，THEN THE GUI_Application SHALL 高亮显示错误行并显示错误信息
8. THE CSS_Editor SHALL 支持撤销和重做操作

### Requirement 23: 颜色主题配置

**User Story:** 作为博客作者，我想配置博客的颜色主题，以便匹配我的品牌风格。

#### Acceptance Criteria

1. THE Style_Editor SHALL 提供预设颜色方案选择器（亮色主题、暗色主题）
2. THE Style_Editor SHALL 提供主色调 Color_Picker
3. THE Style_Editor SHALL 提供背景色 Color_Picker
4. THE Style_Editor SHALL 提供文字颜色 Color_Picker
5. THE Style_Editor SHALL 提供链接颜色 Color_Picker
6. WHEN 用户选择颜色时，THE Color_Picker SHALL 显示可视化颜色选择界面
7. WHEN 用户修改颜色时，THE Style_Editor SHALL 生成对应的 CSS 变量
8. WHEN 用户保存颜色配置时，THE Style_Editor SHALL 将 CSS 变量写入 Custom_CSS_File

### Requirement 24: 布局设置配置

**User Story:** 作为博客作者，我想配置博客的布局设置，以便控制页面的显示方式。

#### Acceptance Criteria

1. THE Style_Editor SHALL 提供首页布局模式选择器（列表模式、卡片模式）
2. THE Style_Editor SHALL 提供侧边栏内容配置选项
3. THE Style_Editor SHALL 提供导航菜单编辑器
4. THE 导航菜单编辑器 SHALL 支持添加、删除和重排序菜单项
5. THE 导航菜单编辑器 SHALL 为每个菜单项提供名称和链接输入字段
6. WHEN 用户保存布局设置时，THE Style_Editor SHALL 更新 Hugo_Config_File 中的相应参数
7. IF 菜单链接格式无效，THEN THE GUI_Application SHALL 显示错误信息并阻止保存

### Requirement 25: 字体设置配置

**User Story:** 作为博客作者，我想配置博客的字体设置，以便提升阅读体验。

#### Acceptance Criteria

1. THE Style_Editor SHALL 提供字体系列选择器（包含常见 Web 字体）
2. THE Style_Editor SHALL 提供标题字体大小调节器（范围 16px 至 48px）
3. THE Style_Editor SHALL 提供正文字体大小调节器（范围 12px 至 24px）
4. THE Style_Editor SHALL 提供行高调节器（范围 1.0 至 2.5）
5. THE Style_Editor SHALL 提供字间距调节器（范围 -0.05em 至 0.2em）
6. WHEN 用户调整字体设置时，THE Style_Editor SHALL 实时显示数值
7. WHEN 用户保存字体设置时，THE Style_Editor SHALL 生成对应的 CSS 规则并写入 Custom_CSS_File

### Requirement 26: 样式实时预览

**User Story:** 作为博客作者，我想实时预览样式更改效果，以便快速调整到满意的外观。

#### Acceptance Criteria

1. THE Style_Editor SHALL 提供 Style_Preview 组件用于实时预览
2. WHEN 用户修改任何样式设置时，THE Style_Preview SHALL 在 500 毫秒内更新预览
3. THE Style_Preview SHALL 支持预览不同页面类型（首页、文章页、列表页）
4. THE Style_Preview SHALL 提供页面类型切换选项卡
5. WHEN 用户切换页面类型时，THE Style_Preview SHALL 加载对应的示例内容
6. THE Style_Preview SHALL 使用实际的 Hugo 渲染引擎生成预览

### Requirement 27: 响应式样式预览

**User Story:** 作为博客作者，我想预览不同设备上的样式效果，以便确保博客在各种屏幕尺寸下都美观。

#### Acceptance Criteria

1. THE Style_Preview SHALL 提供设备尺寸切换按钮（桌面、平板、手机）
2. WHEN 用户选择桌面模式时，THE Style_Preview SHALL 以 1200px 宽度显示预览
3. WHEN 用户选择平板模式时，THE Style_Preview SHALL 以 768px 宽度显示预览
4. WHEN 用户选择手机模式时，THE Style_Preview SHALL 以 375px 宽度显示预览
5. WHEN 切换设备模式时，THE Style_Preview SHALL 在 300 毫秒内完成尺寸过渡动画
6. THE Style_Preview SHALL 在不同设备模式下应用相应的媒体查询样式

### Requirement 28: 样式配置导入导出

**User Story:** 作为博客作者，我想导出和导入样式配置，以便备份或在不同项目间共享样式。

#### Acceptance Criteria

1. THE Style_Editor SHALL 提供"导出样式配置"按钮
2. WHEN 用户点击导出按钮时，THE Style_Editor SHALL 将所有样式设置保存为 JSON 文件
3. THE 导出的 JSON 文件 SHALL 包含颜色主题、字体设置、布局配置和自定义 CSS
4. THE Style_Editor SHALL 提供"导入样式配置"按钮
5. WHEN 用户选择 JSON 配置文件时，THE Style_Editor SHALL 验证文件格式
6. WHEN 配置文件有效时，THE Style_Editor SHALL 应用导入的样式设置
7. IF 配置文件格式无效，THEN THE GUI_Application SHALL 显示错误信息并取消导入

### Requirement 29: 样式重置功能

**User Story:** 作为博客作者，我想重置样式到默认设置，以便在样式调整不满意时快速恢复。

#### Acceptance Criteria

1. THE Style_Editor SHALL 提供"重置为默认样式"按钮
2. WHEN 用户点击重置按钮时，THE GUI_Application SHALL 显示确认对话框
3. WHEN 用户确认重置时，THE Style_Editor SHALL 恢复所有样式设置到 PaperMod_Theme 默认值
4. WHEN 重置完成时，THE Style_Editor SHALL 删除 Custom_CSS_File 中的自定义样式
5. WHEN 重置完成时，THE Style_Preview SHALL 更新显示默认样式效果
6. THE GUI_Application SHALL 显示重置成功提示

### Requirement 30: 样式编辑历史记录

**User Story:** 作为博客作者，我想查看样式编辑历史，以便回退到之前的样式版本。

#### Acceptance Criteria

1. THE Style_Editor SHALL 自动保存每次样式更改的历史记录
2. THE Style_Editor SHALL 保留最近 20 次样式更改记录
3. THE Style_Editor SHALL 提供"样式历史"面板
4. THE 样式历史面板 SHALL 显示每次更改的时间戳和简要描述
5. WHEN 用户选择历史记录项时，THE Style_Preview SHALL 显示该版本的样式效果
6. THE Style_Editor SHALL 提供"恢复到此版本"按钮
7. WHEN 用户恢复到历史版本时，THE Style_Editor SHALL 应用该版本的所有样式设置
