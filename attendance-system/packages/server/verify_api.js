const http = require('http');

function checkEndpoint(path, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3002,
      path: path,
      method: 'GET',
      timeout: 2000
    };

    console.log(`\nTesting ${name} (${path})...`);
    
    const req = http.request(options, (res) => {
      console.log(`${name} Status: ${res.statusCode}`);
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // We expect 401 Unauthorized for protected endpoints if no token is provided
        // This confirms the server is running and the route is mounted
        if (res.statusCode === 200 || res.statusCode === 401 || res.statusCode === 403) {
            console.log(`${name} Check: PASSED (Service is reachable)`);
        } else {
            console.log(`${name} Check: FAILED (Unexpected status)`);
            console.log('Body:', data.substring(0, 200));
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`${name} Check: FAILED (Connection Error)`);
      console.error(e.message);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      console.error(`${name} Check: FAILED (Timeout)`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  await checkEndpoint('/health', 'Health Check');
  await checkEndpoint('/api/v1/users', 'Users Endpoint');
  // Clock endpoint might be POST, but GET should usually return 405 or 404 if not defined, 
  // or 401 if auth middleware is hit first. 
  // Checking route existence.
  await checkEndpoint('/api/v1/attendance/clock', 'Attendance Clock');
}

runTests();
