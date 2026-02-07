import { faker } from '@faker-js/faker/locale/zh_CN';
import { ApiClient } from './api-client';

export class TestDataFactory {
  readonly prefix: string;
  private api: ApiClient | null = null;
  private createdEmployeeIds: number[] = [];
  private createdDepartmentIds: number[] = [];
  private createdScheduleIds: number[] = [];
  private createdShiftIds: number[] = [];
  private createdTimePeriodIds: number[] = [];
  private createdUserIds: number[] = [];

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
      email: faker.internet.email(),
      hireDate: '2024-01-01',
      status: 'active',
      ...overrides,
    };
  }

  /** 创建带前缀的用户（需要先设置 API） */
  async createUser(data: { username: string; password?: string; role?: string; employeeId?: number }) {
    if (!this.api) throw new Error('API client not set');
    const user = await this.api.createUser({
      username: `${this.prefix}${data.username}`,
      password: data.password || '123456',
      role: data.role || 'user',
      employeeId: data.employeeId,
    });
    this.createdUserIds.push(user.id);
    return user;
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

  async createTimePeriod(overrides: any = {}) {
    if (!this.api) throw new Error('API client not set');
    const data = {
      name: `${this.prefix}Time_${Date.now()}`,
      type: 0, // 0: Normal
      startTime: '09:00',
      endTime: '18:00',
      ...overrides
    };
    const period = await this.api.createTimePeriod(data);
    this.createdTimePeriodIds.push(period.id);
    return period;
  }

  async createShift(overrides: any = {}) {
    if (!this.api) throw new Error('API client not set');
    
    // If no days provided, create a default time period and assign it
    let days = overrides.days;
    if (!days) {
      const period = await this.createTimePeriod();
      days = [
        { dayOfCycle: 1, periodIds: [period.id] },
        { dayOfCycle: 2, periodIds: [period.id] },
        { dayOfCycle: 3, periodIds: [period.id] },
        { dayOfCycle: 4, periodIds: [period.id] },
        { dayOfCycle: 5, periodIds: [period.id] }
      ];
    }

    const data = {
      name: `${this.prefix}Shift_${Date.now()}`,
      cycleDays: 7,
      days,
      ...overrides
    };
    
    const shift = await this.api.createShift(data);
    this.createdShiftIds.push(shift.id);
    return shift;
  }

  async createSchedule(data: { employeeId: number; shiftId: number; startDate: string; endDate: string }) {
    if (!this.api) throw new Error('API client not set');
    const schedule = await this.api.createSchedule(data);
    this.createdScheduleIds.push(schedule.id);
    return schedule;
  }

  async createDailyRecord(employeeId: number, date: string) {
    if (!this.api) throw new Error('API client not set');
    // 1. Trigger recalculate to ensure record exists
    await this.api.recalculate({
      startDate: date,
      endDate: date,
      employeeIds: [employeeId]
    });
    
    // 2. Poll for record with retry
    const maxRetries = 10;
    const interval = 500; // ms

    for (let i = 0; i < maxRetries; i++) {
      const records = await this.api.getDailyRecords({
        employeeId,
        startDate: date,
        endDate: date
      });
      
      const item = Array.isArray(records) ? records[0] : (records.items && records.items[0]);
      if (item) {
        return item;
      }
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Failed to create/find daily record for employee ${employeeId} on ${date} after ${maxRetries} retries`);
  }

  async createCorrection(data: { employeeId: number; date: string; time: string; remark?: string }) {
    if (!this.api) throw new Error('API client not set');
    
    // 1. Ensure DailyRecord exists
    const dailyRecord = await this.createDailyRecord(data.employeeId, data.date);
    
    // 2. Create Correction (Supplement Check-In)
    const res = await this.api.supplementCheckIn({
      dailyRecordId: dailyRecord.id,
      checkInTime: `${data.date} ${data.time}`, // format? ISO? Controller expects ISO usually, or 'YYYY-MM-DD HH:mm:ss'?
      // DTO says checkInTime: string. Service does dayjs(dto.checkInTime).toDate().
      // dayjs parses ISO or standard formats.
      remark: data.remark || 'Test Correction'
    });
    
    return res;
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

    // 删除排班
    for (const id of this.createdScheduleIds) {
      try {
        await this.api.deleteSchedule(id);
      } catch {
        // 忽略
      }
    }

    // 删除班次
    for (const id of this.createdShiftIds) {
      try {
        await this.api.deleteShift(id);
      } catch {
        // 忽略
      }
    }

    // 删除时间段
    for (const id of this.createdTimePeriodIds) {
      try {
        await this.api.deleteTimePeriod(id);
      } catch {
        // 忽略
      }
    }

    this.createdEmployeeIds = [];
    this.createdDepartmentIds = [];
    this.createdScheduleIds = [];
    this.createdShiftIds = [];
    this.createdTimePeriodIds = [];
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
