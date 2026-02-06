# 添加人员操作失败及职位字段冗余修复记录

## 问题描述
1. **添加失败**：在前端添加人员时，提示“操作失败”。
2. **字段冗余**：代码中存在 `position` 字段，但需求文档（UA2）和数据库 Schema 中均无此字段。

## 设计锚定
- **所属规格**：UA2
- **原设计意图**：
  - Server 端口应由环境变量控制（规范为 3001）。
  - 人员信息不包含“职位”字段。
- **当前偏离**：
  - 前端请求端口与 Server 监听端口不一致。
  - `employee.dto.ts` 和 `employee.service.ts` 包含 `position` 处理逻辑。

## 根因分析
1. **连接拒绝**：`packages/server/.env` 配置与前端代理配置不一致，或代码强制使用了错误端口。
2. **需求偏离**：开发过程中引入了未定义的 `position` 字段。

## 修复方案
1. **端口修正**：
   - 撤销 `packages/server/src/index.ts` 中的端口强制逻辑，恢复为 `process.env.PORT || 3000`。
   - 确认 `packages/server/.env` 应配置为 `PORT=3001`（需手动修改）。
2. **字段清理**：从 DTO 和 Service 中移除 `position` 字段。

## 验证结果
- [x] Server 启动端口确认（读取环境变量）。
- [x] 单元测试 `EmployeeService.create` 通过（无 position 字段）。
- [x] 编译通过 (`npm run build`).

## 文档同步
- [ ] design.md：无需更新
- [ ] api-contract.md：无需更新

## 提交信息
fix(server): 恢复 Server 端口环境变量读取逻辑并移除冗余 position 字段
