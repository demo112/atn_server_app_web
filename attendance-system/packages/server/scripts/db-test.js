const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  try {
    await prisma.$connect();
    console.log('Connected successfully.');
    
    console.log('Querying users count...');
    const count = await prisma.user.count();
    console.log('User count:', count);
    
    console.log('Querying admin user...');
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    console.log('Admin user found:', !!admin);
    
  } catch (e) {
    console.error('Database connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
