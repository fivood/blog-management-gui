@echo off
REM 主题布局设置脚本
REM 用于为不同主题创建独立的布局目录

echo === Hugo 主题布局设置工具 ===
echo.

REM 进入 blog 目录
cd blog
if errorlevel 1 (
    echo 错误: 无法进入 blog 目录
    pause
    exit /b 1
)

REM 检查当前主题
for /f "tokens=2 delims==" %%a in ('findstr /r "^theme" hugo.toml') do set CURRENT_THEME=%%a
set CURRENT_THEME=%CURRENT_THEME:"=%
set CURRENT_THEME=%CURRENT_THEME: =%
echo 当前主题: %CURRENT_THEME%
echo.

REM 为 PaperMod 创建布局目录
echo 1. 为 hugo-PaperMod 创建布局目录...
if exist "layouts-hugo-papermod" (
    echo    √ layouts-hugo-papermod 已存在
) else (
    if exist "layouts" (
        echo    正在复制当前 layouts\ 到 layouts-hugo-papermod\...
        xcopy /E /I /Q layouts layouts-hugo-papermod
        echo    √ 已创建 layouts-hugo-papermod\
    ) else (
        echo    ⚠ layouts\ 目录不存在，跳过
    )
)
echo.

REM 为 neopost 创建空的布局目录
echo 2. 为 neopost 创建布局目录...
if exist "layouts-neopost" (
    echo    √ layouts-neopost 已存在
) else (
    mkdir layouts-neopost\_default
    mkdir layouts-neopost\partials
    
    REM 创建简单的 single.html
    (
        echo {{- define "main" -}}
        echo ^<article^>
        echo   ^<header^>
        echo     ^<h1^>{{ .Title }}^</h1^>
        echo     {{- if not .Date.IsZero -}}
        echo     ^<div class="post-meta"^>
        echo       ^<time^>{{ .Date.Format "2006-01-02" }}^</time^>
        echo     ^</div^>
        echo     {{- end -}}
        echo   ^</header^>
        echo.
        echo   {{- if .Content -}}
        echo   ^<div class="post-content"^>
        echo     {{ .Content }}
        echo   ^</div^>
        echo   {{- end -}}
        echo.
        echo   ^<footer^>
        echo     {{- if .Params.tags -}}
        echo     ^<div class="post-tags"^>
        echo       {{- range .Params.tags -}}
        echo       ^<span class="tag"^>{{ . }}^</span^>
        echo       {{- end -}}
        echo     ^</div^>
        echo     {{- end -}}
        echo   ^</footer^>
        echo ^</article^>
        echo {{- end -}}
    ) > layouts-neopost\_default\single.html
    
    REM 创建简单的 list.html
    (
        echo {{- define "main" -}}
        echo ^<div class="list-page"^>
        echo   {{- if .Title -}}
        echo   ^<header^>
        echo     ^<h1^>{{ .Title }}^</h1^>
        echo   ^</header^>
        echo   {{- end -}}
        echo.
        echo   {{- range .Pages -}}
        echo   ^<article class="post-entry"^>
        echo     ^<header^>
        echo       ^<h2^>^<a href="{{ .Permalink }}"^>{{ .Title }}^</a^>^</h2^>
        echo       {{- if not .Date.IsZero -}}
        echo       ^<time^>{{ .Date.Format "2006-01-02" }}^</time^>
        echo       {{- end -}}
        echo     ^</header^>
        echo     {{- if .Summary -}}
        echo     ^<div class="post-summary"^>
        echo       {{ .Summary }}
        echo     ^</div^>
        echo     {{- end -}}
        echo   ^</article^>
        echo   {{- end -}}
        echo ^</div^>
        echo {{- end -}}
    ) > layouts-neopost\_default\list.html
    
    echo    √ 已创建 layouts-neopost\ 及基础布局文件
)
echo.

REM 备份当前 layouts
echo 3. 备份当前 layouts 目录...
if exist "layouts" (
    set BACKUP_NAME=layouts-backup-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%
    set BACKUP_NAME=%BACKUP_NAME: =0%
    xcopy /E /I /Q layouts "%BACKUP_NAME%"
    echo    √ 已备份到 %BACKUP_NAME%\
) else (
    echo    ⚠ layouts\ 目录不存在，无需备份
)
echo.

echo === 设置完成 ===
echo.
echo 现在你可以：
echo 1. 在应用中切换主题，系统会自动使用对应的布局目录
echo 2. 手动编辑 layouts-hugo-papermod\ 或 layouts-neopost\ 中的文件
echo 3. 运行 'hugo' 命令测试构建
echo.
echo 布局目录说明：
echo - layouts\              当前激活的布局
echo - layouts-hugo-papermod\  PaperMod 主题专用布局
echo - layouts-neopost\        neopost 主题专用布局
echo - layouts-backup-*\       备份的布局
echo.

pause
