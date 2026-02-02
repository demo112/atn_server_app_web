import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty', options: { colorize: true } } 
    : undefined,
  base: { service: 'attendance-server' },
});

// 模块级 logger 工厂
export function createLogger(module: string) {
  return logger.child({ module });
}
