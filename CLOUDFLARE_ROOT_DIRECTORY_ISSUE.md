# Cloudflare Pages Root Directory 问题分析

## 问题

设置 Root directory 为 `blog` 后，Cloudflare 报错：
```
Failed: root directory not found
```

## 原因分析

Cloudflare Pages 的 Root directory 设置有特殊要求：

### 问题 1: Root Directory 的含义
- **Root directory** 是指 Hugo 项目的根目录（包含 `hugo.toml` 的目录）
- 但 Cloudflare 期望的是相对于 Git 仓库根目录的路径
- 你的 GitHub 仓库结构是：
  ```
  fivood/blog (GitHub 仓库)
  ├── blog/ (Hugo 项目目录)
  │   ├── hugo.toml
  │   ├── content/
  │   ├── themes/
  │   └── ...
  ├── src/ (TypeScript 项目)
  ├── tests/
  └── ...
  ```

### 问题 2: Cloudflare 的期望
- Cloudflare 期望 Hugo 项目在仓库的根目录
- 或者需要特殊配置来处理子目录

---

## 解决方案

### 方案 A: 清除 Root Directory (推荐)

**步骤:**
1. 打开 Cloudflare Pages 设置
2. 找到 Root directory 字段
3. **清除内容** (留空)
4. 点击 Save

**原因:**
- 当 Root directory 为空时，Cloudflare 会在仓库根目录查找构建文件
- 但我们需要在 `blog` 子目录中构建

### 方案 B: 使用 wrangler.toml 配置

在仓库根目录创建 `wrangler.toml` 文件：

```toml
name = "blog"
type = "javascript"

[env.production]
routes = [
  { pattern = "fivood.com/*", zone_name = "fivood.com" }
]

[build]
command = "cd blog && hugo --minify"
cwd = "."
watch_paths = ["blog/**/*"]
```

### 方案 C: 创建构建脚本

在仓库根目录创建 `build.sh` 文件：

```bash
#!/bin/bash
cd blog
hugo --minify
```

然后在 Cloudflare 中设置：
- Build command: `bash build.sh`
- Build output directory: `blog/public`

---

## 推荐方案: 方案 A (清除 Root Directory)

### 步骤 1: 清除 Root Directory

1. 打开 https://dash.cloudflare.com
2. Pages → blog → Settings
3. 找到 Build settings → Root directory
4. **完全清除** (删除 "blog")
5. 点击 Save

### 步骤 2: 修改 Build Command

1. 找到 Build settings → Build command
2. 改为: `cd blog && hugo --minify`
3. 点击 Save

**说明:** 这告诉 Cloudflare 先进入 `blog` 目录，然后运行 Hugo

### 步骤 3: 修改 Build Output Directory

1. 找到 Build settings → Build output directory
2. 改为: `blog/public`
3. 点击 Save

**说明:** 这告诉 Cloudflare 在 `blog/public` 目录中查找生成的文件

### 步骤 4: 修改 Deploy Command

1. 找到 Build configuration → Deploy command
2. 改为: `echo "Deploy complete"`
3. 点击 Save

### 步骤 5: 添加环境变量

1. 找到 Variables and secrets
2. 添加: `HUGO_VERSION = 0.120.0`
3. 点击 Save

### 步骤 6: 清除缓存并重新构建

1. Build cache → Clear Cache
2. Deployments → Trigger build
3. 等待构建完成

---

## 完整配置 (方案 A)

修复后，你的配置应该如下所示：

```
Git repository: fivood/blog

Build configuration:
  Build command: cd blog && hugo --minify
  Deploy command: echo "Deploy complete"
  Version command: (空)
  Root directory: (空)

Branch control:
  Production branch: master
  Builds for non-production branches: Enabled

Build watch paths:
  Include paths: *

Variables and secrets:
  HUGO_VERSION: 0.120.0

Build cache: Enabled
```

---

## 预期构建输出

修复后，构建应该显示：

```
Cloning repository...
Installing dependencies...
Running build command: cd blog && hugo --minify
Building site...
Running deploy command: echo "Deploy complete"
Deployment complete!
```

---

## 如果仍然失败

### 检查 1: 验证 blog 目录在 GitHub

```bash
# 检查 blog 目录是否在 GitHub
git ls-tree -r HEAD | grep "blog/"

# 应该看到 blog 目录中的文件
```

### 检查 2: 验证 Hugo 配置

```bash
# 检查 hugo.toml 是否有效
cd blog
hugo config

# 应该显示配置信息，无错误
```

### 检查 3: 本地测试构建

```bash
# 在本地测试构建命令
cd blog
hugo --minify

# 应该成功生成 public/ 目录
```

### 检查 4: 查看详细构建日志

1. 在 Cloudflare Pages 中点击失败的部署
2. 查看完整的构建日志
3. 查找具体的错误信息

---

## 快速修复清单

- [ ] Root directory: 清除 (留空)
- [ ] Build command: `cd blog && hugo --minify`
- [ ] Build output directory: `blog/public`
- [ ] Deploy command: `echo "Deploy complete"`
- [ ] HUGO_VERSION: `0.120.0`
- [ ] Build cache: 已清除
- [ ] 新的构建已触发
- [ ] 构建状态显示 "Success"
- [ ] 临时 URL 可访问
- [ ] 博客内容正确显示

---

## 为什么这样做

1. **Root directory 为空**: Cloudflare 会在仓库根目录查找构建配置
2. **Build command 包含 cd**: 告诉 Cloudflare 进入 `blog` 子目录
3. **Build output directory 是 blog/public**: 告诉 Cloudflare 在哪里找到生成的文件

这样 Cloudflare 就能正确处理子目录中的 Hugo 项目。

