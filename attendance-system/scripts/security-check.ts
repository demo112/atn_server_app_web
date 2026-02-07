import { spawn } from 'child_process';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

interface Task {
  name: string;
  command: string;
  args: string[];
  description: string;
}

const tasks: Task[] = [
  {
    name: 'Server API Fuzzing',
    command: 'pnpm',
    args: ['--filter', '@attendance/server', 'exec', 'vitest', 'run', 'src/test/security/api-fuzzing.test.ts'],
    description: 'Fuzz testing for API endpoints to detect missing validation',
  },
  {
    name: 'Web Schema Audit',
    command: 'npx',
    args: ['tsx', 'packages/web/scripts/lint-schema.ts'],
    description: 'Static analysis of Zod schemas for missing .max() constraints',
  },
  {
    name: 'App Navigation Audit',
    command: 'npx',
    args: ['tsx', 'packages/app/scripts/lint-nav.ts'],
    description: 'Static analysis of App navigation for unsafe route.params usage',
  },
  {
    name: 'Web E2E Robustness',
    command: 'pnpm',
    args: ['--filter', '@attendance/e2e', 'test:e2e', '--', '--grep', 'Robustness'],
    description: 'E2E testing for UI robustness against long inputs',
  }
];

async function runTask(task: Task): Promise<{ success: boolean; output: string }> {
  console.log(`${BOLD}Running: ${task.name}...${RESET}`);
  console.log(`Command: ${task.command} ${task.args.join(' ')}`);
  
  return new Promise((resolve) => {
    const process = spawn(task.command, task.args, { 
      shell: true, 
      stdio: ['ignore', 'pipe', 'pipe'] 
    });

    let output = '';

    process.stdout?.on('data', (data) => {
      const str = data.toString();
      output += str;
    });

    process.stderr?.on('data', (data) => {
      const str = data.toString();
      output += str;
    });

    process.on('close', (code) => {
      const success = code === 0;
      console.log(`Task finished with code ${code}`);
      resolve({ success, output });
    });
  });
}

async function main() {
  console.log(`${BOLD}=== Security Hardening Verification ===${RESET}\n`);
  
  const results = [];

  for (const task of tasks) {
    const { success, output } = await runTask(task);
    
    // Analyze result
    let status = 'UNKNOWN';
    let details = '';

    if (task.name === 'Server API Fuzzing') {
       // Look for Vitest output
       if (output.includes('failed') && output.includes('passed')) {
           status = 'VULNERABILITY CONFIRMED';
           details = 'Tests failed as expected (Gaps found)';
       } else if (success) {
           status = 'SECURE';
           details = 'All tests passed';
       } else {
           status = 'ERROR';
           details = 'Test execution failed';
       }
    } else if (task.name === 'Web Schema Audit') {
        const match = output.match(/Potential Gaps Found:\s+(\d+)/);
        if (match && parseInt(match[1]) > 0) {
            status = 'VULNERABILITY CONFIRMED';
            details = `Found ${match[1]} schema gaps`;
        } else {
            status = 'SECURE';
        }
    } else if (task.name === 'App Navigation Audit') {
        const match = output.match(/Potential Unsafe Nav Params:\s+(\d+)/);
        if (match && parseInt(match[1]) > 0) {
            status = 'VULNERABILITY CONFIRMED';
            details = `Found ${match[1]} navigation gaps`;
        } else {
            status = 'SECURE';
        }
    } else if (task.name === 'Web E2E Robustness') {
        if (output.includes('[GAP]')) {
            status = 'VULNERABILITY CONFIRMED';
            details = 'Gap detected in UI robustness';
        } else if (!success) {
             // If failed but no [GAP], check output
             if (output.includes('Vulnerability Confirmed')) {
                status = 'VULNERABILITY CONFIRMED';
                details = 'Vulnerability Confirmed';
             } else {
                status = 'ERROR'; // or VULNERABILITY CONFIRMED if we assume any failure is a gap
                details = 'Test failed (Likely gap)';
             }
        } else {
            status = 'SECURE';
        }
    }

    results.push({ ...task, status, details });
  }

  // Print Summary
  console.log(`\n${BOLD}=== Verification Summary ===${RESET}`);
  console.table(results.map(r => ({
      Task: r.name,
      Status: r.status,
      Details: r.details
  })));
  
  console.log(`\n${BOLD}Note:${RESET} "VULNERABILITY CONFIRMED" means the test successfully exposed a security gap (as intended).`);
}

main();
