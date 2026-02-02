import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { attendanceRouter } from './modules/attendance';
import { authRouter } from './modules/auth';
import { userRouter } from './modules/user';
import { errorHandler } from './common/error-handler';
import { logger } from './common/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use('/api/v1/attendance', attendanceRouter);  // 人B负责

// 错误处理中间件
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
