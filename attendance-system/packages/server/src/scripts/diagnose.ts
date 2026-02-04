
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Diagnosis Start ---');
  
  // 1. Check DB Connection
  try {
    console.log('Checking DB connection...');
    await prisma.$connect();
    console.log('DB Connection: OK');
  } catch (e) {
    console.error('DB Connection: FAILED', e);
    return;
  }

  // 2. Check Users
  try {
    console.log('Checking Users table...');
    const count = await prisma.user.count();
    console.log(`User count: ${count}`);
    
    const users = await prisma.user.findMany({ take: 5 });
    console.log('First 5 users:', JSON.stringify(users, null, 2));

    // 3. Verify Bcrypt
    if (users.length > 0) {
      const user = users[0];
      console.log(`Verifying password for user: ${user.username}`);
      // Assuming password is '123456' or 'password' for test users
      // Just check if compare throws
      try {
        await bcrypt.compare('test', user.passwordHash);
        console.log('Bcrypt compare: OK (did not throw)');
      } catch (e) {
        console.error('Bcrypt compare: FAILED (threw error)', e);
      }
    }
  } catch (e) {
    console.error('Query failed', e);
  }

  // 4. Check JWT
  try {
    console.log('Checking JWT...');
    const secret = process.env.JWT_SECRET || 'default-secret';
    console.log(`JWT Secret exists: ${!!process.env.JWT_SECRET}`);
    const token = jwt.sign({ id: 1 }, secret);
    console.log('JWT Sign: OK');
  } catch (e) {
    console.error('JWT Sign: FAILED', e);
  }

  console.log('--- Diagnosis End ---');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
