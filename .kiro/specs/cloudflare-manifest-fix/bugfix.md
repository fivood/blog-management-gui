# Bugfix Requirements Document

## Introduction

修复 Cloudflare Pages 自动部署功能中的 manifest 字段错误问题。当用户尝试通过编辑器部署到 Cloudflare Pages 时，API 返回错误："A 'manifest' field was expected in the request body but was not provided"，尽管日志显示 manifest 字段已包含在请求体中。

根本原因是 Cloudflare Pages Direct Upload API 要求使用 multipart/form-data 格式而不是 JSON 格式来创建部署。当前实现使用 JSON 格式发送 manifest，导致 Cloudflare API 无法正确解析该字段。

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 用户点击部署按钮并发送 POST 请求到 `/accounts/{accountId}/pages/projects/{projectName}/deployments` THEN 系统使用 `Content-Type: application/json` 发送包含 manifest 字段的 JSON 请求体

1.2 WHEN Cloudflare API 接收到 JSON 格式的部署创建请求 THEN API 返回 400 错误，错误代码 8000096，消息为 "A 'manifest' field was expected in the request body but was not provided"

1.3 WHEN 系统记录请求体日志 THEN 日志显示 manifest 字段存在于 JSON 对象中，但 Cloudflare API 仍然无法识别

### Expected Behavior (Correct)

2.1 WHEN 用户点击部署按钮并发送 POST 请求到 `/accounts/{accountId}/pages/projects/{projectName}/deployments` THEN 系统 SHALL 使用 `Content-Type: multipart/form-data` 格式发送 manifest 字段

2.2 WHEN Cloudflare API 接收到 multipart/form-data 格式的部署创建请求 THEN API SHALL 成功创建部署并返回 deployment ID 和 URL

2.3 WHEN manifest 字段以 multipart/form-data 格式发送 THEN Cloudflare API SHALL 正确解析文件哈希映射并接受部署请求

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 系统验证 Cloudflare 凭据 THEN 系统 SHALL CONTINUE TO 使用 `GET /accounts/{accountId}/tokens/verify` 端点并返回验证结果

3.2 WHEN 系统上传文件批次到已创建的部署 THEN 系统 SHALL CONTINUE TO 使用 `POST /accounts/{accountId}/pages/projects/{projectName}/deployments/{deploymentId}/files` 端点上传 base64 编码的文件内容

3.3 WHEN 系统完成部署 THEN 系统 SHALL CONTINUE TO 调用 `POST /accounts/{accountId}/pages/projects/{projectName}/deployments/{deploymentId}/finalize` 端点

3.4 WHEN 系统查询部署状态 THEN 系统 SHALL CONTINUE TO 使用 `GET /accounts/{accountId}/pages/projects/{projectName}/deployments/{deploymentId}` 端点并正确映射状态

3.5 WHEN 系统扫描 public 目录获取文件列表 THEN 系统 SHALL CONTINUE TO 递归扫描所有文件并生成相对路径

3.6 WHEN 系统计算文件哈希 THEN 系统 SHALL CONTINUE TO 使用 SHA-256 算法生成文件哈希值

3.7 WHEN 系统处理 Windows 路径分隔符 THEN 系统 SHALL CONTINUE TO 将反斜杠转换为正斜杠以符合 Cloudflare 要求
