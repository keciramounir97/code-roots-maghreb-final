#!/usr/bin/env node
/**
 * Authentication Test Script
 * Tests login, signup, and password reset functionality
 */

const http = require('http');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const SUCCESS = `${GREEN}✓${RESET}`;
const FAIL = `${RED}✗${RESET}`;

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const TIMEOUT = 5000;

const results = {
  passed: 0,
  failed: 0,
  total: 0
};

function makeRequest(method, path, options = {}) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const req = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: TIMEOUT
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message, success: false });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Request timeout', success: false });
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testRoute(name, method, path, options = {}) {
  results.total++;
  process.stdout.write(`Testing ${BOLD}${name}${RESET}... `);
  
  try {
    const result = await makeRequest(method, path, options);
    
    const expectedStatuses = Array.isArray(options.expectedStatus) 
      ? options.expectedStatus 
      : [options.expectedStatus || 200];
    
    const isSuccess = expectedStatuses.includes(result.status) || 
                     (result.success && !options.expectedStatus);
    
    if (isSuccess) {
      results.passed++;
      console.log(`${SUCCESS} ${result.status || 'OK'}`);
      if (result.body) {
        try {
          const data = JSON.parse(result.body);
          if (data.token) {
            return data.token;
          }
          if (data.code) {
            return data.code;
          }
        } catch {}
      }
      return true;
    } else {
      results.failed++;
      const errorMsg = result.error || `Status ${result.status}`;
      console.log(`${FAIL} ${errorMsg}`);
      if (result.body) {
        try {
          const body = JSON.parse(result.body);
          if (body.message) console.log(`   ${YELLOW}→${RESET} ${body.message}`);
        } catch {}
      }
      return false;
    }
  } catch (err) {
    results.failed++;
    console.log(`${FAIL} ${err.message}`);
    return false;
  }
}

async function testAuth() {
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  AUTHENTICATION TEST${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';
  const testName = 'Test User';

  // Test 1: Health check
  console.log(`${BOLD}1. Health Check${RESET}`);
  await testRoute('Auth Health', 'GET', '/api/auth/health');
  console.log('');

  // Test 2: Signup
  console.log(`${BOLD}2. Signup${RESET}`);
  const signupResult = await testRoute('Signup', 'POST', '/api/auth/signup', {
    body: {
      fullName: testName,
      email: testEmail,
      password: testPassword,
      phone: '+1234567890'
    },
    expectedStatus: [200, 201]
  });
  console.log('');

  if (!signupResult) {
    console.log(`${BOLD}${YELLOW}⚠️  Signup failed, skipping login test${RESET}`);
    console.log('');
  } else {
    // Test 3: Login
    console.log(`${BOLD}3. Login${RESET}`);
    const loginToken = await testRoute('Login', 'POST', '/api/auth/login', {
      body: {
        email: testEmail,
        password: testPassword
      },
      expectedStatus: [200, 201]
    });
    console.log('');

    if (loginToken) {
      // Test 4: Get Me
      console.log(`${BOLD}4. Get Current User${RESET}`);
      await testRoute('Get Me', 'GET', '/api/auth/me', {
        headers: { Authorization: `Bearer ${loginToken}` }
      });
      console.log('');

      // Test 5: Logout
      console.log(`${BOLD}5. Logout${RESET}`);
      await testRoute('Logout', 'POST', '/api/auth/logout', {
        headers: { Authorization: `Bearer ${loginToken}` }
      });
      console.log('');
    }
  }

  // Test 6: Password Reset Request
  console.log(`${BOLD}6. Password Reset Request${RESET}`);
  const resetCode = await testRoute('Request Reset', 'POST', '/api/auth/reset', {
    body: { email: testEmail },
    expectedStatus: [200, 404] // 404 is OK if email doesn't exist
  });
  console.log('');

  // Test 7: Password Reset Verify (if we got a code)
  if (resetCode && typeof resetCode === 'string') {
    console.log(`${BOLD}7. Password Reset Verify${RESET}`);
    await testRoute('Verify Reset', 'POST', '/api/auth/reset/verify', {
      body: {
        email: testEmail,
        code: resetCode,
        newPassword: 'NewTest123!@#'
      },
      expectedStatus: [200, 400]
    });
    console.log('');
  }

  // Summary
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  TEST SUMMARY${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`Total: ${results.total}`);
  console.log(`${GREEN}Passed: ${results.passed}${RESET}`);
  console.log(`${RED}Failed: ${results.failed}${RESET}`);
  const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  console.log(`Pass Rate: ${passRate}%`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log('');

  if (results.failed === 0) {
    console.log(`${BOLD}${GREEN}✅ All authentication tests passed!${RESET}`);
    process.exit(0);
  } else {
    console.log(`${BOLD}${RED}⚠️  Some authentication tests failed.${RESET}`);
    process.exit(1);
  }
}

if (require.main === module) {
  testAuth().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}

module.exports = { testAuth };
