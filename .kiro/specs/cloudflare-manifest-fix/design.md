# Cloudflare Manifest Fix 设计文档

## Overview

修复 Cloudflare Pages 部署 API 调用中的 manifest 字段错误。当前实现使用 JSON 格式发送 manifest，但 Cloudflare Pages Direct Upload API 要求使用 multipart/form-data 格式。本修复将 `createDeployment` 方法从 JSON 请求改为 multipart/form-data 请求，同时保持其他 API 调用（文件上传、状态查询等）不变。

## Glossary

- **Bug_Condition (C)**: 当系统调用 `createDeployment` 方法创建部署时，使用 `Content-Type: application/json` 发送 manifest 字段
- **Property (P)**: 创建部署请求应使用 `Content-Type: multipart/form-data` 格式，manifest 作为表单字段发送，Cloudflare API 成功接受并返回 deployment ID
- **Preservation**: 其他 API 调用（凭据验证、文件上传、部署完成、状态查询）必须保持 JSON 格式不变
- **createDeployment**: `CloudflareClient.ts` 中的私有方法，负责调用 Cloudflare API 创建新部署
- **manifest**: 文件路径到 SHA-256 哈希的映射对象，描述部署中包含的所有文件
- **multipart/form-data**: HTTP 内容类型，用于发送表单数据，包含 boundary 分隔符
- **boundary**: multipart/form-data 格式中用于分隔不同表单字段的唯一字符串

## Bug Details

### Bug Condition

当用户尝试部署到 Cloudflare Pages 时，`createDeployment` 方法使用 JSON 格式发送 manifest 字段。Cloudflare API 无法从 JSON 请求体中识别 manifest 字段，导致返回错误 8000096："A 'manifest' field was expected in the request body but was not provided"。

**Formal Specification:**
```
FUNCTION isBugCondition(request)
  INPUT: request of type HTTPRequest
  OUTPUT: boolean
  
  RETURN request.endpoint CONTAINS '/deployments'
         AND request.method == 'POST'
         AND request.headers['Content-Type'] == 'application/json'
         AND request.body.manifest EXISTS
         AND cloudflareAPIReturnsError(request, 8000096)
END FUNCTION
```

### Examples

- **示例 1**: 用户点击部署按钮，系统发送 `POST /accounts/{accountId}/pages/projects/{projectName}/deployments`，Content-Type 为 `application/json`，body 包含 `{"manifest": {"/index.html": "abc123..."}}`
  - **实际行为**: Cloudflare API 返回 400 错误，错误代码 8000096
  - **期望行为**: API 应接受请求并返回 deployment ID

- **示例 2**: manifest 包含 50 个文件的哈希映射，以 JSON 格式发送
  - **实际行为**: API 拒绝请求，提示缺少 manifest 字段
  - **期望行为**: API 应解析所有 50 个文件哈希并创建部署

- **示例 3**: 日志显示请求体包含完整的 manifest 对象
  - **实际行为**: 尽管日志确认 manifest 存在，API 仍返回错误
  - **期望行为**: API 应识别并处理 manifest 字段

- **边缘情况**: manifest 为空对象 `{}`（没有文件）
  - **期望行为**: API 应接受空 manifest 或返回明确的验证错误（而不是"字段缺失"错误）

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- 凭据验证调用 `GET /accounts/{accountId}/tokens/verify` 必须继续使用 JSON 格式
- 文件上传调用 `POST /accounts/{accountId}/pages/projects/{projectName}/deployments/{deploymentId}/files` 必须继续使用 JSON 格式发送 base64 编码的文件内容
- 部署完成调用 `POST /accounts/{accountId}/pages/projects/{projectName}/deployments/{deploymentId}/finalize` 必须继续使用 JSON 格式
- 状态查询调用 `GET /accounts/{accountId}/pages/projects/{projectName}/deployments/{deploymentId}` 必须继续使用 JSON 格式
- 文件扫描、哈希计算、路径规范化逻辑必须保持不变

**Scope:**
所有不涉及 `createDeployment` 方法的 API 调用应完全不受此修复影响。这包括：
- `validateCredentials()` 方法
- `uploadBatch()` 方法
- `finalizeDeployment()` 方法
- `getDeploymentStatus()` 方法
- `cancelDeployment()` 方法
- 所有辅助方法（文件扫描、哈希计算等）

## Hypothesized Root Cause

基于 bug 描述和 Cloudflare API 文档，最可能的原因是：

1. **API 格式要求不匹配**: Cloudflare Pages Direct Upload API 的 `/deployments` 端点专门要求 multipart/form-data 格式，而不是 JSON 格式
   - 文档明确指出 manifest 应作为表单字段发送
   - JSON 格式的 manifest 字段被 API 忽略或无法解析

2. **Content-Type 头部错误**: 当前代码在 `makeRequest` 方法中硬编码 `Content-Type: application/json`
   - 所有请求都使用相同的 Content-Type
   - 需要为 `createDeployment` 调用使用不同的 Content-Type

3. **请求体格式错误**: JSON 格式的请求体结构与 multipart/form-data 格式不兼容
   - multipart/form-data 需要 boundary 分隔符
   - 需要特定的格式来编码表单字段

4. **makeRequest 方法通用性不足**: 当前 `makeRequest` 方法假设所有请求都是 JSON
   - 需要扩展以支持不同的内容类型
   - 或者为 multipart/form-data 请求创建专门的方法

## Correctness Properties

Property 1: Bug Condition - Multipart Form Data 部署创建

_For any_ 调用 `createDeployment` 方法且 manifest 对象包含有效的文件哈希映射时，修复后的方法 SHALL 使用 `Content-Type: multipart/form-data` 格式发送请求，manifest 作为表单字段（JSON 字符串）发送，Cloudflare API SHALL 成功接受请求并返回包含 deployment ID 和 URL 的响应。

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - 其他 API 调用格式不变

_For any_ API 调用不是 `createDeployment` 方法（包括凭据验证、文件上传、部署完成、状态查询），修复后的代码 SHALL 继续使用 `Content-Type: application/json` 格式，产生与原始代码完全相同的行为，保持所有现有功能不变。

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

假设我们的根本原因分析正确：

**File**: `blog-management-gui/src/main/integrations/CloudflareClient.ts`

**Function**: `createDeployment` 和 `makeRequest`

**Specific Changes**:

1. **修改 createDeployment 方法**: 不再调用 `makeRequest` 发送 JSON，而是构建 multipart/form-data 请求
   - 生成唯一的 boundary 字符串
   - 构建 multipart/form-data 格式的请求体
   - manifest 字段作为表单字段发送，值为 JSON 字符串
   - 直接使用 https 模块发送请求，或创建专门的 `makeMultipartRequest` 方法

2. **构建 multipart/form-data 请求体**: 按照 RFC 2388 标准格式化
   - 使用 `--${boundary}` 分隔字段
   - 每个字段包含 `Content-Disposition: form-data; name="fieldName"`
   - 字段值后跟两个换行符
   - 请求体以 `--${boundary}--` 结束

3. **设置正确的 Content-Type 头部**: 包含 boundary 参数
   - `Content-Type: multipart/form-data; boundary=${boundary}`
   - boundary 应该是唯一的字符串，例如使用时间戳和随机数

4. **保持 makeRequest 方法不变**: 确保其他 API 调用继续使用 JSON 格式
   - 或者扩展 `makeRequest` 方法，添加可选的 `contentType` 参数
   - 默认值为 `application/json`，保持向后兼容

5. **Manifest 字段序列化**: 将 manifest 对象转换为 JSON 字符串作为表单字段值
   - `JSON.stringify(manifest)`
   - 确保 JSON 字符串正确编码在 multipart 格式中

### Implementation Approach

**Option A: 创建专门的 makeMultipartRequest 方法**
- 优点: 保持 `makeRequest` 方法简单，职责分离
- 缺点: 代码重复（错误处理、超时、rate limit 更新）

**Option B: 扩展 makeRequest 方法支持多种内容类型**
- 优点: 代码复用，统一的错误处理和 rate limit 管理
- 缺点: 方法复杂度增加

**推荐方案**: Option A - 创建 `makeMultipartRequest` 方法
- 更清晰的代码结构
- 避免影响现有的 JSON 请求逻辑
- 更容易测试和维护

## Testing Strategy

### Validation Approach

测试策略遵循两阶段方法：首先在未修复的代码上运行测试以确认 bug 存在，然后验证修复后的代码正确工作并保持现有行为不变。

### Exploratory Bug Condition Checking

**Goal**: 在实施修复之前，在未修复的代码上演示 bug。确认或反驳根本原因分析。如果反驳，需要重新假设。

**Test Plan**: 编写测试模拟调用 `createDeployment` 方法，使用有效的 manifest 对象。在未修复的代码上运行这些测试，观察 Cloudflare API 返回错误 8000096。检查请求日志确认使用了 JSON 格式。

**Test Cases**:
1. **基本部署创建测试**: 使用包含 3 个文件的 manifest 调用 `createDeployment`（未修复代码上将失败）
2. **大型 manifest 测试**: 使用包含 100 个文件的 manifest 调用 `createDeployment`（未修复代码上将失败）
3. **空 manifest 测试**: 使用空对象 `{}` 调用 `createDeployment`（未修复代码上将失败）
4. **请求格式检查**: 拦截 HTTP 请求，验证 Content-Type 为 `application/json`（未修复代码上将确认）

**Expected Counterexamples**:
- Cloudflare API 返回 400 错误，错误代码 8000096，消息 "A 'manifest' field was expected in the request body but was not provided"
- 可能原因: Content-Type 为 application/json，API 无法解析 JSON 格式的 manifest

### Fix Checking

**Goal**: 验证对于所有满足 bug 条件的输入，修复后的函数产生期望的行为。

**Pseudocode:**
```
FOR ALL manifest WHERE isValidManifest(manifest) DO
  result := createDeployment_fixed(manifest)
  ASSERT result.id EXISTS
  ASSERT result.url EXISTS
  ASSERT cloudflareAPIAcceptsRequest(result)
END FOR
```

**Test Plan**: 在修复后的代码上运行相同的测试用例，验证 Cloudflare API 成功接受请求并返回 deployment ID 和 URL。

**Test Cases**:
1. **基本部署创建测试**: 验证 API 返回有效的 deployment ID 和 URL
2. **大型 manifest 测试**: 验证 API 正确处理大型 manifest
3. **空 manifest 测试**: 验证 API 的行为（接受或返回明确的验证错误）
4. **请求格式检查**: 拦截 HTTP 请求，验证 Content-Type 为 `multipart/form-data; boundary=...`

### Preservation Checking

**Goal**: 验证对于所有不满足 bug 条件的输入（其他 API 调用），修复后的函数产生与原始函数相同的结果。

**Pseudocode:**
```
FOR ALL apiCall WHERE apiCall != 'createDeployment' DO
  ASSERT apiCall_original(input) = apiCall_fixed(input)
END FOR
```

**Testing Approach**: 基于属性的测试推荐用于保持检查，因为：
- 自动生成许多测试用例覆盖输入域
- 捕获手动单元测试可能遗漏的边缘情况
- 为所有非 bug 输入提供强有力的行为不变保证

**Test Plan**: 首先在未修复的代码上观察其他 API 调用的行为，然后编写基于属性的测试捕获该行为，验证修复后行为保持不变。

**Test Cases**:
1. **凭据验证保持**: 观察 `validateCredentials()` 在未修复代码上的行为，验证修复后继续使用 JSON 格式并返回相同结果
2. **文件上传保持**: 观察 `uploadBatch()` 在未修复代码上的行为，验证修复后继续使用 JSON 格式发送 base64 文件内容
3. **部署完成保持**: 观察 `finalizeDeployment()` 在未修复代码上的行为，验证修复后继续使用 JSON 格式
4. **状态查询保持**: 观察 `getDeploymentStatus()` 在未修复代码上的行为，验证修复后继续使用 JSON 格式并正确映射状态
5. **请求头部保持**: 验证所有非 `createDeployment` 请求的 Content-Type 仍为 `application/json`

### Unit Tests

- 测试 multipart/form-data 请求体构建逻辑（boundary 生成、字段格式化）
- 测试 manifest 对象正确序列化为 JSON 字符串
- 测试 Content-Type 头部包含正确的 boundary 参数
- 测试边缘情况（空 manifest、大型 manifest、特殊字符）
- 测试其他 API 方法继续使用 JSON 格式

### Property-Based Tests

- 生成随机 manifest 对象（不同数量的文件、不同路径、不同哈希），验证 `createDeployment` 正确处理
- 生成随机 API 调用序列，验证只有 `createDeployment` 使用 multipart/form-data，其他使用 JSON
- 测试 boundary 字符串的唯一性（生成多个请求，验证 boundary 不重复）

### Integration Tests

- 测试完整的部署流程：创建部署（multipart）→ 上传文件（JSON）→ 完成部署（JSON）→ 查询状态（JSON）
- 测试错误处理：如果 `createDeployment` 失败，验证取消部署调用仍使用 JSON 格式
- 测试 rate limit 管理在不同内容类型的请求之间正确工作
- 测试真实的 Cloudflare API 集成（如果有测试账户）
