#!/usr/bin/env node
/**
 * Trees CRUD Audit Test
 * Tests all CRUD operations for trees with green ✓ and red ✗ indicators
 */

const { TestResults, makeRequest, generateMockData, SUCCESS, FAIL, BOLD, BLUE, RESET } = require('./utils/testHelpers');

const results = new TestResults();
let authToken = null;
let testTreeId = null;

async function testTreesCRUD() {
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  TREES CRUD AUDIT TEST${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log('');

  // Step 1: Login
  console.log(`${BOLD}Step 1: Authentication...${RESET}`);
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
          results.pass('Authentication successful');
        } else {
          results.fail('Authentication failed - no token received');
          return results.summary();
        }
      } catch (err) {
        results.fail('Authentication failed - invalid response', err);
        return results.summary();
      }
    } else {
      results.fail('Authentication failed', { message: loginRes.error || `Status ${loginRes.status}` });
      return results.summary();
    }
  } catch (err) {
    results.fail('Authentication error', err);
    return results.summary();
  }

  const headers = { Authorization: `Bearer ${authToken}` };

  // Step 2: CREATE
  console.log('');
  console.log(`${BOLD}Step 2: CREATE Operation...${RESET}`);
  try {
    const mockTree = generateMockData('tree');
    const createRes = await makeRequest('POST', '/api/my/trees', {
      headers,
      body: mockTree
    });

    if (createRes.success || createRes.status === 201) {
      try {
        const data = JSON.parse(createRes.body);
        testTreeId = data.id;
        if (testTreeId) {
          results.pass(`Tree created successfully (ID: ${testTreeId})`);
        } else {
          results.fail('Tree creation failed - no ID returned');
        }
      } catch (err) {
        results.fail('Tree creation failed - invalid response', err);
      }
    } else {
      results.fail('Tree creation failed', { 
        message: createRes.error || `Status ${createRes.status}`,
        body: createRes.body 
      });
    }
  } catch (err) {
    results.fail('Tree creation error', err);
  }

  if (!testTreeId) {
    console.log(`${BOLD}⚠️  Cannot continue CRUD tests without tree ID${RESET}`);
    return results.summary();
  }

  // Step 3: READ
  console.log('');
  console.log(`${BOLD}Step 3: READ Operation...${RESET}`);
  
  // 3a: Get my tree
  try {
    const getRes = await makeRequest('GET', `/api/my/trees/${testTreeId}`, { headers });
    if (getRes.success) {
      try {
        const data = JSON.parse(getRes.body);
        if (data.id === testTreeId) {
          results.pass(`Tree retrieved successfully (ID: ${testTreeId})`);
          // Verify optional fields
          if (data.hasOwnProperty('archiveSource') && data.hasOwnProperty('documentCode')) {
            results.pass('Optional fields (archiveSource, documentCode) are included');
          } else {
            results.fail('Optional fields missing in response');
          }
        } else {
          results.fail('Tree ID mismatch');
        }
      } catch (err) {
        results.fail('Tree retrieval failed - invalid response', err);
      }
    } else {
      results.fail('Tree retrieval failed', { message: getRes.error || `Status ${getRes.status}` });
    }
  } catch (err) {
    results.fail('Tree retrieval error', err);
  }

  // 3b: List my trees
  try {
    const listRes = await makeRequest('GET', '/api/my/trees', { headers });
    if (listRes.success) {
      try {
        const data = JSON.parse(listRes.body);
        if (Array.isArray(data)) {
          results.pass(`List trees successful (${data.length} trees)`);
        } else {
          results.fail('List trees failed - not an array');
        }
      } catch (err) {
        results.fail('List trees failed - invalid response', err);
      }
    } else {
      results.fail('List trees failed', { message: listRes.error || `Status ${listRes.status}` });
    }
  } catch (err) {
    results.fail('List trees error', err);
  }

  // 3c: List public trees
  try {
    const publicRes = await makeRequest('GET', '/api/trees', {});
    if (publicRes.success) {
      results.pass('List public trees successful');
    } else {
      results.fail('List public trees failed', { message: publicRes.error || `Status ${publicRes.status}` });
    }
  } catch (err) {
    results.fail('List public trees error', err);
  }

  // Step 4: UPDATE
  console.log('');
  console.log(`${BOLD}Step 4: UPDATE Operation...${RESET}`);
  try {
    const updateData = {
      title: `Updated Tree ${Date.now()}`,
      archiveSource: 'Updated Archive',
      documentCode: 'UPD-001'
    };
    const updateRes = await makeRequest('PUT', `/api/my/trees/${testTreeId}`, {
      headers,
      body: updateData
    });

    if (updateRes.success || updateRes.status === 200) {
      results.pass('Tree updated successfully');
      
      // Verify update
      const verifyRes = await makeRequest('GET', `/api/my/trees/${testTreeId}`, { headers });
      if (verifyRes.success) {
        try {
          const data = JSON.parse(verifyRes.body);
          if (data.archiveSource === 'Updated Archive' && data.documentCode === 'UPD-001') {
            results.pass('Optional fields updated correctly');
          } else {
            results.fail('Optional fields not updated correctly');
          }
        } catch (err) {
          results.fail('Update verification failed', err);
        }
      }
    } else {
      results.fail('Tree update failed', { message: updateRes.error || `Status ${updateRes.status}` });
    }
  } catch (err) {
    results.fail('Tree update error', err);
  }

  // Step 5: DELETE
  console.log('');
  console.log(`${BOLD}Step 5: DELETE Operation...${RESET}`);
  try {
    const deleteRes = await makeRequest('DELETE', `/api/my/trees/${testTreeId}`, { headers });
    if (deleteRes.success || deleteRes.status === 200) {
      results.pass('Tree deleted successfully');
      
      // Verify deletion
      const verifyRes = await makeRequest('GET', `/api/my/trees/${testTreeId}`, { headers });
      if (verifyRes.status === 404) {
        results.pass('Tree deletion verified (404 on retrieval)');
      } else {
        results.fail('Tree still exists after deletion');
      }
    } else {
      results.fail('Tree deletion failed', { message: deleteRes.error || `Status ${deleteRes.status}` });
    }
  } catch (err) {
    results.fail('Tree deletion error', err);
  }

  // Summary
  return results.summary();
}

if (require.main === module) {
  testTreesCRUD()
    .then((summary) => {
      if (summary.failed === 0) {
        console.log('');
        console.log(`${BOLD}${BLUE}✅ All Trees CRUD tests passed!${RESET}`);
        process.exit(0);
      } else {
        console.log('');
        console.log(`${BOLD}⚠️  Some Trees CRUD tests failed.${RESET}`);
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}

module.exports = { testTreesCRUD };
