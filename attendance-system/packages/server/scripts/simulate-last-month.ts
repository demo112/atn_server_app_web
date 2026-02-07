
import { PrismaClient, UserRole, EmployeeStatus, ClockType, ClockSource, LeaveType, LeaveStatus, AttendanceStatus, CorrectionType } from '@prisma/client';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import utc from 'dayjs/plugin/utc';
import bcrypt from 'bcryptjs';
import { AttendanceCalculator } from '../src/modules/attendance/domain/attendance-calculator';
import { createLogger } from '../src/common/logger';

dayjs.extend(weekOfYear);
dayjs.extend(utc);

// 初始化 Prisma
const prisma = new PrismaClient();
const logger = createLogger('Simulator-LastMonth');
const calculator = new AttendanceCalculator();

// 常量定义
const START_DATE = dayjs().subtract(30, 'days').startOf('day');
const END_DATE = dayjs().subtract(1, 'day').endOf('day');
const PASSWORD_HASH = bcrypt.hashSync('123456', 10);

// 辅助函数
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const prob = (percent: number) => Math.random() * 100 < percent;

async function initOrg() {
  logger.info('🏢 Initializing Organization...');

  // 1. 创建部门
  const deptProd = await prisma.department.create({ data: { name: '产品研发部', sortOrder: 1 } });
  const deptOps = await prisma.department.create({ data: { name: '客户运营部', sortOrder: 2 } });

  // 2. 创建人员
  const employees = [];

  // 研发部 (4人)
  // Alice (Manager)
  employees.push(await createEmployee('EMP001', 'Alice', deptProd.id, UserRole.admin));
  // Bob (Senior)
  employees.push(await createEmployee('EMP002', 'Bob', deptProd.id));
  // Charlie (Frontend)
  employees.push(await createEmployee('EMP003', 'Charlie', deptProd.id));
  // David (Intern)
  employees.push(await createEmployee('EMP004', 'David', deptProd.id));

  // 运营部 (6人)
  // Eve (Supervisor)
  employees.push(await createEmployee('EMP005', 'Eve', deptOps.id));
  // Staff 1-5
  employees.push(await createEmployee('EMP006', 'Frank', deptOps.id));
  employees.push(await createEmployee('EMP007', 'Grace', deptOps.id));
  employees.push(await createEmployee('EMP008', 'Heidi', deptOps.id));
  employees.push(await createEmployee('EMP009', 'Ivan', deptOps.id));
  employees.push(await createEmployee('EMP010', 'Judy', deptOps.id));

  return { deptProd, deptOps, employees };
}

async function createEmployee(no: string, name: string, deptId: number, role: UserRole = UserRole.user) {
  const emp = await prisma.employee.create({
    data: {
      employeeNo: no,
      name,
      deptId,
      status: EmployeeStatus.active,
      hireDate: dayjs('2023-01-01').toDate(),
    },
  });

  await prisma.user.create({
    data: {
      username: no.toLowerCase(),
      passwordHash: PASSWORD_HASH,
      employeeId: emp.id,
      role,
    },
  });

  return emp;
}

async function initRules() {
  logger.info('⚖️ Initializing Rules...');

  // 1. 时间段
  // A: 早班 08:00-17:00
  const tpEarly = await prisma.attTimePeriod.create({
    data: {
      name: '早班时间',
      startTime: '08:00',
      endTime: '17:00',
      restStartTime: '12:00',
      restEndTime: '13:00',
      rules: { lateGraceMinutes: 10, earlyLeaveGraceMinutes: 0, absentTime: 60 },
    },
  });

  // B: 常白班 09:00-18:00
  const tpStandard = await prisma.attTimePeriod.create({
    data: {
      name: '常白班时间',
      startTime: '09:00',
      endTime: '18:00',
      restStartTime: '12:00',
      restEndTime: '13:00',
      rules: { lateGraceMinutes: 10, earlyLeaveGraceMinutes: 0, absentTime: 60 },
    },
  });

  // C: 晚班 13:00-22:00
  const tpLate = await prisma.attTimePeriod.create({
    data: {
      name: '晚班时间',
      startTime: '13:00',
      endTime: '22:00',
      restStartTime: '17:00',
      restEndTime: '18:00',
      rules: { lateGraceMinutes: 10, earlyLeaveGraceMinutes: 0, absentTime: 60 },
    },
  });

  // 2. 班次
  // S1: 研发班 (固定常白)
  const shiftDev = await prisma.attShift.create({
    data: { name: '研发标准班', cycleDays: 7 },
  });
  // 周一到周五是常白班
  for (let i = 1; i <= 5; i++) {
    await prisma.attShiftPeriod.create({
      data: { shiftId: shiftDev.id, periodId: tpStandard.id, dayOfCycle: i },
    });
  }

  // S2: 运营早班 (周一到周五早班)
  const shiftOpsEarly = await prisma.attShift.create({
    data: { name: '运营早班', cycleDays: 7 },
  });
  for (let i = 1; i <= 5; i++) {
    await prisma.attShiftPeriod.create({
      data: { shiftId: shiftOpsEarly.id, periodId: tpEarly.id, dayOfCycle: i },
    });
  }
  // 周六值班 (假设周六也上班)
  await prisma.attShiftPeriod.create({
    data: { shiftId: shiftOpsEarly.id, periodId: tpEarly.id, dayOfCycle: 6 },
  });

  // S3: 运营晚班 (周一到周五晚班)
  const shiftOpsLate = await prisma.attShift.create({
    data: { name: '运营晚班', cycleDays: 7 },
  });
  for (let i = 1; i <= 5; i++) {
    await prisma.attShiftPeriod.create({
      data: { shiftId: shiftOpsLate.id, periodId: tpLate.id, dayOfCycle: i },
    });
  }
  // 周日值班
  await prisma.attShiftPeriod.create({
    data: { shiftId: shiftOpsLate.id, periodId: tpLate.id, dayOfCycle: 7 },
  });

  return { tpEarly, tpStandard, tpLate, shiftDev, shiftOpsEarly, shiftOpsLate };
}

async function main() {
  const { deptProd, deptOps, employees } = await initOrg();
  const { shiftDev, shiftOpsEarly, shiftOpsLate, tpStandard, tpEarly, tpLate } = await initRules();

  // 获取管理员 ID
  const adminUser = await prisma.user.findFirst({ where: { role: UserRole.admin } });
  if (!adminUser) throw new Error('Admin user not found');
  const operatorId = adminUser.id;

  logger.info(`📅 Simulating last month: ${START_DATE.format('YYYY-MM-DD')} to ${END_DATE.format('YYYY-MM-DD')}`);

  let currentDate = START_DATE;
  let dayCounter = 0;

  // ==========================================
  // 1. 生成排班
  // ==========================================
  logger.info('📅 Generating Schedules...');
  for (const emp of employees) {
    if (emp.deptId === deptProd.id) {
      await prisma.attSchedule.create({
        data: {
          employeeId: emp.id,
          shiftId: shiftDev.id,
          startDate: START_DATE.toDate(),
          endDate: END_DATE.toDate(),
        },
      });
    } else {
      let weekStart = START_DATE.startOf('week').add(1, 'day');
      while (weekStart.isBefore(END_DATE)) {
        const weekEnd = weekStart.add(6, 'day');
        const isEarlyWeek = weekStart.week() % 2 !== 0;
        const shiftId = isEarlyWeek ? shiftOpsEarly.id : shiftOpsLate.id;
        const actualEnd = weekEnd.isAfter(END_DATE) ? END_DATE : weekEnd;
        
        await prisma.attSchedule.create({
          data: {
            employeeId: emp.id,
            shiftId: shiftId,
            startDate: weekStart.toDate(),
            endDate: actualEnd.toDate(),
          },
        });
        weekStart = weekStart.add(1, 'week');
      }
    }
  }

  // ==========================================
  // 2. 每日模拟 (Scenario Injection)
  // ==========================================
  while (currentDate.isBefore(END_DATE.add(1, 'day'))) {
    const dayOfWeek = currentDate.day(); // 0=Sun
    const dayOfCycle = dayOfWeek === 0 ? 7 : dayOfWeek;
    dayCounter++;

    logger.info(`Processing ${currentDate.format('YYYY-MM-DD')} (Day ${dayCounter})...`);

    // 场景定义
    const isTrafficJam = dayCounter === 6; // 第6天全员迟到
    const isOvertimeDay = dayCounter === 20; // 第20天全员加班

    for (const emp of employees) {
      const schedule = await prisma.attSchedule.findFirst({
        where: {
          employeeId: emp.id,
          startDate: { lte: currentDate.toDate() },
          endDate: { gte: currentDate.toDate() },
        },
        include: { shift: { include: { periods: { include: { period: true } } } } },
      });

      if (!schedule) continue;

      const shiftPeriod = schedule.shift.periods.find(p => p.dayOfCycle === dayOfCycle);
      if (!shiftPeriod && !isOvertimeDay) continue;

      let standardStartStr = shiftPeriod ? shiftPeriod.period.startTime! : '09:00';
      let standardEndStr = shiftPeriod ? shiftPeriod.period.endTime! : '18:00';
      let periodId = shiftPeriod ? shiftPeriod.periodId : tpStandard.id;

      const standardStart = combineDateAndTime(currentDate, standardStartStr);
      const standardEnd = combineDateAndTime(currentDate, standardEndStr);

      // === 强制场景逻辑 ===
      
      // 1. 请假 (EMP003 连续3天请假)
      if (emp.employeeNo === 'EMP003' && dayCounter >= 15 && dayCounter <= 17) {
        await prisma.attLeave.create({
          data: {
            employeeId: emp.id,
            type: LeaveType.annual,
            startTime: standardStart.toDate(),
            endTime: standardEnd.toDate(),
            status: LeaveStatus.approved,
            approverId: operatorId,
            reason: 'Annual Leave',
          },
        });
        await createDailyRecord(emp.id, currentDate, schedule.shiftId, periodId);
        continue;
      }

      // 2. 缺卡 (EMP002 第12天缺卡)
      if (emp.employeeNo === 'EMP002' && dayCounter === 12) {
        // 只打卡签到
        await prisma.attClockRecord.create({
            data: {
              employeeId: emp.id,
              clockTime: standardStart.toDate(),
              type: ClockType.sign_in,
              source: ClockSource.app,
              deviceInfo: { os: 'ios' },
            }
        });
        await createDailyRecord(emp.id, currentDate, schedule.shiftId, periodId);
        continue;
      }

      // 3. 正常/异常打卡计算
      let clockInTime = standardStart.subtract(randomInt(0, 15), 'minute');
      let clockOutTime = standardEnd.add(randomInt(1, 30), 'minute');

      // 场景: 全员迟到
      if (isTrafficJam) {
         clockInTime = standardStart.add(randomInt(20, 50), 'minute');
      }

      // 场景: 加班
      if (isOvertimeDay) {
         clockOutTime = standardEnd.add(randomInt(120, 180), 'minute');
      }

      // 场景: 随机早退 (EMP001 第10天)
      if (emp.employeeNo === 'EMP001' && dayCounter === 10) {
         clockOutTime = standardEnd.subtract(45, 'minute');
      }

      // 插入打卡
      await prisma.attClockRecord.create({
        data: {
          employeeId: emp.id,
          clockTime: clockInTime.toDate(),
          type: ClockType.sign_in,
          source: ClockSource.app,
          deviceInfo: { os: 'ios' },
        }
      });

      await prisma.attClockRecord.create({
        data: {
          employeeId: emp.id,
          clockTime: clockOutTime.toDate(),
          type: ClockType.sign_out,
          source: ClockSource.app,
          deviceInfo: { os: 'ios' },
        }
      });

      // 计算
      const daily = await createDailyRecord(emp.id, currentDate, schedule.shiftId, periodId);

      // 场景: 补卡闭环 (EMP002 缺卡后的第3天补卡)
      // 在 day 15 补 day 12 的卡
      if (emp.employeeNo === 'EMP002' && dayCounter === 15) {
         // 查找 Day 12 的记录
         const targetDate = currentDate.subtract(3, 'day');
         const targetDaily = await prisma.attDailyRecord.findFirst({
            where: { employeeId: emp.id, workDate: targetDate.toDate() }
         });
         
         if (targetDaily) {
            const fixTime = combineDateAndTime(targetDate, '18:05');
            await prisma.attCorrection.create({
                data: {
                    employeeId: emp.id,
                    dailyRecordId: targetDaily.id,
                    type: CorrectionType.check_out,
                    correctionTime: fixTime.toDate(),
                    operatorId: operatorId,
                    remark: 'System Glitch Fix',
                }
            });
            await prisma.attDailyRecord.update({
                where: { id: targetDaily.id },
                data: { 
                    checkOutTime: fixTime.toDate(),
                    status: AttendanceStatus.normal,
                    absentMinutes: 0
                }
            });
         }
      }
    }
    currentDate = currentDate.add(1, 'day');
  }

  logger.info('✅ Last Month Simulation Completed!');
}

async function createDailyRecord(
  employeeId: number, 
  date: dayjs.Dayjs, 
  shiftId: number, 
  periodId: number
) {
  let daily = await prisma.attDailyRecord.findFirst({
    where: { employeeId, workDate: date.toDate() }
  });

  if (!daily) {
    daily = await prisma.attDailyRecord.create({
      data: {
        employeeId,
        workDate: date.toDate(),
        shiftId,
        periodId,
        status: AttendanceStatus.normal,
      }
    });
  }

  const period = await prisma.attTimePeriod.findUnique({ where: { id: periodId } });
  if (!period) return;

  const leaves = await prisma.attLeave.findMany({
    where: {
      employeeId,
      status: LeaveStatus.approved,
      startTime: { lt: date.endOf('day').toDate() },
      endTime: { gt: date.startOf('day').toDate() },
    }
  });

  const clockRecords = await prisma.attClockRecord.findMany({
    where: {
      employeeId,
      clockTime: {
        gte: date.startOf('day').subtract(3, 'hour').toDate(),
        lte: date.endOf('day').add(6, 'hour').toDate(),
      }
    },
    orderBy: { clockTime: 'asc' }
  });

  if (clockRecords.length > 0) {
    const first = clockRecords[0];
    const last = clockRecords[clockRecords.length - 1];
    
    await prisma.attDailyRecord.update({
      where: { id: daily.id },
      data: {
        checkInTime: first.clockTime,
        checkOutTime: (first.id !== last.id) ? last.clockTime : null,
      }
    });
    daily = (await prisma.attDailyRecord.findUnique({ where: { id: daily.id } }))!;
  }

  const result = calculator.calculate(daily, period, leaves);

  const updatedDaily = await prisma.attDailyRecord.update({
    where: { id: daily.id },
    data: {
      status: result.status,
      lateMinutes: result.lateMinutes,
      earlyLeaveMinutes: result.earlyLeaveMinutes,
      absentMinutes: result.absentMinutes,
      leaveMinutes: result.leaveMinutes,
      actualMinutes: result.actualMinutes,
      effectiveMinutes: result.effectiveMinutes,
    }
  });

  return updatedDaily;
}

function combineDateAndTime(date: dayjs.Dayjs, timeStr: string): dayjs.Dayjs {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return date.hour(hours).minute(minutes).second(0).millisecond(0);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
