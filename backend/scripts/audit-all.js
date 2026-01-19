#!/usr/bin/env node
/**
 * Comprehensive Audit Script
 * Runs all audit tests and shows green ✓ and red ✗ indicators
 */

const { spawn } = require('child_process');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const SUCCESS = `${GREEN}✓${RESET}`;
const FAIL = `${RED}✗${RESET}`;

const tests = [
  { name: 'Passenger Safety', file: 'passenger-safety.test.js' },
  { name: 'Routes', file: 'routes.test.js' },
  { name: 'Controllers', file: 'controllers.test.js' },
  { name: 'Books CRUD', file: 'crud-books.test.js' },
  { name: 'Gallery CRUD', file: 'crud-gallery.test.js' },
  { name: 'Trees CRUD', file: 'crud-trees.test.js' },
];

const results = {
  passed: 0,
  failed: 0,
  total: 0
};

function runTest(test) {
  return new Promise((resolve) => {
    console.log('');
    console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
    console.log(`${BOLD}  Running: ${test.name}${RESET}`);
    console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
    
    const testPath = path.join(__dirname, '../tests', test.file);
    const proc = spawn('node', [testPath], {
      stdio: 'inherit',
      shell: true
    });

    proc.on('close', (code) => {
      results.total++;
      if (code === 0) {
        results.passed++;
        console.log(`${SUCCESS} ${test.name} passed`);
        resolve(true);
      } else {
        results.failed++;
        console.log(`${FAIL} ${test.name} failed`);
        resolve(false);
      }
    });

    proc.on('error', (err) => {
      results.total++;
      results.failed++;
      console.log(`${FAIL} ${test.name} error: ${err.message}`);
      resolve(false);
    });
  });
}

async function runAllAudits() {
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  COMPREHENSIVE AUDIT${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log('');

  for (const test of tests) {
    await runTest(test);
  }

  // Summary
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  AUDIT SUMMARY${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`Total Tests: ${results.total}`);
  console.log(`${GREEN}Passed: ${results.passed}${RESET}`);
  console.log(`${RED}Failed: ${results.failed}${RESET}`);
  const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  console.log(`Pass Rate: ${passRate}%`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log('');

  if (results.failed === 0) {
    console.log(`${BOLD}${GREEN}✅ All audits passed!${RESET}`);
    process.exit(0);
  } else {
    console.log(`${BOLD}${RED}⚠️  Some audits failed.${RESET}`);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllAudits().catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
}

module.exports = { runAllAudits };
