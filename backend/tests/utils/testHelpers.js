/**
 * Test Helpers - Common utilities for all tests
 */

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const SUCCESS = `${GREEN}✓${RESET}`;
const FAIL = `${RED}✗${RESET}`;
const INFO = `${BLUE}ℹ${RESET}`;

class TestResults {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.total = 0;
    this.errors = [];
  }

  pass(message = '') {
    this.passed++;
    this.total++;
    console.log(`${SUCCESS} ${message}`);
    return true;
  }

  fail(message = '', error = null) {
    this.failed++;
    this.total++;
    this.errors.push({ message, error });
    console.log(`${FAIL} ${message}`);
    if (error) {
      console.log(`   ${YELLOW}→${RESET} ${error.message || error}`);
    }
    return false;
  }

  skip(message = '') {
    this.skipped++;
    this.total++;
    console.log(`${INFO} ${message} (skipped)`);
    return false;
  }

  summary() {
    const passRate = this.total > 0 ? ((this.passed / this.total) * 100).toFixed(1) : 0;
    console.log('');
    console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
    console.log(`${BOLD}  TEST SUMMARY${RESET}`);
    console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
    console.log(`Total: ${this.total}`);
    console.log(`${GREEN}Passed: ${this.passed}${RESET}`);
    console.log(`${RED}Failed: ${this.failed}${RESET}`);
    console.log(`${YELLOW}Skipped: ${this.skipped}${RESET}`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
    
    if (this.errors.length > 0) {
      console.log('');
      console.log(`${BOLD}${RED}Errors:${RESET}`);
      this.errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.message}`);
        if (err.error) {
          console.log(`   ${err.error.message || err.error}`);
        }
      });
    }
    
    return {
      total: this.total,
      passed: this.passed,
      failed: this.failed,
      skipped: this.skipped,
      passRate: parseFloat(passRate),
      errors: this.errors
    };
  }
}

function makeRequest(method, path, options = {}) {
  return new Promise((resolve) => {
    const http = require('http');
    const https = require('https');
    const BASE_URL = process.env.API_URL || 'http://localhost:5000';
    const TIMEOUT = options.timeout || 5000;
    
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateMockData(type) {
  const mocks = {
    user: {
      email: `test_${Date.now()}@example.com`,
      password: 'Test123!@#',
      fullName: 'Test User',
      phoneNumber: '+1234567890'
    },
    book: {
      title: `Test Book ${Date.now()}`,
      author: 'Test Author',
      description: 'Test description',
      category: 'Test Category',
      archiveSource: 'Test Archive',
      documentCode: 'TEST-001',
      isPublic: true
    },
    tree: {
      title: `Test Tree ${Date.now()}`,
      description: 'Test tree description',
      archiveSource: 'Test Archive',
      documentCode: 'TEST-001',
      isPublic: false
    },
    gallery: {
      title: `Test Image ${Date.now()}`,
      description: 'Test image description',
      archiveSource: 'Test Archive',
      documentCode: 'TEST-001',
      location: 'Test Location',
      year: '2024',
      photographer: 'Test Photographer',
      isPublic: true
    }
  };
  
  return mocks[type] || {};
}

module.exports = {
  TestResults,
  makeRequest,
  sleep,
  generateMockData,
  SUCCESS,
  FAIL,
  INFO,
  GREEN,
  RED,
  YELLOW,
  BLUE,
  RESET,
  BOLD
};
