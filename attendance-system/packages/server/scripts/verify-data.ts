
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying generated data...');

  const userCount = await prisma.user.count();
  const empCount = await prisma.employee.count();
  const dailyCount = await prisma.attDailyRecord.count();
  const clockCount = await prisma.attClockRecord.count();
  const leaveCount = await prisma.attLeave.count();
  const correctionCount = await prisma.attCorrection.count();

  console.log('------------------------------------------------');
  console.log(`👥 Users: ${userCount}`);
  console.log(`👷 Employees: ${empCount}`);
  console.log(`📅 Daily Records: ${dailyCount}`);
  console.log(`⏰ Clock Records: ${clockCount}`);
  console.log(`🏖️ Leave Records: ${leaveCount}`);
  console.log(`📝 Correction Records: ${correctionCount}`);
  console.log('------------------------------------------------');

  if (userCount === 10 && empCount === 10 && dailyCount > 1000) {
    console.log('✅ Data verification passed!');
  } else {
    console.log('⚠️ Data verification warning: Counts might be lower than expected.');
  }
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
