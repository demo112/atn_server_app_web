# 前端测试方法论

## 一、核心理念

### 1.1 测试的本质目的

在 AI 辅助开发场景下，测试的作用不是"证明代码正确"，而是：

| 目的 | 说明 |
|------|------|
| 形式化需求 | 把模糊的需求变成可执行的断言 |
| 自洽性检查 | 验证代码内部逻辑一致 |
| 变更保护 | 修改不破坏已有行为 |
| 边界探索 | 发现没想到的情况 |

### 1.2 测试金字塔（前端版）

```
           E2E 测试（少量）
          /              \
       集成测试（适量）
      /                  \
    单元测试（大量 - 但只测逻辑）
```

**原则：越往下越多，越往上越少。**

### 1.3 高 ROI 测试策略

**优先测试：**
- 业务逻辑（计算、校验、状态转换）
- 自定义 Hooks
- API 调用层
- 表单验证

**可以少测/不测：**
- 纯展示组件
- 第三方库封装
- 样式相关

---

## 二、测试类型定义

### 2.1 单元测试

**定义：** 测试单个函数、Hook 或组件的独立行为。

**特征：**
- 快速（毫秒级）
- 隔离（无外部依赖）
- 确定性（相同输入相同输出）

**文件命名：** `*.test.ts` / `*.test.tsx`

**示例场景：**
- 工具函数
- 自定义 Hook
- 纯组件渲染

### 2.2 属性测试（契约验证）

**定义：** 用随机输入验证代码满足某种属性/契约。

**特征：**
- 基于属性而非具体值
- 随机生成大量测试用例
- 能发现边界情况

**文件命名：** `*.property.test.ts`

**常见属性类型：**

| 属性 | 描述 | 示例 |
|------|------|------|
| 往返 | 操作后逆操作恢复原值 | `decode(encode(x)) === x` |
| 不变 | 操作前后某性质不变 | `sort(arr).length === arr.length` |
| 幂等 | 多次执行结果相同 | `format(format(x)) === format(x)` |
| 单调 | 输入增大输出不减 | `x > y → f(x) >= f(y)` |

### 2.3 集成测试

**定义：** 测试多个模块协作的完整流程。

**特征：**
- 基于用户场景
- 可能涉及 Mock API
- 验证端到端流程

**文件命名：** `*.integration.test.ts` / `*.integration.test.tsx`

**示例场景：**
- 表单提交流程
- 页面导航流程
- 数据加载和展示

---

## 三、测试策略矩阵

### 3.1 按代码类型选择测试策略

| 代码类型 | 单元测试 | 属性测试 | 集成测试 |
|----------|----------|----------|----------|
| 工具函数 | ✅ 必须 | ✅ 推荐 | - |
| 自定义 Hook | ✅ 必须 | ⚪ 可选 | - |
| 业务逻辑 | ✅ 必须 | ✅ 推荐 | - |
| 表单组件 | ⚪ 可选 | - | ✅ 推荐 |
| 展示组件 | ❌ 不需要 | - | - |
| 页面组件 | - | - | ✅ 推荐 |
| API 调用 | ✅ 必须 | - | ✅ 推荐 |

### 3.2 按风险等级选择测试深度

| 风险等级 | 测试深度 | 示例 |
|----------|----------|------|
| 高 | 单元 + 属性 + 集成 | 打卡逻辑、考勤计算 |
| 中 | 单元 + 集成 | 表单验证、数据展示 |
| 低 | 单元 | 格式化函数、简单工具 |

---

## 四、Mock 策略

### 4.1 Mock 层级

```
组件测试
    ↓ mock
API 调用层（MSW 拦截）
    ↓ mock
后端服务
```

**原则：在网络层 Mock，不在代码层 Mock。**

### 4.2 MSW 使用规范

```typescript
// 定义 handler
export const handlers = [
  http.get('/api/v1/departments', () => {
    return HttpResponse.json({
      success: true,
      data: [{ id: 1, name: '研发部' }]
    });
  }),
];

// 测试中使用
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 4.3 Mock 数据管理

```
src/test/
├── mocks/
│   ├── handlers/           # MSW handlers
│   │   ├── department.ts
│   │   ├── employee.ts
│   │   └── index.ts
│   ├── data/               # Mock 数据
│   │   ├── department.ts
│   │   └── employee.ts
│   └── server.ts           # MSW server 配置
└── setup.ts                # 测试环境初始化
```

---

## 五、测试编写规范

### 5.1 命名规范

```typescript
// 好的命名：描述行为和预期
test('当邮箱为空时，返回验证错误', () => {});
test('计算工时时，午休时间应被扣除', () => {});

// 差的命名：模糊不清
test('测试验证', () => {});
test('工时计算', () => {});
```

### 5.2 结构规范（AAA 模式）

```typescript
test('描述', () => {
  // Arrange - 准备
  const input = { email: '' };
  
  // Act - 执行
  const result = validate(input);
  
  // Assert - 断言
  expect(result.valid).toBe(false);
  expect(result.errors).toContain('邮箱必填');
});
```

### 5.3 断言规范

```typescript
// 好：具体的断言
expect(result.status).toBe('success');
expect(result.data.length).toBe(3);

// 差：模糊的断言
expect(result).toBeTruthy();
expect(result.data).toBeDefined();
```

---

## 六、与开发流程的整合

### 6.1 TDD 流程

```
红 → 写失败测试 → 运行确认失败
↓
绿 → 写最小代码 → 运行确认通过
↓
重构 → 清理代码 → 运行确认仍通过
↓
下一个测试
```

### 6.2 验证流程
