# Design: UI-CLONE-Correction 补签页面UI升级

## UI 组件映射

| 原有组件 | 参考组件 | 变更方案 |
|---------|---------|---------|
| `CorrectionPage` | `App.tsx` | 替换 Layout 和 Table 结构，保留 `DepartmentTree` 和 `useCorrection` 逻辑 |
| `CheckInDialog` | `CorrectionModal` | 更新 Modal 内部 JSX，应用新样式 |
| `CheckOutDialog` | `CorrectionModal` | 更新 Modal 内部 JSX，应用新样式 |

## 样式定义 (Tailwind)

### 页面布局
```tsx
<div className="flex h-full gap-0 bg-slate-50"> {/* 移除 gap-5, 改为 gap-0 或适配新布局 */}
  {/* Sidebar (DepartmentTree) */}
  <div className="w-[240px] shrink-0 bg-white border-r border-slate-200 flex flex-col">
    <DepartmentTree />
  </div>

  {/* Main Content */}
  <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
    {/* Filter Header */}
    <div className="bg-white px-6 py-3 border-b border-slate-200 ...">
       {/* ... */}
    </div>
    
    {/* Table Area */}
    <div className="flex-1 overflow-auto p-4 custom-scrollbar">
       {/* ... */}
    </div>
  </div>
</div>
```

### 弹窗样式
将 `StandardModal` 的 `header` 和 `body` 样式进行定制，或者直接在 `CheckInDialog` 中渲染自定义 Header（如果 `StandardModal` 支持隐藏默认 Header）。
*注：`StandardModal` 可能有固定的 Header。如果限制太多，可能需要重写 Modal 结构或调整 `StandardModal`。暂时假设通过 `StandardModal` 的 props 或 children 可以实现大部分样式。如果不行，直接在 Dialog 中使用参考代码的 Modal 结构（需处理 Portal/Overlay）。*

**决策**: 鉴于 `StandardModal` 是通用组件，修改它风险较大。我将在 `CheckInDialog` 中使用 `StandardModal` 但尝试通过 `className` 覆盖样式，或者如果差异过大，就不使用 `StandardModal` 而直接使用 Headless UI 的 `Dialog` (如果项目有) 或参考代码的 Modal 实现。
*检查项目*: 项目有 `StandardModal`。参考代码 `CorrectionModal` 是自己写的 div overlay。
*方案*: 为了完美复刻 UI，建议在 `CheckInDialog` 中**不使用** `StandardModal`，而是直接拷贝参考代码的 Modal 结构（Portal 到 body）。

## API 设计
无变更。继续使用 `correctionService`。

## 文件变更
1. `src/pages/attendance/correction/CorrectionPage.tsx` - 重写 JSX
2. `src/pages/attendance/correction/components/CheckInDialog.tsx` - 重写 JSX (Remove StandardModal, use Custom Modal)
3. `src/pages/attendance/correction/components/CheckOutDialog.tsx` - 重写 JSX (Remove StandardModal, use Custom Modal)
