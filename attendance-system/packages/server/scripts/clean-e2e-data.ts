
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from server root
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dbUrl = process.env.DATABASE_URL || '';
  console.log(`Connected to DB: ${dbUrl.replace(/:[^:@]*@/, ':****@')}`);
  
  // Analyze existing shifts
  const shifts = await prisma.attShift.findMany({ 
    take: 50, 
    orderBy: { id: 'desc' },
    select: { id: true, name: true }
  });
  console.log('Existing shifts sample:', shifts.map(s => s.name));
  
  // Analyze existing TimePeriods
   const periods = await prisma.attTimePeriod.findMany({ 
     take: 50, 
     orderBy: { id: 'desc' },
     select: { id: true, name: true }
  });
   console.log('Existing TimePeriods sample:', periods.map(p => p.name));
 
   const pattern = '-[W';
  
    // 1. Find target IDs
   const dirtyDepts = await prisma.department.findMany({ where: { name: { contains: pattern } }, select: { id: true } });
   const dirtyDeptIds = dirtyDepts.map(d => d.id);
 
   const dirtyEmployees = await prisma.employee.findMany({
     where: {
       OR: [
         { name: { contains: pattern } },
         { employeeNo: { contains: pattern } },
         { deptId: { in: dirtyDeptIds } } // Also clean employees in dirty departments
       ]
     },
     select: { id: true }
   });
   const dirtyEmployeeIds = dirtyEmployees.map(e => e.id);
 
   const dirtyUsers = await prisma.user.findMany({
     where: {
       OR: [
         { username: { contains: pattern } },
         { employeeId: { in: dirtyEmployeeIds } }
       ]
     },
     select: { id: true }
   });
   const dirtyUserIds = dirtyUsers.map(u => u.id);
 
   const dirtyShifts = await prisma.attShift.findMany({ where: { name: { contains: pattern } }, select: { id: true } });
   const dirtyShiftIds = dirtyShifts.map(s => s.id);
 
   const dirtyPeriods = await prisma.attTimePeriod.findMany({ where: { name: { contains: pattern } }, select: { id: true } });
   const dirtyPeriodIds = dirtyPeriods.map(p => p.id);

  console.log(`Found:
    ${dirtyDeptIds.length} Departments
    ${dirtyEmployeeIds.length} Employees
    ${dirtyUserIds.length} Users
    ${dirtyShiftIds.length} Shifts
    ${dirtyPeriodIds.length} TimePeriods
  `);

  if (dirtyDeptIds.length === 0 && dirtyEmployeeIds.length === 0 && dirtyUserIds.length === 0 && dirtyShiftIds.length === 0 && dirtyPeriodIds.length === 0) {
    console.log('No dirty data found.');
    return;
  }

  // 2. Delete dependencies first
  
  // AttLeave
  if (dirtyEmployeeIds.length > 0 || dirtyUserIds.length > 0) {
    const { count } = await prisma.attLeave.deleteMany({
      where: {
        OR: [
          { employeeId: { in: dirtyEmployeeIds } },
          { approverId: { in: dirtyUserIds } }
        ]
      }
    });
    console.log(`Deleted ${count} AttLeave records`);
  }

  // AttCorrection
  if (dirtyEmployeeIds.length > 0 || dirtyUserIds.length > 0) {
    const { count } = await prisma.attCorrection.deleteMany({
      where: {
        OR: [
          { employeeId: { in: dirtyEmployeeIds } },
          { operatorId: { in: dirtyUserIds } }
        ]
      }
    });
    console.log(`Deleted ${count} AttCorrection records`);
  }

  // AttClockRecord
  if (dirtyEmployeeIds.length > 0 || dirtyUserIds.length > 0) {
    const { count } = await prisma.attClockRecord.deleteMany({
      where: {
        OR: [
          { employeeId: { in: dirtyEmployeeIds } },
          { operatorId: { in: dirtyUserIds } }
        ]
      }
    });
    console.log(`Deleted ${count} AttClockRecord records`);
  }

  // AttDailyRecord
  if (dirtyEmployeeIds.length > 0 || dirtyShiftIds.length > 0 || dirtyPeriodIds.length > 0) {
    const { count } = await prisma.attDailyRecord.deleteMany({
      where: {
        OR: [
          { employeeId: { in: dirtyEmployeeIds } },
          { shiftId: { in: dirtyShiftIds } },
          { periodId: { in: dirtyPeriodIds } }
        ]
      }
    });
    console.log(`Deleted ${count} AttDailyRecord records`);
  }

  // AttSchedule
  if (dirtyEmployeeIds.length > 0 || dirtyShiftIds.length > 0) {
    const { count } = await prisma.attSchedule.deleteMany({
      where: {
        OR: [
          { employeeId: { in: dirtyEmployeeIds } },
          { shiftId: { in: dirtyShiftIds } }
        ]
      }
    });
    console.log(`Deleted ${count} AttSchedule records`);
  }

  // AttShiftPeriod
  if (dirtyShiftIds.length > 0 || dirtyPeriodIds.length > 0) {
    const { count } = await prisma.attShiftPeriod.deleteMany({
      where: {
        OR: [
          { shiftId: { in: dirtyShiftIds } },
          { periodId: { in: dirtyPeriodIds } }
        ]
      }
    });
    console.log(`Deleted ${count} AttShiftPeriod records`);
  }

  // 3. Delete core entities

  // Users
  if (dirtyUserIds.length > 0) {
    const { count } = await prisma.user.deleteMany({ where: { id: { in: dirtyUserIds } } });
    console.log(`Deleted ${count} User records`);
  }

  // Employees
  if (dirtyEmployeeIds.length > 0) {
    const { count } = await prisma.employee.deleteMany({ where: { id: { in: dirtyEmployeeIds } } });
    console.log(`Deleted ${count} Employee records`);
  }

  // Shifts
  if (dirtyShiftIds.length > 0) {
    const { count } = await prisma.attShift.deleteMany({ where: { id: { in: dirtyShiftIds } } });
    console.log(`Deleted ${count} AttShift records`);
  }

  // TimePeriods
  if (dirtyPeriodIds.length > 0) {
    const { count } = await prisma.attTimePeriod.deleteMany({ where: { id: { in: dirtyPeriodIds } } });
    console.log(`Deleted ${count} AttTimePeriod records`);
  }

  // Departments
  if (dirtyDeptIds.length > 0) {
    // Option A: Set parentId = null for all dirty depts
    await prisma.department.updateMany({
      where: { id: { in: dirtyDeptIds } },
      data: { parentId: null }
    });
    // Then delete
    const { count } = await prisma.department.deleteMany({ where: { id: { in: dirtyDeptIds } } });
    console.log(`Deleted ${count} Department records`);
  }

  console.log('Cleanup completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
