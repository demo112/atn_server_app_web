import { test, expect } from '@playwright/test';
import { ApiClient } from '../utils/api-client';
import { TestDataFactory } from '../utils/test-data';

test.describe('API Helper Layer', () => {
  let apiClient: ApiClient;
  let testData: TestDataFactory;
  const workerId = 1;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request);
    testData = new TestDataFactory(workerId);
    // Ensure we are logged in for API calls
    await apiClient.login('admin', '123456');
  });

  test.afterEach(async () => {
    // Cleanup any data created with this worker prefix
    await apiClient.cleanupTestData(testData.prefix);
  });

  test('should generate unique test data with prefix', () => {
    const dept = testData.generateDepartment();
    expect(dept.name).toContain(testData.prefix);
    
    const emp = testData.generateEmployee({ deptId: 1 });
    expect(emp.employeeNo).toContain(testData.prefix);
    expect(emp.name).toContain(testData.prefix);
  });

  test('should create and retrieve department', async () => {
    // 1. Create Department
    const deptData = testData.generateDepartment();
    
    const dept = await apiClient.createDepartment(deptData);
    expect(dept.name).toBe(deptData.name);
    expect(dept.id).toBeDefined();

    // 2. Get Departments Tree
    const tree = await apiClient.getDepartments();
    const flatTree = JSON.stringify(tree);
    expect(flatTree).toContain(dept.name);

    // 3. Cleanup is handled in afterEach
  });

  test('should create and retrieve employee', async () => {
    // 1. Create Department first
    const deptData = testData.generateDepartment();
    const dept = await apiClient.createDepartment(deptData);

    // 2. Create Employee
    const empData = testData.generateEmployee({ deptId: dept.id });
    const emp = await apiClient.createEmployee(empData);
    
    expect(emp.name).toBe(empData.name);
    expect(emp.deptId).toBe(dept.id);

    // 3. Get Employees
    const employees = await apiClient.getEmployees({ keyword: testData.prefix });
    const items = Array.isArray(employees) ? employees : employees.items;
    const found = items.find((e: any) => e.id === emp.id);
    expect(found).toBeDefined();
  });
});
