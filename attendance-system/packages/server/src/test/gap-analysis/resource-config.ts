export interface ResourceConfig {
  name: string;
  endpoint: string;
  modelName: string; // The property name in prisma client, e.g. 'user', 'attClockRecord'
  mockEntity: Record<string, any>;
  createPayload?: Record<string, any>; // Valid payload for creation
  stringFields?: string[]; // Fields that should be checked for length limits
}

export const resources: ResourceConfig[] = [
  {
    name: 'User',
    endpoint: '/api/v1/users',
    modelName: 'user',
    mockEntity: {
      id: 1,
      username: 'test_user',
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createPayload: {
      username: 'new_user',
      password: 'password123',
      role: 'user',
      status: 'active',
    },
    stringFields: ['username', 'password'],
  },
  {
    name: 'Employee',
    endpoint: '/api/v1/employees',
    modelName: 'employee',
    mockEntity: {
      id: 101,
      name: 'Test Employee',
      employeeNo: 'EMP001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createPayload: {
      name: 'new_employee',
      employeeNo: 'EMP002',
      status: 'active',
    },
    stringFields: ['name', 'employeeNo'],
  },
  {
    name: 'Department',
    endpoint: '/api/v1/departments',
    modelName: 'department',
    mockEntity: {
      id: 10,
      name: 'IT Dept',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createPayload: {
      name: 'new_dept',
      code: 'DEPT002',
      managerId: 1,
    },
    stringFields: ['name', 'code'],
  },
];
