// 全局测试配置
// import { expect } from 'vitest';
import fc from 'fast-check';

// Config fast-check global options based on environment variables
const numRuns = process.env.FC_NUM_RUNS ? parseInt(process.env.FC_NUM_RUNS, 10) : undefined;
if (numRuns) {
  fc.configureGlobal({ numRuns });
}

// 可以在这里添加全局的 expect 扩展
