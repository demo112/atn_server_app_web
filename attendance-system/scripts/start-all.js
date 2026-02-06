const { spawn, exec } = require('child_process');
const path = require('path');
const net = require('net');
const fs = require('fs');

const REDIS_PORT = 6379;
const REDIS_HOST = '127.0.0.1';
const REDIS_PATH = path.resolve(__dirname, '../.local/redis/redis-server.exe');
const REDIS_CONF = path.resolve(__dirname, '../.local/redis/redis.windows.conf');

const colors = {
    REDIS: '\x1b[31m',
    SERVER: '\x1b[34m',
    WEB: '\x1b[32m',
    RESET: '\x1b[0m'
};

function log(service, message) {
    console.log(`${colors[service]}[${service}] ${message}${colors.RESET}`);
}

function checkPort(port, host) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.on('error', () => {
            resolve(false);
        });
        socket.connect(port, host);
    });
}

async function startRedis() {
    const isRunning = await checkPort(REDIS_PORT, REDIS_HOST);
    if (isRunning) {
        log('REDIS', 'Already running on port ' + REDIS_PORT);
        return;
    }

    if (!fs.existsSync(REDIS_PATH)) {
        log('REDIS', 'Executable not found at ' + REDIS_PATH);
        log('REDIS', 'Skipping Redis auto-start (please start manually)');
        return;
    }

    log('REDIS', 'Starting...');
    const redis = spawn(REDIS_PATH, [REDIS_CONF], {
        stdio: 'ignore', // Redis runs in background or we ignore its output to keep console clean
        detached: true,  // Let it run independently
        shell: false
    });
    
    redis.unref();
    
    // Wait a bit for it to come up
    let retries = 5;
    while (retries > 0) {
        await new Promise(r => setTimeout(r, 1000));
        if (await checkPort(REDIS_PORT, REDIS_HOST)) {
            log('REDIS', 'Started successfully');
            return;
        }
        retries--;
    }
    log('REDIS', 'Warning: Failed to verify startup (could still be starting)');
}

function startService(name, cmd, args) {
    log(name, `Starting... ${cmd} ${args.join(' ')}`);
    const child = spawn(cmd, args, {
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, FORCE_COLOR: 'true' }
    });

    child.stdout.on('data', (data) => {
        process.stdout.write(`${colors[name]}[${name}] ${data.toString()}${colors.RESET}`);
    });

    child.stderr.on('data', (data) => {
        process.stderr.write(`${colors[name]}[${name}] ${data.toString()}${colors.RESET}`);
    });

    return child;
}

async function main() {
    await startRedis();

    const processes = [];

    // Start Server
    processes.push(startService('SERVER', 'pnpm', ['--filter', '@attendance/server', 'dev']));

    // Start Web
    processes.push(startService('WEB', 'pnpm', ['--filter', '@attendance/web', 'dev']));

    // Handle exit
    process.on('SIGINT', () => {
        console.log('\nStopping all processes...');
        processes.forEach(p => p.kill());
        process.exit();
    });
}

main().catch(console.error);
