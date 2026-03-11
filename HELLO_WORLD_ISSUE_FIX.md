# "Hello World" 问题修复指南

## 问题分析

访问 https://fivood.com 显示 "Hello World" 而不是 Hugo 博客。

### 可能的原因

1. **域名指向了错误的 Cloudflare Pages 项目**
2. **Cloudflare Pages 项目连接到了错误的 GitHub 仓库**
3. **有多个 Cloudflare Pages 项目，域名配置错误**
4. **DNS 记录指向了错误的目标**

---

## 诊断步骤

### 步骤 1: 检查 Cloudflare Pages 项目

1. 登录 https://dash.cloudflare.com
2. 点击 "Pages"
3. 查看所有项目列表

**检查项目:**
- 有多少个 Pages 项目？
- 哪个项目连接到 `fivood/blog` 仓库？
- 哪个项目配置了 `fivood.com` 域名？

### 步骤 2: 检查项目的 GitHub 连接

1. 点击 "blog" 项目（或你的 Hugo 项目）
2. 查看 "Settings" → "Build settings"
3. 确认 "Git repository" 是 `fivood/blog`

### 步骤 3: 检查自定义域名配置

1. 在 Pages 项目中，点击 "Custom domains"
2. 查看 `fivood.com` 是否添加到正确的项目
3. 检查域名状态是否为 "Active"

### 步骤 4: 检查最新部署

1. 点击 "Deployments" 标签
2. 查看最新的部署状态
3. 点击最新部署，查看部署的内容
4. 检查部署 URL（如 `blog.pages.dev`）是否显示正确的博客内容

---

## 修复方案

### 方案 A: 域名指向了错误的项目

**症状:** 有多个 Cloudflare Pages 项目，`fivood.com` 添加到了错误的项目

**修复步骤:**

1. **找到显示 "Hello World" 的项目**
   - 在 Pages 列表中，查看哪个项目配置了 `fivood.com`
   - 进入该项目 → Custom domains
   - 删除 `fivood.com` 域名

2. **将域名添加到正确的 Hugo 项目**
   - 进入 "blog" 项目（连接到 `fivood/blog` 仓库的项目）
   - 点击 "Custom domains"
   - 点击 "Set up a custom domain"
   - 输入: `fivood.com`
   - 点击 "Continue"
   - 按照提示完成配置

3. **等待 DNS 传播**
   - 等待 5-10 分钟
   - 刷新 https://fivood.com
   - 应该显示 Hugo 博客

---

### 方案 B: 项目连接到了错误的仓库

**症状:** Cloudflare Pages 项目连接到了错误的 GitHub 仓库

**修复步骤:**

1. **检查当前项目的 GitHub 连接**
   - Pages → blog → Settings
   - 查看 "Git repository"
   - 如果不是 `fivood/blog`，需要重新连接

2. **重新连接正确的仓库**
   - 删除当前项目（如果连接错误）
   - 创建新的 Pages 项目
   - 连接到 `fivood/blog` 仓库
   - 配置构建设置（见下方）

3. **配置构建设置**
   ```
   Build command: hugo --minify
   Build output directory: public
   Root directory: (空)
   HUGO_VERSION: 0.146.0
   ```

4. **添加自定义域名**
   - Custom domains → Set up a custom domain
   - 输入: `fivood.com`
   - 完成配置

---

### 方案 C: DNS 记录配置错误

**症状:** DNS 记录指向了错误的 Cloudflare Pages URL

**修复步骤:**

1. **检查 DNS 记录**
   - Cloudflare Dashboard → 选择 `fivood.com` 域名
   - 点击 "DNS" → "Records"
   - 查看 CNAME 记录

2. **找到正确的 Cloudflare Pages URL**
   - Pages → blog 项目
   - 查看项目 URL（如 `blog.pages.dev`）
   - 复制完整的 URL

3. **更新 DNS 记录**
   - 编辑 CNAME 记录（名称: `@` 或 `fivood.com`）
   - 目标改为正确的 Pages URL（如 `blog.pages.dev`）
   - 保存

4. **等待 DNS 传播**
   - 等待 5-10 分钟
   - 刷新 https://fivood.com

---

## 快速诊断命令

### 检查 DNS 记录

```bash
# Windows
nslookup fivood.com

# 查看 CNAME 记录
nslookup -type=CNAME fivood.com
```

### 检查 HTTP 响应

```bash
# 查看响应头
curl -I https://fivood.com

# 查看完整响应
curl https://fivood.com
```

---

## 验证步骤

### 1. 验证 Cloudflare Pages 项目

**检查项目列表:**
- 登录 Cloudflare Dashboard
- Pages → 查看所有项目
- 确认只有一个项目连接到 `fivood/blog`

**检查项目配置:**
- 项目名称: blog（或其他名称）
- Git repository: fivood/blog ✓
- Build command: hugo --minify ✓
- Build output directory: public ✓
- HUGO_VERSION: 0.146.0 ✓

### 2. 验证自定义域名

**检查域名配置:**
- Custom domains → 应该看到 `fivood.com`
- 状态: Active ✓
- 项目: 正确的 Hugo 项目 ✓

### 3. 验证最新部署

**检查部署内容:**
- Deployments → 点击最新部署
- 查看部署 URL（如 `blog.pages.dev`）
- 访问部署 URL，应该显示 Hugo 博客 ✓

### 4. 验证 DNS 记录

**检查 CNAME 记录:**
- DNS → Records
- 名称: @ 或 fivood.com
- 类型: CNAME
- 目标: 正确的 Pages URL ✓
- 代理状态: Proxied（橙色云） ✓

---

## 常见问题

### Q: 为什么会显示 "Hello World"？

**A:** 可能的原因：
1. 域名添加到了错误的 Cloudflare Pages 项目
2. 该项目是一个测试项目，只有一个简单的 index.html
3. DNS 记录指向了错误的目标

### Q: 如何找到正确的 Cloudflare Pages URL？

**A:** 
1. Pages → 点击你的 Hugo 项目
2. 在项目概览页面，查看 "Visit site" 链接
3. URL 格式通常是 `[project-name].pages.dev`

### Q: 如何确认部署的是 Hugo 博客？

**A:**
1. Pages → Deployments
2. 点击最新的部署
3. 点击 "Visit site" 或部署 URL
4. 应该看到 Hugo 博客内容，而不是 "Hello World"

### Q: 修复后多久生效？

**A:**
- DNS 更改: 5-30 分钟
- 域名配置更改: 立即生效
- 如果超过 1 小时仍未生效，清除浏览器缓存并重试

---

## 下一步

修复后，验证以下内容：

1. ✅ https://fivood.com 显示 Hugo 博客
2. ✅ 博客标题是 "Fivood Blog"
3. ✅ 可以看到文章列表
4. ✅ 可以访问文章页面
5. ✅ 主题样式正确显示
6. ✅ SSL 证书有效（浏览器显示锁图标）

完成后，Hugo 博客部署就完成了！

