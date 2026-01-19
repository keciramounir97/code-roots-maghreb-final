#!/usr/bin/env node
/**
 * Controllers Audit Test
 * Tests all controllers with green ✓ and red ✗ indicators
 */

const { TestResults, makeRequest, BOLD, BLUE, RESET } = require('./utils/testHelpers');
const fs = require('fs');
const path = require('path');

const results = new TestResults();
let authToken = null;

async function testControllers() {
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  CONTROLLERS AUDIT TEST${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log('');

  // Get all controller files
  const controllersDir = path.join(__dirname, '../src/controllers');
  const controllerFiles = fs.readdirSync(controllersDir)
    .filter(file => file.endsWith('Controller.js'))
    .map(file => file.replace('Controller.js', ''));

  console.log(`${BOLD}Found ${controllerFiles.length} controllers to test${RESET}`);
  console.log('');

  // Test each controller
  for (const controller of controllerFiles) {
    console.log(`${BOLD}Testing ${controller}Controller...${RESET}`);
    
    try {
      // Check if controller file exists and is valid
      const controllerPath = path.join(controllersDir, `${controller}Controller.js`);
      if (fs.existsSync(controllerPath)) {
        const content = fs.readFileSync(controllerPath, 'utf8');
        
        // Basic checks
        if (content.includes('module.exports')) {
          results.pass(`${controller}Controller exports correctly`);
        } else {
          results.fail(`${controller}Controller missing module.exports`);
        }

        // Check for error handling
        if (content.includes('try') && content.includes('catch')) {
          results.pass(`${controller}Controller has error handling`);
        } else {
          results.fail(`${controller}Controller missing error handling`);
        }

        // Check for database error handling
        if (content.includes('getDatabaseErrorResponse') || content.includes('prisma')) {
          results.pass(`${controller}Controller has database error handling`);
        }
      } else {
        results.fail(`${controller}Controller file not found`);
      }
    } catch (err) {
      results.fail(`Error testing ${controller}Controller`, err);
    }
  }

  // Test controller endpoints (if authenticated)
  console.log('');
  console.log(`${BOLD}Testing controller endpoints...${RESET}`);
  
  // Try to authenticate
  try {
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      body: {
        email: process.env.TEST_EMAIL || 'admin@example.com',
        password: process.env.TEST_PASSWORD || 'admin123'
      }
    });

    if (loginRes.success && loginRes.body) {
      try {
        const data = JSON.parse(loginRes.body);
        authToken = data.token;
        if (authToken) {
          results.pass('Authentication successful for endpoint testing');
        }
      } catch (err) {
        results.skip('Authentication failed - skipping endpoint tests');
      }
    }
  } catch (err) {
    results.skip('Authentication error - skipping endpoint tests');
  }

  if (authToken) {
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // Test health endpoints for each controller
    const healthEndpoints = [
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

    for (const endpoint of healthEndpoints) {
      try {
        const res = await makeRequest('GET', endpoint, {});
        if (res.success) {
          results.pass(`Health endpoint ${endpoint} works`);
        } else {
          results.fail(`Health endpoint ${endpoint} failed`, { message: res.error || `Status ${res.status}` });
        }
      } catch (err) {
        results.fail(`Health endpoint ${endpoint} error`, err);
      }
    }
  }

  return results.summary();
}

if (require.main === module) {
  testControllers()
    .then((summary) => {
      if (summary.failed === 0) {
        console.log('');
        console.log(`${BOLD}${BLUE}✅ All Controllers tests passed!${RESET}`);
        process.exit(0);
      } else {
        console.log('');
        console.log(`${BOLD}⚠️  Some Controllers tests failed.${RESET}`);
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}

module.exports = { testControllers };
