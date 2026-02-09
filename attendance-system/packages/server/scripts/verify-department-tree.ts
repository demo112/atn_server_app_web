
import dotenv from 'dotenv';
import path from 'path';

// Load .env from packages/server
const envPath = path.resolve(__dirname, '../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

import { prisma } from '../src/common/db/prisma';

async function main() {
  console.log('--- Verifying Department Data ---');
  
  const count = await prisma.department.count();
  console.log(`Total departments: ${count}`);
  
  if (count === 0) {
    console.error('❌ No departments found!');
    process.exit(1);
  }

  const roots = await prisma.department.findMany({
    where: { parentId: null },
    include: { children: true },
    orderBy: { sortOrder: 'asc' }
  });

  console.log(`Root departments: ${roots.length}`);
  roots.forEach(root => {
    console.log(`- ${root.name} (ID: ${root.id}, Children: ${root.children.length})`);
    root.children.forEach(child => {
        console.log(`  - ${child.name} (ID: ${child.id})`);
    });
  });

  console.log('✅ Verification successful');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
