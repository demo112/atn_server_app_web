# 技术设计文档：用户登录信息展示与登出

## 1. 现有架构分析
- **AuthContext**: 已存在，提供 `user` 对象（含 `name`, `username`, `role`）和 `logout` 方法。
- **Header 组件**: `packages/web/src/components/layout/Header.tsx` 已存在，且被 `MainLayout` 引用。
- **UI 风格**: Tailwind CSS，顶部深蓝色背景。

## 2. 详细设计

### 2.1 UI 设计
在 `Header` 组件右侧 Flex 容器中添加用户信息区：

```tsx
<div className="flex items-center space-x-6 text-sm">
  {/* 用户信息卡片 */}
  <div className="flex items-center space-x-2 ...">
    <Icon name="person" />
    <span>{user.name || user.username}</span>
    <Badge>{role}</Badge>
  </div>

  {/* 登出按钮 */}
  <button onClick={logout} ...>
    <Icon name="logout" />
    <span>退出</span>
  </button>
</div>
```

### 2.2 逻辑设计
- 直接使用 `useAuth()` hook 获取 `user` 和 `logout`。
- `logout` 方法内部已处理 `localStorage` 清除和路由跳转。

### 2.3 数据模型
依赖现有的 `AuthUser` 接口：
```typescript
interface AuthUser {
  id: number;
  username: string;
  role: 'admin' | 'user';
  name?: string;
  // ...
}
```

## 3. 验证计划
- **单元测试**: `Header.test.tsx`
  - 验证登录状态下渲染用户名
  - 验证点击退出按钮调用 logout 方法
- **集成测试**: 
  - 启动应用，模拟登录流程，检查 Header 显示
  - 点击退出，检查是否跳回登录页
