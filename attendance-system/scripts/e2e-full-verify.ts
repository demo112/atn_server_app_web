
async function verify() {
  const baseUrl = 'http://localhost:3000/api/v1';
  let adminToken = '';
  let createdUserId = 0;
  let createdEmployeeId = 0;

  try {
    // ==========================================
    // 1. Login as Admin
    // ==========================================
    console.log('🔹 1. Login as Admin...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' })
    });
    
    if (!loginRes.ok) {
        const text = await loginRes.text();
        throw new Error(`Login failed: ${loginRes.status} - ${text}`);
    }
    const loginData: any = await loginRes.json();
    adminToken = loginData.data?.token || loginData.token;
    console.log('✅ Admin Login success');

    // ==========================================
    // 2. Get Department (for Employee creation)
    // ==========================================
    console.log('\n🔹 2. Getting Department...');
    let departmentId = 1;
    try {
        const deptRes = await fetch(`${baseUrl}/departments/tree`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (deptRes.ok) {
            const deptData: any = await deptRes.json();
            const depts = deptData.data || deptData;
            // Simple logic to find first leaf or just first id
            if (Array.isArray(depts) && depts.length > 0) {
                departmentId = depts[0].id;
                console.log(`   Found department ID: ${departmentId}`);
            }
        } else {
            console.log('   Could not fetch departments, defaulting to ID 1');
        }
    } catch (e) {
        console.log('   Error fetching departments, defaulting to ID 1');
    }

    // ==========================================
    // 3. Create Test Employee
    // ==========================================
    console.log('\n🔹 3. Creating Test Employee...');
    const empCode = `E2E_${Date.now()}`;
    const empRes = await fetch(`${baseUrl}/employees`, { // Check route prefix
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            name: 'E2E Test Employee',
            code: empCode,
            departmentId: departmentId,
            status: 'active',
            position: 'Tester',
            email: `${empCode}@test.com`,
            phone: '13800000000',
            hireDate: new Date().toISOString()
        })
    });

    if (!empRes.ok) {
         // Try /attendance/employees if /employees failed
         const empRes2 = await fetch(`${baseUrl}/attendance/employees`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: 'E2E Test Employee',
                code: empCode,
                departmentId: departmentId,
                status: 'active',
                position: 'Tester',
                email: `${empCode}@test.com`,
                phone: '13800000000',
                hireDate: new Date().toISOString()
            })
         });
         
         if (!empRes2.ok) {
            const text = await empRes2.text();
            throw new Error(`Create Employee failed: ${empRes2.status} - ${text}`);
         }
         const empData = await empRes2.json();
         createdEmployeeId = empData.data.id;
    } else {
        const empData = await empRes.json();
        createdEmployeeId = empData.data.id;
    }
    console.log(`✅ Employee created: ID ${createdEmployeeId}`);

    // ==========================================
    // 4. Create Test User linked to Employee
    // ==========================================
    console.log('\n🔹 4. Creating Test User...');
    const username = `e2e_user_${Date.now()}`;
    const userRes = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            username: username,
            password: '123456',
            role: 'user',
            employeeId: createdEmployeeId
        })
    });

    if (!userRes.ok) {
        const text = await userRes.text();
        throw new Error(`Create User failed: ${userRes.status} - ${text}`);
    }
    const userData: any = await userRes.json();
    createdUserId = userData.data.id;
    console.log(`✅ User created: ${username} (ID: ${createdUserId}) linked to Employee ${createdEmployeeId}`);

    // ==========================================
    // 5. Login as New User & Verify employeeId
    // ==========================================
    console.log('\n🔹 5. Verifying New User Login...');
    const testLoginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: '123456' })
    });

    if (!testLoginRes.ok) throw new Error('Test User Login failed');
    const testLoginData: any = await testLoginRes.json();
    const { user: testUser, token: testToken } = testLoginData.data || testLoginData;

    if (testUser.employeeId === createdEmployeeId) {
        console.log(`✅ Login response contains correct employeeId: ${testUser.employeeId}`);
    } else {
        console.error(`❌ Login response MISSING or WRONG employeeId. Expected ${createdEmployeeId}, got ${testUser.employeeId}`);
        // We continue to see if /me works
    }

    // ==========================================
    // 6. Verify /auth/me
    // ==========================================
    console.log('\n🔹 6. Verifying /auth/me...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
        headers: { 'Authorization': `Bearer ${testToken}` }
    });
    const meData: any = await meRes.json();
    const me = meData.data || meData;

    if (me.employeeId === createdEmployeeId) {
        console.log(`✅ /auth/me response contains correct employeeId: ${me.employeeId}`);
    } else {
        console.error(`❌ /auth/me response MISSING or WRONG employeeId. Expected ${createdEmployeeId}, got ${me.employeeId}`);
    }

    // ==========================================
    // 7. Fetch Schedules
    // ==========================================
    console.log('\n🔹 7. Fetching Schedules...');
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const schedRes = await fetch(`${baseUrl}/attendance/schedules?employeeId=${createdEmployeeId}&startDate=${start}&endDate=${end}`, {
        headers: { 'Authorization': `Bearer ${testToken}` }
    });

    if (schedRes.ok) {
        console.log('✅ Schedule fetch success (200 OK)');
    } else {
        const text = await schedRes.text();
        console.error(`❌ Schedule fetch failed: ${schedRes.status} - ${text}`);
    }

  } catch (err) {
    console.error('\n❌ Verification Process Failed:', err);
    process.exit(1);
  } finally {
      // Optional Cleanup
      if (createdUserId || createdEmployeeId) {
          console.log('\n🧹 Cleanup skipped to allow manual inspection.');
          // Implement delete if needed
      }
  }
}

verify();
