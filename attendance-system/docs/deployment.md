# 环境部署指南

本文档旨在指导如何在生产环境（Linux Server）部署考勤系统。

> **注意**：本项目采用 Monorepo 架构，包含 Server（后端）和 Web（前端）两个主要部署单元。

## 1. 环境准备

在开始部署前，请确保服务器满足以下要求：

### 基础环境
- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 7+ 推荐)
- **Node.js**: LTS 版本 (推荐 v18 或 v20)
- **包管理器**: `pnpm` (必需，用于管理 Monorepo 依赖)
- **Web 服务器**: Nginx (用于静态资源托管及反向代理)
- **进程管理**: PM2 (用于管理后端服务)

### 依赖服务
- **数据库**: MySQL 8.0+
- **缓存**: Redis 6.2+

> 推荐使用云厂商提供的托管数据库和 Redis 服务以获得更好的稳定性。

## 2. 自动化部署 (推荐)

项目根目录提供了自动化部署脚本 `deploy.sh`，可一键完成更新代码、安装依赖、数据库迁移、构建和服务重启。

### 使用步骤

1. **配置环境变量**
   
   首次部署时，必须先配置后端环境变量：
   ```bash
   cp packages/server/.env.example packages/server/.env
   vim packages/server/.env
   ```
   填入实际的数据库和 Redis 连接信息。

2. **执行部署脚本**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

脚本执行成功后：
- 后端服务将通过 PM2 启动或重载 (配置见 `packages/server/ecosystem.config.js`)
- 前端静态文件将生成在 `packages/web/dist`

### 3. Nginx 配置

1. **复制配置文件**
   
   将项目中的 `nginx.conf` 复制到 Nginx 配置目录（根据实际情况修改）：
   ```bash
   sudo cp nginx.conf /etc/nginx/conf.d/attendance.conf
   ```

2. **修改配置**
   
   编辑配置文件，修改域名和静态文件路径：
   ```bash
   sudo vim /etc/nginx/conf.d/attendance.conf
   ```
   - 修改 `server_name` 为你的域名
   - 修改 `root` 为实际的 `packages/web/dist` 绝对路径

3. **重启 Nginx**
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

## 4. 手动部署流程 (参考)

如果无法使用自动化脚本，可按照以下步骤手动部署。

### 4.1 代码更新与依赖
```bash
git pull
pnpm install
```

### 4.2 后端服务 (Server)
```bash
cd packages/server
# 数据库迁移
npx prisma migrate deploy
# 构建
pnpm build
# 启动服务
pm2 startOrReload ecosystem.config.js
```

### 4.3 前端应用 (Web)
```bash
cd packages/web
# 构建
pnpm build
# 产物位于 packages/web/dist
```

## 6. 验证部署

1. **检查后端状态**: 
   ```bash
   pm2 status
   pm2 logs attendance-server
   ```

2. **访问前端**: 
   在浏览器访问配置的域名（或 http://localhost），应能看到登录页面。

3. **功能测试**: 
   尝试登录系统，确保前后端连接正常，数据库读写正常。
