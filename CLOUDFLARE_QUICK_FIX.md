# Cloudflare Pages 快速修复清单

## 三个关键问题

### ❌ 问题 1: Root Directory 为空
**修复:** 设置为 `blog`

### ❌ 问题 2: Production Branch 是 `master`
**修复:** 改为 `main`

### ❌ 问题 3: Deploy Command 是 `npx wrangler deploy`
**修复:** 清除或留空（Pages 会自动处理）

---

## 修复步骤 (5 分钟)

### 1️⃣ 打开 Cloudflare Pages 设置
- 访问 https://dash.cloudflare.com
- Pages → blog → Settings

### 2️⃣ 修改 Root Directory
- 找到: Build settings → Root directory
- 输入: `blog`
- 点击: Save

### 3️⃣ 修改 Production Branch
- 找到: Branch control → Production branch
- 改为: `main`
- 点击: Save

### 4️⃣ 清除 Deploy Command
- 找到: Build configuration → Deploy command
- 清除内容 (留空)
- 点击: Save

### 5️⃣ 添加环境变量
- 找到: Variables and secrets
- 点击: Add variable
- 名称: `HUGO_VERSION`
- 值: `0.120.0`
- 点击: Save

### 6️⃣ 清除缓存并重新构建
- 找到: Build cache → Clear Cache
- 点击: Deployments → Trigger build
- 等待构建完成

---

## 验证

构建完成后应该看到:
- ✅ Status: Success (绿色)
- ✅ 临时 URL 可访问
- ✅ 博客内容正确显示

---

## 如果仍然失败

检查以下内容:

1. **GitHub 分支**
   ```bash
   git branch -a
   # 确认默认分支是 main
   ```

2. **blog 目录结构**
   ```bash
   ls -la blog/
   # 应该看到: hugo.toml, content/, themes/, config/
   ```

3. **Hugo 配置**
   ```bash
   cd blog && hugo config
   # 应该显示配置信息，无错误
   ```

4. **查看构建日志**
   - Cloudflare Pages → Deployments
   - 点击失败的部署
   - 查看完整日志找出具体错误

---

## 完成后

修复完成并构建成功后:
1. ✅ Task 15 完成
2. ➡️ 继续 Task 18: 设置 DNS 记录
3. ➡️ 继续 Task 19: 启用 HTTPS
4. ➡️ 继续 Task 20: 验证域名

