# Cloudflare 验证失败故障排查

## 常见问题和解决方案

### 1. Token 格式问题

**问题**: Token 复制时可能包含多余的空格或换行符

**检查方法**:
1. 打开开发者工具（F12）
2. 查看控制台日志
3. 找到 "Token length:" 和 "Token prefix:" 的输出

**解决方案**:
- 确保 Token 没有前后空格
- 确保 Token 是一个完整的字符串
- Token 通常是 40 个字符长度
- 格式类似: `abcdef1234567890abcdef1234567890abcdef12`

### 2. Token 权限不足

**问题**: Token 创建时没有选择正确的权限

**需要的权限**:
- ✅ **Cloudflare Pages:编辑** (必需)
- ✅ **帐户设置:读取** (推荐)

**解决方案**:
1. 登录 Cloudflare 控制台
2. 进入 "我的个人资料" > "API 令牌"
3. 找到你创建的 Token
4. 点击"编辑"检查权限
5. 确保包含 "Cloudflare Pages:编辑" 权限

### 3. Token 已过期或被撤销

**问题**: Token 创建后被删除或过期

**解决方案**:
1. 在 Cloudflare 控制台检查 Token 状态
2. 如果 Token 不存在，创建新的 Token
3. 重新复制并粘贴到应用中

### 4. 网络连接问题

**问题**: 无法连接到 Cloudflare API

**检查方法**:
- 查看控制台是否有 "ENOTFOUND" 或 "ETIMEDOUT" 错误
- 尝试在浏览器访问 https://api.cloudflare.com

**解决方案**:
- 检查网络连接
- 检查防火墙设置
- 检查代理设置
- 尝试关闭 VPN

### 5. Account ID 或 Project Name 错误

**问题**: 虽然 Token 验证只需要 Token 本身，但如果配置错误可能影响后续部署

**检查方法**:
1. 登录 Cloudflare 控制台
2. 进入 "Workers & Pages"
3. 找到你的 Pages 项目

**Account ID 位置**:
- 在 Cloudflare 控制台右侧边栏
- 或在 URL 中: `https://dash.cloudflare.com/{account_id}/pages`

**Project Name**:
- 就是你的 Pages 项目名称
- 区分大小写
- 不要包含空格

## 调试步骤

### 步骤 1: 查看控制台日志

1. 打开应用
2. 按 F12 打开开发者工具
3. 切换到 "Console" 标签
4. 点击"验证凭据"
5. 查看输出的日志

**正常的日志应该包含**:
```
Validating Cloudflare credentials...
API Base URL: https://api.cloudflare.com/client/v4
Token length: 40
Token prefix: abcdef1234...
Validation response: { success: true }
```

**错误的日志可能包含**:
```
Error message: API request failed with status 401
Error message: Network error: getaddrinfo ENOTFOUND api.cloudflare.com
Error message: Failed to parse API response
```

### 步骤 2: 手动测试 Token

使用 curl 命令测试 Token:

```bash
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**成功响应**:
```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "...",
    "status": "active"
  }
}
```

**失败响应**:
```json
{
  "success": false,
  "errors": [
    {
      "code": 9109,
      "message": "Invalid access token"
    }
  ]
}
```

### 步骤 3: 检查配置文件

配置保存在:
- Windows: `%APPDATA%\blog-management-gui\config.json`
- macOS: `~/Library/Application Support/blog-management-gui/config.json`
- Linux: `~/.config/blog-management-gui/config.json`

检查 `cloudflare` 部分:
```json
{
  "cloudflare": {
    "apiToken": "your-token-here",
    "accountId": "your-account-id",
    "projectName": "your-project-name"
  }
}
```

### 步骤 4: 重新创建 Token

如果以上都不行，尝试重新创建 Token:

1. 登录 Cloudflare 控制台
2. 进入 "我的个人资料" > "API 令牌"
3. 点击 "创建令牌"
4. 选择 "自定义令牌"
5. 设置权限:
   - **Cloudflare Pages** - **编辑**
   - **帐户设置** - **读取**
6. 设置账户资源:
   - 选择你的账户
7. 点击 "继续以显示摘要"
8. 点击 "创建令牌"
9. **立即复制 Token**（只显示一次！）
10. 粘贴到应用的设置页面

## 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| 401 | Token 无效 | 检查 Token 是否正确复制 |
| 403 | 权限不足 | 检查 Token 权限设置 |
| 429 | 请求过多 | 等待几分钟后重试 |
| 500 | 服务器错误 | Cloudflare 服务问题，稍后重试 |
| ENOTFOUND | 网络错误 | 检查网络连接 |
| ETIMEDOUT | 超时 | 检查网络速度或防火墙 |

## 仍然无法解决？

如果以上方法都不行，请提供以下信息：

1. 控制台完整的错误日志
2. Token 的前 10 个字符（不要提供完整 Token！）
3. Token 的长度
4. 是否能在浏览器访问 https://api.cloudflare.com
5. 使用 curl 测试的结果

这样我可以帮你进一步诊断问题。
