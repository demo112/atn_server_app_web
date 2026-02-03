import request from '../utils/request';
import { Shift, ApiResponse, CreateShiftDto, UpdateShiftDto } from '@attendance/shared';

export const getShifts = async (params?: { name?: string }): Promise<Shift[]> => {
  const res = await request.get<unknown, ApiResponse<Shift[]>>('/attendance/shifts', { params });
  return res.data || [];
};

export const getShift = async (id: number): Promise<Shift> => {
  const res = await request.get<unknown, ApiResponse<Shift>>(`/attendance/shifts/${id}`);
  if (!res.data) throw new Error('Shift not found');
  return res.data;
};

export const createShift = async (data: CreateShiftDto): Promise<Shift> => {
  const res = await request.post<unknown, ApiResponse<Shift>>('/attendance/shifts', data);
  if (!res.data) throw new Error('Failed to create shift');
  return res.data;
};

export const updateShift = async (id: number, data: UpdateShiftDto): Promise<Shift> => {
  const res = await request.put<unknown, ApiResponse<Shift>>(`/attendance/shifts/${id}`, data);
  if (!res.data) throw new Error('Failed to update shift');
  return res.data;
};

export const deleteShift = async (id: number): Promise<void> => {
  await request.delete<unknown, ApiResponse<void>>(`/attendance/shifts/${id}`);
};
