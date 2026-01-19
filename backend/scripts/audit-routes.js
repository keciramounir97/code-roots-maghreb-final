#!/usr/bin/env node
/**
 * API Route Auditor
 * Tests all API routes and shows ✓ (green) for success, ✗ (red) for failure
 */

const http = require('http');
const https = require('https');

// Colors for terminal
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const SUCCESS = `${GREEN}✓${RESET}`;
const FAIL = `${RED}✗${RESET}`;
const INFO = `${BLUE}ℹ${RESET}`;

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const TIMEOUT = 5000;

// Test results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0
};

// Helper to make HTTP request
function makeRequest(method, path, options = {}) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: TIMEOUT
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
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

// Test a route
async function testRoute(name, method, path, options = {}) {
  results.total++;
  process.stdout.write(`Testing ${BOLD}${method} ${path}${RESET}... `);
  
  try {
    const result = await makeRequest(method, path, options);
    
    if (result.success || (options.expectedStatus && result.status === options.expectedStatus)) {
      results.passed++;
      console.log(`${SUCCESS} ${result.status || 'OK'}`);
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

// Main audit function
async function auditRoutes() {
  console.log(`\n${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${BLUE}  API ROUTE AUDITOR${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}\n`);
  console.log(`Base URL: ${BOLD}${BASE_URL}${RESET}\n`);

  // Health & System Routes
  console.log(`${BOLD}Health & System Routes${RESET}`);
  console.log('─'.repeat(50));
  await testRoute('Root', 'GET', '/');
  await testRoute('API Health', 'GET', '/api/health');
  await testRoute('DB Health', 'GET', '/api/db-health');
  console.log('');

  // Auth Routes
  console.log(`${BOLD}Authentication Routes${RESET}`);
  console.log('─'.repeat(50));
  await testRoute('Signup', 'POST', '/api/auth/signup', {
    body: { email: 'test@test.com', password: 'test123', fullName: 'Test User' },
    expectedStatus: 400 // May fail if email exists or validation fails
  });
  await testRoute('Login', 'POST', '/api/auth/login', {
    body: { email: 'invalid@test.com', password: 'wrong' },
    expectedStatus: 401
  });
  await testRoute('Get Me (no auth)', 'GET', '/api/auth/me', { expectedStatus: 401 });
  console.log('');

  // Public Routes
  console.log(`${BOLD}Public Routes${RESET}`);
  console.log('─'.repeat(50));
  await testRoute('List Public Trees', 'GET', '/api/trees');
  await testRoute('List Public Books', 'GET', '/api/books');
  await testRoute('List Public Gallery', 'GET', '/api/gallery');
  await testRoute('Search', 'GET', '/api/search?q=test');
  await testRoute('Search Suggest', 'GET', '/api/search/suggest?q=test');
  await testRoute('Get Footer', 'GET', '/api/footer');
  console.log('');

  // Tree Routes
  console.log(`${BOLD}Tree Routes${RESET}`);
  console.log('─'.repeat(50));
  await testRoute('Get Public Tree', 'GET', '/api/trees/1', { expectedStatus: 404 });
  await testRoute('Download Public GEDCOM', 'GET', '/api/trees/1/gedcom', { expectedStatus: 404 });
  await testRoute('List My Trees (no auth)', 'GET', '/api/my/trees', { expectedStatus: 401 });
  await testRoute('List Admin Trees (no auth)', 'GET', '/api/admin/trees', { expectedStatus: 401 });
  console.log('');

  // Person Routes
  console.log(`${BOLD}Person Routes${RESET}`);
  console.log('─'.repeat(50));
  await testRoute('List Public Tree Persons', 'GET', '/api/trees/1/persons', { expectedStatus: 404 });
  await testRoute('Get Public Person', 'GET', '/api/persons/1', { expectedStatus: 404 });
  await testRoute('List My Tree Persons (no auth)', 'GET', '/api/my/trees/1/persons', { expectedStatus: 401 });
  console.log('');

  // Book Routes
  console.log(`${BOLD}Book Routes${RESET}`);
  console.log('─'.repeat(50));
  await testRoute('Get Public Book', 'GET', '/api/books/1', { expectedStatus: 404 });
  await testRoute('Download Public Book', 'GET', '/api/books/1/download', { expectedStatus: 404 });
  await testRoute('List My Books (no auth)', 'GET', '/api/my/books', { expectedStatus: 401 });
  await testRoute('List Admin Books (no auth)', 'GET', '/api/admin/books', { expectedStatus: 401 });
  console.log('');

  // Gallery Routes
  console.log(`${BOLD}Gallery Routes${RESET}`);
  console.log('─'.repeat(50));
  await testRoute('Get Public Gallery Item', 'GET', '/api/gallery/1', { expectedStatus: 404 });
  await testRoute('List My Gallery (no auth)', 'GET', '/api/my/gallery', { expectedStatus: 401 });
  await testRoute('List Admin Gallery (no auth)', 'GET', '/api/admin/gallery', { expectedStatus: 401 });
  console.log('');

  // Admin Routes
  console.log(`${BOLD}Admin Routes${RESET}`);
  console.log('─'.repeat(50));
  await testRoute('List Users (no auth)', 'GET', '/api/admin/users', { expectedStatus: 401 });
  await testRoute('List Roles (no auth)', 'GET', '/api/admin/roles', { expectedStatus: 401 });
  await testRoute('Get Stats (no auth)', 'GET', '/api/admin/stats', { expectedStatus: 401 });
  await testRoute('Get Activity (no auth)', 'GET', '/api/admin/activity', { expectedStatus: 401 });
  await testRoute('Get Settings (no auth)', 'GET', '/api/admin/settings', { expectedStatus: 401 });
  await testRoute('Get Diagnostics (no auth)', 'GET', '/api/admin/diagnostics/schema', { expectedStatus: 401 });
  console.log('');

  // Other Routes
  console.log(`${BOLD}Other Routes${RESET}`);
  console.log('─'.repeat(50));
  await testRoute('Contact', 'POST', '/api/contact', {
    body: { name: 'Test', email: 'test@test.com', message: 'Test message' }
  });
  await testRoute('Newsletter', 'POST', '/api/newsletter', {
    body: { email: 'test@test.com' }
  });
  await testRoute('User Activity (no auth)', 'GET', '/api/activity', { expectedStatus: 401 });
  console.log('');

  // 404 Test
  console.log(`${BOLD}404 Handling${RESET}`);
  console.log('─'.repeat(50));
  await testRoute('Non-existent Route', 'GET', '/api/nonexistent', { expectedStatus: 404 });
  console.log('');

  // Summary
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}SUMMARY${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}\n`);
  
  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`Total Tests:  ${BOLD}${results.total}${RESET}`);
  console.log(`${SUCCESS} Passed:     ${BOLD}${GREEN}${results.passed}${RESET}`);
  console.log(`${FAIL} Failed:     ${BOLD}${RED}${results.failed}${RESET}`);
  console.log(`Pass Rate:    ${BOLD}${passRate}%${RESET}\n`);

  if (results.failed === 0) {
    console.log(`${GREEN}${BOLD}All routes are working correctly!${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${YELLOW}Some routes need attention. Check the failures above.${RESET}\n`);
    process.exit(1);
  }
}

// Run audit
if (require.main === module) {
  auditRoutes().catch((err) => {
    console.error(`${RED}${FAIL} Audit failed:${RESET}`, err.message);
    process.exit(1);
  });
}

module.exports = { auditRoutes, testRoute };
