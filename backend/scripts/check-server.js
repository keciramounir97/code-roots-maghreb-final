#!/usr/bin/env node
/**
 * Quick server health check script
 * Tests if the server is running and responding
 */

const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const SUCCESS = `${GREEN}✓${RESET}`;
const FAIL = `${RED}✗${RESET}`;
const INFO = `${BLUE}ℹ${RESET}`;

function checkEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          success: res.statusCode === expectedStatus,
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
        status: 0
      });
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
        status: 0
      });
    });
  });
}

async function checkServer() {
  console.log(`\n${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${BLUE}  SERVER HEALTH CHECK${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}\n`);
  console.log(`Checking server at: ${BOLD}${BASE_URL}${RESET}\n`);

  const checks = [
    { name: 'Root endpoint (/)', path: '/', expected: 200 },
    { name: 'API Health (/api/health)', path: '/api/health', expected: 200 },
    { name: 'DB Health (/api/db-health)', path: '/api/db-health', expected: [200, 500] },
  ];

  let allPassed = true;

  for (const check of checks) {
    process.stdout.write(`Testing ${BOLD}${check.name}${RESET}... `);
    const result = await checkEndpoint(check.path, Array.isArray(check.expected) ? check.expected[0] : check.expected);
    
    const expectedStatuses = Array.isArray(check.expected) ? check.expected : [check.expected];
    const isSuccess = result.success && expectedStatuses.includes(result.status);
    
    if (isSuccess) {
      console.log(`${SUCCESS} ${result.status}`);
      allPassed = true;
    } else {
      console.log(`${FAIL} ${result.error || `Status ${result.status}`}`);
      allPassed = false;
    }
  }

  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  
  if (allPassed) {
    console.log(`${GREEN}${BOLD}✅ Server is running and responding correctly!${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}❌ Server is not responding correctly${RESET}\n`);
    console.log(`${YELLOW}Make sure the server is running:${RESET}`);
    console.log(`  cd backend`);
    console.log(`  npm start\n`);
    process.exit(1);
  }
}

checkServer().catch((err) => {
  console.error(`${RED}${FAIL} Check failed:${RESET}`, err.message);
  process.exit(1);
});
