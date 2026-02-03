const { spawn } = require('child_process');
const path = require('path');

const commands = [
  { name: 'SERVER', cmd: 'pnpm', args: ['--filter', '@attendance/server', 'dev'], color: '\x1b[34m' },
  { name: 'WEB', cmd: 'pnpm', args: ['--filter', '@attendance/web', 'dev'], color: '\x1b[32m' },
  { name: 'APP', cmd: 'pnpm', args: ['--filter', '@attendance/app', 'start'], color: '\x1b[35m' }
];

const processes = [];

commands.forEach(({ name, cmd, args, color }) => {
  console.log(`${color}[${name}] Starting...${cmd} ${args.join(' ')}\x1b[0m`);
  
  // Use shell: true for Windows compatibility
  const child = spawn(cmd, args, { 
    stdio: 'pipe', 
    shell: true,
    env: process.env
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(`${color}[${name}] ${data.toString()}\x1b[0m`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`${color}[${name}] ${data.toString()}\x1b[0m`);
  });

  child.on('close', (code) => {
    console.log(`${color}[${name}] Exited with code ${code}\x1b[0m`);
    // If one fails, should we kill others? Maybe not for dev.
  });

  processes.push(child);
});

// Handle exit
process.on('SIGINT', () => {
  console.log('\nStopping all processes...');
  processes.forEach(p => p.kill());
  process.exit();
});
