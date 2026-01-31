@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo       考勤系统 Windows 本机部署脚本
echo ==========================================

:: 1. 检查环境
echo [1/5] 检查环境工具...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 未检测到 Node.js，请先安装: https://nodejs.org/
    pause
    exit /b 1
)

where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARN] 未检测到 pnpm，正在尝试安装...
    call npm install -g pnpm
    if %errorlevel% neq 0 (
        echo [ERROR] pnpm 安装失败，请手动安装: npm install -g pnpm
        pause
        exit /b 1
    )
)

:: 2. 安装依赖
echo.
echo [2/5] 安装项目依赖...
call pnpm install --frozen-lockfile
if %errorlevel% neq 0 (
    echo [ERROR] 依赖安装失败
    pause
    exit /b 1
)

:: 3. 后端部署
echo.
echo [3/5] 部署后端服务 (Server)...
cd packages\server

:: 检查 .env
if not exist .env (
    echo [WARN] 未找到 .env 配置文件
    if exist .env.example (
        echo [INFO] 正在从 .env.example 创建 .env...
        copy .env.example .env >nul
        echo [WARN] 请稍后手动修改 packages\server\.env 中的数据库配置！
    )
)

:: 数据库迁移
echo [INFO] 执行数据库迁移...
call pnpm db:generate
call pnpm prisma migrate deploy
if %errorlevel% neq 0 (
    echo [WARN] 数据库迁移失败 (可能是数据库连接未配置)，跳过...
)

:: 编译
echo [INFO] 编译后端代码...
call pnpm build

:: 启动服务
echo [INFO] 启动后端服务...
:: 尝试使用 PM2，如果没有则直接用 node 启动
where pm2 >nul 2>nul
if %errorlevel% equ 0 (
    call pm2 startOrReload ecosystem.config.js
) else (
    echo [WARN] 未找到 PM2，将在新窗口中直接启动 Node 服务...
    start "Attendance Server" node dist/server/src/index.js
)

cd ..\..

:: 4. 前端部署
echo.
echo [4/5] 部署前端应用 (Web)...
cd packages\web

echo [INFO] 编译前端代码...
call pnpm build
if %errorlevel% neq 0 (
    echo [ERROR] 前端构建失败
    pause
    exit /b 1
)

echo [SUCCESS] 前端构建完成，产物位于: packages\web\dist
cd ..\..

:: 5. 完成
echo.
echo ==========================================
echo           部署流程执行完毕
echo ==========================================
echo 1. 后端服务: 已启动 (端口 3000)
echo 2. 前端文件: packages\web\dist (请使用 Nginx 或 serve 托管)
echo.
echo 提示: 如果这是首次运行，请务必检查 packages\server\.env 数据库配置
echo.
pause
