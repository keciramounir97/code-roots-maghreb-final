#!/usr/bin/env node
/**
 * Passenger Safety Test
 * Verifies that the code is safe for cPanel Passenger + Apache + Node.js setup
 */

const { TestResults, SUCCESS, FAIL, BOLD, BLUE, RESET } = require('./utils/testHelpers');
const fs = require('fs');
const path = require('path');

const results = new TestResults();

async function testPassengerSafety() {
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  PASSENGER SAFETY TEST${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log('');

  // Test 1: Server.js doesn't call app.listen() in Passenger mode
  console.log(`${BOLD}1. Checking server.js for Passenger compatibility...${RESET}`);
  try {
    const serverContent = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    const hasPassengerCheck = serverContent.includes('PASSENGER_APP_ENV') || 
                               serverContent.includes('PASSENGER_ENABLED');
    const hasConditionalListen = serverContent.includes('isPassengerMode') ||
                                 serverContent.includes('!isPassengerMode');
    
    if (hasPassengerCheck && hasConditionalListen) {
      results.pass('Server.js has Passenger mode detection');
    } else {
      results.fail('Server.js missing Passenger mode detection');
    }
  } catch (err) {
    results.fail('Could not read server.js', err);
  }

  // Test 2: Prisma lazy loading
  console.log(`${BOLD}2. Checking Prisma lazy loading...${RESET}`);
  try {
    const prismaPath = path.join(__dirname, '../src/lib/prisma.js');
    if (fs.existsSync(prismaPath)) {
      const prismaContent = fs.readFileSync(prismaPath, 'utf8');
      const hasLazyLoading = prismaContent.includes('getPrisma') ||
                            prismaContent.includes('lazy') ||
                            prismaContent.includes('Proxy');
      
      if (hasLazyLoading) {
        results.pass('Prisma uses lazy loading');
      } else {
        results.fail('Prisma does not use lazy loading');
      }
    } else {
      results.skip('Prisma file not found');
    }
  } catch (err) {
    results.fail('Could not check Prisma lazy loading', err);
  }

  // Test 3: No blocking operations at module load
  console.log(`${BOLD}3. Checking for blocking operations at module load...${RESET}`);
  try {
    const serverContent = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    const hasLazyRouteLoading = serverContent.includes('apiLoaded') ||
                               serverContent.includes('lazy-load');
    
    if (hasLazyRouteLoading) {
      results.pass('Routes are loaded lazily');
    } else {
      results.fail('Routes may be loaded at module load time');
    }
  } catch (err) {
    results.fail('Could not check route loading', err);
  }

  // Test 4: Error handling
  console.log(`${BOLD}4. Checking error handling...${RESET}`);
  try {
    const serverContent = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    const hasErrorHandlers = serverContent.includes('uncaughtException') ||
                            serverContent.includes('unhandledRejection') ||
                            serverContent.includes('app.use((err'));
    
    if (hasErrorHandlers) {
      results.pass('Error handlers are present');
    } else {
      results.fail('Missing error handlers');
    }
  } catch (err) {
    results.fail('Could not check error handling', err);
  }

  // Test 5: No process.exit() in normal flow
  console.log(`${BOLD}5. Checking for process.exit() in normal flow...${RESET}`);
  try {
    const serverContent = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    const exitMatches = serverContent.match(/process\.exit\(/g);
    const hasExitInNormalFlow = exitMatches && exitMatches.length > 2; // Only in error cases
    
    if (!hasExitInNormalFlow) {
      results.pass('No process.exit() in normal flow');
    } else {
      results.fail('process.exit() found in normal flow (should only be in error handlers)');
    }
  } catch (err) {
    results.fail('Could not check process.exit()', err);
  }

  // Test 6: Module exports app
  console.log(`${BOLD}6. Checking module exports...${RESET}`);
  try {
    const serverContent = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    const hasModuleExport = serverContent.includes('module.exports = app') ||
                           serverContent.includes('module.exports=app');
    
    if (hasModuleExport) {
      results.pass('Server exports app for Passenger');
    } else {
      results.fail('Server does not export app');
    }
  } catch (err) {
    results.fail('Could not check module exports', err);
  }

  // Test 7: Health check endpoint exists
  console.log(`${BOLD}7. Checking health check endpoint...${RESET}`);
  try {
    const serverContent = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    const hasHealthCheck = serverContent.includes('app.get(\'/\'') ||
                        serverContent.includes('app.get("/"');
    
    if (hasHealthCheck) {
      results.pass('Health check endpoint exists');
    } else {
      results.fail('Health check endpoint missing');
    }
  } catch (err) {
    results.fail('Could not check health check endpoint', err);
  }

  // Test 8: No database connections at startup
  console.log(`${BOLD}8. Checking for database connections at startup...${RESET}`);
  try {
    const serverContent = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    // Check that Prisma is not instantiated at module level
    const hasPrismaAtTop = serverContent.match(/const.*prisma.*=.*new.*PrismaClient/);
    
    if (!hasPrismaAtTop) {
      results.pass('No database connections at startup');
    } else {
      results.fail('Database connection found at startup');
    }
  } catch (err) {
    results.fail('Could not check database connections', err);
  }

  // Summary
  const summary = results.summary();
  
  if (summary.failed === 0) {
    console.log('');
    console.log(`${BOLD}${BLUE}✅ All Passenger safety checks passed!${RESET}`);
    process.exit(0);
  } else {
    console.log('');
    console.log(`${BOLD}⚠️  Some Passenger safety checks failed. Please review.${RESET}`);
    process.exit(1);
  }
}

if (require.main === module) {
  testPassengerSafety().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}

module.exports = { testPassengerSafety };
