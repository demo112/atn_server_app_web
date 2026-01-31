# 考勤系统项目概述

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
| 需求规格 | docs/requirements.md |
| 需求分析 | docs/requirement-analysis.md |
| 数据库设计 | docs/database-design.md |
| 项目路线图 | docs/project-roadmap.md |
| 任务清单 | docs/task-backlog.md |
| API 契约 | docs/api-contract.md |
| 共享类型 | packages/shared/src/types/index.ts |
| Prisma Schema | packages/server/prisma/schema.prisma |
