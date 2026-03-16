@echo off
chcp 65001 >nul
echo ========================================
echo Hugo博客迁移脚本
echo ========================================
echo.

set SOURCE_BLOG=G:\Publish\Publish\blog
set TARGET_BLOG=blog-fukki

echo 源博客路径: %SOURCE_BLOG%
echo 目标路径: %CD%\%TARGET_BLOG%
echo.

REM 检查源目录是否存在
if not exist "%SOURCE_BLOG%" (
    echo 错误: 源博客目录不存在: %SOURCE_BLOG%
    pause
    exit /b 1
)

REM 检查目标目录
if exist "%TARGET_BLOG%" (
    echo 警告: 目标目录已存在
    set /p CONFIRM="是否覆盖? (Y/N): "
    if /i not "%CONFIRM%"=="Y" (
        echo 取消迁移
        pause
        exit /b 0
    )
    echo 删除现有目录...
    rmdir /s /q "%TARGET_BLOG%"
)

echo.
echo 开始迁移...
echo.

REM 创建目标目录
echo [1/8] 创建目标目录...
mkdir "%TARGET_BLOG%"

REM 复制配置文件
echo [2/8] 复制配置文件...
if exist "%SOURCE_BLOG%\config" (
    xcopy "%SOURCE_BLOG%\config" "%TARGET_BLOG%\config" /E /I /H /Y >nul
    echo   ✓ config/ (多环境配置)
) else if exist "%SOURCE_BLOG%\hugo.toml" (
    copy "%SOURCE_BLOG%\hugo.toml" "%TARGET_BLOG%\hugo.toml" >nul
    echo   ✓ hugo.toml
) else if exist "%SOURCE_BLOG%\config.toml" (
    copy "%SOURCE_BLOG%\config.toml" "%TARGET_BLOG%\config.toml" >nul
    echo   ✓ config.toml
) else if exist "%SOURCE_BLOG%\hugo.yaml" (
    copy "%SOURCE_BLOG%\hugo.yaml" "%TARGET_BLOG%\hugo.yaml" >nul
    echo   ✓ hugo.yaml
) else (
    echo   ✗ 未找到配置文件
)

REM 复制内容目录
echo [3/8] 复制内容目录 (content/)...
if exist "%SOURCE_BLOG%\content" (
    xcopy "%SOURCE_BLOG%\content" "%TARGET_BLOG%\content" /E /I /H /Y >nul
    echo   ✓ content/
) else (
    echo   ✗ content/ 不存在
)

REM 复制静态文件
echo [4/8] 复制静态文件 (static/)...
if exist "%SOURCE_BLOG%\static" (
    xcopy "%SOURCE_BLOG%\static" "%TARGET_BLOG%\static" /E /I /H /Y >nul
    echo   ✓ static/
) else (
    echo   ✗ static/ 不存在
)

REM 复制主题
echo [5/8] 复制主题 (themes/)...
if exist "%SOURCE_BLOG%\themes" (
    xcopy "%SOURCE_BLOG%\themes" "%TARGET_BLOG%\themes" /E /I /H /Y >nul
    echo   ✓ themes/
) else (
    echo   ⚠ themes/ 不存在 (可能使用共享主题)
)

REM 复制布局
echo [6/8] 复制布局 (layouts/)...
if exist "%SOURCE_BLOG%\layouts" (
    xcopy "%SOURCE_BLOG%\layouts" "%TARGET_BLOG%\layouts" /E /I /H /Y >nul
    echo   ✓ layouts/
) else (
    echo   ⚠ layouts/ 不存在 (使用默认布局)
)

REM 复制资源
echo [7/8] 复制资源 (assets/)...
if exist "%SOURCE_BLOG%\assets" (
    xcopy "%SOURCE_BLOG%\assets" "%TARGET_BLOG%\assets" /E /I /H /Y >nul
    echo   ✓ assets/
) else (
    echo   ⚠ assets/ 不存在
)

REM 复制其他可选目录
echo [8/8] 复制其他文件...
if exist "%SOURCE_BLOG%\data" (
    xcopy "%SOURCE_BLOG%\data" "%TARGET_BLOG%\data" /E /I /H /Y >nul
    echo   ✓ data/
)
if exist "%SOURCE_BLOG%\i18n" (
    xcopy "%SOURCE_BLOG%\i18n" "%TARGET_BLOG%\i18n" /E /I /H /Y >nul
    echo   ✓ i18n/
)
if exist "%SOURCE_BLOG%\archetypes" (
    xcopy "%SOURCE_BLOG%\archetypes" "%TARGET_BLOG%\archetypes" /E /I /H /Y >nul
    echo   ✓ archetypes/
)

echo.
echo ========================================
echo 迁移完成！
echo ========================================
echo.
echo 目标路径: %CD%\%TARGET_BLOG%
echo.
echo 下一步:
echo 1. 启动应用 (npm run dev)
echo 2. 点击Header中的博客切换器
echo 3. 选择"新建博客配置"
echo 4. 填写以下信息:
echo    - 配置名称: fukki-blog
echo    - 显示名称: Fukki博客
echo    - Hugo项目路径: %CD%\%TARGET_BLOG%
echo    - Cloudflare设置: 填写fukki.org的API信息
echo 5. 点击"验证"确保路径正确
echo 6. 点击"创建"完成配置
echo.
pause
