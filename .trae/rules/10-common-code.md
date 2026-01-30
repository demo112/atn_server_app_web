# 公共代码规则

## 公共代码范围
- `packages/server/src/common/**/*`
- `packages/server/src/types/common.ts`
- `packages/web/src/types/common.ts`
- `packages/web/src/utils/common.ts`
- `packages/app/src/types/common.ts`
- `packages/app/src/utils/common.ts`

## 修改规则
| 规则 | 说明 |
|------|------|
| 禁止AI自行修改 | AI不得自行修改公共代码 |
| 修改前必须沟通 | 需要修改时，先告知用户 |
| 获得确认后修改 | 用户确认后才能修改 |
| 修改后通知 | 修改后通知所有相关人员 |

## AI 需要修改时
```
⚠️ 需要修改公共代码
文件: xxx
原因: xxx
修改内容: xxx
影响范围: xxx
请确认是否允许修改。
```
