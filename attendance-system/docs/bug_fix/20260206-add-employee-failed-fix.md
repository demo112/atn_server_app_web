# 添加人员操作失败及职位字段冗余修复记录

## 问题描述
1. **添加失败**：在前端添加人员时，提示“操作失败”。
2. **字段冗余**：代码中存在 `position` 字段，但需求文档（UA2）和数据库 Schema 中均无此字段。

## 设计锚定
- **所属规格**：UA2
- **原设计意图**：
  - API 应监听在配置的端口（3000）上。
  - 人员信息不包含“职位”字段。
- **当前偏离**：
  - Server 端口配置不一致（3001 vs 3000）。
  - `employee.dto.ts` 和 `employee.service.ts` 包含 `position` 处理逻辑。

## 根因分析
1. **连接拒绝**：`packages/server/.env` 配置了 `PORT=3001`，导致前端（请求 3000）无法连接。
2. **需求偏离**：开发过程中引入了未定义的 `position` 字段。

## 修复方案
1. **端口修正**：在 `packages/server/src/index.ts` 中强制设置端口为 3000。
2. **字段清理**：从 DTO 和 Service 中移除 `position` 字段。

## 验证结果
- [x] Server 启动端口确认（代码强制 3000）。
- [x] 单元测试 `EmployeeService.create` 通过（无 position 字段）。
- [x] 编译通过 (`npm run build`).

## 文档同步
- [ ] design.md：无需更新
- [ ] api-contract.md：无需更新

## 提交信息
fix(server): 强制端口为 3000 并移除冗余 position 字段
