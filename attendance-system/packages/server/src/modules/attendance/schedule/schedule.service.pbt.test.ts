import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { ScheduleService } from './schedule.service';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'vitest-mock-extended';

describe('ScheduleService Property Tests', () => {
  const service = new ScheduleService();
  const txMock = mockDeep<Prisma.TransactionClient>();

  it('resolveConflict logic coverage', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }), 
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }), 
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }), 
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }), 
        async (d1, d2, d3, d4) => {
           // Normalize dates to avoid time part issues if service uses full Date
           // But service uses new Date(date), so it keeps time.
           // However, let's ensure start <= end for valid ranges
           const oldStart = d1 < d2 ? d1 : d2;
           const oldEnd = d1 < d2 ? d2 : d1;
           const newStart = d3 < d4 ? d3 : d4;
           const newEnd = d3 < d4 ? d4 : d3;

           // Filter for overlap: (StartA <= EndB) and (EndA >= StartB)
           // Here: (oldStart <= newEnd) and (oldEnd >= newStart)
           if (oldStart > newEnd || oldEnd < newStart) return true; // No overlap

           // Create fresh mock for each run
           const txMock = mockDeep<Prisma.TransactionClient>();
           
           // Mock data
           const oldSchedule = { 
             id: 1, 
             startDate: oldStart, 
             endDate: oldEnd, 
             employeeId: 1, 
             shiftId: 1 
           };

           // Access private method
           await (service as any).resolveConflict(txMock, oldSchedule, newStart, newEnd);

           // Logic verification
           if (oldStart >= newStart && oldEnd <= newEnd) {
             // 1. Enclosed -> Delete
             expect(txMock.attSchedule.delete).toHaveBeenCalledWith({ where: { id: oldSchedule.id } });
           } 
           else if (oldStart < newStart && oldEnd <= newEnd) {
             // 2. Left Overlap -> Trim Right (Update old end)
             // Should update to newStart - 1 day
             expect(txMock.attSchedule.update).toHaveBeenCalled();
             const updateCall = txMock.attSchedule.update.mock.calls[0][0];
             expect(updateCall.where.id).toBe(oldSchedule.id);
             // Check if endDate is roughly newStart - 1 day
             // Since exact calculation depends on timezone/implementation, we check it's < newStart
             expect(updateCall.data.endDate).toBeInstanceOf(Date);
             expect((updateCall.data.endDate as Date).getTime()).toBeLessThan(newStart.getTime());
           } 
           else if (oldStart >= newStart && oldEnd > newEnd) {
             // 3. Right Overlap -> Trim Left (Update old start)
             // Should update to newEnd + 1 day
             expect(txMock.attSchedule.update).toHaveBeenCalled();
             const updateCall = txMock.attSchedule.update.mock.calls[0][0];
             expect(updateCall.where.id).toBe(oldSchedule.id);
             expect(updateCall.data.startDate).toBeInstanceOf(Date);
             expect((updateCall.data.startDate as Date).getTime()).toBeGreaterThan(newEnd.getTime());
           } 
           else if (oldStart < newStart && oldEnd > newEnd) {
             // 4. Split -> Update old end + Create new right
             expect(txMock.attSchedule.update).toHaveBeenCalled();
             expect(txMock.attSchedule.create).toHaveBeenCalled();
             
             // Check Update (Left part)
             const updateCall = txMock.attSchedule.update.mock.calls[0][0];
             expect((updateCall.data.endDate as Date).getTime()).toBeLessThan(newStart.getTime());

             // Check Create (Right part)
             const createCall = txMock.attSchedule.create.mock.calls[0][0];
             expect(createCall.data.employeeId).toBe(oldSchedule.employeeId);
             expect(createCall.data.shiftId).toBe(oldSchedule.shiftId);
             expect((createCall.data.startDate as Date).getTime()).toBeGreaterThan(newEnd.getTime());
             expect(createCall.data.endDate).toEqual(oldEnd);
           }
           
           return true;
        }
      )
    );
  });
});
