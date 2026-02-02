
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: hashedPassword,
      role: 'admin'
    },
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
      role: 'admin',
      employee: {
        create: {
          name: 'Admin User',
          employeeNo: 'ADMIN001',
          status: 'active',
          department: {
            create: {
              name: 'IT Department'
            }
          }
        }
      }
    }
  });

  console.log('Admin user seeded:', admin);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
