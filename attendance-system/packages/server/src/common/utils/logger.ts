
export const logger = {
  info: (module: string, userId: string | number, message: string, context?: any) => {
    console.log(`[${new Date().toISOString()}] [INFO] [${module}] [${userId}] ${message}`, context ? JSON.stringify(context) : '');
  },
  warn: (module: string, userId: string | number, message: string, context?: any) => {
    console.warn(`[${new Date().toISOString()}] [WARN] [${module}] [${userId}] ${message}`, context ? JSON.stringify(context) : '');
  },
  error: (module: string, userId: string | number, message: string, context?: any) => {
    console.error(`[${new Date().toISOString()}] [ERROR] [${module}] [${userId}] ${message}`, context ? JSON.stringify(context) : '');
  }
};
