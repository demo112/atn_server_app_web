import request from '../utils/request';
import { Shift, ApiResponse, CreateShiftDto, UpdateShiftDto } from '@attendance/shared';

export const getShifts = async (params?: { name?: string }): Promise<Shift[]> => {
  const res = await request.get<any, ApiResponse<Shift[]>>('/attendance/shifts', { params });
  return res.data!;
};

export const getShift = async (id: number): Promise<Shift> => {
  const res = await request.get<any, ApiResponse<Shift>>(`/attendance/shifts/${id}`);
  return res.data!;
};

export const createShift = async (data: CreateShiftDto): Promise<Shift> => {
  const res = await request.post<any, ApiResponse<Shift>>('/attendance/shifts', data);
  return res.data!;
};

export const updateShift = async (id: number, data: UpdateShiftDto): Promise<Shift> => {
  const res = await request.put<any, ApiResponse<Shift>>(`/attendance/shifts/${id}`, data);
  return res.data!;
};

export const deleteShift = async (id: number): Promise<void> => {
  await request.delete<any, ApiResponse<void>>(`/attendance/shifts/${id}`);
};
