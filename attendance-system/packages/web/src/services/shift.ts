import { api, validateResponse } from './api';
import { z } from 'zod';
import { Shift, ApiResponse, PaginatedResponse } from '@attendance/shared';
import { ShiftSchema } from '../schemas/attendance';
import { createPaginatedResponseSchema } from '@attendance/shared/src/schemas/common';

// Server DTO shapes for Shift create/update (align with backend contract)
export interface CreateShiftDaysDto {
  name: string;
  cycleDays: number;
  days: { dayOfCycle: number; periodIds: number[] }[];
}

export type UpdateShiftDaysDto = Partial<CreateShiftDaysDto>;

export const getShifts = async (params?: { name?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<Shift>> => {
  const res = await api.get<unknown, ApiResponse<PaginatedResponse<Shift>>>('/attendance/shifts', { params });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return validateResponse(createPaginatedResponseSchema(ShiftSchema) as any, res) as unknown as PaginatedResponse<Shift>;
};

export const getShift = async (id: number): Promise<Shift> => {
  const res = await api.get<unknown, ApiResponse<Shift>>(`/attendance/shifts/${id}`);
  return validateResponse(ShiftSchema, res) as unknown as Shift;
};

// Create returns AttShiftVo (with days), frontend does not rely on response here — avoid strict validation
export const createShift = async (data: CreateShiftDaysDto): Promise<void> => {
  await api.post<unknown, ApiResponse<unknown>>('/attendance/shifts', data);
};

export const updateShift = async (id: number, data: UpdateShiftDaysDto): Promise<void> => {
  await api.put<unknown, ApiResponse<unknown>>(`/attendance/shifts/${id}`, data);
};
};

export const deleteShift = async (id: number): Promise<void> => {
  const res = await api.delete<unknown, ApiResponse<void>>(`/attendance/shifts/${id}`);
  return validateResponse(z.void(), res);
};
