# Hugo博客迁移脚本 (PowerShell版本)
# 用法: .\migrate-blog.ps1

param(
    [string]$SourcePath = "G:\Publish\Publish\blog",
    [string]$TargetName = "blog-fukki"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Hugo博客迁移脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$TargetPath = Join-Path $PSScriptRoot $TargetName

Write-Host "源博客路径: $SourcePath" -ForegroundColor Yellow
Write-Host "目标路径: $TargetPath" -ForegroundColor Yellow
Write-Host ""

# 检查源目录
if (-not (Test-Path $SourcePath)) {
    Write-Host "错误: 源博客目录不存在: $SourcePath" -ForegroundColor Red
    Read-Host "按Enter键退出"
    exit 1
}

# 检查目标目录
if (Test-Path $TargetPath) {
    Write-Host "警告: 目标目录已存在" -ForegroundColor Yellow
    $confirm = Read-Host "是否覆盖? (Y/N)"
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host "取消迁移" -ForegroundColor Yellow
        Read-Host "按Enter键退出"
        exit 0
    }
    Write-Host "删除现有目录..." -ForegroundColor Yellow
    Remove-Item -Path $TargetPath -Recurse -Force
}

Write-Host ""
Write-Host "开始迁移..." -ForegroundColor Green
Write-Host ""

# 统计信息
$stats = @{
    Files = 0
    Directories = 0
    Errors = 0
}

# 辅助函数：复制目录
function Copy-Directory {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Name
    )
    
    if (Test-Path $Source) {
        try {
            Copy-Item -Path $Source -Destination $Destination -Recurse -Force
            $items = Get-ChildItem -Path $Destination -Recurse
            $fileCount = ($items | Where-Object { -not $_.PSIsContainer }).Count
            $dirCount = ($items | Where-Object { $_.PSIsContainer }).Count
            
            $script:stats.Files += $fileCount
            $script:stats.Directories += $dirCount
            
            Write-Host "  ✓ $Name ($fileCount 文件, $dirCount 目录)" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "  ✗ $Name - 错误: $_" -ForegroundColor Red
            $script:stats.Errors++
            return $false
        }
    } else {
        Write-Host "  ⚠ $Name - 不存在" -ForegroundColor Yellow
        return $false
    }
}

# 辅助函数：复制文件
function Copy-File {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Name
    )
    
    if (Test-Path $Source) {
        try {
            Copy-Item -Path $Source -Destination $Destination -Force
            $script:stats.Files++
            Write-Host "  ✓ $Name" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "  ✗ $Name - 错误: $_" -ForegroundColor Red
            $script:stats.Errors++
            return $false
        }
    }
    return $false
}

# 创建目标目录
Write-Host "[1/8] 创建目标目录..." -ForegroundColor Cyan
New-Item -Path $TargetPath -ItemType Directory -Force | Out-Null
Write-Host "  ✓ 目录已创建" -ForegroundColor Green

# 复制配置文件
Write-Host "[2/8] 复制配置文件..." -ForegroundColor Cyan
$configCopied = $false

# 首先检查config目录（多环境配置）
if (Test-Path (Join-Path $SourcePath "config")) {
    $configCopied = Copy-Directory (Join-Path $SourcePath "config") (Join-Path $TargetPath "config") "config/ (多环境配置)"
}

# 如果没有config目录，检查根目录的配置文件
if (-not $configCopied) {
    $configCopied = Copy-File (Join-Path $SourcePath "hugo.toml") (Join-Path $TargetPath "hugo.toml") "hugo.toml"
}
if (-not $configCopied) {
    $configCopied = Copy-File (Join-Path $SourcePath "config.toml") (Join-Path $TargetPath "config.toml") "config.toml"
}
if (-not $configCopied) {
    $configCopied = Copy-File (Join-Path $SourcePath "hugo.yaml") (Join-Path $TargetPath "hugo.yaml") "hugo.yaml"
}
if (-not $configCopied) {
    Write-Host "  ✗ 未找到配置文件" -ForegroundColor Red
}

# 复制内容目录
Write-Host "[3/8] 复制内容目录 (content/)..." -ForegroundColor Cyan
Copy-Directory (Join-Path $SourcePath "content") (Join-Path $TargetPath "content") "content/"

# 复制静态文件
Write-Host "[4/8] 复制静态文件 (static/)..." -ForegroundColor Cyan
Copy-Directory (Join-Path $SourcePath "static") (Join-Path $TargetPath "static") "static/"

# 复制主题
Write-Host "[5/8] 复制主题 (themes/)..." -ForegroundColor Cyan
Copy-Directory (Join-Path $SourcePath "themes") (Join-Path $TargetPath "themes") "themes/"

# 复制布局
Write-Host "[6/8] 复制布局 (layouts/)..." -ForegroundColor Cyan
Copy-Directory (Join-Path $SourcePath "layouts") (Join-Path $TargetPath "layouts") "layouts/"

# 复制资源
Write-Host "[7/8] 复制资源 (assets/)..." -ForegroundColor Cyan
Copy-Directory (Join-Path $SourcePath "assets") (Join-Path $TargetPath "assets") "assets/"

# 复制其他可选目录
Write-Host "[8/8] 复制其他文件..." -ForegroundColor Cyan
Copy-Directory (Join-Path $SourcePath "data") (Join-Path $TargetPath "data") "data/"
Copy-Directory (Join-Path $SourcePath "i18n") (Join-Path $TargetPath "i18n") "i18n/"
Copy-Directory (Join-Path $SourcePath "archetypes") (Join-Path $TargetPath "archetypes") "archetypes/"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "迁移完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "统计信息:" -ForegroundColor Yellow
Write-Host "  文件数: $($stats.Files)" -ForegroundColor White
Write-Host "  目录数: $($stats.Directories)" -ForegroundColor White
Write-Host "  错误数: $($stats.Errors)" -ForegroundColor White
Write-Host ""
Write-Host "目标路径: $TargetPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "下一步:" -ForegroundColor Cyan
Write-Host "1. 启动应用: npm run dev" -ForegroundColor White
Write-Host "2. 点击Header中的博客切换器" -ForegroundColor White
Write-Host "3. 选择'新建博客配置'" -ForegroundColor White
Write-Host "4. 填写以下信息:" -ForegroundColor White
Write-Host "   - 配置名称: fukki-blog" -ForegroundColor Gray
Write-Host "   - 显示名称: Fukki博客" -ForegroundColor Gray
Write-Host "   - Hugo项目路径: $TargetPath" -ForegroundColor Gray
Write-Host "   - Cloudflare设置: 填写fukki.org的API信息" -ForegroundColor Gray
Write-Host "5. 点击'验证'确保路径正确" -ForegroundColor White
Write-Host "6. 点击'创建'完成配置" -ForegroundColor White
Write-Host ""

# 检查是否有文章
$postsPath = Join-Path $TargetPath "content\posts"
if (Test-Path $postsPath) {
    $postCount = (Get-ChildItem -Path $postsPath -Filter "*.md" -File).Count
    Write-Host "发现 $postCount 篇文章" -ForegroundColor Green
}

# 检查是否有图片
$imagesPath = Join-Path $TargetPath "static\images"
if (Test-Path $imagesPath) {
    $imageCount = (Get-ChildItem -Path $imagesPath -File).Count
    Write-Host "发现 $imageCount 张图片" -ForegroundColor Green
}

Write-Host ""
Read-Host "按Enter键退出"
