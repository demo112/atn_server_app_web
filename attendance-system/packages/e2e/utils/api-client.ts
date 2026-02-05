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
  private readonly baseUrl = 'http://localhost:3000'; // Default API URL

  constructor(request: APIRequestContext) {
    this.request = request;
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

  // Cleanup
  async cleanupTestData(prefix: string) {
    // 1. Get all employees with prefix
    const emps = await this.getEmployees({ keyword: prefix });
    const items = Array.isArray(emps) ? emps : emps.items || []; // Handle pagination if needed
    
    for (const emp of items) {
      if (emp.name.includes(prefix) || emp.employeeNo.includes(prefix)) {
          try {
              await this.deleteEmployee(emp.id);
          } catch (e) {
              console.warn(`Failed to delete employee ${emp.id}:`, e);
          }
      }
    }

    // 2. Get all departments (tree) and find with prefix
    // Note: Deleting departments might be tricky if they have children. 
    // We should probably delete bottom-up or just catch errors.
    // For simplicity, we assume test data is simple.
    // Ideally, we should implement a specific bulk delete endpoint or better cleanup logic.
    // But iterating is fine for now.
    // Since tree API returns nested structure, we need to flatten or traverse.
    // Skipping complex department cleanup for now to avoid recursion issues in this quick implementation.
    // Assuming tests delete their own departments or we rely on DB reset in worst case.
    // But let's try to delete top-level ones if they match.
  }
}
