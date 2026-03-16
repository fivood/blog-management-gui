@echo off
echo ========================================
echo 博客管理 GUI - 开发模式启动脚本
echo ========================================
echo.

REM 检查 5173 端口是否被占用
echo 检查端口占用情况...
netstat -ano | findstr ":5173" > nul
if %errorlevel% equ 0 (
    echo 警告: 5173 端口已被占用
    echo Vite 将自动使用其他端口
    echo.
)

echo 启动开发服务器...
echo.
npm run dev
