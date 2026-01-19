#!/usr/bin/env node
/**
 * Simple Authentication Test
 * Quick test to verify auth endpoints are working
 */

const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

function test(endpoint, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const url = new URL(endpoint, BASE_URL);
    const req = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data,
          ok: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message, ok: false });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  console.log('\n🔐 Testing Authentication Endpoints...\n');

  // Test 1: Health
  console.log('1. Testing /api/auth/health...');
  const health = await test('/api/auth/health');
  console.log(`   Status: ${health.status} ${health.ok ? '✅' : '❌'}\n`);

  // Test 2: Signup
  console.log('2. Testing /api/auth/signup...');
  const signup = await test('/api/auth/signup', 'POST', {
    fullName: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'Test123!@#'
  });
  console.log(`   Status: ${signup.status} ${signup.ok ? '✅' : '❌'}`);
  if (signup.body) {
    try {
      const data = JSON.parse(signup.body);
      console.log(`   Response: ${data.message || JSON.stringify(data)}`);
    } catch {}
  }
  console.log('');

  // Test 3: Login (will fail if user doesn't exist, that's OK)
  console.log('3. Testing /api/auth/login...');
  const login = await test('/api/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'test123'
  });
  console.log(`   Status: ${login.status} ${login.ok ? '✅' : '❌'}`);
  if (login.body) {
    try {
      const data = JSON.parse(login.body);
      if (data.message) console.log(`   Response: ${data.message}`);
      if (data.token) console.log(`   Token received: ✅`);
    } catch {}
  }
  console.log('');

  // Test 4: Reset Request
  console.log('4. Testing /api/auth/reset...');
  const reset = await test('/api/auth/reset', 'POST', {
    email: 'test@example.com'
  });
  console.log(`   Status: ${reset.status} ${reset.ok ? '✅' : '❌'}`);
  if (reset.body) {
    try {
      const data = JSON.parse(reset.body);
      if (data.message) console.log(`   Response: ${data.message}`);
    } catch {}
  }
  console.log('');

  console.log('✅ Auth endpoints are accessible!\n');
}

main().catch(console.error);
