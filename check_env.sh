#!/usr/bin/env bash
# ==============================================
#   GIS 全栈开发环境自检脚本
#   承接第01讲-练习2：一键验证工具链版本
# ==============================================

set -e

echo "=============================================="
echo "   GIS 全栈开发环境自检脚本"
echo "   承接第01讲-练习2：一键验证工具链版本"
echo "=============================================="
echo ""

# [1/4] Node.js
echo "[1/4] Node.js 前端运行时"
echo "----------------------------------------------"
if command -v node &>/dev/null; then
    echo "  安装路径: $(command -v node)"
    echo "  版本号:   $(node -v)"
    echo "  npm 版本: $(npm -v)"
else
    echo "  [WARN] Node.js 未安装或未加入 PATH"
fi
echo ""

# [2/4] Python
echo "[2/4] Python 数据处理环境"
echo "----------------------------------------------"
if command -v python &>/dev/null; then
    echo "  安装路径: $(command -v python)"
    echo "  版本号:   $(python --version 2>&1)"
elif command -v python3 &>/dev/null; then
    echo "  安装路径: $(command -v python3)"
    echo "  版本号:   $(python3 --version 2>&1)"
else
    echo "  [WARN] Python 未安装或未加入 PATH"
fi
echo ""

# [3/4] Java
echo "[3/4] Java 后端运行环境"
echo "----------------------------------------------"
if command -v java &>/dev/null; then
    echo "  安装路径: $(command -v java)"
    echo "  版本号:   $(java -version 2>&1 | head -1)"
elif command -v javac &>/dev/null; then
    echo "  安装路径: $(command -v javac)"
    echo "  版本号:   $(javac -version 2>&1)"
else
    echo "  [WARN] Java 未安装或未加入 PATH"
fi
echo ""

# [4/4] Git
echo "[4/4] Git 版本控制"
echo "----------------------------------------------"
if command -v git &>/dev/null; then
    echo "  安装路径: $(command -v git)"
    echo "  版本号:   $(git --version)"
else
    echo "  [WARN] Git 未安装或未加入 PATH"
fi
echo ""

echo "=============================================="
echo "   自检完成！ 请确认以上版本号满足实验要求"
echo "=============================================="
