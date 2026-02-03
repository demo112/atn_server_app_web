import fc from 'fast-check';

// Config fast-check global options based on environment variables
const numRuns = process.env.FC_NUM_RUNS ? parseInt(process.env.FC_NUM_RUNS, 10) : undefined;

if (numRuns) {
  fc.configureGlobal({ numRuns });
  console.log(`[PBT] Configured fast-check with numRuns=${numRuns}`);
}
