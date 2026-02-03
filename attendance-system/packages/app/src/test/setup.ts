import fc from 'fast-check';

// Define global __DEV__ for expo modules
(global as any).__DEV__ = true;

const numRuns = process.env.FC_NUM_RUNS ? parseInt(process.env.FC_NUM_RUNS, 10) : undefined;
if (numRuns) {
  fc.configureGlobal({ numRuns });
}
