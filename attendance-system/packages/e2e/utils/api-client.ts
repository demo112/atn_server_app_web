import { APIRequestContext } from '@playwright/test';

export interface ApiLoginResponse {
  success: boolean;
  data: {
    token: string;
    user: any;
  };
}

export class ApiClient {
  private request: APIRequestContext;
  private token: string | null = null;
  private readonly baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3001'; // Default API URL

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /** 获取当前 token */
  getToken(): string | null {
    return this.token;
  }

  /** 设置认证 token */
  setToken(token: string): void {
    this.token = token;
  }

  private async post(url: string, data: any) {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const response = await this.request.post(`${this.baseUrl}${url}`, {
      data,
      headers,
    });
    
    if (!response.ok()) {
        const body = await response.text();
        throw new Error(`API Request Failed: ${response.status()} ${response.statusText()} - ${body}`);
    }
    return response.json();
  }

  private async get(url: string, params?: any) {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await this.request.get(`${this.baseUrl}${url}`, {
      params,
      headers,
    });

    if (!response.ok()) {
        const body = await response.text();
        throw new Error(`API Request Failed: ${response.status()} ${response.statusText()} - ${body}`);
    }
    return response.json();
  }

  private async delete(url: string) {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await this.request.delete(`${this.baseUrl}${url}`, {
      headers,
    });

    if (!response.ok()) {
        const body = await response.text();
        throw new Error(`API Request Failed: ${response.status()} ${response.statusText()} - ${body}`);
    }
    return response.json();
  }

  async login(username: string = 'admin', password: string = '123456'): Promise<string> {
    const response = await this.request.post(`${this.baseUrl}/api/v1/auth/login`, {
      data: { username, password },
    });
    
    if (!response.ok()) {
        const body = await response.text();
        throw new Error(`Login Failed: ${response.status()} ${body}`);
    }
    
    const body: ApiLoginResponse = await response.json();
    this.token = body.data.token;
    return this.token;
  }

  // Department CRUD
  async createDepartment(data: any) {
    const res = await this.post('/api/v1/departments', data);
    return res.data;
  }

  async getDepartments() {
    const res = await this.get('/api/v1/departments/tree');
    return res.data;
  }

  async deleteDepartment(id: number) {
    return this.delete(`/api/v1/departments/${id}`);
  }

  // User CRUD
  async getUsers(params?: any) {
    const res = await this.get('/api/v1/users', params);
    return res.data;
  }

  async createUser(data: any) {
    const res = await this.post('/api/v1/users', data);
    return res.data;
  }

  async deleteUser(id: number) {
    return this.delete(`/api/v1/users/${id}`);
  }

  // Employee CRUD
  async createEmployee(data: any) {
    const res = await this.post('/api/v1/employees', data);
    return res.data;
  }

  async getEmployees(params?: any) {
    const res = await this.get('/api/v1/employees', params);
    return res.data;
  }

  async deleteEmployee(id: number) {
    return this.delete(`/api/v1/employees/${id}`);
  }

  // Correction
  async supplementCheckIn(data: any) {
    const res = await this.post('/api/v1/attendance/corrections/check-in', data);
    return res.data;
  }

  async supplementCheckOut(data: any) {
    const res = await this.post('/api/v1/attendance/corrections/check-out', data);
    return res.data;
  }

  async getCorrections(params?: any) {
    const res = await this.get('/api/v1/attendance/corrections', params);
    return res.data;
  }

  async updateCorrection(id: number, data: any) {
    const res = await this.request.put(`${this.baseUrl}/api/v1/attendance/corrections/${id}`, {
      data,
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    if (!res.ok()) {
      const body = await res.text();
      throw new Error(`Update Correction Failed: ${res.status()} ${body}`);
    }
    return res.json();
  }

  async deleteCorrection(id: number) {
    return this.delete(`/api/v1/attendance/corrections/${id}`);
  }

  async getDailyRecords(params?: any) {
    const res = await this.get('/api/v1/attendance/daily', params);
    return res.data;
  }

  // Clock
  async clock(data: any) {
    const res = await this.post('/api/v1/attendance/clock', data);
    return res.data;
  }

  // Attendance
  async createTimePeriod(data: any) {
    const res = await this.post('/api/v1/attendance/time-periods', data);
    return res.data;
  }

  async deleteTimePeriod(id: number) {
    return this.delete(`/api/v1/attendance/time-periods/${id}`);
  }

  async createShift(data: any) {
    const res = await this.post('/api/v1/attendance/shifts', data);
    return res.data;
  }

  async deleteShift(id: number) {
    return this.delete(`/api/v1/attendance/shifts/${id}`);
  }

  async createSchedule(data: any) {
    const res = await this.post('/api/v1/attendance/schedules', data);
    return res.data;
  }

  async deleteSchedule(id: number) {
    return this.delete(`/api/v1/attendance/schedules/${id}`);
  }

  async recalculate(data: { startDate: string; endDate: string; employeeIds?: number[] }) {
    const res = await this.post('/api/v1/attendance/recalculate', data);
    return res.data;
  }

  async getShifts(params?: any) {
    const res = await this.get('/api/v1/attendance/shifts', params);
    return res.data;
  }

  async getTimePeriods(params?: any) {
    const res = await this.get('/api/v1/attendance/time-periods', params);
    return res.data;
  }

  // Cleanup
  async cleanupTestData(prefix: string) {
    // 0. Clean Users with prefix (User -> Employee might be CASCADE, or we delete User then Employee)
    // If User -> Employee is CASCADE, deleting User deletes Employee.
    // If RESTRICT, we must delete User first (since Employee is usually the parent in business logic, but database FK might be on User.employeeId).
    // In our schema: User has employeeId (optional).
    // Let's delete Users first.
    try {
        const users = await this.getUsers({ keyword: prefix, pageSize: 100 });
        const userItems = Array.isArray(users) ? users : users.items || [];
        for (const user of userItems) {
            if (user.username && user.username.includes(prefix)) {
                try {
                    await this.deleteUser(user.id);
                } catch (e) {
                    console.warn(`Failed to delete user ${user.id}:`, e);
                }
            }
        }
    } catch (e) {
        console.warn('Failed to cleanup users:', e);
    }

    // 0. Clean Shifts and TimePeriods first (as they might rely on employees/depts? No, usually other way around or independent)
    // Actually, Schedule depends on Shift and Employee.
    // If we delete Employee first, Schedule might be deleted (if cascade) or block deletion.
    // In our DB, Schedule -> Employee is RESTRICT. So we must delete Schedule first.
    // But we can't find Schedule easily.
    // So let's try to delete Shift. If Shift -> Schedule is RESTRICT, it will fail.
    
    // Try to find Shifts with prefix
    try {
        const shifts = await this.getShifts({ name: prefix, pageSize: 100 });
        const shiftItems = Array.isArray(shifts) ? shifts : shifts.items || [];
        for (const shift of shiftItems) {
            if (shift.name && shift.name.includes(prefix)) {
                try {
                    await this.deleteShift(shift.id);
                } catch (e) {
                    // console.warn(`Failed to delete shift ${shift.id}:`, e);
                }
            }
        }
    } catch (e) {
        console.warn('Failed to cleanup shifts:', e);
    }

    // Try to find TimePeriods with prefix
    try {
        const periods = await this.getTimePeriods();
        const periodItems = Array.isArray(periods) ? periods : periods.items || [];
        for (const period of periodItems) {
            if (period.name && period.name.includes(prefix)) {
                try {
                    await this.deleteTimePeriod(period.id);
                } catch (e) {
                    // console.warn(`Failed to delete time period ${period.id}:`, e);
                }
            }
        }
    } catch (e) {
        console.warn('Failed to cleanup time periods:', e);
    }

    // 1. Get all employees with prefix
    const emps = await this.getEmployees({ keyword: prefix });
    const items = Array.isArray(emps) ? emps : emps.items || [];
    
    for (const emp of items) {
      if (emp.name.includes(prefix) || emp.employeeNo.includes(prefix)) {
          try {
              await this.deleteEmployee(emp.id);
          } catch (e) {
              console.warn(`Failed to delete employee ${emp.id}:`, e);
          }
      }
    }

    // 2. Get all departments and find with prefix
    try {
      const departments = await this.getDepartments();
      const flatDepts = this.flattenDepartments(departments || []);
      for (const dept of flatDepts) {
        if (dept.name.includes(prefix)) {
          try {
            await this.deleteDepartment(dept.id);
          } catch {
            // 忽略删除失败
          }
        }
      }
    } catch {
      // 忽略错误
    }
  }

  /** 扁平化部门树 */
  private flattenDepartments(
    tree: Array<{ id: number; name: string; children?: any[] }>
  ): Array<{ id: number; name: string }> {
    const result: Array<{ id: number; name: string }> = [];
    const traverse = (nodes: Array<{ id: number; name: string; children?: any[] }>) => {
      for (const node of nodes) {
        result.push({ id: node.id, name: node.name });
        if (node.children && Array.isArray(node.children)) {
          traverse(node.children);
        }
      }
    };
    traverse(tree);
    return result;
  }
}
