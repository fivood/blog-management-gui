# Cloudflare Pages 配置修复指南

## 问题分析

你的 Cloudflare Pages 配置有以下问题：

### 问题 1: Deploy Command 错误
**当前:** `npx wrangler deploy`
**问题:** 这是 Cloudflare Workers 的命令，不是 Pages 的命令
**影响:** 导致构建失败

### 问题 2: Root Directory 为空
**当前:** (空)
**应该:** `blog`
**问题:** Cloudflare 不知道 Hugo 项目在哪个目录
**影响:** 无法找到 Hugo 配置文件

### 问题 3: Production Branch 错误
**当前:** `master`
**应该:** `main`
**问题:** GitHub 默认分支是 `main`，不是 `master`
**影响:** Cloudflare 可能无法检测到代码更新

---

## 修复步骤

### 步骤 1: 访问 Cloudflare Pages 设置

1. 登录 https://dash.cloudflare.com
2. 点击左侧 "Pages"
3. 点击 "blog" 项目
4. 点击 "Settings" 标签

### 步骤 2: 修复 Root Directory

**位置:** Build settings → Root directory

1. 找到 "Root directory" 字段
2. 点击输入框
3. 输入: `blog`
4. 点击 "Save"

**说明:** 这告诉 Cloudflare 你的 Hugo 项目在 `blog` 目录中

### 步骤 3: 修复 Production Branch

**位置:** Branch control → Production branch

1. 找到 "Production branch" 字段
2. 点击输入框
3. 清除当前值 `master`
4. 输入: `main`
5. 点击 "Save"

**说明:** GitHub 的默认分支是 `main`

### 步骤 4: 验证 Build Command

**位置:** Build settings → Build command

1. 确认 "Build command" 是: `hugo --minify`
2. 如果不同，改为: `hugo --minify`
3. 点击 "Save"

### 步骤 5: 验证 Build Output Directory

**位置:** Build settings → Build output directory

1. 确认 "Build output directory" 是: `public`
2. 如果不同，改为: `public`
3. 点击 "Save"

**说明:** Hugo 生成的文件在 `blog/public` 目录中

### 步骤 6: 设置环境变量

**位置:** Variables and secrets

1. 找到 "Variables and secrets" 部分
2. 点击 "Add variable" 或 "+" 按钮
3. 添加以下变量：

**变量 1: HUGO_VERSION**
- **名称:** `HUGO_VERSION`
- **值:** `0.120.0`
- **环境:** Production
- 点击 "Save"

**变量 2: HUGO_ENV (可选)**
- **名称:** `HUGO_ENV`
- **值:** `production`
- **环境:** Production
- 点击 "Save"

### 步骤 7: 清除构建缓存

**位置:** Build cache

1. 找到 "Build cache" 部分
2. 点击 "Clear Cache" 按钮
3. 确认清除缓存

**说明:** 清除缓存确保使用最新的配置

### 步骤 8: 触发新的构建

1. 点击 "Deployments" 标签
2. 点击 "Trigger build" 或 "Redeploy" 按钮
3. 等待构建完成

---

## 完整配置检查清单

修复后，你的配置应该如下所示：

```
Git repository: fivood/blog
Build configuration:
  Build command: hugo --minify
  Deploy command: (应该是空的或自动)
  Version command: (应该是空的或自动)
  Root directory: blog

Branch control:
  Production branch: main
  Builds for non-production branches: Enabled

Build watch paths:
  Include paths: *

Variables and secrets:
  HUGO_VERSION: 0.120.0
  HUGO_ENV: production (可选)

Build cache: Enabled
```

---

## 修复前后对比

### 修复前 (错误)
```
Build command: hugo --minify ✓
Deploy command: npx wrangler deploy ✗ (错误)
Root directory: (空) ✗ (错误)
Production branch: master ✗ (错误)
Variables: None ✗ (缺少)
```

### 修复后 (正确)
```
Build command: hugo --minify ✓
Deploy command: (自动) ✓
Root directory: blog ✓
Production branch: main ✓
Variables: HUGO_VERSION=0.120.0 ✓
```

---

## 预期构建输出

修复后，构建应该显示：

```
Cloning repository...
Installing dependencies...
Running build command: hugo --minify
Building site...
Deployment complete!
```

---

## 如果构建仍然失败

### 检查 1: 验证 GitHub 分支

```bash
# 检查你的 GitHub 仓库默认分支
git branch -a
```

如果默认分支不是 `main`，需要：
1. 在 GitHub 上更改默认分支为 `main`
2. 或在 Cloudflare 中改为正确的分支名称

### 检查 2: 验证 blog 目录结构

```bash
# 检查 blog 目录是否存在
ls -la blog/

# 应该看到:
# - hugo.toml (Hugo 配置文件)
# - content/ (内容目录)
# - themes/ (主题目录)
# - config/ (配置目录)
```

### 检查 3: 验证 Hugo 配置

```bash
# 检查 hugo.toml 是否有效
cd blog
hugo config
```

### 检查 4: 验证主题文件

```bash
# 检查 PaperMod 主题是否存在
ls -la blog/themes/hugo-PaperMod/

# 应该看到主题文件
```

### 检查 5: 查看详细构建日志

1. 在 Cloudflare Pages 中点击失败的部署
2. 查看完整的构建日志
3. 查找具体的错误信息
4. 根据错误信息进行调整

---

## 常见错误和解决方案

| 错误 | 原因 | 解决方案 |
|------|------|--------|
| `hugo: command not found` | Hugo 版本未指定 | 设置 `HUGO_VERSION` 环境变量 |
| `config file not found` | Root directory 错误 | 改为 `blog` |
| `theme not found` | 主题目录缺失 | 验证 `blog/themes/hugo-PaperMod/` 存在 |
| `branch not found` | Production branch 错误 | 改为 `main` |
| `deploy command failed` | Deploy command 错误 | 清除或改为正确的命令 |

---

## 下一步

修复配置后：

1. **验证构建成功**
   - 检查 Deployments 标签
   - 确认构建状态为 "Success"
   - 点击临时 URL 验证网站可访问

2. **继续 Task 18**
   - 设置 Cloudflare DNS 记录
   - 将 fivood.com 指向 Cloudflare Pages

3. **继续 Task 19-20**
   - 启用 HTTPS/SSL
   - 验证域名可访问性

---

## 快速参考

### 需要修改的字段

| 字段 | 当前值 | 新值 |
|------|--------|------|
| Root directory | (空) | `blog` |
| Production branch | `master` | `main` |
| Build command | `hugo --minify` | `hugo --minify` (保持不变) |
| Build output directory | `public` | `public` (保持不变) |
| HUGO_VERSION | (无) | `0.120.0` |

### 需要删除或清除的字段

| 字段 | 当前值 | 操作 |
|------|--------|------|
| Deploy command | `npx wrangler deploy` | 清除或留空 |
| Version command | `npx wrangler versions upload` | 清除或留空 |

---

## 验证清单

完成修复后，检查以下项目：

- [ ] Root directory 设置为 `blog`
- [ ] Production branch 设置为 `main`
- [ ] Build command 是 `hugo --minify`
- [ ] Build output directory 是 `public`
- [ ] HUGO_VERSION 环境变量已设置
- [ ] Deploy command 已清除或为空
- [ ] Build cache 已清除
- [ ] 新的构建已触发
- [ ] 构建状态显示 "Success"
- [ ] 临时 URL 可访问
- [ ] 博客内容正确显示

