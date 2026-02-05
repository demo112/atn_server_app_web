import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';


import { attendanceRouter } from './modules/attendance';
import { authRouter } from './modules/auth';
import { userRouter } from './modules/user';
import { employeeRouter } from './modules/employee';
import { departmentRouter } from './modules/department';
import { statisticsRouter } from './modules/statistics/statistics.routes';
import { errorHandler } from './common/error-handler';
import { logger } from './common/logger';
import { attendanceScheduler } from './modules/attendance/attendance-scheduler';

export const app = express();


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

// 错误处理中间件
app.use(errorHandler);
