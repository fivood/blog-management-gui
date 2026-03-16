# 功能支持状态

## 已实现的后端功能 ✓

### 1. 文章管理
- ✓ **创建文章** - `ArticleService.createArticle()`
- ✓ **编辑文章** - `ArticleService.updateArticle()`
- ✓ **删除文章** - `ArticleService.deleteArticle()`
- ✓ **发布文章** - `ArticleService.publishArticle()`
- ✓ **文章列表** - `ArticleService.listArticles()`
- ✓ **文章搜索** - 支持按标题和标签搜索

### 2. 文章属性
- ✓ **标题** - `Article.title`
- ✓ **内容** - `Article.content`
- ✓ **标签（tags）** - `Article.tags[]` - 可用于分类文章
- ✓ **分类（categories）** - `Article.categories[]` - 可用于"长篇/短篇/随笔"等
- ✓ **创建时间** - `Article.createdAt`
- ✓ **修改时间** - `Article.modifiedAt`
- ✓ **发布时间** - `Article.publishedAt` - 可自定义
- ✓ **草稿/已发布状态** - `Article.state`
- ✓ **密码保护** - `Article.isProtected` + `Article.passwordHash`

### 3. 密码保护功能
- ✓ **设置密码** - `PasswordProtector.protectArticle()`
- ✓ **修改密码** - `PasswordProtector.updatePassword()`
- ✓ **移除密码** - `PasswordProtector.unprotectArticle()`
- ✓ **密码加密** - 使用 bcrypt 加密存储

### 4. Hugo 集成
- ✓ **生成 Hugo 文件** - 自动生成 `content/posts/*.md`
- ✓ **Hugo 配置管理** - `HugoService.getConfig()` / `updateConfig()`
- ✓ **站点构建** - `HugoService.build()`
- ✓ **预览服务器** - `HugoService.startPreviewServer()`

### 5. 站点配置
- ✓ **站点名称** - 通过 `HugoService.updateConfig({ title: '...' })`
- ✓ **站点描述** - 通过 Hugo 配置的 params
- ✓ **作者信息** - 通过 Hugo 配置

### 6. 数据持久化
- ✓ **文章不会被覆盖** - 每篇文章有唯一 ID
- ✓ **自动保存到 Hugo 项目** - 文章保存到 `content/posts/`
- ✓ **配置持久化** - 使用 electron-store

## 使用示例

### 创建带标签和分类的文章

```typescript
// 通过 IPC 调用
const result = await window.electronAPI.article.create({
  title: '我的第一篇文章',
  content: '# 标题\n\n文章内容...',
  tags: ['技术', 'JavaScript'],
  categories: ['长篇'], // 可以是：长篇、短篇、随笔等
  password: '可选密码' // 如果需要密码保护
});
```

### 编辑文章（包括修改发文时间）

```typescript
// 更新文章
const result = await window.electronAPI.article.update(articleId, {
  title: '更新后的标题',
  content: '更新后的内容',
  tags: ['新标签'],
  categories: ['短篇'],
  password: '新密码' // 或留空移除密码
});

// 注意：publishedAt 时间在发布时自动设置
// 如需自定义发文时间，需要直接修改 Hugo frontmatter 文件
```

### 编辑站点名称和介绍

```typescript
// 获取当前配置
const config = await window.electronAPI.hugo.getConfig();

// 更新站点信息
await window.electronAPI.hugo.updateConfig({
  title: '我的博客',
  params: {
    description: '这是我的个人博客',
    author: '作者名称'
  }
});
```

### 使用分类作为菜单

在 Hugo 配置中，可以将 categories 用作导航菜单：

```toml
[menu]
  [[menu.main]]
    name = "长篇"
    url = "/categories/长篇/"
    weight = 1
  
  [[menu.main]]
    name = "短篇"
    url = "/categories/短篇/"
    weight = 2
  
  [[menu.main]]
    name = "随笔"
    url = "/categories/随笔/"
    weight = 3
```

## 需要 UI 实现的功能

以下功能后端已支持，需要在 UI 中实现：

### 1. 文章编辑器
- [ ] 标题输入框
- [ ] Markdown 编辑器
- [ ] 标签选择器（支持多选和新建）
- [ ] 分类选择器（长篇/短篇/随笔等）
- [ ] 密码保护开关和密码输入框
- [ ] 保存按钮（带未保存提示）
- [ ] 发布/取消发布按钮

### 2. 站点设置
- [ ] 站点名称输入框
- [ ] 站点描述输入框
- [ ] 作者信息输入框
- [ ] 保存按钮

### 3. 文章列表
- [ ] 显示所有文章
- [ ] 按标签筛选
- [ ] 按分类筛选
- [ ] 搜索功能
- [ ] 密码保护标识
- [ ] 编辑/删除按钮

### 4. 保存提示
- [ ] 检测未保存的更改
- [ ] 离开页面前提示
- [ ] 自动保存功能（可选）

## 技术实现说明

### 文章分类系统

当前实现支持两种分类方式：

1. **Tags（标签）** - 用于内容标记
   - 例如：技术、生活、旅行等
   - 支持多个标签
   - 可用于搜索和筛选

2. **Categories（分类）** - 用于文章类型
   - 例如：长篇、短篇、随笔
   - 支持多个分类
   - 可用于导航菜单

### 密码保护

- 密码使用 bcrypt 加密存储
- 密码哈希存储在文章元数据中
- 支持设置、修改、移除密码
- Hugo 主题需要支持密码保护功能

### 数据安全

- 每篇文章有唯一 ID（UUID）
- 新文章不会覆盖旧文章
- 所有操作都有错误处理
- 支持文章版本控制

## 下一步建议

1. **实现基础 UI** - 先实现文章编辑器和列表
2. **添加站点设置页面** - 编辑站点名称和描述
3. **实现保存提示** - 检测未保存更改
4. **添加分类管理** - 管理"长篇/短篇/随笔"等分类
5. **测试密码保护** - 确保密码功能正常工作
