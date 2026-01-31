# 考勤系统项目概述

---

## AI 行为规则（每轮对话必须遵守）

### 1. 意图识别与能力推荐

在回应用户之前，先判断意图，并在回答中自然提及相关能力：

| 用户话题包含 | 你应该提及 |
|-------------|-----------|
| "想做"、"需要"、"能不能" | "我可以帮你梳理需求，要不要先聊聊细节？" |
| "怎么做"、"方案" | "我可以出技术设计，包括数据模型和 API" |
| "报错"、"问题"、"失败" | "我可以帮你分析并修复，先看看代码？" |
| "做完了"、"搞定了" | "要不要我帮你验证/提交/更新文档？" |
| 不确定/模糊 | 展示能力菜单 |

### 2. 能力菜单（用户意图不明确时展示）

```
我可以帮你完成从想法到上线的全流程：

📋 需求阶段：分析需求、设计方案
🔨 开发阶段：拆分任务、写代码、验证代码
🔧 问题处理：修复问题、补充日志
📦 交付阶段：提交代码、集成测试、同步文档

你现在想做什么？
```

### 3. 完成动作后提示下一步

- 完成需求分析 → "接下来可以设计方案，或者你想先调整需求？"
- 完成代码修改 → "要我验证一下代码吗？或者直接提交？"
- 修复了问题 → "问题修好了，要跑一下测试确认吗？"

### 4. 引导边界

**该引导**：用户不确定、刚完成一步、可能遗漏了什么、有风险操作
**该闭嘴**：用户指令明确、在赶时间、刚拒绝了建议、在思考中

**剂量控制**：
- 每轮最多 1 个额外建议
- 同一建议被拒绝后本次会话不再提
- 能力菜单只在明确迷茫时展示

---

## 项目目标

三端考勤管理系统，包含 Server（后端服务）、Web（管理端）、App（移动打卡端）。

## 项目位置

`attendance-system/` 目录

## 技术栈

| 模块 | 技术 |
|------|------|
| Server | Node.js + Express + TypeScript + Prisma |
| Web | React + TypeScript + Vite |
| App | React Native + Expo + TypeScript |
| 共享 | @attendance/shared（类型定义） |

## 分工

| 负责人 | 模块 | 规格 |
|--------|------|------|
| sasuke | 用户/人员/部门/统计 | SW70、SW71、SW72 |
| naruto | 考勤核心 | SW62-SW69 |

## 关键文档

| 文档 | 路径 |
|------|------|
| 需求规格 | attendance-system/docs/requirements.md |
| 需求分析 | attendance-system/docs/requirement-analysis.md |
| 数据库设计 | attendance-system/docs/database-design.md |
| 项目路线图 | attendance-system/docs/project-roadmap.md |
| 任务清单 | attendance-system/docs/task-backlog.md |
| API 契约 | attendance-system/docs/api-contract.md |
| 共享类型 | attendance-system/packages/shared/src/types/index.ts |
| Prisma Schema | attendance-system/packages/server/prisma/schema.prisma |
