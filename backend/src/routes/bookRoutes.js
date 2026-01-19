const express = require("express");
const {
  bookUpload,
  listPublicBooks,
  getPublicBook,
  downloadPublicBook,
  listMyBooks,
  getMyBook,
  createMyBook,
  updateMyBook,
  saveMyBook,
  downloadMyBook,
  deleteMyBook,
  listAdminBooks,
  getAdminBook,
  createAdminBook,
  updateAdminBook,
  saveAdminBook,
  deleteAdminBook,
} = require("../controllers/bookController");
const { authMiddleware, requirePermission, requireAnyPermission } = require("../middlewares/auth");
const { uploadErrorHandler } = require("../middlewares/uploadErrorHandler");

const router = express.Router();

// Health check endpoint
router.get("/books/health", (_req, res) => {
  res.json({
    status: "ok",
    route: "books",
    time: new Date().toISOString(),
  });
});

router.get("/books", listPublicBooks);
router.get("/books/:id", getPublicBook);
router.get("/books/:id/download", downloadPublicBook);

router.get("/my/books", authMiddleware, listMyBooks);
router.get("/my/books/:id", authMiddleware, getMyBook);
router.post(
  "/my/books",
  authMiddleware,
  bookUpload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  uploadErrorHandler,
  createMyBook
);
router.put(
  "/my/books/:id",
  authMiddleware,
  bookUpload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  uploadErrorHandler,
  updateMyBook
);
router.post(
  "/my/books/:id/save",
  authMiddleware,
  bookUpload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  uploadErrorHandler,
  saveMyBook
);
router.get("/my/books/:id/download", authMiddleware, downloadMyBook);
router.delete("/my/books/:id", authMiddleware, deleteMyBook);

router.get(
  "/admin/books",
  authMiddleware,
  requirePermission("manage_books"),
  listAdminBooks
);
router.get(
  "/admin/books/:id",
  authMiddleware,
  requirePermission("manage_books"),
  getAdminBook
);
router.post(
  "/admin/books",
  authMiddleware,
  requireAnyPermission(["manage_books", "upload_books"]),
  bookUpload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  uploadErrorHandler,
  createAdminBook
);
router.put(
  "/admin/books/:id",
  authMiddleware,
  requirePermission("manage_books"),
  bookUpload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  uploadErrorHandler,
  updateAdminBook
);
router.post(
  "/admin/books/:id/save",
  authMiddleware,
  requirePermission("manage_books"),
  bookUpload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  uploadErrorHandler,
  saveAdminBook
);
router.delete(
  "/admin/books/:id",
  authMiddleware,
  requirePermission("manage_books"),
  deleteAdminBook
);

module.exports = router;
