const path = require('path');
const fs = require('fs');

// Verify dist/main.js exists
const distMain = path.join(__dirname, 'dist', 'main.js');

if (fs.existsSync(distMain)) {
  // Production mode: run compiled code
  require(distMain);
} else {
  // Fallback or Dev mode
  // If we are in passenger, we might need to rely on pre-built code.
  // But if this is a raw start, we might try ts-node but ideally we stick to dist
  console.error("DIST folder not found! Please run 'npm run build' first.");
  process.exit(1);
}
