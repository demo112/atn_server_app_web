import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = '123456';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: hashedPassword,
      role: 'admin',
      status: 'active',
    },
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
      role: 'admin',
      status: 'active',
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seeded admin user:', admin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
