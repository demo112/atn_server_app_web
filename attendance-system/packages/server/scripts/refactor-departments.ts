
import { prisma } from '../src/common/db/prisma';

async function main() {
  console.log('Starting department refactoring...');

  // 1. Create "公司总部"
  console.log('Creating "公司总部"...');
  let headQuarters = await prisma.department.findFirst({
    where: { name: '公司总部' }
  });

  if (!headQuarters) {
    headQuarters = await prisma.department.create({
      data: {
        name: '公司总部',
        parentId: null
      }
    });
    console.log(`Created "公司总部" (ID: ${headQuarters.id})`);
  } else {
    console.log(`"公司总部" already exists (ID: ${headQuarters.id})`);
  }

  // 2. Identify root departments
  const rootDepts = await prisma.department.findMany({
    where: {
      parentId: null,
      id: { not: headQuarters.id } // Exclude HQ itself
    },
    include: {
      _count: {
        select: { employees: true, children: true }
      }
    }
  });

  console.log(`Found ${rootDepts.length} other root departments.`);

  const deptsToMove: typeof rootDepts = [];
  const deptsToDelete: typeof rootDepts = [];

  for (const dept of rootDepts) {
    // Logic to identify test data: name contains "Test" or "Dept-" or looks like a timestamp
    // Logic to identify useful data: "Technology", "RD1", "11", "Day1-Dept-..." (maybe useful?)
    // User said: "clean useless data". 
    // We will assume names starting with "Test" are useless.
    // Also "Day1-Dept-286949" looks like test data too, but user didn't explicitly say. 
    // However, looking at previous output: "Test Dept ...", "TestDept_...".
    
    const isTest = dept.name.includes('Test') || dept.name.startsWith('TestDept');
    
    if (isTest) {
      deptsToDelete.push(dept);
    } else {
      deptsToMove.push(dept);
    }
  }

  // 3. Move useful departments to HQ
  console.log(`Moving ${deptsToMove.length} departments to "公司总部"...`);
  for (const dept of deptsToMove) {
    console.log(`  - Moving "${dept.name}" (ID: ${dept.id})`);
    await prisma.department.update({
      where: { id: dept.id },
      data: { parentId: headQuarters.id }
    });
  }

  // 4. Delete test departments
  console.log(`Deleting ${deptsToDelete.length} test departments...`);
  for (const dept of deptsToDelete) {
    console.log(`  - Deleting "${dept.name}" (ID: ${dept.id})`);
    
    // Check for sub-departments and employees first? 
    // Prisma cascading delete might not be configured, let's do safe delete or recursive delete.
    // Ideally we should delete employees first if any.
    
    if (dept._count.employees > 0) {
       console.log(`    WARNING: Dept ${dept.name} has ${dept._count.employees} employees. Deleting employees...`);
       
       const employees = await prisma.employee.findMany({
         where: { department: { id: dept.id } }
       });
       
       for (const emp of employees) {
         // Check if user account exists
         const user = await prisma.user.findFirst({ where: { employeeId: emp.id } });
         if (user) {
             console.log(`      - Deleting User for employee ${emp.name}...`);
             await prisma.user.delete({ where: { id: user.id } });
         }

         // Delete related attendance data
         // Due to FK constraints, we might need to delete records first
         // But usually onDelete: Cascade is better. Since schema might not have cascade, we do manual delete.
         // Or update employee to "deleted" status if we want soft delete.
         // User said "clean useless data", so hard delete is preferred if possible, but safer to soft delete if constraints complex.
         // However, let's try to delete related records first.
         
         await prisma.attClockRecord.deleteMany({ where: { employeeId: emp.id } });
         await prisma.attDailyRecord.deleteMany({ where: { employeeId: emp.id } });
         await prisma.attCorrection.deleteMany({ where: { employeeId: emp.id } });
         await prisma.attLeave.deleteMany({ where: { employeeId: emp.id } });
         await prisma.attSchedule.deleteMany({ where: { employeeId: emp.id } });

         console.log(`      - Deleting Employee ${emp.name}...`);
         await prisma.employee.delete({ where: { id: emp.id } });
       }
    }

    // Recursively delete children (if any) - though root test depts usually don't have deep structure in this context
    // Actually Prisma might throw error if children exist.
    // Let's rely on a helper or just deleteMany for children.
    
    const childrenCount = await prisma.department.count({ where: { parentId: dept.id } });
    if (childrenCount > 0) {
        console.log(`    Deleting ${childrenCount} sub-departments...`);
        await prisma.department.deleteMany({ where: { parentId: dept.id } });
    }

    await prisma.department.delete({
      where: { id: dept.id }
    });
  }

  console.log('Refactoring complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
