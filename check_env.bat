@echo off
chcp 65001 >nul
echo ==============================================
echo    GIS 全栈开发环境自检脚本
echo    承接第01讲-练习2：一键验证工具链版本
echo ==============================================
echo.

echo [1/4] Node.js 前端运行时
echo ----------------------------------------------
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo   安装路径: %~dp$PATH:node
    for /f "tokens=*" %%i in ('node -v') do echo   版本号:   %%i
) else (
    echo   [WARN] Node.js 未安装或未加入 PATH
)
echo.

echo [2/4] Python 数据处理环境
echo ----------------------------------------------
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo   安装路径: %~dp$PATH:python
    for /f "tokens=*" %%i in ('python --version 2^>^&1') do echo   版本号:   %%i
) else (
    echo   [WARN] Python 未安装或未加入 PATH
)
echo.

echo [3/4] Java 后端运行环境
echo ----------------------------------------------
where java >nul 2>&1
if %errorlevel% equ 0 (
    echo   安装路径: %~dp$PATH:java
    for /f "tokens=3 delims= " %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do echo   版本号:   %%i
) else (
    echo   [WARN] Java 未安装或未加入 PATH
)
echo.

echo [4/4] Git 版本控制
echo ----------------------------------------------
where git >nul 2>&1
if %errorlevel% equ 0 (
    echo   安装路径: %~dp$PATH:git
    for /f "tokens=*" %%i in ('git --version') do echo   版本号:   %%i
) else (
    echo   [WARN] Git 未安装或未加入 PATH
)
echo.

echo ==============================================
echo    自检完成！ 请确认以上版本号满足实验要求
echo ==============================================
pause
