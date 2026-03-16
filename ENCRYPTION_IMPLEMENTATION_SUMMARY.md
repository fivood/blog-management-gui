# 项目加密方案总结

## 项目中的加密方式

项目共有 **3 种** 加密方式：

### 1. **AES-256-GCM + PBKDF2** ⭐ 最佳选择
- **位置**: `src/services/SecurityService.ts`
- **用途**: 文章内容加密
- **特点**:
  - 使用 PBKDF2 进行密钥派生（210,000 次迭代）
  - 使用 AES-256-GCM 进行加密（256位密钥）
  - 提供认证标签保护
  - 包含随机 IV 和 Salt
  - 安全性最高
- **输出格式**:
  ```json
  {
    "v": 1,
    "alg": "AES-256-GCM",
    "kdf": "PBKDF2",
    "digest": "sha256",
    "iterations": 210000,
    "salt": "base64_encoded",
    "iv": "base64_encoded",
    "tag": "base64_encoded",
    "data": "base64_encoded"
  }
  ```

### 2. **SHA-256 哈希**
- **位置**: `src/services/SecurityService.ts` - `hashPassword()` 方法
- **用途**: 快速客户端验证
- **特点**: 单向哈希，不可逆

### 3. **Bcrypt** (成本因子 12)
- **位置**: `src/PasswordProtector.ts`
- **用途**: 密码哈希存储
- **特点**: 自适应算法，包含 salt

---

## 更新项目内容

### ✅ 已实施的更改

#### 1. ArticleEditor 组件 (`blog-management-gui/src/renderer/components/ArticleEditor.tsx`)
- **更改内容**:
  - 密码最小长度: `4` → `2` 字符
  - 添加了加密方案说明
  - 添加了帮助文本和提示

- **代码更新**:
  ```tsx
  <Form.Item
    label="密码"
    name="password"
    rules={[
      { required: true, message: '请输入密码' },
      { min: 2, message: '密码至少2个字符' }
    ]}
    help="使用 AES-256-GCM 加密算法（采用 PBKDF2 密钥派生）。建议使用复杂密码以提高安全性。"
    tooltip="该密码将使用最强的加密标准保护，包含 210000 次迭代的密钥派生和认证标签保护。"
  >
    <Input.Password 
      placeholder="请输入文章密码（至少2个字符）"
      disabled={loading || isSaving}
    />
  </Form.Item>
  ```

#### 2. ArticleEditorSimple 组件 (`blog-management-gui/src/renderer/components/ArticleEditorSimple.tsx`)
- **更改内容**: 与 ArticleEditor 相同的更新
  - 密码最小长度: `4` → `2` 字符
  - 添加了加密方案说明
  - 添加了帮助文本和提示

---

## 加密工作流

### 文章编辑时:
1. 用户在编辑器中启用"密码保护"
2. 输入至少2个字符的密码
3. 系统使用 **AES-256-GCM** 加密文章内容
4. 加密数据与密码哈希一起保存

### 文章发布时:
1. 加密的内容包含在 HTML 中
2. 用户访问时浏览器显示密码输入框
3. 用户输入密码进行解密
4. 使用相同的 PBKDF2 + AES-256-GCM 参数完成解密

---

## 安全特性

✅ **PBKDF2 密钥派生**
- 迭代次数: 210,000 (2024 标准)
- 哈希算法: SHA-256
- 盐长度: 16 字节 (128 bits)

✅ **AES-256-GCM 加密**
- 密钥长度: 256 bits
- IV 长度: 12 字节 (96 bits)
- 认证标签: 128 bits
- 保证数据完整性和真实性

✅ **每次加密不同**
- 随机 IV 和 Salt
- 相同密码产生不同密文

---

## 相关文件

- **安全服务**: `src/services/SecurityService.ts`
- **密码保护器**: `src/PasswordProtector.ts`
- **编辑器组件**: `blog-management-gui/src/renderer/components/ArticleEditor.tsx`
- **简易编辑器**: `blog-management-gui/src/renderer/components/ArticleEditorSimple.tsx`
- **测试用例**: `tests/SecurityService.test.ts`

---

## 建议

1. ✅ **已采纳**: 使用 AES-256-GCM 作为最佳加密方案
2. ✅ **已采纳**: 密码最小长度设为 2 字符，提供用户友好性
3. 💡 **建议**: 在生产环境中考虑使用密钥管理服务 (KMS)
4. 💡 **建议**: 定期轮换加密参数（PBKDF2 迭代次数）
5. 💡 **建议**: 实现密码强度指示器

