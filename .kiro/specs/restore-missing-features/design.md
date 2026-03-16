# 恢复丢失功能修复设计

## Overview

本设计文档描述如何恢复博客管理工具中丢失的关键功能。修复涉及两个主要组件：StyleEditorView（样式编辑器）和 ArticleEditorSimple（文章编辑器）。修复策略是添加缺失的 UI 组件和功能，同时保持现有功能完全不变。

## Glossary

- **Bug_Condition (C)**: 用户尝试访问或使用丢失的功能时触发的条件
- **Property (P)**: 修复后用户应该能够正常使用这些功能的期望行为
- **Preservation**: 现有的样式编辑、文章保存、密码保护等功能必须保持完全不变
- **StyleEditorView**: 位于 `blog-management-gui/src/renderer/components/styles/StyleEditorView.tsx` 的样式编辑器组件
- **ArticleEditorSimple**: 位于 `blog-management-gui/src/renderer/components/ArticleEditorSimple.tsx` 的文章编辑器组件
- **PaperMod**: Hugo 主题之一，需要独立的配置标签页
- **Neopost**: Hugo 主题之一，需要独立的配置标签页
- **publishedAt**: Article 类型中的可选字段，表示文章发布时间
- **slug**: URL 别名，用于自定义文章的 URL 路径

## Bug Details

### Bug Condition

Bug 在以下情况下显现：

1. 用户打开样式编辑器，期望看到 PaperMod 和 Neopost 主题的独立配置标签页，但只看到 "Hugo 配置" 和 "自定义 CSS" 两个标签页
2. 用户在文章编辑器中创建或编辑文章，期望手动设置发布日期，但找不到日期选择器
3. 用户在文章编辑器中编辑元数据，期望填写作者信息，但找不到作者字段
4. 用户在文章编辑器中编辑元数据，期望自定义 URL 别名，但找不到 slug 字段
5. 用户完成文章编辑后，期望直接发布文章，但只能保存为草稿

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type UserAction
  OUTPUT: boolean
  
  RETURN (input.action == 'openStyleEditor' AND NOT hasThemeTabs(input.view))
         OR (input.action == 'editArticle' AND NOT hasDatePicker(input.editor))
         OR (input.action == 'editArticle' AND NOT hasAuthorField(input.editor))
         OR (input.action == 'editArticle' AND NOT hasSlugField(input.editor))
         OR (input.action == 'finishEditing' AND NOT hasPublishButton(input.editor))
END FUNCTION
```

### Examples

- **样式编辑器示例**: 用户打开样式编辑器，看到标签页列表 `["Hugo 配置", "自定义 CSS"]`，期望看到 `["Hugo 配置", "自定义 CSS", "PaperMod 主题", "Neopost 主题"]`
- **日期选择器示例**: 用户创建新文章，希望设置发布日期为 "2026-03-15 14:30"，但找不到日期选择器组件
- **作者字段示例**: 用户编辑文章元数据，希望填写作者为 "五木"，但表单中没有作者输入框
- **Slug 字段示例**: 用户创建文章标题为 "我的第一篇博客"，希望设置 slug 为 "my-first-blog"，但找不到 slug 输入框
- **发布按钮示例**: 用户完成文章编辑，点击"保存"按钮后文章状态仍为 draft，期望有"发布"按钮直接将状态改为 published

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Hugo 配置的编辑和保存功能必须继续正常工作
- 自定义 CSS 的编辑和保存功能必须继续正常工作
- 文章标题、内容、标签、分类的编辑和保存必须继续正常工作
- 密码保护功能必须继续正常工作
- Ctrl+S 快捷键保存功能必须继续正常工作
- 未保存更改的确认对话框必须继续正常工作
- 样式配置的导出、导入、重置功能必须继续正常工作
- 样式历史记录功能必须继续正常工作

**Scope:**
所有不涉及新增功能的现有操作都应该完全不受影响。这包括：
- 现有表单字段的验证逻辑
- 现有 API 调用（createArticle, updateArticle, getArticle 等）
- 现有状态管理（isDirty, isPasswordProtected 等）
- 现有 UI 布局和样式

## Hypothesized Root Cause

基于 bug 描述和代码分析，最可能的原因是：

1. **功能移除或重构**: 在代码重构过程中，这些功能被意外移除或注释掉
   - StyleEditorView 可能之前有 4 个标签页，但在简化过程中只保留了 2 个
   - ArticleEditorSimple 可能之前有完整的表单字段，但在简化过程中移除了部分字段

2. **组件未创建**: PaperMod 和 Neopost 主题的配置编辑器组件可能从未被创建
   - 需要创建 PaperModEditor.tsx 和 NeopostEditor.tsx 组件

3. **类型定义不完整**: Article 类型虽然包含 author 和 publishedAt 字段，但可能缺少 slug 字段
   - 需要在 Article 接口中添加 slug 字段

4. **API 支持不足**: ArticleService 可能不支持在创建/更新时设置 publishedAt 和 slug
   - 需要扩展 CreateArticleData 和 ArticleUpdate 接口

## Correctness Properties

Property 1: Bug Condition - 恢复丢失的功能

_For any_ 用户操作，当用户尝试访问样式编辑器的主题配置标签页、文章编辑器的日期选择器、作者字段、slug 字段或发布按钮时，修复后的系统 SHALL 显示这些 UI 组件并允许用户正常使用这些功能。

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

Property 2: Preservation - 现有功能不受影响

_For any_ 用户操作，当用户使用现有功能（Hugo 配置编辑、CSS 编辑、文章基本信息编辑、密码保护、快捷键保存等）时，修复后的系统 SHALL 产生与修复前完全相同的行为，保持所有现有功能的正确性。

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12**

## Fix Implementation

### Changes Required

假设我们的根因分析是正确的：

#### 文件 1: `blog-management-gui/src/shared/types/article.ts`

**Function**: Article 接口

**Specific Changes**:
1. **添加 slug 字段**: 在 Article 接口中添加可选的 slug 字段
   - `slug?: string;`
   - 用于存储文章的 URL 别名

2. **扩展 CreateArticleData 接口**: 添加 author、publishedAt 和 slug 字段
   - `author?: string;`
   - `publishedAt?: Date;`
   - `slug?: string;`

3. **扩展 ArticleUpdate 接口**: 添加 author、publishedAt 和 slug 字段
   - `author?: string;`
   - `publishedAt?: Date;`
   - `slug?: string;`

#### 文件 2: `blog-management-gui/src/renderer/components/ArticleEditorSimple.tsx`

**Function**: ArticleEditorSimple 组件

**Specific Changes**:
1. **添加日期选择器**: 在标题和分类之间添加 DatePicker 组件
   - 使用 Ant Design 的 DatePicker 组件
   - 字段名: `publishedAt`
   - 标签: "发布日期"
   - 默认值: 当前日期时间
   - 格式: "YYYY-MM-DD HH:mm"

2. **添加作者字段**: 在分类和标签之间添加 Input 组件
   - 字段名: `author`
   - 标签: "作者"
   - 占位符: "请输入作者名称"

3. **添加 slug 字段**: 在标签和内容之间添加 Input 组件
   - 字段名: `slug`
   - 标签: "URL 别名（可选）"
   - 占位符: "自定义文章 URL，留空则使用文章 ID"
   - 提示: "只能包含小写字母、数字和连字符"

4. **添加发布按钮**: 在保存按钮旁边添加发布按钮
   - 按钮文本: "发布"
   - 图标: <CheckOutlined />
   - 类型: "primary"
   - 点击时调用 publishArticle API

5. **更新 handleSave 逻辑**: 在保存时包含新字段
   - 从表单获取 author、publishedAt、slug 值
   - 传递给 createArticle 或 updateArticle

6. **添加 handlePublish 函数**: 处理发布按钮点击
   - 先调用 handleSave 保存文章
   - 然后调用 publishArticle(articleId) 发布文章
   - 显示成功或失败通知

#### 文件 3: `blog-management-gui/src/renderer/components/styles/StyleEditorView.tsx`

**Function**: StyleEditorView 组件

**Specific Changes**:
1. **添加 PaperMod 主题标签页**: 在 Tabs 组件中添加新的 TabPane
   - key: "papermod"
   - tab: "PaperMod 主题"
   - 内容: <PaperModEditor /> 组件

2. **添加 Neopost 主题标签页**: 在 Tabs 组件中添加新的 TabPane
   - key: "neopost"
   - tab: "Neopost 主题"
   - 内容: <NeopostEditor /> 组件

3. **导入新组件**: 在文件顶部导入 PaperModEditor 和 NeopostEditor
   - `import PaperModEditor from './PaperModEditor';`
   - `import NeopostEditor from './NeopostEditor';`

#### 文件 4: `blog-management-gui/src/renderer/components/styles/PaperModEditor.tsx` (新建)

**Function**: PaperMod 主题配置编辑器

**Specific Changes**:
1. **创建组件文件**: 新建 PaperModEditor.tsx
   - 接收 props: config, onChange
   - 显示 PaperMod 主题特有的配置选项

2. **从 ConfigEditor 中提取 PaperMod 配置**: 将 ConfigEditor 中的 PaperMod 相关配置移到这里
   - ShowReadingTime
   - ShowShareButtons
   - ShowPostNavLinks
   - ShowBreadCrumbs
   - ShowCodeCopyButtons
   - ShowToc
   - TocOpen

3. **添加更多 PaperMod 配置**: 根据 PaperMod 主题文档添加其他配置选项
   - defaultTheme (light/dark/auto)
   - disableThemeToggle
   - ShowFullTextinRSS
   - ShowRssButtonInSectionTermList

#### 文件 5: `blog-management-gui/src/renderer/components/styles/NeopostEditor.tsx` (新建)

**Function**: Neopost 主题配置编辑器

**Specific Changes**:
1. **创建组件文件**: 新建 NeopostEditor.tsx
   - 接收 props: config, onChange
   - 显示 Neopost 主题特有的配置选项

2. **添加 Neopost 配置选项**: 根据 Neopost 主题文档添加配置
   - bio (个人简介)
   - avatar (头像)
   - instagram, github, twitter (社交链接)
   - color (主题颜色)
   - theme (主题变体，如 gray-green)

3. **使用 Card 和 Form 布局**: 与 ConfigEditor 保持一致的 UI 风格
   - 使用 Ant Design 的 Card 和 Form 组件
   - 每个配置项使用 Form.Item

#### 文件 6: `blog-management-gui/src/main/services/ArticleService.ts`

**Function**: ArticleService 类

**Specific Changes**:
1. **更新 createArticle 方法**: 支持 author、publishedAt 和 slug 字段
   - 从 data 参数中提取这些字段
   - 在调用 createDraft 时传递 author
   - 在创建后使用 modifyArticle 设置 publishedAt 和 slug

2. **更新 updateArticle 方法**: 支持 author、publishedAt 和 slug 字段
   - 从 updates 参数中提取这些字段
   - 在调用 modifyArticle 时传递这些字段

3. **更新 generateHugoFile 调用**: 确保新字段被写入 Hugo 文件
   - HugoIntegration.generateStaticFile 应该处理 author、date 和 slug 字段

#### 文件 7: `src/ArticleManager.ts`

**Function**: ArticleManager 类

**Specific Changes**:
1. **更新 createDraft 方法**: 支持在创建时设置 publishedAt
   - 如果 metadata 中包含 publishedAt，则使用该值
   - 否则使用当前时间

2. **更新 modifyArticle 方法**: 支持修改 author、publishedAt 和 slug
   - 在 updates 参数中添加这些字段的处理
   - 确保 publishedAt 不会被意外覆盖

#### 文件 8: `src/integrations/HugoIntegration.ts`

**Function**: HugoIntegration.generateStaticFile 方法

**Specific Changes**:
1. **添加 slug 字段到 frontmatter**: 如果 article.slug 存在，添加到 YAML frontmatter
   - `slug: ${article.slug}`

2. **使用 publishedAt 作为 date**: 如果 article.publishedAt 存在，使用它作为 date 字段
   - `date: ${article.publishedAt.toISOString()}`

3. **添加 author 字段到 frontmatter**: 如果 article.author 存在，添加到 YAML frontmatter
   - `author: ${article.author}`

## Testing Strategy

### Validation Approach

测试策略遵循两阶段方法：首先在未修复的代码上演示 bug，然后验证修复后的代码正确工作并保持现有行为不变。

### Exploratory Bug Condition Checking

**Goal**: 在实施修复之前，在未修复的代码上演示 bug。确认或反驳根因分析。如果反驳，需要重新假设。

**Test Plan**: 编写测试来检查 UI 组件的存在性和功能性。在未修复的代码上运行这些测试，观察失败并理解根本原因。

**Test Cases**:
1. **样式编辑器标签页测试**: 检查 StyleEditorView 是否有 4 个标签页（将在未修复代码上失败）
2. **日期选择器测试**: 检查 ArticleEditorSimple 是否有 publishedAt DatePicker（将在未修复代码上失败）
3. **作者字段测试**: 检查 ArticleEditorSimple 是否有 author Input（将在未修复代码上失败）
4. **Slug 字段测试**: 检查 ArticleEditorSimple 是否有 slug Input（将在未修复代码上失败）
5. **发布按钮测试**: 检查 ArticleEditorSimple 是否有发布按钮（将在未修复代码上失败）

**Expected Counterexamples**:
- StyleEditorView 只有 2 个标签页而不是 4 个
- ArticleEditorSimple 缺少日期选择器、作者字段、slug 字段和发布按钮
- 可能的原因：组件未创建、字段未添加到表单、类型定义不完整

### Fix Checking

**Goal**: 验证对于所有触发 bug 条件的输入，修复后的功能产生期望的行为。

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedComponent(input)
  ASSERT expectedBehavior(result)
END FOR
```

**Test Cases**:
1. **样式编辑器标签页验证**: 打开样式编辑器，验证有 4 个标签页
2. **PaperMod 编辑器验证**: 切换到 PaperMod 标签页，验证显示 PaperMod 配置选项
3. **Neopost 编辑器验证**: 切换到 Neopost 标签页，验证显示 Neopost 配置选项
4. **日期选择器验证**: 在文章编辑器中选择日期，验证日期被正确保存
5. **作者字段验证**: 在文章编辑器中输入作者，验证作者被正确保存
6. **Slug 字段验证**: 在文章编辑器中输入 slug，验证 slug 被正确保存到 Hugo 文件
7. **发布按钮验证**: 点击发布按钮，验证文章状态变为 published

### Preservation Checking

**Goal**: 验证对于所有不触发 bug 条件的输入，修复后的功能产生与原始功能相同的结果。

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalComponent(input) = fixedComponent(input)
END FOR
```

**Testing Approach**: 推荐使用基于属性的测试进行保留检查，因为：
- 它自动生成许多测试用例覆盖输入域
- 它捕获手动单元测试可能遗漏的边缘情况
- 它提供强有力的保证，确保所有非 bug 输入的行为不变

**Test Plan**: 首先在未修复的代码上观察现有功能的行为，然后编写基于属性的测试捕获该行为。

**Test Cases**:
1. **Hugo 配置保留测试**: 观察未修复代码上 Hugo 配置编辑和保存的行为，验证修复后行为相同
2. **CSS 编辑保留测试**: 观察未修复代码上 CSS 编辑和保存的行为，验证修复后行为相同
3. **文章基本信息保留测试**: 观察未修复代码上标题、内容、标签、分类的编辑和保存，验证修复后行为相同
4. **密码保护保留测试**: 观察未修复代码上密码保护功能，验证修复后行为相同
5. **快捷键保留测试**: 观察未修复代码上 Ctrl+S 快捷键，验证修复后行为相同
6. **确认对话框保留测试**: 观察未修复代码上未保存更改的确认对话框，验证修复后行为相同

### Unit Tests

- 测试 PaperModEditor 组件渲染和配置更改
- 测试 NeopostEditor 组件渲染和配置更改
- 测试 ArticleEditorSimple 中新字段的表单验证
- 测试 handlePublish 函数调用正确的 API
- 测试 ArticleService 正确处理新字段
- 测试 HugoIntegration 正确生成包含新字段的 frontmatter

### Property-Based Tests

- 生成随机样式配置，验证保存和加载功能正确
- 生成随机文章数据（包含新字段），验证创建和更新功能正确
- 生成随机日期时间，验证 DatePicker 正确处理各种日期格式
- 测试 slug 字段的各种输入（有效和无效），验证验证逻辑正确

### Integration Tests

- 测试完整的样式编辑流程：打开编辑器 -> 切换标签页 -> 编辑配置 -> 保存 -> 验证配置生效
- 测试完整的文章创建流程：创建文章 -> 填写所有字段（包括新字段）-> 保存 -> 发布 -> 验证 Hugo 文件正确生成
- 测试完整的文章编辑流程：加载文章 -> 修改字段（包括新字段）-> 保存 -> 验证更改生效
- 测试主题切换：在 Hugo 配置中切换主题 -> 验证对应的主题配置标签页可用
