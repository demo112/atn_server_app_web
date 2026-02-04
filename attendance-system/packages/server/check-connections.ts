
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  console.log('Checking DB connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
  
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('✅ DB Connection successful');
    const count = await prisma.user.count();
    console.log(`User count: ${count}`);
  } catch (error) {
    console.error('❌ DB Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\nChecking Redis connection...');
  const redisConfig = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  };
  console.log('Redis Config:', { ...redisConfig, password: '****' });

  const redis = new IORedis(redisConfig);
  
  try {
    await new Promise((resolve, reject) => {
        redis.on('ready', () => {
            console.log('✅ Redis Connection successful');
            resolve(true);
        });
        redis.on('error', (err) => {
            console.error('❌ Redis Connection failed:', err);
            reject(err);
        });
        // Timeout
        setTimeout(() => reject(new Error('Redis timeout')), 5000);
    });
  } catch (e) {
      console.error('Redis check failed', e);
  } finally {
      redis.disconnect();
  }
}

check().catch(console.error);
