# 🧪 Testing Guide

## Overview

This project includes comprehensive testing and auditing tools to verify:
- ✅ All CRUD operations work correctly
- ✅ All API routes are functional
- ✅ All controllers are properly implemented
- ✅ Code is safe for cPanel Passenger + Apache + Node.js
- ✅ Optional fields (archiveSource, documentCode) work correctly

---

## 📋 Available Tests

### 1. Passenger Safety Test
Verifies code is safe for cPanel Passenger setup:
```bash
npm run test:passenger
```

**Checks:**
- ✅ Passenger mode detection
- ✅ Prisma lazy loading
- ✅ No blocking operations at startup
- ✅ Error handling
- ✅ Module exports
- ✅ Health check endpoint
- ✅ No database connections at startup

### 2. Routes Test
Tests all API routes:
```bash
npm run test:routes
```

**Tests:**
- ✅ All public routes
- ✅ All health endpoints
- ✅ Auth routes
- ✅ Response status codes

### 3. Controllers Test
Audits all controllers:
```bash
npm run test:controllers
```

**Checks:**
- ✅ Controller files exist
- ✅ Module exports
- ✅ Error handling
- ✅ Database error handling
- ✅ Health endpoints

### 4. Books CRUD Test
Tests all CRUD operations for books:
```bash
npm run test:crud-books
```

**Tests:**
- ✅ CREATE - Create new book
- ✅ READ - Get book, list books
- ✅ UPDATE - Update book with optional fields
- ✅ DELETE - Delete book
- ✅ Optional fields (archiveSource, documentCode)

### 5. Gallery CRUD Test
Tests all CRUD operations for gallery (images):
```bash
npm run test:crud-gallery
```

**Tests:**
- ✅ CREATE - Create new gallery item
- ✅ READ - Get gallery item, list gallery
- ✅ UPDATE - Update gallery item with optional fields
- ✅ DELETE - Delete gallery item
- ✅ Optional fields (archiveSource, documentCode)

### 6. Trees CRUD Test
Tests all CRUD operations for trees:
```bash
npm run test:crud-trees
```

**Tests:**
- ✅ CREATE - Create new tree
- ✅ READ - Get tree, list trees
- ✅ UPDATE - Update tree with optional fields
- ✅ DELETE - Delete tree
- ✅ Optional fields (archiveSource, documentCode)

### 7. Smoke Tests
Quick tests to verify basic functionality:
```bash
npm run test:smoke
```

**Tests:**
- ✅ Server health
- ✅ Database connection
- ✅ API routes loaded
- ✅ Public endpoints

### 8. Comprehensive Audit
Runs all tests:
```bash
npm run test:all
# or
npm run audit:all
```

---

## 🎯 Test Output

All tests use color-coded indicators:
- ✅ **Green ✓** - Test passed
- ❌ **Red ✗** - Test failed
- ℹ️ **Blue ℹ** - Test skipped

Example output:
```
═══════════════════════════════════════════════════════
  BOOKS CRUD AUDIT TEST
═══════════════════════════════════════════════════════

Step 1: Authentication...
✓ Authentication successful

Step 2: CREATE Operation...
✓ Book created successfully (ID: 123)

Step 3: READ Operation...
✓ Book retrieved successfully (ID: 123)
✓ Optional fields (archiveSource, documentCode) are included

═══════════════════════════════════════════════════════
  TEST SUMMARY
═══════════════════════════════════════════════════════
Total: 10
Passed: 10
Failed: 0
Skipped: 0
Pass Rate: 100.0%
═══════════════════════════════════════════════════════
```

---

## 🔧 Mock Data

### Generate Mock Data

Generate mock data for testing:
```bash
npm run mock-data [count]
```

Example:
```bash
npm run mock-data 20  # Generate 20 items of each type
```

**Generates:**
- Books with optional fields
- Trees with optional fields
- Gallery items with optional fields
- Test user (test@example.com / test123)

### Inject Mock Data from Admin Panel

1. Go to Admin Panel → Settings
2. Use the "Inject Mock Data" feature
3. Select entity type (books, trees, gallery, or all)
4. Enter count (1-100)
5. Click "Inject"

**API Endpoint:**
```
POST /api/admin/settings/mock-data
{
  "entity": "all",  // books, trees, gallery, or all
  "count": 10
}
```

---

## 📝 Test Configuration

### Environment Variables

Set these in your `.env` file for tests:
```env
TEST_EMAIL=admin@example.com
TEST_PASSWORD=admin123
API_URL=http://localhost:5000
NODE_ENV=test
```

### Test Files Location

All test files are in `backend/tests/`:
```
tests/
├── utils/
│   └── testHelpers.js       # Common test utilities
├── passenger-safety.test.js # Passenger safety tests
├── routes.test.js            # Route tests
├── controllers.test.js       # Controller tests
├── crud-books.test.js        # Books CRUD tests
├── crud-gallery.test.js      # Gallery CRUD tests
├── crud-trees.test.js        # Trees CRUD tests
└── smoke.test.js             # Smoke tests
```

---

## 🚀 Running Tests

### Individual Tests
```bash
# Passenger safety
npm run test:passenger

# Routes
npm run test:routes

# Controllers
npm run test:controllers

# CRUD tests
npm run test:crud-books
npm run test:crud-gallery
npm run test:crud-trees

# Smoke tests
npm run test:smoke
```

### All Tests
```bash
npm run test:all
```

### Legacy Tests
```bash
# Original smoke tests
npm run smoke
npm run smoke:full

# Original audit
npm run audit
```

---

## ✅ Verification Checklist

Before deploying, run:
- [ ] `npm run test:passenger` - Verify Passenger safety
- [ ] `npm run test:routes` - Verify all routes work
- [ ] `npm run test:controllers` - Verify all controllers
- [ ] `npm run test:crud-books` - Verify books CRUD
- [ ] `npm run test:crud-gallery` - Verify gallery CRUD
- [ ] `npm run test:crud-trees` - Verify trees CRUD
- [ ] `npm run test:smoke` - Quick smoke test
- [ ] `npm run test:all` - Full audit

---

## 🐛 Troubleshooting

### Tests Fail with "Connection Refused"
- Make sure the server is running: `npm start`
- Check `API_URL` in `.env` matches your server URL

### Authentication Fails
- Set `TEST_EMAIL` and `TEST_PASSWORD` in `.env`
- Make sure the test user exists in the database
- Run `npm run mock-data` to create test user

### Database Errors
- Make sure database is running
- Check `DATABASE_URL` in `.env`
- Run `npx prisma generate` if needed

---

**Status:** ✅ **All tests are ready to use!**
