# Hugo博客结构验证脚本
param(
    [string]$BlogPath = "blog-fukki"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Hugo博客结构验证" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$FullPath = Join-Path $PSScriptRoot $BlogPath
Write-Host "检查路径: $FullPath" -ForegroundColor Yellow
Write-Host ""

# 检查目录是否存在
if (-not (Test-Path $FullPath)) {
    Write-Host "✗ 目录不存在" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 目录存在" -ForegroundColor Green

# 检查必需目录
Write-Host ""
Write-Host "检查必需目录:" -ForegroundColor Cyan
$requiredDirs = @("content", "static")
foreach ($dir in $requiredDirs) {
    $dirPath = Join-Path $FullPath $dir
    if (Test-Path $dirPath) {
        Write-Host "  ✓ $dir/" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $dir/ (缺失)" -ForegroundColor Red
    }
}

# 检查配置文件
Write-Host ""
Write-Host "检查配置文件:" -ForegroundColor Cyan
$configFiles = @(
    "hugo.toml",
    "hugo.yaml", 
    "config.toml",
    "config.yaml",
    "config/_default/hugo.toml",
    "config/_default/hugo.yaml",
    "config/_default/config.toml",
    "config/_default/config.yaml"
)

$configFound = $false
foreach ($configFile in $configFiles) {
    $configPath = Join-Path $FullPath $configFile
    if (Test-Path $configPath) {
        Write-Host "  ✓ $configFile" -ForegroundColor Green
        $configFound = $true
    }
}

if (-not $configFound) {
    Write-Host "  ✗ 未找到任何配置文件" -ForegroundColor Red
}

# 检查可选目录
Write-Host ""
Write-Host "检查可选目录:" -ForegroundColor Cyan
$optionalDirs = @("themes", "layouts", "assets", "data", "i18n", "archetypes")
foreach ($dir in $optionalDirs) {
    $dirPath = Join-Path $FullPath $dir
    if (Test-Path $dirPath) {
        Write-Host "  ✓ $dir/" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $dir/ (不存在)" -ForegroundColor Yellow
    }
}

# 统计内容
Write-Host ""
Write-Host "内容统计:" -ForegroundColor Cyan

# 统计文章
$postsPath = Join-Path $FullPath "content\blog"
if (-not (Test-Path $postsPath)) {
    $postsPath = Join-Path $FullPath "content\posts"
}
if (Test-Path $postsPath) {
    $postCount = (Get-ChildItem -Path $postsPath -Filter "*.md" -Recurse -File).Count
    Write-Host "  文章数: $postCount" -ForegroundColor White
} else {
    Write-Host "  文章数: 0 (未找到posts或blog目录)" -ForegroundColor Yellow
}

# 统计图片
$imagesPath = Join-Path $FullPath "static\images"
if (Test-Path $imagesPath) {
    $imageCount = (Get-ChildItem -Path $imagesPath -File -Recurse).Count
    Write-Host "  图片数: $imageCount" -ForegroundColor White
} else {
    Write-Host "  图片数: 0 (未找到images目录)" -ForegroundColor Yellow
}

# 检查主题
$themesPath = Join-Path $FullPath "themes"
if (Test-Path $themesPath) {
    $themes = Get-ChildItem -Path $themesPath -Directory
    Write-Host "  主题数: $($themes.Count)" -ForegroundColor White
    foreach ($theme in $themes) {
        Write-Host "    - $($theme.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($configFound) {
    Write-Host "验证通过！可以在应用中创建博客配置" -ForegroundColor Green
} else {
    Write-Host "验证失败：缺少配置文件" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
