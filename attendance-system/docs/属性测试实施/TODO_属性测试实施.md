# TODO - 属性测试实施 (后续计划)

## 1. 立即行动 (Quick Wins)
- [ ] **Schema 优化**: `TimePeriodRulesSchema` 当前接受负数，建议添加 `.min(0)` 校验.
- [ ] **Utils 扩展**: 为 `date-helper.ts` (如有) 添加日期计算的属性测试.

## 2. 长期规划
- [ ] **Server 端推广**: 将属性测试引入 `packages/server`，重点覆盖排班算法.
- [ ] **CI 优化**: 配置 `FC_NUM_RUNS` 环境变量，区分开发环境 (100 runs) 和 CI 环境 (1000+ runs).
- [ ] **团队赋能**: 组织一次关于 Property-Based Testing 的内部技术分享.

## 3. 已知限制
- **UI 测试**: 暂未覆盖 React 组件的渲染逻辑，建议维持现状，优先用 Storybook 或 E2E 测试覆盖 UI.
