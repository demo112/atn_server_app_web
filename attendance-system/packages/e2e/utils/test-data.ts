import { faker } from '@faker-js/faker/locale/zh_CN';

export class TestDataFactory {
  readonly prefix: string;

  constructor(workerId: number | string) {
    this.prefix = `[W${workerId}]`;
  }

  generatePhone(): string {
    return faker.phone.number();
  }

  generateEmployeeNo(): string {
    // Generate random 4 digits suffix to avoid collision within worker
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
      mobile: this.generatePhone(),
      position: 'Staff',
      email: faker.internet.email(),
      hireDate: '2024-01-01',
      status: 'active',
      ...overrides,
    };
  }
}
