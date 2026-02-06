# 请假列表接口404/网络错误 修复记录

## 问题描述
- 现象：前端请假页面加载列表时弹出“Network error, please check your connection”和“加载请假列表失败”，控制台出现 404 及连接拒绝错误
- 复现步骤：进入 Web 端 请假/出差管理 页面 → 自动请求列表
- 影响范围：请假列表查询、撤销操作

## 设计锚定
- 所属规格：SW70 考勤模块
- 原设计意图：Web 端通过 `/api/v1/attendance/leaves` 查询与操作请假数据，Vite 代理将 `/api` 前缀转发到后端端口
- 当前偏离：后端未将 `leave.routes` 挂载到 `/api/v1/attendance/leaves`；前端撤销接口使用 `POST /:id/cancel`，后端仅提供 `DELETE /:id`

## 根因分析
- 直接原因：`leave.routes` 未在 `attendance.routes` 中挂载，导致 `/attendance/leaves` 请求返回 404
- 根本原因：路由集成遗漏，前后端接口路径在撤销场景不一致
- 相关代码：packages/server/src/modules/attendance/attendance.routes.ts、packages/server/src/modules/attendance/leave.routes.ts

## 修复方案
- 在考勤主路由中挂载子路由：`router.use('/leaves', leaveRouter)`
- 为撤销操作增加兼容路由：`POST /:id/cancel` 复用同一控制器方法

## 改动文件
- packages/server/src/modules/attendance/attendance.routes.ts
- packages/server/src/modules/attendance/leave.routes.ts

## 验证结果
- 服务器健康检查：`GET /health` 返回 200
- 路由可达性：`GET /api/v1/attendance/leaves` 返回 401（需鉴权）→ 证明路由存在且被认证拦截，不再是 404
- 端口一致性：强制后端监听 3001 端口，修复了因环境变量异常导致监听 3002 造成的代理失败
- 构建：服务端 `npm run build` 通过
- 说明：未更改业务逻辑与数据结构，仅修正路由挂载与撤销路径兼容

## 验证过程补充
- 修复路由挂载后，用户仍反馈 404。经排查，后端服务意外运行在 3002 端口（环境变量 `PORT` 被异常注入），而前端代理指向 3001。
- 解决方案：强制指定 `PORT=3001` 重启服务，并清理旧进程。

## 文档同步
- api-contract.md：无需更新（路径与设计一致）

## 提交信息
fix(attendance): 挂载请假路由并兼容撤销接口路径

