import { http, HttpResponse } from 'msw';
import { mockDepartments } from '../data/department';

export const departmentHandlers = [
  http.get('/api/v1/departments', () => {
    return HttpResponse.json({
      success: true,
      data: mockDepartments,
    });
  }),
  http.get('/api/v1/departments/tree', () => {
    return HttpResponse.json({
      success: true,
      data: mockDepartments,
    });
  }),
];
