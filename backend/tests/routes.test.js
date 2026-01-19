#!/usr/bin/env node
/**
 * Routes Audit Test
 * Tests all API routes with green ✓ and red ✗ indicators
 */

const { TestResults, makeRequest, BOLD, BLUE, RESET } = require('./utils/testHelpers');

const results = new TestResults();

async function testRoutes() {
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  ROUTES AUDIT TEST${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log('');

  // Define all routes to test
  const routes = [
    // Public routes
    { method: 'GET', path: '/api/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/db-health', auth: false, expectedStatus: [200, 500] },
    { method: 'GET', path: '/api/books', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/trees', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/gallery', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/search', auth: false, expectedStatus: 200 },
    { method: 'POST', path: '/api/contact', auth: false, expectedStatus: [200, 400] },
    { method: 'POST', path: '/api/newsletter', auth: false, expectedStatus: [200, 400] },
    
    // Auth routes
    { method: 'GET', path: '/api/auth/health', auth: false, expectedStatus: 200 },
    { method: 'POST', path: '/api/auth/signup', auth: false, expectedStatus: [200, 201, 400] },
    
    // Health endpoints
    { method: 'GET', path: '/api/books/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/trees/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/users/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/gallery/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/persons/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/contact/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/newsletter/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/search/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/settings/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/stats/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/activity/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/roles/health', auth: false, expectedStatus: 200 },
    { method: 'GET', path: '/api/diagnostics/health', auth: false, expectedStatus: 200 },
  ];

  console.log(`Testing ${routes.length} routes...`);
  console.log('');

  for (const route of routes) {
    try {
      const options = {
        headers: route.auth ? { Authorization: `Bearer ${route.authToken}` } : {},
        body: route.body
      };

      const res = await makeRequest(route.method, route.path, options);
      
      const expectedStatuses = Array.isArray(route.expectedStatus) 
        ? route.expectedStatus 
        : [route.expectedStatus || 200];
      
      const isSuccess = expectedStatuses.includes(res.status) || res.success;
      
      if (isSuccess) {
        results.pass(`${route.method} ${route.path} (${res.status})`);
      } else {
        results.fail(`${route.method} ${route.path}`, { 
          message: `Expected ${expectedStatuses.join(' or ')}, got ${res.status}`,
          error: res.error 
        });
      }
    } catch (err) {
      results.fail(`${route.method} ${route.path}`, err);
    }
  }

  return results.summary();
}

if (require.main === module) {
  testRoutes()
    .then((summary) => {
      if (summary.failed === 0) {
        console.log('');
        console.log(`${BOLD}${BLUE}✅ All Routes tests passed!${RESET}`);
        process.exit(0);
      } else {
        console.log('');
        console.log(`${BOLD}⚠️  Some Routes tests failed.${RESET}`);
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}

module.exports = { testRoutes };
