import dotenv from 'dotenv';
import path from 'path';

// Load .env from packages/server
const envPath = path.resolve(__dirname, '../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Restoring Departments ---');

  const count = await prisma.department.count();
  if (count > 0) {
    console.log(`Departments already exist (${count}). Skipping restoration.`);
    return;
  }

  console.log('Creating default departments...');

  // Level 1: Roots
  const deptGM = await prisma.department.create({
    data: { name: '总经办', sortOrder: 1 }
  });

  const deptHR = await prisma.department.create({
    data: { name: '人事行政部', sortOrder: 2 }
  });

  const deptRD = await prisma.department.create({
    data: { name: '产品研发部', sortOrder: 3 }
  });

  const deptFinance = await prisma.department.create({
    data: { name: '财务部', sortOrder: 4 }
  });
  
  const deptMarketing = await prisma.department.create({
    data: { name: '市场部', sortOrder: 5 }
  });

  // Level 2: Children of R&D
  await prisma.department.create({
    data: { name: '后端开发组', sortOrder: 1, parentId: deptRD.id }
  });
  
  await prisma.department.create({
    data: { name: '前端开发组', sortOrder: 2, parentId: deptRD.id }
  });
  
  await prisma.department.create({
    data: { name: '测试组', sortOrder: 3, parentId: deptRD.id }
  });

  // Level 2: Children of HR
  await prisma.department.create({
    data: { name: '招聘组', sortOrder: 1, parentId: deptHR.id }
  });

  console.log('Departments restored successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
