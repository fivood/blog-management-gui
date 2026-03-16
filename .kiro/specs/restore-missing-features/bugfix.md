# Bugfix Requirements Document

## Introduction

本文档描述博客管理工具中丢失功能的修复需求。在最近的代码更新中，两个关键组件（StyleEditorView 和 ArticleEditorSimple）丢失了重要功能，导致用户无法访问主题配置选项和文章编辑的完整功能。本次修复将恢复这些丢失的功能。

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 用户打开样式编辑器（StyleEditorView.tsx）THEN 系统只显示 2 个标签页（"Hugo 配置" 和 "自定义 CSS"），缺失 PaperMod 和 Neopost 主题的单独配置标签页

1.2 WHEN 用户在文章编辑器（ArticleEditorSimple.tsx）中创建或编辑文章 THEN 系统不提供手动选择发布日期/时间的 DatePicker 组件

1.3 WHEN 用户在文章编辑器中编辑文章元数据 THEN 系统不显示作者字段（author field），尽管 Article 类型中包含 author 属性

1.4 WHEN 用户在文章编辑器中编辑文章元数据 THEN 系统不显示 URL 别名字段（slug field）

1.5 WHEN 用户在文章编辑器中完成文章编辑 THEN 系统只提供"保存"和"取消"按钮，缺少单独的"发布"按钮用于将草稿状态的文章发布

1.6 WHEN 用户查看 ConfigEditor.tsx THEN 系统将 PaperMod 主题参数混合在 Hugo 配置中，而不是作为独立的主题配置标签页

### Expected Behavior (Correct)

2.1 WHEN 用户打开样式编辑器（StyleEditorView.tsx）THEN 系统 SHALL 显示 4 个标签页："Hugo 配置"、"自定义 CSS"、"PaperMod 主题"、"Neopost 主题"

2.2 WHEN 用户在文章编辑器（ArticleEditorSimple.tsx）中创建或编辑文章 THEN 系统 SHALL 提供 DatePicker 组件允许用户手动选择发布日期和时间

2.3 WHEN 用户在文章编辑器中编辑文章元数据 THEN 系统 SHALL 显示作者字段（author field）供用户输入，该字段应与 Article 类型的 author 属性对应

2.4 WHEN 用户在文章编辑器中编辑文章元数据 THEN 系统 SHALL 显示 URL 别名字段（slug field）供用户自定义文章 URL

2.5 WHEN 用户在文章编辑器中完成文章编辑 THEN 系统 SHALL 提供"保存"、"发布"和"取消"三个按钮，其中"发布"按钮用于调用 publishArticle API 将草稿状态的文章发布

2.6 WHEN 用户在样式编辑器中选择 PaperMod 主题标签页 THEN 系统 SHALL 显示 PaperMod 主题的专属配置选项（从 ConfigEditor 中分离出来）

2.7 WHEN 用户在样式编辑器中选择 Neopost 主题标签页 THEN 系统 SHALL 显示 Neopost 主题的专属配置选项

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 用户在样式编辑器中编辑 Hugo 配置 THEN 系统 SHALL CONTINUE TO 正常保存和应用配置更改

3.2 WHEN 用户在样式编辑器中编辑自定义 CSS THEN 系统 SHALL CONTINUE TO 正常保存和应用 CSS 样式

3.3 WHEN 用户在文章编辑器中输入标题和内容 THEN 系统 SHALL CONTINUE TO 正常保存文章的基本信息

3.4 WHEN 用户在文章编辑器中添加标签和分类 THEN 系统 SHALL CONTINUE TO 正常保存标签和分类信息

3.5 WHEN 用户在文章编辑器中启用密码保护 THEN 系统 SHALL CONTINUE TO 正常加密和保护文章内容

3.6 WHEN 用户使用 Ctrl+S 快捷键保存文章 THEN 系统 SHALL CONTINUE TO 响应快捷键并保存文章

3.7 WHEN 用户在有未保存更改时点击取消 THEN 系统 SHALL CONTINUE TO 显示确认对话框防止数据丢失

3.8 WHEN 用户导出、导入或重置样式配置 THEN 系统 SHALL CONTINUE TO 正常执行这些操作

3.9 WHEN 用户查看样式历史记录 THEN 系统 SHALL CONTINUE TO 正常显示历史版本并支持恢复

3.10 WHEN 用户在设置中配置 Cloudflare API Token、Account ID 和 Project Name THEN 系统 SHALL CONTINUE TO 正常保存和验证凭据

3.11 WHEN 用户在文章列表中按创建时间或修改时间排序 THEN 系统 SHALL CONTINUE TO 正常排序显示文章

3.12 WHEN 用户在设置中配置 Hugo 项目路径 THEN 系统 SHALL CONTINUE TO 正常加载和保存项目路径
