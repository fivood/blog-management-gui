# 可修改密码提示字段功能说明

## 功能概述

用户在编辑博客文章时，如果启用密码保护，现在可以为每篇文章设置一个自定义的密码提示（`passwordHint`）。读者访问受保护的文章时，会在密码输入框中看到这个提示。

## 功能流程

### 1. 编辑器界面
当用户在文章编辑器中启用"密码保护"开关时：

```
✓ 密码保护  [已启用]
    ┌─────────────────────────────────┐
    │ 密码                            │
    │ [password input field]          │ ← 显示 placeholder：密码提示中的文本
    │                                 │
    │ 密码提示                        │
    │ [text input field]              │ ← 可编辑的提示文本
    │ 用户在输入密码框中看到的提示   │
    │ 如：文章标题拼音首字母、......  │
    └─────────────────────────────────┘
```

### 2. 用户交互

- **密码字段**: 输入文章的密码（最少 2 个字符）
- **密码提示字段**: 输入提示文本（最多 100 个字符，可选）
  - 如果留空，默认显示 "请输入文章密码（至少2个字符）"
  - 当修改提示时，密码字段的 placeholder 会实时更新

### 3. 数据保存流程

```
用户编辑 → 点击保存
  ↓
前端验证 (ArticleEditor/ArticleEditorSimple)
  ↓
发送 IPC 消息 (article:create 或 article:update)
  ↓
主进程 ArticleService 处理
  ├─ 保存 password（已加密）
  ├─ 保存 passwordHash（SHA-256）
  └─ 保存 passwordHint（明文）
  ↓
HugoIntegration 生成前置数据 (frontmatter)
  ├─ protected: true/false
  ├─ passwordHash: [hash]
  └─ passwordHint: "用户的提示文本"
  ↓
Hugo 模板渲染
  ↓
生成 HTML 文件
```

### 4. 前端展示

Hugo 模板 (`layouts/blog/single.html`) 中：

```html
{{- $passwordHint := "默认提示" -}}
{{- with .passwordHint -}}
  {{- $passwordHint = . -}}
{{- end -}}

<input id="protected-password" 
       type="password" 
       placeholder="{{ $passwordHint }}" />
```

### 5. 读者体验

受保护的文章页面显示：

```
┌─────────────────────────────────────┐
│ 这篇文章已加密                      │
│ 请输入本篇文章独立密码后解锁正文。 │
│                                     │
│ 文章密码                            │
│ [password input with hint]          │  ← 显示提示文本
│    🔒 显示                          │
│ [解锁文章]                          │
└─────────────────────────────────────┘
```

## 实现细节

### 修改的文件

1. **类型定义** (`src/shared/types/article.ts` / `src/types/index.ts`)
   - 添加 `passwordHint?: string` 字段到 `Article` 接口
   - 添加 `passwordHint?: string` 字段到 `CreateArticleData` 接口
   - 添加 `passwordHint?: string` 字段到 `ArticleUpdate` 接口

2. **编辑器组件**
   - `blog-management-gui/src/renderer/components/ArticleEditor.tsx`
   - `blog-management-gui/src/renderer/components/ArticleEditorSimple.tsx`
   - 添加密码提示输入框
   - 实时更新密码字段的 placeholder

3. **后端服务** (`blog-management-gui/src/main/services/ArticleService.ts`)
   - 创建文章时保存 `passwordHint`
   - 更新文章时允许修改 `passwordHint`
   - 禁用密码保护时清除 `passwordHint`

4. **Hugo 集成** (`src/integrations/HugoIntegration.ts`)
   - 在生成 frontmatter 时包含 `passwordHint`
   - 从 frontmatter 解析时恢复 `passwordHint`

## 数据存储

### Frontmatter 格式

```yaml
---
title: 文章标题
date: 2024-03-16
protected: true
passwordHash: "abc123def456..."
passwordHint: "文章标题拼音首字母"
---

文章内容...
```

### 禁用保护时

```yaml
---
title: 文章标题
protected: false
# passwordHash 和 passwordHint 都被移除
---
```

## 验证规则

- **密码最小长度**: 2 个字符
- **密码提示最大长度**: 100 个字符
- **是否必填**: 密码必填，提示可选
- **是否加密**: 密码已加密，提示为明文（用户可见）

## 安全说明

⚠️ **重要**: 密码提示是明文的，对阅读者可见。请不要在提示中包含真实密码或敏感信息。

推荐的提示示例：
- ✅ "文章标题拼音首字母小写"
- ✅ "本文发布日期（YYYYMMDD）"
- ✅ "一个非显而易见的词语"
- ❌ "123456"（太容易破解）
- ❌ "password123"（不应该透露密码）

