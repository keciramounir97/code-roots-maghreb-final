#!/usr/bin/env node
/**
 * CORS Configuration Checker
 * Verifies CORS is properly configured
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const SUCCESS = `${GREEN}✓${RESET}`;
const FAIL = `${RED}✗${RESET}`;
const WARN = `${YELLOW}⚠${RESET}`;

function checkCORS() {
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  CORS CONFIGURATION CHECK${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log('');

  let hasErrors = false;
  let hasWarnings = false;

  // Check if cors package is installed
  console.log('1. Checking CORS package...');
  try {
    require.resolve('cors');
    console.log(`   ${SUCCESS} CORS package is installed`);
  } catch (err) {
    console.log(`   ${FAIL} CORS package is NOT installed`);
    console.log(`   ${YELLOW}   → Run: npm install cors${RESET}`);
    hasErrors = true;
  }
  console.log('');

  // Check server.js for CORS configuration
  console.log('2. Checking server.js for CORS configuration...');
  const serverPath = path.join(__dirname, '..', 'server.js');
  
  if (!fs.existsSync(serverPath)) {
    console.log(`   ${FAIL} server.js not found`);
    hasErrors = true;
  } else {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Check for cors import
    if (serverContent.includes("require('cors')") || serverContent.includes('require("cors")')) {
      console.log(`   ${SUCCESS} CORS is imported`);
    } else {
      console.log(`   ${FAIL} CORS is NOT imported`);
      hasErrors = true;
    }

    // Check for cors usage
    if (serverContent.includes('app.use') && serverContent.includes('cors')) {
      console.log(`   ${SUCCESS} CORS middleware is configured`);
    } else {
      console.log(`   ${FAIL} CORS middleware is NOT configured`);
      hasErrors = true;
    }

    // Check for allowed origins
    const requiredOrigins = [
      'rootsmaghreb.com',
      'frontend.rootsmaghreb.com',
      'admin.rootsmaghreb.com',
      'server.rootsmaghreb.com',
      'backend.rootsmaghreb.com',
      'localhost:5173',
      '192.168.56.1:5173',
      '10.160.87.239:5173'
    ];
    
    // Also check for HTTP versions
    const httpOrigins = [
      'http://rootsmaghreb.com',
      'http://frontend.rootsmaghreb.com',
      'http://admin.rootsmaghreb.com',
      'http://server.rootsmaghreb.com',
      'http://backend.rootsmaghreb.com'
    ];

    console.log('   Checking required origins...');
    let missingOrigins = [];
    [...requiredOrigins, ...httpOrigins].forEach(origin => {
      if (serverContent.includes(origin)) {
        console.log(`     ${SUCCESS} ${origin}`);
      } else {
        console.log(`     ${WARN} ${origin} - not found`);
        missingOrigins.push(origin);
        hasWarnings = true;
      }
    });

    // Check for credentials
    if (serverContent.includes('credentials: true')) {
      console.log(`   ${SUCCESS} Credentials are enabled`);
    } else {
      console.log(`   ${WARN} Credentials might not be enabled`);
      hasWarnings = true;
    }

    // Check for methods
    const requiredMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
    let missingMethods = [];
    requiredMethods.forEach(method => {
      if (serverContent.includes(`"${method}"`) || serverContent.includes(`'${method}'`)) {
        // Method found
      } else {
        missingMethods.push(method);
      }
    });

    if (missingMethods.length === 0) {
      console.log(`   ${SUCCESS} All required HTTP methods are allowed`);
    } else {
      console.log(`   ${WARN} Missing methods: ${missingMethods.join(', ')}`);
      hasWarnings = true;
    }
  }
  console.log('');

  // Summary
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  SUMMARY${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  
  if (hasErrors) {
    console.log(`${BOLD}${RED}❌ CORS configuration has ERRORS${RESET}`);
    console.log(`${YELLOW}   Please fix the errors above before running the server${RESET}`);
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`${BOLD}${YELLOW}⚠️  CORS configuration has WARNINGS${RESET}`);
    console.log(`${YELLOW}   Some recommended origins or settings might be missing${RESET}`);
    console.log(`${GREEN}   Server should still work, but review warnings above${RESET}`);
    process.exit(0);
  } else {
    console.log(`${BOLD}${GREEN}✅ CORS is properly configured!${RESET}`);
    console.log(`${GREEN}   All required origins and settings are in place${RESET}`);
    process.exit(0);
  }
}

if (require.main === module) {
  checkCORS();
}

module.exports = { checkCORS };
