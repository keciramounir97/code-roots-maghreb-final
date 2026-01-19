#!/usr/bin/env node
/**
 * Gallery (Images) CRUD Audit Test
 * Tests all CRUD operations for gallery with green ✓ and red ✗ indicators
 */

const { TestResults, makeRequest, generateMockData, SUCCESS, FAIL, BOLD, BLUE, RESET } = require('./utils/testHelpers');

const results = new TestResults();
let authToken = null;
let testGalleryId = null;

async function testGalleryCRUD() {
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  GALLERY (IMAGES) CRUD AUDIT TEST${RESET}`);
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
    const mockGallery = generateMockData('gallery');
    const createRes = await makeRequest('POST', '/api/my/gallery', {
      headers,
      body: mockGallery
    });

    if (createRes.success || createRes.status === 201) {
      try {
        const data = JSON.parse(createRes.body);
        testGalleryId = data.item?.id || data.id;
        if (testGalleryId) {
          results.pass(`Gallery item created successfully (ID: ${testGalleryId})`);
        } else {
          results.fail('Gallery creation failed - no ID returned');
        }
      } catch (err) {
        results.fail('Gallery creation failed - invalid response', err);
      }
    } else {
      results.fail('Gallery creation failed', { 
        message: createRes.error || `Status ${createRes.status}`,
        body: createRes.body 
      });
    }
  } catch (err) {
    results.fail('Gallery creation error', err);
  }

  if (!testGalleryId) {
    console.log(`${BOLD}⚠️  Cannot continue CRUD tests without gallery ID${RESET}`);
    return results.summary();
  }

  // Step 3: READ
  console.log('');
  console.log(`${BOLD}Step 3: READ Operation...${RESET}`);
  
  // 3a: Get my gallery item
  try {
    const getRes = await makeRequest('GET', `/api/my/gallery/${testGalleryId}`, { headers });
    if (getRes.success) {
      try {
        const data = JSON.parse(getRes.body);
        const item = data.item || data;
        if (item.id === testGalleryId) {
          results.pass(`Gallery item retrieved successfully (ID: ${testGalleryId})`);
          // Verify optional fields
          if (item.hasOwnProperty('archiveSource') && item.hasOwnProperty('documentCode')) {
            results.pass('Optional fields (archiveSource, documentCode) are included');
          } else {
            results.fail('Optional fields missing in response');
          }
        } else {
          results.fail('Gallery ID mismatch');
        }
      } catch (err) {
        results.fail('Gallery retrieval failed - invalid response', err);
      }
    } else {
      results.fail('Gallery retrieval failed', { message: getRes.error || `Status ${getRes.status}` });
    }
  } catch (err) {
    results.fail('Gallery retrieval error', err);
  }

  // 3b: List my gallery
  try {
    const listRes = await makeRequest('GET', '/api/my/gallery', { headers });
    if (listRes.success) {
      try {
        const data = JSON.parse(listRes.body);
        const gallery = data.gallery || data;
        if (Array.isArray(gallery)) {
          results.pass(`List gallery successful (${gallery.length} items)`);
        } else {
          results.fail('List gallery failed - not an array');
        }
      } catch (err) {
        results.fail('List gallery failed - invalid response', err);
      }
    } else {
      results.fail('List gallery failed', { message: listRes.error || `Status ${listRes.status}` });
    }
  } catch (err) {
    results.fail('List gallery error', err);
  }

  // 3c: List public gallery
  try {
    const publicRes = await makeRequest('GET', '/api/gallery', {});
    if (publicRes.success) {
      results.pass('List public gallery successful');
    } else {
      results.fail('List public gallery failed', { message: publicRes.error || `Status ${publicRes.status}` });
    }
  } catch (err) {
    results.fail('List public gallery error', err);
  }

  // Step 4: UPDATE
  console.log('');
  console.log(`${BOLD}Step 4: UPDATE Operation...${RESET}`);
  try {
    const updateData = {
      title: `Updated Image ${Date.now()}`,
      archiveSource: 'Updated Archive',
      documentCode: 'UPD-001'
    };
    const updateRes = await makeRequest('PUT', `/api/my/gallery/${testGalleryId}`, {
      headers,
      body: updateData
    });

    if (updateRes.success || updateRes.status === 200) {
      results.pass('Gallery item updated successfully');
      
      // Verify update
      const verifyRes = await makeRequest('GET', `/api/my/gallery/${testGalleryId}`, { headers });
      if (verifyRes.success) {
        try {
          const data = JSON.parse(verifyRes.body);
          const item = data.item || data;
          if (item.archiveSource === 'Updated Archive' && item.documentCode === 'UPD-001') {
            results.pass('Optional fields updated correctly');
          } else {
            results.fail('Optional fields not updated correctly');
          }
        } catch (err) {
          results.fail('Update verification failed', err);
        }
      }
    } else {
      results.fail('Gallery update failed', { message: updateRes.error || `Status ${updateRes.status}` });
    }
  } catch (err) {
    results.fail('Gallery update error', err);
  }

  // Step 5: DELETE
  console.log('');
  console.log(`${BOLD}Step 5: DELETE Operation...${RESET}`);
  try {
    const deleteRes = await makeRequest('DELETE', `/api/my/gallery/${testGalleryId}`, { headers });
    if (deleteRes.success || deleteRes.status === 200) {
      results.pass('Gallery item deleted successfully');
      
      // Verify deletion
      const verifyRes = await makeRequest('GET', `/api/my/gallery/${testGalleryId}`, { headers });
      if (verifyRes.status === 404) {
        results.pass('Gallery deletion verified (404 on retrieval)');
      } else {
        results.fail('Gallery item still exists after deletion');
      }
    } else {
      results.fail('Gallery deletion failed', { message: deleteRes.error || `Status ${deleteRes.status}` });
    }
  } catch (err) {
    results.fail('Gallery deletion error', err);
  }

  // Summary
  return results.summary();
}

if (require.main === module) {
  testGalleryCRUD()
    .then((summary) => {
      if (summary.failed === 0) {
        console.log('');
        console.log(`${BOLD}${BLUE}✅ All Gallery CRUD tests passed!${RESET}`);
        process.exit(0);
      } else {
        console.log('');
        console.log(`${BOLD}⚠️  Some Gallery CRUD tests failed.${RESET}`);
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}

module.exports = { testGalleryCRUD };
