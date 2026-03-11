# Cloudflare Pages 最终修复方案

## 问题原因

Root directory 设置为 `blog` 后失败，因为 Cloudflare 不能正确处理子目录。

## 解决方案

需要修改三个字段来处理子目录中的 Hugo 项目：

---

## 修复步骤 (5 分钟)

### 1️⃣ 清除 Root Directory

**位置:** Settings → Build settings → Root directory

1. 点击 Root directory 字段
2. **完全删除** "blog" (留空)
3. 点击 Save

---

### 2️⃣ 修改 Build Command

**位置:** Settings → Build settings → Build command

1. 点击 Build command 字段
2. 清除当前值: `hugo --minify`
3. 输入新值: `cd blog && hugo --minify`
4. 点击 Save

**说明:** 这告诉 Cloudflare 先进入 blog 目录，再运行 Hugo

---

### 3️⃣ 修改 Build Output Directory

**位置:** Settings → Build settings → Build output directory

1. 点击 Build output directory 字段
2. 清除当前值: `public`
3. 输入新值: `blog/public`
4. 点击 Save

**说明:** 这告诉 Cloudflare 在 blog/public 目录中查找生成的文件

---

### 4️⃣ 修改 Deploy Command

**位置:** Settings → Build configuration → Deploy command

1. 点击 Deploy command 字段
2. 清除当前值: `npx wrangler deploy`
3. 输入新值: `echo "Deploy complete"`
4. 点击 Save

---

### 5️⃣ 添加环境变量

**位置:** Settings → Variables and secrets

1. 点击 "Add variable"
2. 名称: `HUGO_VERSION`
3. 值: `0.120.0`
4. 环境: Production
5. 点击 Save

---

### 6️⃣ 清除缓存并重新构建

1. 找到 Build cache → 点击 "Clear Cache"
2. 点击 "Deployments" 标签
3. 点击 "Trigger build"
4. 等待构建完成

---

## 完整配置对比

### 修复前 (错误)
```
Build command: hugo --minify
Build output directory: public
Root directory: blog ✗ (导致失败)
Deploy command: npx wrangler deploy
```

### 修复后 (正确)
```
Build command: cd blog && hugo --minify ✓
Build output directory: blog/public ✓
Root directory: (空) ✓
Deploy command: echo "Deploy complete" ✓
HUGO_VERSION: 0.120.0 ✓
```

---

## 预期结果

修复后，构建应该显示：

```
Cloning repository...
Installing dependencies...
Running build command: cd blog && hugo --minify
Building site...
Running deploy command: echo "Deploy complete"
Deployment complete!
Status: Success ✓
```

---

## 验证清单

完成修复后，检查以下项目：

- [ ] Root directory: 空 (已清除)
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

## 如果仍然失败

### 检查 1: 验证本地构建

```bash
cd blog
hugo --minify
# 应该成功生成 public/ 目录
```

### 检查 2: 查看详细日志

1. Cloudflare Pages → Deployments
2. 点击失败的部署
3. 查看完整的构建日志
4. 查找具体的错误信息

### 检查 3: 验证 Hugo 配置

```bash
cd blog
hugo config
# 应该显示配置信息，无错误
```

---

## 下一步

修复完成并构建成功后:

1. ✅ Task 15 完成
2. ➡️ Task 18: 设置 DNS 记录
3. ➡️ Task 19: 启用 HTTPS
4. ➡️ Task 20: 验证域名

