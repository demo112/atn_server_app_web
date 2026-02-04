
import { createLogger } from './src/common/logger';

// Use fetch for API calls
const API_URL = 'http://localhost:3001/api/v1';
let TOKEN = '';

async function request(method: string, endpoint: string, body?: any) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  console.log(`[${method}] ${endpoint}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${JSON.stringify(data)}`);
    }
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function main() {
  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await request('POST', '/auth/login', { username: 'admin', password: '123456' });
    TOKEN = loginRes.data.token;
    console.log('✅ Login successful');

    // 2. Create Department
    console.log('2. Creating Department...');
    const deptName = `TestDept_${Date.now()}`;
    const deptRes = await request('POST', '/departments', {
      name: deptName,
      code: `TD_${Date.now()}`,
      managerId: null
    });
    const deptId = deptRes.data.id;
    console.log(`✅ Department created: ${deptId}`);

    // 3. Create Employee
    console.log('3. Creating Employee...');
    // Note: Use deptId and hireDate as per DTO
    const empRes = await request('POST', '/employees', {
      name: `Emp_${Date.now()}`,
      email: `emp${Date.now()}@example.com`,
      deptId: deptId,
      hireDate: '2026-01-01',
      employeeNo: `EMP${Date.now()}`
    });
    const empId = empRes.data.id;
    console.log(`✅ Employee created: ${empId}`);

    // 4. Create Shift
    console.log('4. Creating Shift...');
    const shiftRes = await request('POST', '/attendance/shifts', {
      name: `Shift_${Date.now()}`,
      startTime: '09:00',
      endTime: '18:00',
      lateThreshold: 15,
      earlyLeaveThreshold: 15
    });
    const shiftId = shiftRes.data.id;
    console.log(`✅ Shift created: ${shiftId}`);

    // 5. Create Schedule
    console.log('5. Creating Schedule...');
    const today = new Date().toISOString().split('T')[0];
    const scheduleRes = await request('POST', '/attendance/schedules', {
      employeeId: empId,
      startDate: today,
      endDate: today,
      shiftId: shiftId
    });
    console.log(`✅ Schedule created`);

    // 6. Clock In
    console.log('6. Clocking In...');
    const clockInTime = new Date();
    clockInTime.setHours(8, 55, 0, 0);
    await request('POST', '/attendance/clock', {
      employeeId: empId,
      clockTime: clockInTime.toISOString(),
      type: 'sign_in',
      device: 'test_device',
      location: 'office'
    });
    console.log(`✅ Clock In successful`);

    // 7. Clock Out
    console.log('7. Clocking Out...');
    const clockOutTime = new Date();
    clockOutTime.setHours(18, 5, 0, 0);
    await request('POST', '/attendance/clock', {
      employeeId: empId,
      clockTime: clockOutTime.toISOString(),
      type: 'sign_out',
      device: 'test_device',
      location: 'office'
    });
    console.log(`✅ Clock Out successful`);

    // 8. Trigger Calculation
    console.log('8. Triggering Calculation...');
    await request('POST', '/attendance/debug/calc', {
      startDate: today,
      endDate: today,
      employeeIds: [empId]
    });
    console.log(`✅ Calculation triggered`);

    console.log('Waiting for calculation (5s)...');
    await new Promise(r => setTimeout(r, 5000));

    // 9. Verify Result
    console.log('9. Verifying Result...');
    const dailyRes = await request('GET', `/attendance/daily?employeeId=${empId}&startDate=${today}&endDate=${today}`);
    const records = dailyRes.data; 
    
    if (records && records.length > 0) {
      console.log('✅ Daily record found:', JSON.stringify(records[0], null, 2));
    } else {
      console.error('❌ No daily record found!');
      process.exit(1);
    }

    process.exit(0);

  } catch (err) {
    console.error('❌ Test Failed:', err);
    process.exit(1);
  }
}

main();
