# Integrations

This directory contains integration modules for external services and APIs.

## CloudflareClient

The `CloudflareClient` class provides integration with Cloudflare Pages API for deploying static websites.

### Features

- **Authentication**: Validates API credentials before deployment
- **File Upload**: Uploads entire public directory to Cloudflare Pages
- **Deployment Status**: Tracks deployment progress and status
- **Rate Limiting**: Automatically handles Cloudflare API rate limits
- **Error Handling**: Comprehensive error handling with detailed messages
- **Batch Upload**: Uploads files in batches to optimize performance

### Usage Example

```typescript
import { CloudflareClient } from './CloudflareClient';
import { CloudflareConfig } from '../../shared/types/config';

// Initialize client with configuration
const config: CloudflareConfig = {
  apiToken: 'your-api-token',
  accountId: 'your-account-id',
  projectName: 'your-project-name'
};

const client = new CloudflareClient(config);

// Validate credentials
const isValid = await client.validateCredentials();
if (!isValid) {
  console.error('Invalid Cloudflare credentials');
  return;
}

// Upload files
try {
  const result = await client.uploadFiles('/path/to/public');
  console.log('Deployment ID:', result.deploymentId);
  console.log('Deployment URL:', result.url);
  
  // Check deployment status
  const status = await client.getDeploymentStatus(result.deploymentId);
  console.log('Status:', status.status);
} catch (error) {
  console.error('Deployment failed:', error);
}
```

### API Methods

#### `validateCredentials(): Promise<boolean>`

Validates the Cloudflare API credentials by making a test request to the API.

**Returns**: `true` if credentials are valid, `false` otherwise

#### `uploadFiles(publicDir: string): Promise<{ deploymentId: string; url: string }>`

Uploads all files from the specified public directory to Cloudflare Pages.

**Parameters**:
- `publicDir`: Path to the public directory containing static files

**Returns**: Object containing deployment ID and URL

**Throws**: Error if upload fails or configuration is invalid

#### `getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>`

Gets the current status of a deployment.

**Parameters**:
- `deploymentId`: The deployment ID returned from `uploadFiles`

**Returns**: Deployment status object with current state

**Throws**: Error if status check fails

#### `updateConfig(config: CloudflareConfig): void`

Updates the Cloudflare configuration.

**Parameters**:
- `config`: New Cloudflare configuration

### Error Handling

The client handles various error scenarios:

- **Configuration Errors**: Missing or invalid API token, account ID, or project name
- **Network Errors**: Connection failures, timeouts
- **API Errors**: Invalid credentials, rate limiting, server errors
- **File System Errors**: Missing public directory, file read errors

All errors are thrown with descriptive messages that can be displayed to users.

### Rate Limiting

The client automatically handles Cloudflare API rate limits:

- Tracks remaining requests from response headers
- Waits automatically when rate limit is exceeded
- Resumes operations after rate limit reset

### Requirements Mapping

This implementation satisfies the following requirements:

- **12.1-12.7**: Cloudflare Pages deployment functionality
- **13.1-13.7**: Cloudflare configuration management
- **12.2**: Credential validation
- **12.3**: File upload to Cloudflare Pages
- **12.4**: Deployment status tracking
- **12.5**: API error handling
- **12.6**: Rate limiting support
