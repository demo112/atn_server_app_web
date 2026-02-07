
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { StatisticsService } from './statistics.service';
import { prisma } from '../../common/db/prisma';

/**
 * Bug Regression Test
 * Issue: Monthly report includes future dates (e.g., absent count includes future days if records exist)
 * Fix: Filter records by effectiveEndDate = min(queryEnd, now)
 */
describe('StatisticsService Regression Tests', () => {
  let service: StatisticsService;

  beforeAll(async () => {
    service = new StatisticsService();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should not include future dates in absent count', async () => {
    // 1. Setup data
    // Create a dummy employee
    const emp = await prisma.employee.create({
      data: {
        name: 'Future Test User',
        employeeNo: 'TEST_FUTURE_001',
        status: 'active',
      }
    });

    // Create a past record (Yesterday) - Absent
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayUTC = new Date(Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()));

    await prisma.attDailyRecord.create({
      data: {
        employeeId: emp.id,
        workDate: yesterdayUTC,
        status: 'absent',
        absentMinutes: 480
      }
    });

    // Create a future record (Tomorrow) - Absent (Simulating pre-generated record)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowUTC = new Date(Date.UTC(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()));

    await prisma.attDailyRecord.create({
      data: {
        employeeId: emp.id,
        workDate: tomorrowUTC,
        status: 'absent',
        absentMinutes: 480
      }
    });

    // 2. Execute
    // Query range covering both yesterday and tomorrow
    const start = new Date(yesterday);
    start.setDate(start.getDate() - 5);
    const end = new Date(tomorrow);
    end.setDate(end.getDate() + 5);

    const result = await service.getDepartmentSummary({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      employeeId: emp.id
    });

    // 3. Verify
    const userStats = result.find(r => r.employeeId === emp.id);
    expect(userStats).toBeDefined();
    
    // Should only count yesterday's absence, not tomorrow's
    // Current buggy behavior would likely be 2
    // Expected behavior is 1
    console.log('Absent Count:', userStats?.absentCount);
    
    // Cleanup
    await prisma.attDailyRecord.deleteMany({ where: { employeeId: emp.id } });
    await prisma.employee.delete({ where: { id: emp.id } });
    
    // Assert
    expect(Number(userStats?.absentCount)).toBe(1);
  });
});
