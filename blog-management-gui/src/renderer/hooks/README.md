# Renderer Hooks

This directory contains custom React hooks for interacting with the Electron main process via IPC.

## Available Hooks

### useIPC

Generic hook for IPC communication with loading and error states.

```tsx
import { useIPC } from './hooks';

function MyComponent() {
  const { data, loading, error, execute } = useIPC<Article[]>();
  
  const loadData = async () => {
    await execute(() => window.electronAPI.article.list());
  };
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <p>Loaded {data.length} items</p>}
    </div>
  );
}
```

### useArticles

Hook for article CRUD operations.

**Features:**
- List articles with filtering
- Get single article
- Create article
- Update article
- Delete article
- Publish article

```tsx
import { useArticles } from './hooks';

function ArticleList() {
  const { articles, loading, loadArticles, createArticle, deleteArticle } = useArticles();
  
  useEffect(() => {
    loadArticles();
  }, []);
  
  const handleCreate = async () => {
    const article = await createArticle({
      title: 'New Article',
      content: 'Content here...',
      tags: ['tag1', 'tag2']
    });
    if (article) {
      console.log('Created:', article);
    }
  };
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      <button onClick={handleCreate}>Create Article</button>
      {articles.map(article => (
        <div key={article.id}>
          <h3>{article.title}</h3>
          <button onClick={() => deleteArticle(article.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### useImages

Hook for image management operations.

**Features:**
- List images
- Upload image
- Delete image
- Get image path
- Generate Markdown link
- Copy Markdown link to clipboard

```tsx
import { useImages } from './hooks';

function ImageGallery() {
  const { 
    images, 
    loading, 
    uploadProgress,
    loadImages, 
    uploadImage, 
    deleteImage,
    copyMarkdownLink 
  } = useImages();
  
  useEffect(() => {
    loadImages();
  }, []);
  
  const handleUpload = async (file: File) => {
    const image = await uploadImage(file.path, file.name);
    if (image) {
      console.log('Uploaded:', image);
    }
  };
  
  const handleCopyLink = async (filename: string) => {
    const success = await copyMarkdownLink(filename, 'Alt text');
    if (success) {
      console.log('Copied to clipboard');
    }
  };
  
  return (
    <div>
      {loading && <p>Loading... {uploadProgress}%</p>}
      {images.map(image => (
        <div key={image.filename}>
          <img src={image.path} alt={image.filename} />
          <button onClick={() => handleCopyLink(image.filename)}>
            Copy Markdown Link
          </button>
          <button onClick={() => deleteImage(image.filename)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### useHugo

Hook for Hugo build and preview operations.

**Features:**
- Build site
- Start/stop preview server
- Get/update Hugo configuration
- Stream build output
- Track build status

```tsx
import { useHugo } from './hooks';

function BuildPanel() {
  const { 
    buildStatus, 
    buildOutput, 
    buildResult,
    previewRunning,
    previewServer,
    build, 
    startPreview, 
    stopPreview 
  } = useHugo();
  
  const handleBuild = async () => {
    const result = await build({ minify: true });
    if (result) {
      console.log('Build completed:', result.stats);
    }
  };
  
  const handlePreview = async () => {
    if (previewRunning) {
      await stopPreview();
    } else {
      const server = await startPreview();
      if (server) {
        console.log('Preview at:', server.url);
      }
    }
  };
  
  return (
    <div>
      <button onClick={handleBuild} disabled={buildStatus === 'building'}>
        Build Site
      </button>
      <button onClick={handlePreview}>
        {previewRunning ? 'Stop Preview' : 'Start Preview'}
      </button>
      
      {buildStatus === 'building' && <p>Building...</p>}
      {buildStatus === 'success' && <p>Build successful!</p>}
      {buildStatus === 'error' && <p>Build failed</p>}
      
      {previewServer && <p>Preview: {previewServer.url}</p>}
      
      <div>
        <h4>Build Output:</h4>
        {buildOutput.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
```

### useDeploy

Hook for Cloudflare Pages deployment.

**Features:**
- Deploy to Cloudflare Pages
- Validate credentials
- Get deployment status
- Track deployment progress

```tsx
import { useDeploy } from './hooks';

function DeployPanel() {
  const { 
    deployStatus, 
    deployResult,
    progress,
    progressMessage,
    deploy, 
    validateCredentials 
  } = useDeploy();
  
  const handleValidate = async () => {
    const isValid = await validateCredentials();
    if (isValid) {
      console.log('Credentials are valid');
    }
  };
  
  const handleDeploy = async () => {
    const result = await deploy();
    if (result) {
      console.log('Deployed to:', result.url);
    }
  };
  
  return (
    <div>
      <button onClick={handleValidate}>Validate Credentials</button>
      <button onClick={handleDeploy} disabled={deployStatus === 'deploying'}>
        Deploy to Cloudflare
      </button>
      
      {deployStatus === 'deploying' && (
        <div>
          <p>Deploying... {progress}%</p>
          <p>{progressMessage}</p>
        </div>
      )}
      
      {deployStatus === 'success' && deployResult && (
        <p>Deployed successfully! <a href={deployResult.url}>View Site</a></p>
      )}
      
      {deployStatus === 'error' && <p>Deployment failed</p>}
    </div>
  );
}
```

### useStyles

Hook for style configuration management.

**Features:**
- Get/update style configuration
- Export/import style configuration
- Reset to default styles
- Style history management
- Local preview updates

```tsx
import { useStyles } from './hooks';

function StyleEditor() {
  const { 
    styleConfig, 
    styleHistory,
    isDirty,
    loading,
    getStyleConfig,
    updateStyleConfig,
    exportStyleConfig,
    importStyleConfig,
    resetToDefault,
    updateLocalConfig
  } = useStyles();
  
  useEffect(() => {
    getStyleConfig();
  }, []);
  
  const handleColorChange = (color: string) => {
    // Update local config for preview (doesn't save)
    updateLocalConfig({
      colorTheme: {
        ...styleConfig?.colorTheme,
        primaryColor: color
      }
    });
  };
  
  const handleSave = async () => {
    const success = await updateStyleConfig(styleConfig!, 'Updated primary color');
    if (success) {
      console.log('Saved successfully');
    }
  };
  
  const handleExport = async () => {
    const json = await exportStyleConfig();
    if (json) {
      // Download or copy JSON
      console.log('Exported:', json);
    }
  };
  
  const handleReset = async () => {
    const success = await resetToDefault();
    if (success) {
      console.log('Reset to defaults');
    }
  };
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {isDirty && <p>Unsaved changes</p>}
      
      <input 
        type="color" 
        value={styleConfig?.colorTheme?.primaryColor}
        onChange={(e) => handleColorChange(e.target.value)}
      />
      
      <button onClick={handleSave} disabled={!isDirty}>Save</button>
      <button onClick={handleExport}>Export</button>
      <button onClick={handleReset}>Reset to Default</button>
    </div>
  );
}
```

## Hook Patterns

### Loading States

All hooks provide a `loading` boolean to track async operations:

```tsx
const { loading, execute } = useIPC();

{loading && <Spinner />}
```

### Error Handling

All hooks provide an `error` string for error messages:

```tsx
const { error, execute } = useIPC();

{error && <Alert type="error">{error}</Alert>}
```

### Auto-Refresh

Hooks automatically refresh related data after mutations:

```tsx
const { articles, createArticle } = useArticles();

// After creating, articles list is automatically refreshed
await createArticle(data);
```

## Best Practices

1. **Call hooks at the top level**: Don't call hooks inside loops, conditions, or nested functions
2. **Load data in useEffect**: Use useEffect to load data when component mounts
3. **Handle loading states**: Always show loading indicators during async operations
4. **Handle errors gracefully**: Display error messages to users
5. **Cleanup on unmount**: Remove event listeners in useEffect cleanup
6. **Memoize callbacks**: Use useCallback for functions passed as dependencies
7. **Combine hooks**: Use multiple hooks together for complex features

## Example: Complete Component

```tsx
import { useEffect } from 'react';
import { useArticles, useNotification } from './hooks';

function ArticleManager() {
  const { 
    articles, 
    loading, 
    error, 
    loadArticles, 
    createArticle, 
    deleteArticle 
  } = useArticles();
  
  const { showNotification } = useNotification();
  
  useEffect(() => {
    loadArticles();
  }, []);
  
  const handleCreate = async () => {
    const article = await createArticle({
      title: 'New Article',
      content: 'Content...'
    });
    
    if (article) {
      showNotification('success', 'Article created successfully');
    } else {
      showNotification('error', 'Failed to create article');
    }
  };
  
  const handleDelete = async (id: string) => {
    const success = await deleteArticle(id);
    
    if (success) {
      showNotification('success', 'Article deleted');
    } else {
      showNotification('error', 'Failed to delete article');
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <button onClick={handleCreate}>Create Article</button>
      {articles.map(article => (
        <div key={article.id}>
          <h3>{article.title}</h3>
          <button onClick={() => handleDelete(article.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```
