import { api, validateResponse } from './api';
import { z } from 'zod';
import { Shift, ApiResponse, CreateShiftDto, UpdateShiftDto } from '@attendance/shared';
import { ShiftSchema } from '../schemas/attendance';

export const getShifts = async (params?: { name?: string }): Promise<Shift[]> => {
  const res = await api.get<unknown, ApiResponse<Shift[]>>('/attendance/shifts', { params });
  return validateResponse(z.array(ShiftSchema), res);
};

export const getShift = async (id: number): Promise<Shift> => {
  const res = await api.get<unknown, ApiResponse<Shift>>(`/attendance/shifts/${id}`);
  return validateResponse(ShiftSchema, res);
};

export const createShift = async (data: CreateShiftDto): Promise<Shift> => {
  const res = await api.post<unknown, ApiResponse<Shift>>('/attendance/shifts', data);
  return validateResponse(ShiftSchema, res);
};

export const updateShift = async (id: number, data: UpdateShiftDto): Promise<Shift> => {
  const res = await api.put<unknown, ApiResponse<Shift>>(`/attendance/shifts/${id}`, data);
  return validateResponse(ShiftSchema, res);
};

export const deleteShift = async (id: number): Promise<void> => {
  const res = await api.delete<unknown, ApiResponse<void>>(`/attendance/shifts/${id}`);
  return validateResponse(z.void(), res);
};
