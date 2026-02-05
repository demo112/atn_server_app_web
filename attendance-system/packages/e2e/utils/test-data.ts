import { faker } from '@faker-js/faker/locale/zh_CN';
import { ApiClient } from './api-client';

export class TestDataFactory {
  readonly prefix: string;
  private api: ApiClient | null = null;
  private createdEmployeeIds: number[] = [];
  private createdDepartmentIds: number[] = [];

  constructor(workerId: number | string, api?: ApiClient) {
    this.prefix = `[W${workerId}]`;
    this.api = api || null;
  }

  /** 设置 API 客户端 */
  setApi(api: ApiClient): void {
    this.api = api;
  }

  generatePhone(): string {
    return faker.phone.number();
  }

  generateEmployeeNo(): string {
    const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${this.prefix}${suffix}`;
  }

  generateDepartment(overrides: any = {}) {
    return {
      name: `${this.prefix}Dept_${faker.commerce.department()}_${Date.now()}`,
      ...overrides,
    };
  }

  generateEmployee(overrides: any = {}) {
    return {
      name: `${this.prefix}User_${faker.person.firstName()}`,
      employeeNo: this.generateEmployeeNo(),
      phone: this.generatePhone(),
      position: 'Staff',
      email: faker.internet.email(),
      hireDate: '2024-01-01',
      status: 'active',
      ...overrides,
    };
  }

  /** 创建带前缀的员工（需要先设置 API） */
  async createEmployee(data: { name: string; phone?: string; email?: string; deptId?: number }) {
    if (!this.api) throw new Error('API client not set');
    const employee = await this.api.createEmployee({
      ...this.generateEmployee(),
      name: `${this.prefix}${data.name}`,
      phone: data.phone,
      email: data.email,
      deptId: data.deptId,
    });
    this.createdEmployeeIds.push(employee.id);
    return employee;
  }

  /** 创建带前缀的部门（需要先设置 API） */
  async createDepartment(data: { name: string; parentId?: number }) {
    if (!this.api) throw new Error('API client not set');
    const department = await this.api.createDepartment({
      name: `${this.prefix}${data.name}`,
      parentId: data.parentId,
    });
    this.createdDepartmentIds.push(department.id);
    return department;
  }

  /** 清理本工厂创建的所有数据 */
  async cleanup(): Promise<void> {
    if (!this.api) return;

    // 先删除员工
    for (const id of this.createdEmployeeIds) {
      try {
        await this.api.deleteEmployee(id);
      } catch {
        // 忽略删除失败
      }
    }

    // 再删除部门（倒序删除）
    for (const id of [...this.createdDepartmentIds].reverse()) {
      try {
        await this.api.deleteDepartment(id);
      } catch {
        // 忽略删除失败
      }
    }

    this.createdEmployeeIds = [];
    this.createdDepartmentIds = [];
  }

  /** 获取已创建的员工 ID 列表 */
  getCreatedEmployeeIds(): number[] {
    return [...this.createdEmployeeIds];
  }

  /** 获取已创建的部门 ID 列表 */
  getCreatedDepartmentIds(): number[] {
    return [...this.createdDepartmentIds];
  }
}
