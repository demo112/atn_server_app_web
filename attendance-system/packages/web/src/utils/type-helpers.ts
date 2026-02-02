// Helper to cast Antd components to compatible React types to avoid "cannot be used as a JSX component" errors
// This is a workaround for Antd v5 + React 18 type incompatibility in this monorepo environment
export const fixAntd = <T>(component: T): any => {
  return component as any;
};
