#!/usr/bin/env node
/**
 * Books CRUD Audit Test
 * Tests all CRUD operations for books with green ✓ and red ✗ indicators
 */

const { TestResults, makeRequest, generateMockData, SUCCESS, FAIL, BOLD, BLUE, RESET } = require('./utils/testHelpers');

const results = new TestResults();
let authToken = null;
let testBookId = null;

async function testBooksCRUD() {
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  BOOKS CRUD AUDIT TEST${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log('');

  // Step 1: Login to get auth token
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

  // Step 2: CREATE - Create a new book
  console.log('');
  console.log(`${BOLD}Step 2: CREATE Operation...${RESET}`);
  try {
    const mockBook = generateMockData('book');
    const createRes = await makeRequest('POST', '/api/my/books', {
      headers,
      body: mockBook
    });

    if (createRes.success || createRes.status === 201) {
      try {
        const data = JSON.parse(createRes.body);
        testBookId = data.id;
        if (testBookId) {
          results.pass(`Book created successfully (ID: ${testBookId})`);
        } else {
          results.fail('Book creation failed - no ID returned');
        }
      } catch (err) {
        results.fail('Book creation failed - invalid response', err);
      }
    } else {
      results.fail('Book creation failed', { 
        message: createRes.error || `Status ${createRes.status}`,
        body: createRes.body 
      });
    }
  } catch (err) {
    results.fail('Book creation error', err);
  }

  if (!testBookId) {
    console.log(`${BOLD}⚠️  Cannot continue CRUD tests without book ID${RESET}`);
    return results.summary();
  }

  // Step 3: READ - Get the created book
  console.log('');
  console.log(`${BOLD}Step 3: READ Operation...${RESET}`);
  
  // 3a: Get my book
  try {
    const getRes = await makeRequest('GET', `/api/my/books/${testBookId}`, { headers });
    if (getRes.success) {
      try {
        const data = JSON.parse(getRes.body);
        if (data.id === testBookId) {
          results.pass(`Book retrieved successfully (ID: ${testBookId})`);
          // Verify optional fields
          if (data.hasOwnProperty('archiveSource') && data.hasOwnProperty('documentCode')) {
            results.pass('Optional fields (archiveSource, documentCode) are included');
          } else {
            results.fail('Optional fields missing in response');
          }
        } else {
          results.fail('Book ID mismatch');
        }
      } catch (err) {
        results.fail('Book retrieval failed - invalid response', err);
      }
    } else {
      results.fail('Book retrieval failed', { message: getRes.error || `Status ${getRes.status}` });
    }
  } catch (err) {
    results.fail('Book retrieval error', err);
  }

  // 3b: List my books
  try {
    const listRes = await makeRequest('GET', '/api/my/books', { headers });
    if (listRes.success) {
      try {
        const data = JSON.parse(listRes.body);
        if (Array.isArray(data)) {
          results.pass(`List books successful (${data.length} books)`);
        } else {
          results.fail('List books failed - not an array');
        }
      } catch (err) {
        results.fail('List books failed - invalid response', err);
      }
    } else {
      results.fail('List books failed', { message: listRes.error || `Status ${listRes.status}` });
    }
  } catch (err) {
    results.fail('List books error', err);
  }

  // 3c: List public books
  try {
    const publicRes = await makeRequest('GET', '/api/books', {});
    if (publicRes.success) {
      results.pass('List public books successful');
    } else {
      results.fail('List public books failed', { message: publicRes.error || `Status ${publicRes.status}` });
    }
  } catch (err) {
    results.fail('List public books error', err);
  }

  // Step 4: UPDATE - Update the book
  console.log('');
  console.log(`${BOLD}Step 4: UPDATE Operation...${RESET}`);
  try {
    const updateData = {
      title: `Updated Book ${Date.now()}`,
      archiveSource: 'Updated Archive',
      documentCode: 'UPD-001'
    };
    const updateRes = await makeRequest('PUT', `/api/my/books/${testBookId}`, {
      headers,
      body: updateData
    });

    if (updateRes.success || updateRes.status === 200) {
      results.pass('Book updated successfully');
      
      // Verify update
      const verifyRes = await makeRequest('GET', `/api/my/books/${testBookId}`, { headers });
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
      results.fail('Book update failed', { message: updateRes.error || `Status ${updateRes.status}` });
    }
  } catch (err) {
    results.fail('Book update error', err);
  }

  // Step 5: DELETE - Delete the book
  console.log('');
  console.log(`${BOLD}Step 5: DELETE Operation...${RESET}`);
  try {
    const deleteRes = await makeRequest('DELETE', `/api/my/books/${testBookId}`, { headers });
    if (deleteRes.success || deleteRes.status === 200) {
      results.pass('Book deleted successfully');
      
      // Verify deletion
      const verifyRes = await makeRequest('GET', `/api/my/books/${testBookId}`, { headers });
      if (verifyRes.status === 404) {
        results.pass('Book deletion verified (404 on retrieval)');
      } else {
        results.fail('Book still exists after deletion');
      }
    } else {
      results.fail('Book deletion failed', { message: deleteRes.error || `Status ${deleteRes.status}` });
    }
  } catch (err) {
    results.fail('Book deletion error', err);
  }

  // Summary
  return results.summary();
}

if (require.main === module) {
  testBooksCRUD()
    .then((summary) => {
      if (summary.failed === 0) {
        console.log('');
        console.log(`${BOLD}${BLUE}✅ All Books CRUD tests passed!${RESET}`);
        process.exit(0);
      } else {
        console.log('');
        console.log(`${BOLD}⚠️  Some Books CRUD tests failed.${RESET}`);
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}

module.exports = { testBooksCRUD };
