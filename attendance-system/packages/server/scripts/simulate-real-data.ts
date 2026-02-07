
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
const logger = createLogger('Simulator');
const calculator = new AttendanceCalculator();

// 常量定义
const START_DATE = dayjs().subtract(180, 'days').startOf('day');
const END_DATE = dayjs().subtract(1, 'day').endOf('day');
const PASSWORD_HASH = bcrypt.hashSync('123456', 10);

// 辅助函数
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const prob = (percent: number) => Math.random() * 100 < percent;

async function cleanDB() {
  logger.info('🧹 Cleaning database...');
  // 按顺序清理，避免外键约束
  await prisma.attCorrection.deleteMany();
  await prisma.attDailyRecord.deleteMany();
  await prisma.attClockRecord.deleteMany();
  await prisma.attSchedule.deleteMany();
  await prisma.attLeave.deleteMany();
  await prisma.attShiftPeriod.deleteMany();
  await prisma.attShift.deleteMany();
  await prisma.attTimePeriod.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
}

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
  await cleanDB();
  const { deptProd, deptOps, employees } = await initOrg();
  const { shiftDev, shiftOpsEarly, shiftOpsLate, tpStandard, tpEarly, tpLate } = await initRules();

  // 获取管理员 ID 用于审批/操作
  const adminUser = await prisma.user.findFirst({ where: { role: UserRole.admin } });
  if (!adminUser) throw new Error('Admin user not found');
  const operatorId = adminUser.id;

  logger.info(`📅 Simulating from ${START_DATE.format('YYYY-MM-DD')} to ${END_DATE.format('YYYY-MM-DD')}`);

  let currentDate = START_DATE;
  
  // 缓存每日排班信息用于计算
  const dailySchedules: Record<string, any> = {};

  // ==========================================
  // 1. 生成排班 (Schedules)
  // ==========================================
  logger.info('📅 Generating Schedules...');
  for (const emp of employees) {
    // 研发部：固定班
    if (emp.deptId === deptProd.id) {
      await prisma.attSchedule.create({
        data: {
          employeeId: emp.id,
          shiftId: shiftDev.id,
          startDate: START_DATE.toDate(),
          endDate: END_DATE.toDate(),
        },
      });
    } 
    // 运营部：按周轮换
    else {
      let weekStart = START_DATE.startOf('week').add(1, 'day'); // Monday
      while (weekStart.isBefore(END_DATE)) {
        const weekEnd = weekStart.add(6, 'day');
        // 简单轮换：奇数周早班，偶数周晚班
        // 使用 week() 判断
        const isEarlyWeek = weekStart.week() % 2 !== 0;
        const shiftId = isEarlyWeek ? shiftOpsEarly.id : shiftOpsLate.id;
        
        // 调整排班日期范围，确保不超出 END_DATE
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
  // 2. 每日模拟循环
  // ==========================================
  while (currentDate.isBefore(END_DATE.add(1, 'day'))) {
    const dateStr = currentDate.format('YYYY-MM-DD');
    const dayOfWeek = currentDate.day(); // 0=Sun, 1=Mon
    // 修正 dayOfCycle (1=Mon, 7=Sun)
    const dayOfCycle = dayOfWeek === 0 ? 7 : dayOfWeek;

    // 特殊事件
    const isProjectRush = currentDate.isAfter(dayjs().subtract(20, 'day')) && currentDate.isBefore(dayjs().subtract(14, 'day'));
    const isHoliday = false; // 简化处理，暂不加法定节假日逻辑，主要靠排班和周末

    if (dayOfWeek === 1) { // Log progress weekly
      logger.info(`Processing week of ${dateStr}...`);
    }

    for (const emp of employees) {
      // 获取当天排班
      // 查询该员工当天的 Schedule
      const schedule = await prisma.attSchedule.findFirst({
        where: {
          employeeId: emp.id,
          startDate: { lte: currentDate.toDate() },
          endDate: { gte: currentDate.toDate() },
        },
        include: { shift: { include: { periods: { include: { period: true } } } } },
      });

      if (!schedule) continue;

      // 找到当天的班次时间段
      const shiftPeriod = schedule.shift.periods.find(p => p.dayOfCycle === dayOfCycle);
      
      // 如果没有排班 (休息日)，且不是加班
      if (!shiftPeriod && !isProjectRush) {
        // 休息日，不生成打卡，也不生成 DailyRecord (或者生成状态为 Normal 但无班次?)
        // 系统逻辑通常是：无排班不生成 DailyRecord，或者生成为休息日
        // 这里我们简单跳过，除非是 Project Rush 加班
        continue;
      }

      // 确定当天的标准上下班时间
      let standardStartStr = shiftPeriod ? shiftPeriod.period.startTime! : '09:00';
      let standardEndStr = shiftPeriod ? shiftPeriod.period.endTime! : '18:00';
      let periodId = shiftPeriod ? shiftPeriod.periodId : tpStandard.id; // 加班默认用标准

      const standardStart = combineDateAndTime(currentDate, standardStartStr);
      const standardEnd = combineDateAndTime(currentDate, standardEndStr);

      // === 行为模拟 ===
      
      // 1. 请假 (5%概率，仅工作日)
      if (shiftPeriod && prob(5)) {
        const leaveType = randomItem([LeaveType.sick, LeaveType.annual, LeaveType.personal]);
        // 创建请假记录
        await prisma.attLeave.create({
          data: {
            employeeId: emp.id,
            type: leaveType,
            startTime: standardStart.toDate(),
            endTime: standardEnd.toDate(),
            status: LeaveStatus.approved,
            approverId: operatorId, // Alice approves
            reason: '模拟请假数据',
          },
        });
        // 请假就不打卡了
        await createDailyRecord(emp.id, currentDate, schedule.shiftId, periodId, []);
        continue;
      }

      // 2. 出差 (2%概率)
      if (shiftPeriod && prob(2)) {
        await prisma.attLeave.create({
          data: {
            employeeId: emp.id,
            type: LeaveType.business_trip,
            startTime: standardStart.toDate(),
            endTime: standardEnd.toDate(),
            status: LeaveStatus.approved,
            reason: '客户现场支持',
          },
        });
        // 出差通常会有外勤打卡，这里简化为有请假记录
        await createDailyRecord(emp.id, currentDate, schedule.shiftId, periodId, []);
        continue;
      }

      // 3. 正常/异常打卡
      let clockInTime = standardStart.subtract(randomInt(0, 15), 'minute'); // 默认早到
      let clockOutTime = standardEnd.add(randomInt(1, 30), 'minute'); // 默认晚走

      let isMissingPunch = false;

      // 迟到 (5%)
      if (prob(5)) {
        const lateMins = prob(20) ? randomInt(30, 60) : randomInt(1, 15); // 20%大迟到
        clockInTime = standardStart.add(lateMins, 'minute');
      }

      // 早退 (2%)
      if (prob(2)) {
        clockOutTime = standardEnd.subtract(randomInt(1, 30), 'minute');
      }

      // 缺卡 (3%)
      if (prob(3)) {
        isMissingPunch = true;
      }

      // 项目攻坚周加班 (Project Rush)
      if (emp.deptId === deptProd.id && isProjectRush) {
        clockOutTime = standardEnd.add(randomInt(180, 240), 'minute'); // 加班3-4小时
      }

      // 插入打卡记录
      const records = [];
      
      // 签到
      const inRecord = await prisma.attClockRecord.create({
        data: {
          employeeId: emp.id,
          clockTime: clockInTime.toDate(),
          type: ClockType.sign_in,
          source: ClockSource.app,
          deviceInfo: { os: 'ios', model: 'iPhone 13' },
          location: { lat: 31.23, lng: 121.47, address: '公司大楼' },
        },
      });
      records.push(inRecord);

      // 签退 (如果没缺卡)
      if (!isMissingPunch) {
        const outRecord = await prisma.attClockRecord.create({
          data: {
            employeeId: emp.id,
            clockTime: clockOutTime.toDate(),
            type: ClockType.sign_out,
            source: ClockSource.app,
            deviceInfo: { os: 'ios', model: 'iPhone 13' },
            location: { lat: 31.23, lng: 121.47, address: '公司大楼' },
          },
        });
        records.push(outRecord);
      }

      // ==========================================
      // 4. 每日计算 (Call Calculator)
      // ==========================================
      const daily = await createDailyRecord(emp.id, currentDate, schedule.shiftId, periodId, []);
      
      // 5. 缺卡补卡闭环逻辑 (50%概率补卡)
      if (isMissingPunch && prob(50) && daily) {
         // 创建补签记录 (Correction) 并关联到 DailyRecord
         // 模拟3天后申请补签退
         const correctionTime = standardEnd.add(randomInt(5, 30), 'minute');
         
         await prisma.attCorrection.create({
            data: {
              employeeId: emp.id,
              dailyRecordId: daily.id,
               type: CorrectionType.check_out,
               correctionTime: correctionTime.toDate(),
               operatorId: operatorId, // Alice approved
               remark: 'Forgot to punch out',
               createdAt: currentDate.add(3, 'day').toDate(), // 3 days later
             }
         });
         
         // 修正 DailyRecord 状态
         await prisma.attDailyRecord.update({
            where: { id: daily.id },
            data: {
               checkOutTime: correctionTime.toDate(),
               status: AttendanceStatus.normal, // Manually fix status
               absentMinutes: 0 // Clear absent
            }
         });
      }
    }

    currentDate = currentDate.add(1, 'day');
  }

  logger.info('✅ Simulation Completed!');
}

// 辅助: 创建并计算 DailyRecord
async function createDailyRecord(
  employeeId: number, 
  date: dayjs.Dayjs, 
  shiftId: number, 
  periodId: number,
  extraLeaves: any[] // 没用到，直接查库
) {
  // 1. 创建初始 DailyRecord
  // 先检查是否已存在
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
        status: AttendanceStatus.normal, // 初始值
      }
    });
  }

  // 2. 准备计算所需数据
  // 查 Period
  const period = await prisma.attTimePeriod.findUnique({ where: { id: periodId } });
  if (!period) return;

  // 查 Leaves
  const leaves = await prisma.attLeave.findMany({
    where: {
      employeeId,
      status: LeaveStatus.approved,
      startTime: { lt: date.endOf('day').toDate() },
      endTime: { gt: date.startOf('day').toDate() },
    }
  });

  // 查 ClockRecords
  const clockRecords = await prisma.attClockRecord.findMany({
    where: {
      employeeId,
      clockTime: {
        gte: date.startOf('day').subtract(3, 'hour').toDate(), // 宽容度
        lte: date.endOf('day').add(6, 'hour').toDate(),
      }
    },
    orderBy: { clockTime: 'asc' }
  });

  // 简单匹配首末打卡 (实际逻辑更复杂)
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
    
    // 重新获取更新后的 record
    daily = (await prisma.attDailyRecord.findUnique({ where: { id: daily.id } }))!;
  }

  // 3. 调用计算器
  const result = calculator.calculate(daily, period, leaves);

  // 4. 更新结果
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
  // 本地时间构造
  return date.hour(hours).minute(minutes).second(0).millisecond(0);
}

// 执行
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
