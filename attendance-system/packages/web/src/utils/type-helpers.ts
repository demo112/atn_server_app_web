// Helper to cast Antd components to compatible React types to avoid "cannot be used as a JSX component" errors
// This is a workaround for Antd v5 + React 18 type incompatibility in this monorepo environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fixAntd = <T>(component: T): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return component as any;
};
