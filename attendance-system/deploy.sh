#!/bin/bash

# 考勤系统自动化部署脚本
# 用途：在 Linux 生产环境执行全量部署
# 运行方式：chmod +x deploy.sh && ./deploy.sh

# 遇到错误立即停止
set -e

echo "🚀 开始部署流程..."

# 检查必要命令
command -v pnpm >/dev/null 2>&1 || { echo "❌ 错误: 未找到 pnpm，请先安装: npm install -g pnpm"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "❌ 错误: 未找到 pm2，请先安装: npm install -g pm2"; exit 1; }

# 1. 更新代码
echo "----------------------------------------"
echo "📦 步骤 1/4: 更新代码"
git pull
echo "✅ 代码已更新"

# 2. 安装依赖
echo "----------------------------------------"
echo "📚 步骤 2/4: 安装依赖"
pnpm install --frozen-lockfile
echo "✅ 依赖安装完成"

# 3. 部署后端 (Server)
echo "----------------------------------------"
echo "🔧 步骤 3/4: 部署后端服务"
cd packages/server

# 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  警告: 未找到 .env 文件，跳过数据库迁移"
    echo "   请确保 packages/server/.env 文件存在"
else
    echo "   执行数据库迁移..."
    npx prisma migrate deploy
fi

echo "   编译后端代码..."
pnpm build

echo "   启动/重载 PM2 服务..."
if pm2 describe attendance-server > /dev/null 2>&1; then
    pm2 reload attendance-server
    echo "✅ 服务已重载"
else
    pm2 start dist/server/src/index.js --name "attendance-server"
    echo "✅ 服务已启动"
fi
echo "✅ 后端服务已就绪"

cd ../..

# 4. 部署前端 (Web)
echo "----------------------------------------"
echo "🌐 步骤 4/4: 部署前端应用"
cd packages/web

echo "   编译前端代码..."
pnpm build

echo "✅ 前端构建完成 (输出目录: packages/web/dist)"
cd ../..

echo "----------------------------------------"
echo "🎉 部署全部完成！"
echo "   - 后端服务: 运行中 (PM2)"
echo "   - 前端资源: ready for Nginx"
