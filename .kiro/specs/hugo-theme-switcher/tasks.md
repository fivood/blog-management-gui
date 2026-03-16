# Implementation Plan: Hugo Theme Switcher

## Overview

实现 Hugo 主题切换器功能，允许用户在博客管理编辑器中浏览、安装、切换和预览 Hugo 主题。系统通过 Git submodule 管理主题，自动更新 hugo.toml 配置，并提供主题预览功能。

## Tasks

- [x] 1. 创建核心类型定义和接口
  - 在 src/shared/types/ 中创建 theme.ts 定义 ThemeInfo、ThemeConfig、ThemeRegistryEntry 等类型
  - 定义 ThemeService 接口和 GitSubmoduleManager 接口
  - _Requirements: 1.2, 2.1, 3.1, 7.2_

- [ ] 2. 实现 Git Submodule 管理器
  - [x] 2.1 创建 GitSubmoduleManager 类
    - 在 src/main/services/ 中创建 GitSubmoduleManager.ts
    - 实现 addSubmodule()、removeSubmodule()、listSubmodules() 方法
    - 使用 simple-git 库执行 Git 操作
    - 实现 .gitmodules 文件解析
    - _Requirements: 3.1, 3.2, 4.2, 8.2, 8.3_
  
  - [ ]* 2.2 编写 GitSubmoduleManager 的单元测试
    - 测试 submodule 添加和移除
    - 测试 .gitmodules 解析
    - 测试 Git 错误处理
    - _Requirements: 3.1, 4.2, 9.1_

- [ ] 3. 实现主题服务核心功能
  - [x] 3.1 创建 ThemeService 类基础结构
    - 在 src/main/services/ 中创建 ThemeService.ts
    - 注入 GitSubmoduleManager 和 ConfigService 依赖
    - 实现主题缓存机制
    - _Requirements: 1.1, 11.1, 11.2_
  
  - [x] 3.2 实现主题扫描功能
    - 实现 getInstalledThemes() 方法扫描 themes/ 目录
    - 实现 readThemeMetadata() 读取主题配置文件
    - 实现主题列表排序和缓存
    - _Requirements: 1.1, 1.2, 1.5, 11.1, 12.2_
  
  - [ ]* 3.3 编写主题扫描的属性测试
    - **Property 1: Theme Uniqueness** - 验证所有已安装主题名称唯一
    - **Property 3: Configuration Consistency** - 验证配置文件反映当前主题
    - **Validates: Requirements 1.1, 12.1, 12.4**
  
  - [x] 3.4 实现获取当前主题功能
    - 实现 getCurrentTheme() 方法读取 hugo.toml
    - 解析 TOML 配置文件获取 theme 字段
    - _Requirements: 1.3, 12.1_

- [ ] 4. 实现配置备份和恢复机制
  - [x] 4.1 实现配置备份功能
    - 实现 backupHugoConfig() 创建带时间戳的备份文件
    - 实现备份文件管理（保留最近 10 个）
    - 使用原子文件操作确保安全性
    - _Requirements: 2.2, 5.1, 5.4, 5.5, 11.5_
  
  - [x] 4.2 实现配置恢复功能
    - 实现 restoreHugoConfig() 从备份恢复配置
    - 实现配置文件有效性验证
    - _Requirements: 2.4, 5.2, 5.3, 9.4_
  
  - [ ]* 4.3 编写备份恢复的属性测试
    - **Property 3: Backup/Restore Symmetry** - 验证备份恢复对称性
    - **Property 5: Backup Existence** - 验证每次切换都创建备份
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 5. Checkpoint - 确保核心服务测试通过
  - 确保所有测试通过，如有问题请询问用户

- [ ] 6. 实现主题切换功能
  - [x] 6.1 实现主题切换核心逻辑
    - 实现 switchTheme() 方法
    - 实现主题存在性验证
    - 实现配置更新和备份
    - 实现失败回滚机制
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.3, 12.1_
  
  - [ ] 6.2 实现主题验证功能
    - 实现 verifyThemeLoaded() 验证主题加载
    - 实现 validateThemeExists() 检查主题文件
    - 实现 Hugo 版本兼容性检查
    - _Requirements: 6.1, 6.2, 6.4, 6.5_
  
  - [ ] 6.3 集成预览服务器重启
    - 在 HugoService 中添加 restartPreviewServer() 方法
    - 实现优雅关闭避免端口冲突
    - 在主题切换后触发重启
    - _Requirements: 2.5, 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 6.4 编写主题切换的单元测试
    - 测试成功切换场景
    - 测试切换到不存在主题的错误处理
    - 测试失败回滚机制
    - 测试预览服务器重启
    - _Requirements: 2.1, 2.3, 2.4, 6.3, 9.1_
  
  - [ ]* 6.5 编写主题切换的属性测试
    - **Property 2: Active Theme Existence** - 验证始终有且仅有一个激活主题
    - **Property 8: Rollback Safety** - 验证失败切换恢复之前状态
    - **Validates: Requirements 2.4, 6.3, 12.4**

- [ ] 7. 实现主题安装功能
  - [x] 7.1 实现主题安装核心逻辑
    - 实现 installTheme() 方法
    - 实现输入验证（Git URL、主题名称）
    - 实现重复主题检测
    - 实现 Git submodule 添加
    - 实现安装失败清理
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 8.1, 8.2, 8.3, 8.4, 11.3_
  
  - [ ] 7.2 实现主题注册功能
    - 创建 theme-registry.json 管理已安装主题元数据
    - 实现 registerTheme() 添加主题到注册表
    - 实现主题注册表读写
    - _Requirements: 3.3, 12.3_
  
  - [ ]* 7.3 编写主题安装的单元测试
    - 测试成功安装场景
    - 测试重复主题检测
    - 测试无效 Git URL 处理
    - 测试安装失败清理
    - _Requirements: 3.1, 3.4, 3.5, 8.2, 9.2_
  
  - [ ]* 7.4 编写主题安装的属性测试
    - **Property 4: Submodule Integrity** - 验证每个主题都有 Git submodule 条目
    - **Property 6: Path Validity** - 验证所有主题路径有效
    - **Property 7: Git URL Validity** - 验证 Git URL 格式正确
    - **Validates: Requirements 3.2, 8.2, 12.2, 12.3**

- [ ] 8. 实现主题卸载功能
  - [x] 8.1 实现主题卸载核心逻辑
    - 实现 uninstallTheme() 方法
    - 实现当前主题保护（禁止卸载激活主题）
    - 实现主题目录删除
    - 实现 Git submodule 移除
    - 实现注册表更新
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 8.2 编写主题卸载的单元测试
    - 测试成功卸载场景
    - 测试卸载激活主题的保护
    - 测试 submodule 移除
    - 测试注册表更新
    - _Requirements: 4.1, 4.4, 4.5_
  
  - [ ]* 8.3 编写主题卸载的属性测试
    - **Property 4: Installation/Uninstallation Inverse** - 验证安装卸载互逆
    - **Validates: Requirements 4.1, 4.2, 4.3, 12.3**

- [ ] 9. 实现主题注册表和推荐主题
  - [x] 9.1 创建推荐主题数据
    - 在 src/main/data/ 中创建 recommended-themes.json
    - 添加常用 Hugo 主题（PaperMod, Stack, Ananke 等）
    - 包含主题名称、描述、Git URL、标签、截图等信息
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 9.2 实现推荐主题查询
    - 实现 getThemeRegistry() 方法读取推荐主题列表
    - 实现主题搜索和过滤功能
    - _Requirements: 7.1, 7.2_

- [ ] 10. Checkpoint - 确保后端服务完整性
  - 确保所有测试通过，如有问题请询问用户

- [ ] 11. 实现 IPC 通信层
  - [x] 11.1 创建主题相关的 IPC handlers
    - 在 src/main/ipc/ 中创建 theme-handlers.ts
    - 实现 theme:getInstalled、theme:getCurrent、theme:switch 等 IPC 处理器
    - 实现 theme:install、theme:uninstall、theme:getRegistry 处理器
    - 注册所有 IPC 处理器到主进程
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 7.1_
  
  - [x] 11.2 更新 preload 脚本
    - 在 src/preload/index.ts 中添加 theme API 暴露
    - 定义 window.electronAPI.theme 接口
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 7.1_
  
  - [x] 11.3 更新类型定义
    - 在 src/renderer/global.d.ts 中添加 theme API 类型定义
    - 确保 TypeScript 类型安全
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 7.1_

- [ ] 12. 实现主题切换器 UI 组件
  - [x] 12.1 创建 ThemeSwitcher 主组件
    - 在 src/renderer/components/styles/ 中创建 ThemeSwitcher.tsx
    - 实现组件基础结构和状态管理
    - 使用 Ant Design 组件库构建 UI
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 12.2 实现已安装主题列表视图
    - 使用 List 组件显示已安装主题
    - 显示主题名称、描述、作者信息
    - 标识当前激活主题
    - 实现空状态提示
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 12.3 实现主题切换交互
    - 添加切换按钮和事件处理
    - 实现加载状态显示
    - 实现成功/失败提示
    - _Requirements: 2.1, 2.3, 8.5, 11.4_
  
  - [x] 12.4 实现主题安装界面
    - 创建主题安装对话框
    - 实现 Git URL 和主题名称输入
    - 实现输入验证和错误提示
    - 实现安装进度指示器
    - _Requirements: 3.1, 3.6, 8.1, 8.5, 9.2_
  
  - [x] 12.5 实现主题卸载交互
    - 添加卸载按钮和确认对话框
    - 实现卸载成功提示
    - 实现激活主题保护提示
    - _Requirements: 4.1, 4.4, 4.5_

- [ ] 13. 实现推荐主题浏览界面
  - [x] 13.1 创建推荐主题列表组件
    - 创建 ThemeRegistry.tsx 组件
    - 使用 Card 或 List 组件展示推荐主题
    - 显示主题截图、描述、标签
    - 实现演示站点链接
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 13.2 实现快速安装功能
    - 从推荐列表一键安装主题
    - 自动填充 Git URL
    - _Requirements: 7.5_

- [ ] 14. 集成到样式编辑器
  - [x] 14.1 更新 ConfigEditor 组件
    - 在 src/renderer/components/styles/ConfigEditor.tsx 中添加主题切换器标签页
    - 集成 ThemeSwitcher 组件
    - 确保与现有样式编辑功能协调
    - _Requirements: 1.1, 2.1_
  
  - [ ] 14.2 实现预览服务器状态同步
    - 在主题切换后更新预览服务器状态
    - 显示预览服务器重启通知
    - _Requirements: 10.1, 10.3, 10.5_

- [ ] 15. 实现错误处理和用户反馈
  - [ ] 15.1 实现全局错误处理
    - 捕获所有主题操作错误
    - 实现错误分类（网络、权限、Git、配置等）
    - 显示用户友好的错误信息
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 15.2 实现重试和恢复机制
    - 为网络错误提供重试选项
    - 实现自动配置恢复
    - 显示恢复通知
    - _Requirements: 9.2, 9.4, 9.5_
  
  - [ ] 15.3 实现操作确认对话框
    - 为危险操作（卸载、覆盖配置）添加确认对话框
    - 显示操作影响说明
    - _Requirements: 4.1, 6.5_

- [ ] 16. Checkpoint - 确保 UI 功能完整
  - 确保所有测试通过，如有问题请询问用户

- [ ] 17. 实现数据一致性检查
  - [ ] 17.1 实现启动时一致性验证
    - 在应用启动时验证主题配置一致性
    - 检查 hugo.toml 中的主题是否存在
    - 检查 .gitmodules 与实际主题目录的一致性
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ] 17.2 实现自动修复机制
    - 检测到不一致时记录警告日志
    - 尝试自动修复常见问题
    - 通知用户修复结果
    - _Requirements: 12.5_
  
  - [ ]* 17.3 编写数据一致性的属性测试
    - **Property 3: Configuration Consistency** - 验证配置与当前主题一致
    - **Property 4: Submodule Integrity** - 验证 submodule 条目完整性
    - **Property 6: Path Validity** - 验证所有主题路径有效
    - **Validates: Requirements 12.1, 12.2, 12.3**

- [ ] 18. 性能优化和缓存实现
  - [ ] 18.1 实现主题列表缓存
    - 实现内存缓存避免重复扫描
    - 实现缓存失效策略
    - _Requirements: 11.1, 11.2_
  
  - [ ] 18.2 优化 Git 操作性能
    - 使用浅克隆加速主题下载
    - 实现并行操作支持
    - _Requirements: 11.3_
  
  - [ ] 18.3 实现进度指示器
    - 为长时间操作添加进度条
    - 显示操作状态和预计时间
    - _Requirements: 11.4_

- [ ] 19. 添加日志和调试支持
  - [ ] 19.1 实现主题操作日志
    - 记录所有主题操作（安装、切换、卸载）
    - 记录 Git 操作输出
    - 记录错误和警告
    - _Requirements: 9.1, 12.5_
  
  - [ ] 19.2 添加调试模式
    - 实现详细日志输出
    - 显示 Git 命令和输出
    - 帮助问题诊断
    - _Requirements: 9.1_

- [ ] 20. 最终集成和测试
  - [ ] 20.1 端到端集成测试
    - 测试完整的主题安装流程
    - 测试主题切换和预览
    - 测试错误恢复流程
    - _Requirements: 所有需求_
  
  - [ ] 20.2 用户体验优化
    - 优化加载状态和过渡动画
    - 确保操作响应及时
    - 优化错误提示文案
    - _Requirements: 11.4_
  
  - [ ] 20.3 文档更新
    - 更新 README 添加主题管理功能说明
    - 添加主题安装和切换的使用指南
    - 记录常见问题和解决方案
    - _Requirements: 所有需求_

- [ ] 21. Final Checkpoint - 确保所有功能正常
  - 确保所有测试通过，如有问题请询问用户

## Notes

- 任务标记 `*` 为可选任务，可跳过以加快 MVP 开发
- 每个任务都引用了具体的需求条款以确保可追溯性
- Checkpoint 任务确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
- 使用 TypeScript 确保类型安全
- 使用 Ant Design 组件库保持 UI 一致性
- 使用 simple-git 库简化 Git 操作
- 使用 @iarna/toml 库处理 TOML 配置文件
