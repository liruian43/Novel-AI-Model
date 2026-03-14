#!/bin/bash

# InkOS Studio - 智能启动器 (macOS/Linux)

echo ""
echo "╔════════════════════════════════════════╗"
echo "║     InkOS Studio - 智能启动器          ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "ℹ️  未检测到 Node.js"
    echo "📥 将自动下载便携版到项目文件夹..."
    echo ""
fi

# 运行启动器
node "$(dirname "$0")/launcher.js"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║            启动失败                    ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "可能的原因和解决方案："
    echo ""
    echo "1. 网络连接问题"
    echo "   - 请检查网络是否正常"
    echo "   - 便携版 Node.js 需要下载（仅需一次）"
    echo ""
    echo "2. Node.js 版本过低"
    echo "   - 请访问 https://nodejs.org/"
    echo "   - 下载安装最新 LTS 版本（v20.x）"
    echo ""
    echo "3. 权限问题"
    echo "   - 尝试：chmod +x start.sh"
    echo "   - 然后：sudo ./start.sh"
    echo ""
    echo "4. 手动启动"
    echo "   - 安装 Node.js 后"
    echo "   - 打开终端"
    echo "   - 进入项目文件夹"
    echo "   - 运行：node launcher.js"
    echo ""
fi

exit $EXIT_CODE
