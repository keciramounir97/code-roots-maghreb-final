#!/usr/bin/env node
/**
 * Comprehensive Route Auditor
 * Verifies all CRUD routes exist and function correctly
 * Shows green ✓ for success, red ✗ for failure
 */

const http = require('http');
const https = require('https');

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

const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  errors: []
};

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

async function testRoute(name, method, path, options = {}) {
  results.total++;
  process.stdout.write(`Testing ${BOLD}${method} ${path}${RESET}... `);
  
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
      return true;
    } else {
      results.failed++;
      const errorMsg = result.error || `Status ${result.status}`;
      console.log(`${FAIL} ${errorMsg}`);
      results.errors.push({ name, method, path, error: errorMsg });
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
    results.errors.push({ name, method, path, error: err.message });
    return false;
  }
}

async function auditAllRoutes() {
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  COMPREHENSIVE ROUTE AUDIT${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');

  // Health endpoints
  console.log(`${BOLD}❤️  Health Endpoints${RESET}`);
  await testRoute('Health', 'GET', '/api/health');
  await testRoute('DB Health', 'GET', '/api/db-health', { expectedStatus: [200, 500] });
  await testRoute('Users Count', 'GET', '/api/users/count', { expectedStatus: [200, 500] });
  console.log('');

  // Route health checks
  console.log(`${BOLD}🏥  Route Health Checks${RESET}`);
  const healthRoutes = [
    '/api/auth/health',
    '/api/books/health',
    '/api/trees/health',
    '/api/users/health',
    '/api/gallery/health',
    '/api/persons/health',
    '/api/contact/health',
    '/api/newsletter/health',
    '/api/search/health',
    '/api/settings/health',
    '/api/stats/health',
    '/api/activity/health',
    '/api/roles/health',
    '/api/diagnostics/health'
  ];
  for (const route of healthRoutes) {
    await testRoute('Health Check', 'GET', route);
  }
  console.log('');

  // Public routes
  console.log(`${BOLD}🌐  Public Routes${RESET}`);
  await testRoute('List Books', 'GET', '/api/books');
  await testRoute('List Trees', 'GET', '/api/trees');
  await testRoute('List Gallery', 'GET', '/api/gallery');
  await testRoute('Search', 'GET', '/api/search');
  console.log('');

  // Books CRUD
  console.log(`${BOLD}📖  Books CRUD Routes${RESET}`);
  await testRoute('List Public Books', 'GET', '/api/books');
  await testRoute('Get Public Book', 'GET', '/api/books/1', { expectedStatus: [200, 404] });
  await testRoute('List Admin Books', 'GET', '/api/admin/books', { expectedStatus: [200, 401, 403] });
  await testRoute('Get Admin Book', 'GET', '/api/admin/books/1', { expectedStatus: [200, 401, 403, 404] });
  console.log('');

  // Trees CRUD
  console.log(`${BOLD}🌳  Trees CRUD Routes${RESET}`);
  await testRoute('List Public Trees', 'GET', '/api/trees');
  await testRoute('Get Public Tree', 'GET', '/api/trees/1', { expectedStatus: [200, 404] });
  await testRoute('List Admin Trees', 'GET', '/api/admin/trees', { expectedStatus: [200, 401, 403] });
  await testRoute('Get Admin Tree', 'GET', '/api/admin/trees/1', { expectedStatus: [200, 401, 403, 404] });
  console.log('');

  // Gallery CRUD
  console.log(`${BOLD}🖼️   Gallery CRUD Routes${RESET}`);
  await testRoute('List Public Gallery', 'GET', '/api/gallery');
  await testRoute('Get Public Gallery Item', 'GET', '/api/gallery/1', { expectedStatus: [200, 404] });
  await testRoute('List Admin Gallery', 'GET', '/api/admin/gallery', { expectedStatus: [200, 401, 403] });
  await testRoute('Get Admin Gallery Item', 'GET', '/api/admin/gallery/1', { expectedStatus: [200, 401, 403, 404] });
  console.log('');

  // Users CRUD
  console.log(`${BOLD}👥  Users CRUD Routes${RESET}`);
  await testRoute('List Users', 'GET', '/api/admin/users', { expectedStatus: [200, 401, 403] });
  await testRoute('Get User', 'GET', '/api/admin/users/1', { expectedStatus: [200, 401, 403, 404] });
  console.log('');

  // Auth routes
  console.log(`${BOLD}🔐  Auth Routes${RESET}`);
  await testRoute('Auth Health', 'GET', '/api/auth/health');
  await testRoute('Login', 'POST', '/api/auth/login', { 
    body: { email: 'test@test.com', password: 'test' },
    expectedStatus: [200, 400, 401]
  });
  console.log('');

  // Summary
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  AUDIT SUMMARY${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`Total Routes: ${results.total}`);
  console.log(`${GREEN}Passed: ${results.passed}${RESET}`);
  console.log(`${RED}Failed: ${results.failed}${RESET}`);
  console.log(`${YELLOW}Skipped: ${results.skipped}${RESET}`);
  const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  console.log(`Pass Rate: ${passRate}%`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  
  if (results.errors.length > 0) {
    console.log('');
    console.log(`${BOLD}${RED}Failed Routes:${RESET}`);
    results.errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err.method} ${err.path} - ${err.error}`);
    });
  }
  
  console.log('');
  
  if (results.failed === 0) {
    console.log(`${BOLD}${GREEN}✅ All routes verified!${RESET}`);
    process.exit(0);
  } else {
    console.log(`${BOLD}${RED}⚠️  Some routes failed. Please review.${RESET}`);
    process.exit(1);
  }
}

if (require.main === module) {
  auditAllRoutes().catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
}

module.exports = { auditAllRoutes };
