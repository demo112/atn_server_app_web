const http = require('http');

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: 'localhost',
      port: 3001,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      timeout: 5000 // 5s timeout
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`[DEBUG] ${path} response end. Status: ${res.statusCode}, Body length: ${data.length}`);
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          console.log(`[DEBUG] JSON parse failed: ${e.message}`);
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (e) => {
        console.error(`[DEBUG] Request error: ${e.message}`);
        reject(e);
    });
    
    req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
    });

    if (body) {
      const bodyStr = JSON.stringify(body);
      req.setHeader('Content-Length', Buffer.byteLength(bodyStr));
      req.write(bodyStr);
    }
    req.end();
  });
}

async function runTests() {
  try {
    console.log('--- 1. Health Check ---');
    const health = await request('/health');
    console.log('Status:', health.status);
    console.log('Response:', health.data);

    console.log('\n--- 2. Login (admin/123456) ---');
    const login = await request('/api/v1/auth/login', { method: 'POST' }, {
      username: 'admin',
      password: '123456'
    });
    console.log('Status:', login.status);
    
    if (login.data && login.data.token) {
        console.log('Response: Login Success, Token received');
        console.log('User:', login.data.user);
        
        const token = login.data.token;
        console.log('\n--- 3. Get Current User Profile ---');
        const profile = await request('/api/v1/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Status:', profile.status);
        console.log('Response:', profile.data);
    } else {
        console.log('Response:', login.data);
    }

  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

runTests();
