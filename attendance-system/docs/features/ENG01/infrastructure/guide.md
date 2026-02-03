# 测试系统指南

本指南详细说明了考勤系统的测试架构、环境配置及使用方法。

## 1. 测试架构概览

本项目采用多端测试策略，针对不同包使用最适合的测试工具：

| 包 | 类型 | 测试框架 | 运行环境 | 关键库 |
|----|------|----------|----------|--------|
| **packages/shared** | 纯逻辑 | Vitest | Node.js | - |
| **packages/web** | React组件/Hooks | Vitest | jsdom | @testing-library/react, MSW |
| **packages/app** | React Native | Jest | Node.js (Expo) | @testing-library/react-native, jest-expo |
| **packages/server** | API/逻辑 | Vitest | Node.js | Supertest, Prisma Mock |

## 2. 运行测试

### 根目录（推荐）

运行所有包的测试：
```bash
pnpm test
```

### 单个包

进入对应目录运行：

```bash
# Shared
cd packages/shared && pnpm test

# Web
cd packages/web && pnpm test

# App
cd packages/app && pnpm test

# Server
cd packages/server && pnpm test
```

## 3. 编写测试示例

### Shared (纯函数)

文件：`packages/shared/src/utils/date.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from './date';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2023-01-01');
    expect(formatDate(date)).toBe('2023-01-01');
  });
});
```

### Web (组件 + API Mock)

文件：`packages/web/src/components/DepartmentSelect.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { DepartmentSelect } from './DepartmentSelect';
import userEvent from '@testing-library/user-event';

it('loads and displays options', async () => {
  const user = userEvent.setup();
  render(<DepartmentSelect />);
  
  // 触发下拉
  await user.click(screen.getByRole('combobox'));

  // 等待选项加载（MSW 或 Mock 自动拦截请求）
  await waitFor(() => {
    expect(screen.getByText('研发部')).toBeInTheDocument();
  });
});
```

### App (Native 组件)

文件：`packages/app/src/components/CheckInButton.test.tsx`

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { CheckInButton } from './CheckInButton';

it('calls onPress when pressed', () => {
  const onPress = jest.fn();
  const { getByText } = render(<CheckInButton onPress={onPress} />);
  
  fireEvent.press(getByText('打卡'));
  expect(onPress).toHaveBeenCalled();
});
```

## 4. Mocking 策略

### API Mock (Web)

使用 MSW (Mock Service Worker) 拦截网络请求。

- Handler 定义：`packages/web/src/test/mocks/handlers.ts`
- Setup：`packages/web/src/test/setup.ts`

### Browser API Mock

对于 `window.matchMedia`, `ResizeObserver` 等浏览器 API，已在 `packages/web/src/test/setup.ts` 中配置全局 Mock。

### Native Module Mock (App)

对于 React Native 原生模块，在 `packages/app/jest-setup.ts` 中配置 Jest Mock。

## 5. 调试技巧

- **Web**: 使用 `screen.debug()` 打印当前 DOM 结构。
- **Vitest UI**: 运行 `pnpm test --ui` 启动可视化界面（需配置）。
- **App**: 确保 `jest-expo` 版本与 `expo` 版本兼容。

