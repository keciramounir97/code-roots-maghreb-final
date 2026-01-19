#!/usr/bin/env node
/**
 * Mock Data Generator
 * Generates mock data that can be injected from admin panel settings
 */

const { prisma } = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const SUCCESS = `${GREEN}✓${RESET}`;
const FAIL = `${RED}✗${RESET}`;

async function generateMockData(count = 10) {
  console.log('');
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  GENERATING MOCK DATA${RESET}`);
  console.log(`${BOLD}${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`Generating ${count} items for each entity...`);
  console.log('');

  try {
    // Get or create admin role
    let adminRole = await prisma.role.findUnique({ where: { id: 1 } });
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          id: 1,
          name: 'admin',
          permissions: JSON.stringify(['manage_users', 'manage_books', 'manage_all_trees', 'view_dashboard'])
        }
      });
      console.log(`${SUCCESS} Admin role created`);
    }

    // Get or create test user
    let testUser = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('test123', 10);
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          fullName: 'Test User',
          roleId: 1,
          status: 'active'
        }
      });
      console.log(`${SUCCESS} Test user created`);
    }

    // Generate Books
    console.log(`${BOLD}Generating Books...${RESET}`);
    for (let i = 0; i < count; i++) {
      try {
        await prisma.book.create({
          data: {
            title: `Mock Book ${i + 1}`,
            author: `Author ${i + 1}`,
            description: `Description for mock book ${i + 1}`,
            category: `Category ${(i % 3) + 1}`,
            archiveSource: `Archive Source ${i + 1}`,
            documentCode: `DOC-${String(i + 1).padStart(3, '0')}`,
            filePath: `/uploads/books/mock-${i + 1}.pdf`,
            coverPath: `/uploads/books/cover-${i + 1}.jpg`,
            isPublic: i % 2 === 0,
            uploadedBy: testUser.id,
            fileSize: BigInt(1024 * 1024 * (i + 1)),
            downloadCount: Math.floor(Math.random() * 100)
          }
        });
        if ((i + 1) % 5 === 0) {
          process.stdout.write(`${SUCCESS} Created ${i + 1} books...\r`);
        }
      } catch (err) {
        console.log(`${FAIL} Failed to create book ${i + 1}: ${err.message}`);
      }
    }
    console.log(`${SUCCESS} Created ${count} books`);

    // Generate Trees
    console.log(`${BOLD}Generating Trees...${RESET}`);
    for (let i = 0; i < count; i++) {
      try {
        await prisma.familyTree.create({
          data: {
            title: `Mock Tree ${i + 1}`,
            description: `Description for mock tree ${i + 1}`,
            archiveSource: `Archive Source ${i + 1}`,
            documentCode: `TREE-${String(i + 1).padStart(3, '0')}`,
            gedcomPath: `/uploads/trees/tree-${i + 1}.ged`,
            isPublic: i % 2 === 0,
            userId: testUser.id
          }
        });
        if ((i + 1) % 5 === 0) {
          process.stdout.write(`${SUCCESS} Created ${i + 1} trees...\r`);
        }
      } catch (err) {
        console.log(`${FAIL} Failed to create tree ${i + 1}: ${err.message}`);
      }
    }
    console.log(`${SUCCESS} Created ${count} trees`);

    // Generate Gallery Items
    console.log(`${BOLD}Generating Gallery Items...${RESET}`);
    for (let i = 0; i < count; i++) {
      try {
        await prisma.gallery.create({
          data: {
            title: `Mock Image ${i + 1}`,
            description: `Description for mock image ${i + 1}`,
            archiveSource: `Archive Source ${i + 1}`,
            documentCode: `IMG-${String(i + 1).padStart(3, '0')}`,
            imagePath: `/uploads/gallery/image-${i + 1}.jpg`,
            location: `Location ${i + 1}`,
            year: String(2020 + (i % 5)),
            photographer: `Photographer ${i + 1}`,
            isPublic: i % 2 === 0,
            uploadedBy: testUser.id
          }
        });
        if ((i + 1) % 5 === 0) {
          process.stdout.write(`${SUCCESS} Created ${i + 1} gallery items...\r`);
        }
      } catch (err) {
        console.log(`${FAIL} Failed to create gallery item ${i + 1}: ${err.message}`);
      }
    }
    console.log(`${SUCCESS} Created ${count} gallery items`);

    console.log('');
    console.log(`${BOLD}${GREEN}✅ Mock data generation complete!${RESET}`);
    console.log('');
    console.log(`Test user credentials:`);
    console.log(`  Email: test@example.com`);
    console.log(`  Password: test123`);
    console.log('');

  } catch (err) {
    console.error(`${FAIL} Error generating mock data:`, err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  const count = parseInt(process.argv[2]) || 10;
  generateMockData(count).catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
  });
}

module.exports = { generateMockData };
