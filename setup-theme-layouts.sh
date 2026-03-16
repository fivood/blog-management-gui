#!/bin/bash

# 主题布局设置脚本
# 用于为不同主题创建独立的布局目录

echo "=== Hugo 主题布局设置工具 ==="
echo ""

# 进入 blog 目录
cd blog || exit 1

# 检查当前主题
CURRENT_THEME=$(grep '^theme = ' hugo.toml | sed 's/theme = "\(.*\)"/\1/')
echo "当前主题: $CURRENT_THEME"
echo ""

# 为 PaperMod 创建布局目录
echo "1. 为 hugo-PaperMod 创建布局目录..."
if [ -d "layouts-hugo-papermod" ]; then
  echo "   ✓ layouts-hugo-papermod 已存在"
else
  if [ -d "layouts" ]; then
    echo "   正在复制当前 layouts/ 到 layouts-hugo-papermod/..."
    cp -r layouts layouts-hugo-papermod
    echo "   ✓ 已创建 layouts-hugo-papermod/"
  else
    echo "   ⚠ layouts/ 目录不存在，跳过"
  fi
fi
echo ""

# 为 neopost 创建空的布局目录
echo "2. 为 neopost 创建布局目录..."
if [ -d "layouts-neopost" ]; then
  echo "   ✓ layouts-neopost 已存在"
else
  mkdir -p layouts-neopost/_default
  mkdir -p layouts-neopost/partials
  
  # 创建简单的 single.html（不依赖 PaperMod 的 partial）
  cat > layouts-neopost/_default/single.html << 'EOF'
{{- define "main" }}
<article>
  <header>
    <h1>{{ .Title }}</h1>
    {{- if not .Date.IsZero -}}
    <div class="post-meta">
      <time>{{ .Date.Format "2006-01-02" }}</time>
    </div>
    {{- end }}
  </header>

  {{- if .Content }}
  <div class="post-content">
    {{ .Content }}
  </div>
  {{- end }}

  <footer>
    {{- if .Params.tags }}
    <div class="post-tags">
      {{- range .Params.tags }}
      <span class="tag">{{ . }}</span>
      {{- end }}
    </div>
    {{- end }}
  </footer>
</article>
{{- end }}
EOF

  # 创建简单的 list.html
  cat > layouts-neopost/_default/list.html << 'EOF'
{{- define "main" }}
<div class="list-page">
  {{- if .Title }}
  <header>
    <h1>{{ .Title }}</h1>
  </header>
  {{- end }}

  {{- range .Pages }}
  <article class="post-entry">
    <header>
      <h2><a href="{{ .Permalink }}">{{ .Title }}</a></h2>
      {{- if not .Date.IsZero -}}
      <time>{{ .Date.Format "2006-01-02" }}</time>
      {{- end }}
    </header>
    {{- if .Summary }}
    <div class="post-summary">
      {{ .Summary }}
    </div>
    {{- end }}
  </article>
  {{- end }}
</div>
{{- end }}
EOF

  echo "   ✓ 已创建 layouts-neopost/ 及基础布局文件"
fi
echo ""

# 备份当前 layouts
echo "3. 备份当前 layouts 目录..."
if [ -d "layouts" ]; then
  BACKUP_NAME="layouts-backup-$(date +%Y%m%d-%H%M%S)"
  cp -r layouts "$BACKUP_NAME"
  echo "   ✓ 已备份到 $BACKUP_NAME/"
else
  echo "   ⚠ layouts/ 目录不存在，无需备份"
fi
echo ""

echo "=== 设置完成 ==="
echo ""
echo "现在你可以："
echo "1. 在应用中切换主题，系统会自动使用对应的布局目录"
echo "2. 手动编辑 layouts-hugo-papermod/ 或 layouts-neopost/ 中的文件"
echo "3. 运行 'hugo' 命令测试构建"
echo ""
echo "布局目录说明："
echo "- layouts/              当前激活的布局"
echo "- layouts-hugo-papermod/  PaperMod 主题专用布局"
echo "- layouts-neopost/        neopost 主题专用布局"
echo "- layouts-backup-*/       备份的布局"
echo ""
