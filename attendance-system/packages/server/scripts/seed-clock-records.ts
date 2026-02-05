
import { PrismaClient, ClockType, ClockSource } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding clock records...');

  // 1. Get all active employees
  const employees = await prisma.employee.findMany({
    where: { status: 'active' }
  });

  console.log(`Found ${employees.length} active employees.`);

  if (employees.length === 0) {
    console.log('No active employees found. Please seed employees first.');
    return;
  }

  // 2. Define date range: 2026-01-15 to 2026-02-28
  const startDate = dayjs('2026-01-15');
  const endDate = dayjs('2026-02-28');

  console.log(`Generating records from ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}`);

  // 3. Iterate
  let currentDate = startDate;
  const recordsToCreate: any[] = [];

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    const isWeekend = currentDate.day() === 0 || currentDate.day() === 6;
    
    for (const emp of employees) {
      // Logic:
      // - Weekends: 90% chance to be absent (no records)
      // - Weekdays: 5% chance to be absent
      const isWorkDay = !isWeekend;
      let skipDayProb = isWorkDay ? 0.05 : 0.90; 
      
      if (Math.random() < skipDayProb) {
        continue; // Absent
      }

      // Generate Clock In
      // Target: 09:00. 
      // Random: 08:30 - 09:30 (mostly), sometimes very late.
      // 5% chance to miss clock in
      if (Math.random() > 0.05) {
        const baseIn = currentDate.hour(9).minute(0).second(0);
        // Random offset: -30min to +30min (normal fluctuation)
        let offsetMinutes = Math.floor(Math.random() * 60) - 30; 
        
        // 5% chance of being late (09:30 - 10:30)
        if (Math.random() < 0.05) {
            offsetMinutes = Math.floor(Math.random() * 60) + 30;
        }
        
        const clockInTime = baseIn.add(offsetMinutes, 'minute').toDate();
        
        recordsToCreate.push({
          employeeId: emp.id,
          clockTime: clockInTime,
          type: ClockType.sign_in,
          source: ClockSource.app, // Simulate App
          deviceInfo: { device: 'simulator', ip: '127.0.0.1' },
          location: { lat: 39.9, lng: 116.4, address: 'Test Location' }
        });
      }

      // Generate Clock Out
      // Target: 18:00
      // Random: 17:30 - 19:00
      // 5% chance to miss clock out
      if (Math.random() > 0.05) {
        const baseOut = currentDate.hour(18).minute(0).second(0);
        // Random offset: -30min to +60min
        let offsetMinutes = Math.floor(Math.random() * 90) - 30;
        
         // 5% chance of early leave (16:00 - 17:30)
        if (Math.random() < 0.05) {
            offsetMinutes = -(Math.floor(Math.random() * 90) + 30);
        }

        const clockOutTime = baseOut.add(offsetMinutes, 'minute').toDate();

        recordsToCreate.push({
          employeeId: emp.id,
          clockTime: clockOutTime,
          type: ClockType.sign_out,
          source: ClockSource.app,
          deviceInfo: { device: 'simulator', ip: '127.0.0.1' },
          location: { lat: 39.9, lng: 116.4, address: 'Test Location' }
        });
      }
    }

    currentDate = currentDate.add(1, 'day');
  }

  console.log(`Generated ${recordsToCreate.length} records. Inserting...`);

  // Batch insert
  const batchSize = 500;
  for (let i = 0; i < recordsToCreate.length; i += batchSize) {
    const batch = recordsToCreate.slice(i, i + batchSize);
    await prisma.attClockRecord.createMany({
      data: batch
    });
    console.log(`Inserted batch ${Math.min(i + batchSize, recordsToCreate.length)}/${recordsToCreate.length}`);
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
