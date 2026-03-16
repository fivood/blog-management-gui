# 实现计划

- [~] 1. 编写 bug condition 探索测试
  - **Property 1: Bug Condition** - 丢失功能检测
  - **关键**: 此测试必须在未修复的代码上失败 - 失败确认 bug 存在
  - **不要尝试修复测试或代码当它失败时**
  - **注意**: 此测试编码了期望的行为 - 它将在实现后通过时验证修复
  - **目标**: 展示证明 bug 存在的反例
  - **作用域 PBT 方法**: 对于确定性 bug，将属性作用域限定为具体的失败案例以确保可重现性
  - 测试实现细节来自设计中的 Bug Condition
  - 测试断言应匹配设计中的 Expected Behavior Properties
  - 在未修复的代码上运行测试
  - **预期结果**: 测试失败（这是正确的 - 它证明 bug 存在）
  - 记录发现的反例以理解根本原因
  - 当测试被编写、运行并记录失败时标记任务完成
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [~] 2. 编写保留属性测试（在实现修复之前）
  - **Property 2: Preservation** - 现有功能不受影响
  - **重要**: 遵循观察优先方法
  - 在未修复的代码上观察非 bug 输入的行为
  - 编写基于属性的测试捕获来自 Preservation Requirements 的观察行为模式
  - 基于属性的测试生成许多测试用例以获得更强的保证
  - 在未修复的代码上运行测试
  - **预期结果**: 测试通过（这确认了要保留的基线行为）
  - 当测试被编写、在未修复代码上运行并通过时标记任务完成
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12_

- [x] 3. 恢复丢失功能的修复

  - [x] 3.1 更新类型定义
    - 在 `blog-management-gui/src/shared/types/article.ts` 中添加 slug 字段到 Article 接口
    - 在 CreateArticleData 接口中添加 author、publishedAt 和 slug 字段
    - 在 ArticleUpdate 接口中添加 author、publishedAt 和 slug 字段
    - _Bug_Condition: isBugCondition(input) where input.action == 'editArticle' AND NOT hasSlugField(input.editor)_
    - _Expected_Behavior: 用户可以在文章编辑器中输入和保存 slug、author 和 publishedAt 字段_
    - _Preservation: 现有的 Article 类型字段（title、content、tags、categories 等）保持不变_
    - _Requirements: 1.3, 1.4, 2.3, 2.4_

  - [x] 3.2 创建 PaperModEditor 组件
    - 创建新文件 `blog-management-gui/src/renderer/components/styles/PaperModEditor.tsx`
    - 从 ConfigEditor 中提取 PaperMod 相关配置选项
    - 添加 PaperMod 主题特有的配置字段（ShowReadingTime、ShowShareButtons、ShowPostNavLinks 等）
    - 使用 Ant Design 的 Card 和 Form 组件保持 UI 一致性
    - _Bug_Condition: isBugCondition(input) where input.action == 'openStyleEditor' AND NOT hasThemeTabs(input.view)_
    - _Expected_Behavior: 用户可以在独立的 PaperMod 标签页中编辑 PaperMod 主题配置_
    - _Preservation: 现有的 ConfigEditor 功能保持不变_
    - _Requirements: 1.1, 1.6, 2.1, 2.6_

  - [x] 3.3 创建 NeopostEditor 组件
    - 创建新文件 `blog-management-gui/src/renderer/components/styles/NeopostEditor.tsx`
    - 添加 Neopost 主题特有的配置选项（bio、avatar、社交链接、主题颜色等）
    - 使用 Ant Design 的 Card 和 Form 组件保持 UI 一致性
    - _Bug_Condition: isBugCondition(input) where input.action == 'openStyleEditor' AND NOT hasThemeTabs(input.view)_
    - _Expected_Behavior: 用户可以在独立的 Neopost 标签页中编辑 Neopost 主题配置_
    - _Preservation: 现有的 ConfigEditor 功能保持不变_
    - _Requirements: 1.1, 2.1, 2.7_

  - [x] 3.4 更新 StyleEditorView 添加主题标签页
    - 在 `blog-management-gui/src/renderer/components/styles/StyleEditorView.tsx` 中导入 PaperModEditor 和 NeopostEditor
    - 在 Tabs 组件中添加 "PaperMod 主题" 标签页
    - 在 Tabs 组件中添加 "Neopost 主题" 标签页
    - _Bug_Condition: isBugCondition(input) where input.action == 'openStyleEditor' AND NOT hasThemeTabs(input.view)_
    - _Expected_Behavior: 样式编辑器显示 4 个标签页（Hugo 配置、自定义 CSS、PaperMod 主题、Neopost 主题）_
    - _Preservation: 现有的 Hugo 配置和自定义 CSS 标签页功能保持不变_
    - _Requirements: 1.1, 2.1, 2.6, 2.7_

  - [x] 3.5 更新 ArticleEditorSimple 添加新字段
    - 在标题和分类之间添加 DatePicker 组件用于 publishedAt 字段
    - 在分类和标签之间添加 Input 组件用于 author 字段
    - 在标签和内容之间添加 Input 组件用于 slug 字段
    - 添加 slug 字段的验证逻辑（只能包含小写字母、数字和连字符）
    - 更新 handleSave 逻辑以包含新字段
    - _Bug_Condition: isBugCondition(input) where (input.action == 'editArticle' AND NOT hasDatePicker(input.editor)) OR (NOT hasAuthorField(input.editor)) OR (NOT hasSlugField(input.editor))_
    - _Expected_Behavior: 文章编辑器显示日期选择器、作者字段和 slug 字段，用户可以输入和保存这些值_
    - _Preservation: 现有的标题、内容、标签、分类、密码保护功能保持不变_
    - _Requirements: 1.2, 1.3, 1.4, 2.2, 2.3, 2.4_

  - [x] 3.6 添加发布按钮到 ArticleEditorSimple
    - 在保存按钮旁边添加发布按钮（使用 CheckOutlined 图标）
    - 实现 handlePublish 函数：先保存文章，然后调用 publishArticle API
    - 添加成功/失败通知
    - _Bug_Condition: isBugCondition(input) where input.action == 'finishEditing' AND NOT hasPublishButton(input.editor)_
    - _Expected_Behavior: 用户可以点击发布按钮直接将文章状态改为 published_
    - _Preservation: 现有的保存和取消按钮功能保持不变_
    - _Requirements: 1.5, 2.5_

  - [x] 3.7 更新 ArticleService 支持新字段
    - 在 `blog-management-gui/src/main/services/ArticleService.ts` 中更新 createArticle 方法
    - 从 data 参数中提取 author、publishedAt 和 slug 字段
    - 在调用 createDraft 时传递 author
    - 在创建后使用 modifyArticle 设置 publishedAt 和 slug
    - 更新 updateArticle 方法支持这些字段
    - 确保 generateHugoFile 调用传递新字段
    - _Bug_Condition: isBugCondition(input) where 用户保存包含新字段的文章但字段未被持久化_
    - _Expected_Behavior: ArticleService 正确处理和保存 author、publishedAt 和 slug 字段_
    - _Preservation: 现有的文章创建、更新、删除功能保持不变_
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 3.8 更新 ArticleManager 支持新字段
    - 在 `src/ArticleManager.ts` 中更新 createDraft 方法支持在创建时设置 publishedAt
    - 更新 modifyArticle 方法支持修改 author、publishedAt 和 slug
    - 确保 publishedAt 不会被意外覆盖
    - _Bug_Condition: isBugCondition(input) where ArticleManager 不支持新字段的存储和检索_
    - _Expected_Behavior: ArticleManager 正确存储和检索 author、publishedAt 和 slug 字段_
    - _Preservation: 现有的文章生命周期管理功能保持不变_
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 3.9 更新 HugoIntegration 生成包含新字段的文件
    - 在 `src/integrations/HugoIntegration.ts` 的 generateStaticFile 方法中添加 slug 字段到 frontmatter
    - 使用 publishedAt 作为 date 字段（如果存在）
    - 添加 author 字段到 frontmatter（如果存在）
    - _Bug_Condition: isBugCondition(input) where Hugo 文件不包含新字段导致功能丢失_
    - _Expected_Behavior: 生成的 Hugo 文件包含 slug、author 和正确的 date 字段_
    - _Preservation: 现有的 Hugo 文件生成功能（title、content、tags、categories、draft 等）保持不变_
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 3.10 验证 bug condition 探索测试现在通过
    - **Property 1: Expected Behavior** - 丢失功能已恢复
    - **重要**: 重新运行任务 1 中的相同测试 - 不要编写新测试
    - 任务 1 中的测试编码了期望的行为
    - 当此测试通过时，它确认期望的行为得到满足
    - 运行任务 1 中的 bug condition 探索测试
    - **预期结果**: 测试通过（确认 bug 已修复）
    - _Requirements: Expected Behavior Properties from design_

  - [x] 3.11 验证保留测试仍然通过
    - **Property 2: Preservation** - 现有功能不受影响
    - **重要**: 重新运行任务 2 中的相同测试 - 不要编写新测试
    - 运行任务 2 中的保留属性测试
    - **预期结果**: 测试通过（确认没有回归）
    - 确认修复后所有测试仍然通过（没有回归）

- [x] 4. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。
