import fc from 'fast-check';

const numRuns = process.env.FC_NUM_RUNS ? parseInt(process.env.FC_NUM_RUNS, 10) : undefined;
if (numRuns) {
  fc.configureGlobal({ numRuns });
}
