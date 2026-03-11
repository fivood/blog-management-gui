# Cloudflare Pages 正确配置

## 重要发现

`blog` 目录是一个**独立的 Git 仓库**，推送到 `https://github.com/fivood/blog.git`

### GitHub 仓库结构

**仓库 URL:** https://github.com/fivood/blog

**文件结构:**
```
https://github.com/fivood/blog (仓库根目录)
├── hugo.toml                    ← Hugo 配置在根目录
├── content/
│   ├── posts/
│   └── pages/
├── themes/
│   └── hugo-PaperMod/
├── layouts/
│   └── partials/
│       └── google_analytics.html
├── config/
│   └── menus.toml
├── dev-server.sh
├── dev-server.bat
└── ...
```

**不是这样的:**
```
https://github.com/fivood/blog
└── blog/                        ← 没有这个子目录
    ├── hugo.toml
    └── ...
```

---

## 正确的 Cloudflare Pages 配置

由于 Hugo 项目在 GitHub 仓库的**根目录**，配置应该是：

### Build Settings

| 设置项 | 值 | 说明 |
|--------|-----|------|
| **Build command** | `hugo --minify` | 直接运行 Hugo（不需要 cd） |
| **Build output directory** | `public` | Hugo 输出目录 |
| **Root directory** | (空) | 项目在仓库根目录 |

### Build Configuration

| 设置项 | 值 | 说明 |
|--------|-----|------|
| **Deploy command** | `echo "Deploy complete"` | 简单的占位命令 |
| **Production branch** | `master` | 生产分支 |

### Environment Variables

| 变量名 | 值 | 说明 |
|--------|-----|------|
| **HUGO_VERSION** | `0.146.0` | Hugo 版本 |

---

## 修复步骤

### 步骤 1: 修改 Build Command

**位置:** Settings → Build settings → Build command

**当前值 (错误):**
```
cd blog && hugo --minify
```

**改为 (正确):**
```
hugo --minify
```

**原因:** Hugo 项目在仓库根目录，不需要 `cd blog`

---

### 步骤 2: 修改 Build Output Directory

**位置:** Settings → Build settings → Build output directory

**当前值 (错误):**
```
blog/public
```

**改为 (正确):**
```
public
```

**原因:** Hugo 生成的文件在根目录的 `public/` 目录

---

### 步骤 3: 确认 Root Directory 为空

**位置:** Settings → Build settings → Root directory

**值:**
```
(空)
```

**原因:** Hugo 项目在仓库根目录

---

### 步骤 4: 设置 HUGO_VERSION

**位置:** Settings → Variables and secrets

**添加环境变量:**
- **名称:** `HUGO_VERSION`
- **值:** `0.146.0`
- **环境:** Production

---

### 步骤 5: 清除缓存并重新构建

1. **清除缓存:** Settings → Build cache → Clear Cache
2. **触发构建:** Deployments → Trigger build
3. **等待构建完成**

---

## 完整配置对比

### 错误配置 (之前)
```
Build command: cd blog && hugo --minify  ✗
Build output directory: blog/public      ✗
Root directory: (空)                     ✓
Deploy command: echo "Deploy complete"   ✓
HUGO_VERSION: 0.146.0                    ✓
```

### 正确配置 (现在)
```
Build command: hugo --minify             ✓
Build output directory: public           ✓
Root directory: (空)                     ✓
Deploy command: echo "Deploy complete"   ✓
HUGO_VERSION: 0.146.0                    ✓
```

---

## 预期构建输出

修复后，构建应该显示：

```
Cloning repository...
Installing dependencies...
Running build command: hugo --minify
Building site...
Total in XXX ms
Running deploy command: echo "Deploy complete"
Deployment complete!
Status: Success ✓
```

---

## 为什么之前的配置错误

### 问题 1: `cd blog` 命令
- **错误:** `cd blog && hugo --minify`
- **原因:** GitHub 仓库根目录就是 Hugo 项目，没有 `blog` 子目录
- **结果:** Cloudflare 找不到 `blog` 目录，构建失败

### 问题 2: `blog/public` 输出目录
- **错误:** `blog/public`
- **原因:** Hugo 生成的文件在根目录的 `public/`，不是 `blog/public/`
- **结果:** Cloudflare 找不到输出文件，部署失败

---

## 验证清单

完成修复后，检查以下项目：

- [ ] Build command: `hugo --minify`
- [ ] Build output directory: `public`
- [ ] Root directory: (空)
- [ ] Deploy command: `echo "Deploy complete"`
- [ ] HUGO_VERSION: `0.146.0`
- [ ] Build cache: 已清除
- [ ] 新的构建已触发
- [ ] 构建状态显示 "Success"
- [ ] 临时 URL 可访问
- [ ] 博客内容正确显示

---

## 下一步

修复完成并构建成功后:

1. ✅ Task 15 完成
2. ➡️ Task 18: 设置 DNS 记录
3. ➡️ Task 19: 启用 HTTPS
4. ➡️ Task 20: 验证域名

