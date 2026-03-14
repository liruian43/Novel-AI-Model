@echo off
chcp 65001 >nul
title InkOS Studio - 智能启动器

echo.
echo ╔════════════════════════════════════════╗
echo ║     InkOS Studio - 智能启动器          ║
echo ╚════════════════════════════════════════╝
echo.

REM 检查是否安装了 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ℹ️  未检测到 Node.js
    echo 📥 将自动下载便携版到项目文件夹...
    echo.
)

REM 运行智能启动器
node "%~dp0launcher.js"

echo.
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ╔════════════════════════════════════════╗
    echo ║            启动失败                    ║
    echo ╚════════════════════════════════════════╝
    echo.
    echo 可能的原因和解决方案：
    echo.
    echo 1. 网络连接问题
    echo    - 请检查网络是否正常
    echo    - 便携版 Node.js 需要下载（仅需一次）
    echo.
    echo 2. Node.js 版本过低
    echo    - 请访问 https://nodejs.org/ 
    echo    - 下载安装最新 LTS 版本（v20.x）
    echo.
    echo 3. 权限问题
    echo    - 右键点击此文件，选择"以管理员身份运行"
    echo.
    echo 4. 手动启动
    echo    - 安装 Node.js 后
    echo    - 打开命令提示符
    echo    - 进入项目文件夹
    echo    - 运行：node launcher.js
    echo.
    pause
)
