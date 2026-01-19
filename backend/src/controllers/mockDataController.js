/**
 * Mock Data Controller
 * Allows injecting mock data from admin panel settings
 */

const { prisma } = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { logActivity } = require('../services/activityService');
const { getDatabaseErrorResponse } = require('../utils/prismaErrors');

async function generateMockDataInternal(count = 10, entity = 'all') {
  const results = { books: 0, trees: 0, gallery: 0 };

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
  }

  // Generate Books
  if (entity === 'all' || entity === 'books') {
    for (let i = 0; i < count; i++) {
      try {
        await prisma.book.create({
          data: {
            title: `Mock Book ${Date.now()}-${i}`,
            author: `Author ${i + 1}`,
            description: `Description for mock book ${i + 1}`,
            category: `Category ${(i % 3) + 1}`,
            archiveSource: `Archive Source ${i + 1}`,
            documentCode: `DOC-${String(i + 1).padStart(3, '0')}`,
            filePath: `/uploads/books/mock-${Date.now()}-${i}.pdf`,
            coverPath: `/uploads/books/cover-${Date.now()}-${i}.jpg`,
            isPublic: i % 2 === 0,
            uploadedBy: testUser.id,
            fileSize: BigInt(1024 * 1024 * (i + 1)),
            downloadCount: Math.floor(Math.random() * 100)
          }
        });
        results.books++;
      } catch (err) {
        console.error(`Failed to create book ${i + 1}:`, err.message);
      }
    }
  }

  // Generate Trees
  if (entity === 'all' || entity === 'trees') {
    for (let i = 0; i < count; i++) {
      try {
        await prisma.familyTree.create({
          data: {
            title: `Mock Tree ${Date.now()}-${i}`,
            description: `Description for mock tree ${i + 1}`,
            archiveSource: `Archive Source ${i + 1}`,
            documentCode: `TREE-${String(i + 1).padStart(3, '0')}`,
            gedcomPath: `/uploads/trees/tree-${Date.now()}-${i}.ged`,
            isPublic: i % 2 === 0,
            userId: testUser.id
          }
        });
        results.trees++;
      } catch (err) {
        console.error(`Failed to create tree ${i + 1}:`, err.message);
      }
    }
  }

  // Generate Gallery Items
  if (entity === 'all' || entity === 'gallery') {
    for (let i = 0; i < count; i++) {
      try {
        await prisma.gallery.create({
          data: {
            title: `Mock Image ${Date.now()}-${i}`,
            description: `Description for mock image ${i + 1}`,
            archiveSource: `Archive Source ${i + 1}`,
            documentCode: `IMG-${String(i + 1).padStart(3, '0')}`,
            imagePath: `/uploads/gallery/image-${Date.now()}-${i}.jpg`,
            location: `Location ${i + 1}`,
            year: String(2020 + (i % 5)),
            photographer: `Photographer ${i + 1}`,
            isPublic: i % 2 === 0,
            uploadedBy: testUser.id
          }
        });
        results.gallery++;
      } catch (err) {
        console.error(`Failed to create gallery item ${i + 1}:`, err.message);
      }
    }
  }

  return results;
}

const injectMockData = async (req, res) => {
  try {
    const { count = 10, entity = 'all' } = req.body || {};
    
    if (!['books', 'trees', 'gallery', 'all'].includes(entity)) {
      return res.status(400).json({ message: 'Invalid entity. Use: books, trees, gallery, or all' });
    }

    const numCount = parseInt(count) || 10;
    if (numCount < 1 || numCount > 100) {
      return res.status(400).json({ message: 'Count must be between 1 and 100' });
    }

    // Generate mock data
    const results = await generateMockDataInternal(numCount, entity);

    if (req.user?.id) {
      await logActivity(req.user.id, 'settings', `Injected mock ${entity} data (${numCount} items)`);
    }

    res.json({ 
      message: `Mock data injected successfully`,
      count: numCount,
      entity,
      results
    });
  } catch (err) {
    console.error('Inject mock data failed:', err.code || '', err.message);
    const dbError = getDatabaseErrorResponse(err);
    if (dbError) {
      return res.status(dbError.status).json({ message: dbError.message });
    }
    res.status(500).json({ message: 'Failed to inject mock data' });
  }
};

module.exports = { injectMockData };
