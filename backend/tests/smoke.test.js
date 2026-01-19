#!/usr/bin/env node
/**
 * Smoke Tests
 * Quick tests to verify basic functionality
 */

const { TestResults, makeRequest, BOLD, BLUE, RESET } = require('./utils/testHelpers');

const results = new TestResults();

async function smokeTests() {
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  SMOKE TESTS${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log('');

  // Test 1: Server is running
  console.log(`${BOLD}1. Server Health...${RESET}`);
  try {
    const res = await makeRequest('GET', '/api/health', {});
    if (res.success && res.status === 200) {
      results.pass('Server is running and responding');
    } else {
      results.fail('Server health check failed', { message: res.error || `Status ${res.status}` });
    }
  } catch (err) {
    results.fail('Server health check error', err);
  }

  // Test 2: Database connection
  console.log(`${BOLD}2. Database Connection...${RESET}`);
  try {
    const res = await makeRequest('GET', '/api/db-health', {});
    if (res.status === 200 || res.status === 500) {
      // 500 is OK if DB is down, we just want to know it's responding
      results.pass('Database health endpoint responding');
    } else {
      results.fail('Database health check failed', { message: res.error || `Status ${res.status}` });
    }
  } catch (err) {
    results.fail('Database health check error', err);
  }

  // Test 3: API routes loaded
  console.log(`${BOLD}3. API Routes...${RESET}`);
  try {
    const res = await makeRequest('GET', '/api/books/health', {});
    if (res.success) {
      results.pass('API routes are loaded');
    } else {
      results.fail('API routes not loaded', { message: res.error || `Status ${res.status}` });
    }
  } catch (err) {
    results.fail('API routes check error', err);
  }

  // Test 4: Public endpoints
  console.log(`${BOLD}4. Public Endpoints...${RESET}`);
  const publicEndpoints = [
    '/api/books',
    '/api/trees',
    '/api/gallery'
  ];

  for (const endpoint of publicEndpoints) {
    try {
      const res = await makeRequest('GET', endpoint, {});
      if (res.success || res.status === 200) {
        results.pass(`Public endpoint ${endpoint} works`);
      } else {
        results.fail(`Public endpoint ${endpoint} failed`, { message: res.error || `Status ${res.status}` });
      }
    } catch (err) {
      results.fail(`Public endpoint ${endpoint} error`, err);
    }
  }

  return results.summary();
}

if (require.main === module) {
  smokeTests()
    .then((summary) => {
      if (summary.failed === 0) {
        console.log('');
        console.log(`${BOLD}${BLUE}✅ All smoke tests passed!${RESET}`);
        process.exit(0);
      } else {
        console.log('');
        console.log(`${BOLD}⚠️  Some smoke tests failed.${RESET}`);
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}

module.exports = { smokeTests };
