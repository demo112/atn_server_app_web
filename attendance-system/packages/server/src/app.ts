import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';

console.log('DEBUG: app.ts - Start imports');

console.log('DEBUG: app.ts - Importing modules/attendance');
import { attendanceRouter, leaveRouter } from './modules/attendance';
console.log('DEBUG: app.ts - Importing modules/auth');
import { authRouter } from './modules/auth';
console.log('DEBUG: app.ts - Importing modules/user');
import { userRouter } from './modules/user';
console.log('DEBUG: app.ts - Importing modules/employee');
import { employeeRouter } from './modules/employee';
console.log('DEBUG: app.ts - Importing modules/department');
import { departmentRouter } from './modules/department';
console.log('DEBUG: app.ts - Importing modules/statistics/statistics.routes');
import { statisticsRouter } from './modules/statistics/statistics.routes';

console.log('DEBUG: app.ts - Importing common/error-handler');
import { errorHandler } from './common/error-handler';
console.log('DEBUG: app.ts - Importing common/logger');
import { logger } from './common/logger';
console.log('DEBUG: app.ts - Importing attendance-scheduler');
import { attendanceScheduler } from './modules/attendance/attendance-scheduler';

console.log('DEBUG: app.ts - Creating express app');
export const app: express.Application = express();

// 初始化调度器
attendanceScheduler.init().catch(err => {
  logger.error({ err }, 'Failed to initialize attendance scheduler');
});

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由挂载点
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/employees', employeeRouter);
app.use('/api/v1/departments', departmentRouter);
app.use('/api/v1/statistics', statisticsRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/leaves', leaveRouter);

// 错误处理中间件
app.use(errorHandler);

console.log('DEBUG: app.ts - Exported app');
