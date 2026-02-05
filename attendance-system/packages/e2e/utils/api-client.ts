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
  private readonly baseUrl = process.env.API_BASE_URL || 'http://localhost:3001'; // Default API URL

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
