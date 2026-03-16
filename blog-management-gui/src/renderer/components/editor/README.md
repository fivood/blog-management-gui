# Markdown Editor Components

这个目录包含了博客管理 GUI 的 Markdown 编辑器组件。

## 组件

### MarkdownEditor

主要的 Markdown 编辑器组件，提供分屏编辑和实时预览功能。

**功能：**
- 左侧 CodeMirror 6 编辑器，支持 Markdown 语法高亮
- 右侧实时预览面板
- 编辑器工具栏，包含常用格式化按钮
- 内容更改防抖（100ms）
- 支持插入图片

**Props：**
```typescript
interface MarkdownEditorProps {
  value: string;              // 当前内容
  onChange: (value: string) => void;  // 内容变化回调
  onInsertImage: () => void;  // 插入图片按钮回调
}
```

**使用示例：**
```tsx
import { MarkdownEditor } from './components/editor';

function MyComponent() {
  const [content, setContent] = useState('');
  
  const handleInsertImage = () => {
    // 打开图片库选择对话框
    console.log('Open image gallery');
  };
  
  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      onInsertImage={handleInsertImage}
    />
  );
}
```

### MarkdownPreview

Markdown 预览组件，负责渲染 Markdown 内容。

**功能：**
- 使用 marked.js 解析 Markdown
- 使用 highlight.js 进行代码语法高亮
- 使用 DOMPurify 清理 HTML 输出，防止 XSS 攻击
- 支持标准 Markdown 语法（标题、列表、链接、图片、代码块、表格等）

**Props：**
```typescript
interface MarkdownPreviewProps {
  content: string;  // 要渲染的 Markdown 内容
}
```

### EditorToolbar

编辑器工具栏组件，提供常用的 Markdown 格式化按钮。

**功能：**
- 粗体、斜体、标题、列表、链接、代码块按钮
- 插入图片按钮
- 在光标位置插入 Markdown 语法

**Props：**
```typescript
interface EditorToolbarProps {
  editorView: EditorView | null;  // CodeMirror 编辑器视图实例
  onInsertImage: () => void;       // 插入图片按钮回调
}
```

## 集成到 ArticleEditor

要将 MarkdownEditor 集成到现有的 ArticleEditor 组件中，替换 TextArea：

```tsx
// 在 ArticleEditor.tsx 中

import { MarkdownEditor } from './editor';

// 替换原来的 TextArea Form.Item：
<Form.Item
  label="内容"
  name="content"
  rules={[
    { required: true, message: '请输入内容' },
    { min: 1, message: '内容不能为空' }
  ]}
>
  <MarkdownEditor
    value={form.getFieldValue('content') || ''}
    onChange={(value) => {
      form.setFieldValue('content', value);
      handleFormChange();
    }}
    onInsertImage={() => {
      // TODO: 打开 ImageGalleryView 选择模式
      console.log('Open image gallery in selection mode');
    }}
  />
</Form.Item>
```

## 依赖

所有必需的依赖已经安装在 package.json 中：

- `@codemirror/state` - CodeMirror 状态管理
- `@codemirror/view` - CodeMirror 视图
- `@codemirror/lang-markdown` - Markdown 语言支持
- `@codemirror/theme-one-dark` - 暗色主题
- `codemirror` - CodeMirror 核心
- `marked` - Markdown 解析器
- `highlight.js` - 代码语法高亮
- `dompurify` - HTML 清理
- `@types/dompurify` - DOMPurify 类型定义

## 测试

单元测试位于 `tests/unit/components/` 目录：

- `MarkdownPreview.test.tsx` - 测试 Markdown 解析和渲染
- `EditorToolbar.test.tsx` - 测试工具栏格式化逻辑

运行测试：
```bash
npm test -- tests/unit/components
```

## 需求覆盖

这些组件满足以下需求：

- **Requirement 5.1-5.5**: Markdown 实时预览
- **Requirement 8.1-8.4**: 插入图片到文章
- **Requirement 19.3**: 性能要求（100ms 防抖更新预览）

## 下一步

1. 在 ArticleEditor 中集成 MarkdownEditor 组件
2. 实现 ImageGalleryView 选择模式
3. 实现图片插入功能（将选中的图片 Markdown 链接插入到编辑器光标位置）
