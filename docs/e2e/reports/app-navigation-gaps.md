# App Navigation Security Gap Analysis Report
Generated at: 2026-02-07T02:54:47.529Z

## Summary
Total usages of `route.params` found: 13

> Note: These are locations where navigation parameters are accessed. Review them to ensure runtime validation (e.g. using Zod) is performed before using the data.

## Details
| File | Line | Content |
|------|------|---------|
| screens\organization\department\DepartmentEditScreen.tsx | 12 | `const isEdit = !!route.params?.id;` |
| screens\organization\department\DepartmentEditScreen.tsx | 13 | `const initialParentId = route.params?.parentId || null;` |
| screens\organization\department\DepartmentEditScreen.tsx | 44 | `const res = await getDepartmentById(route.params.id);` |
| screens\organization\department\DepartmentEditScreen.tsx | 82 | `await updateDepartment(route.params.id, data);` |
| screens\organization\department\DepartmentListScreen.tsx | 15 | `const parentId = route.params?.parentId || null;` |
| screens\organization\department\DepartmentListScreen.tsx | 16 | `const parentName = route.params?.title || '部门管理';` |
| screens\organization\employee\EmployeeEditScreen.tsx | 12 | `const isEdit = !!route.params?.id;` |
| screens\organization\employee\EmployeeEditScreen.tsx | 44 | `const emp = await getEmployeeById(route.params.id);` |
| screens\organization\employee\EmployeeEditScreen.tsx | 82 | `await updateEmployee(route.params.id, data);` |
| screens\organization\user\UserEditScreen.tsx | 72 | `const isEdit = !!route.params?.id;` |
| screens\organization\user\UserEditScreen.tsx | 110 | `const user = await getUserById(route.params.id);` |
| screens\organization\user\UserEditScreen.tsx | 166 | `await updateUser(route.params.id, data);` |
| screens\shift\ShiftEditScreen.tsx | 37 | `const { shift } = route.params as { shift: Shift | null };` |
