
import { PrismaClient } from '@prisma/client';
import { createLogger } from '../src/common/logger';

const prisma = new PrismaClient();
const logger = createLogger('Cleaner');

async function cleanDB() {
  logger.info('🧹 Starting full database cleanup...');

  try {
    // 1. 业务数据 (Business Data)
    logger.info('Deleting Corrections...');
    await prisma.attCorrection.deleteMany();
    
    logger.info('Deleting Daily Records...');
    await prisma.attDailyRecord.deleteMany();
    
    logger.info('Deleting Clock Records...');
    await prisma.attClockRecord.deleteMany();
    
    logger.info('Deleting Leaves...');
    await prisma.attLeave.deleteMany();
    
    logger.info('Deleting Schedules...');
    await prisma.attSchedule.deleteMany();

    // 2. 规则配置 (Rules & Config)
    logger.info('Deleting Shift Periods...');
    await prisma.attShiftPeriod.deleteMany();
    
    logger.info('Deleting Shifts...');
    await prisma.attShift.deleteMany();
    
    logger.info('Deleting Time Periods...');
    await prisma.attTimePeriod.deleteMany();

    // 3. 基础档案 (Base Archives)
    logger.info('Deleting Users...');
    await prisma.user.deleteMany();
    
    logger.info('Deleting Employees...');
    await prisma.employee.deleteMany();
    
    logger.info('Deleting Departments...');
    await prisma.department.deleteMany();

    logger.info('✅ Database cleanup completed successfully!');
  } catch (error) {
    logger.error(error, '❌ Error during cleanup');
    throw error;
  }
}

cleanDB()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
