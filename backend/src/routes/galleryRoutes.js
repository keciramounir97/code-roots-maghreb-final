const express = require("express");
const {
  imageUpload,
  listPublicGallery,
  getPublicGalleryItem,
  listMyGallery,
  getMyGalleryItem,
  createMyGalleryItem,
  updateMyGalleryItem,
  saveMyGalleryItem,
  deleteMyGalleryItem,
  listAdminGallery,
  getAdminGalleryItem,
  createAdminGalleryItem,
  updateAdminGalleryItem,
  saveAdminGalleryItem,
  deleteAdminGalleryItem,
} = require("../controllers/galleryController");
const {
  authMiddleware,
  requirePermission,
  requireAnyPermission,
} = require("../middlewares/auth");
const { uploadErrorHandler } = require("../middlewares/uploadErrorHandler");

const router = express.Router();

// Health check endpoint
router.get("/gallery/health", (_req, res) => {
  res.json({
    status: "ok",
    route: "gallery",
    time: new Date().toISOString(),
  });
});

// Public routes
router.get("/gallery", listPublicGallery);
router.get("/gallery/:id", getPublicGalleryItem);

// User routes
router.get("/my/gallery", authMiddleware, listMyGallery);
router.get("/my/gallery/:id", authMiddleware, getMyGalleryItem);
router.post(
  "/my/gallery",
  authMiddleware,
  imageUpload.single("image"),
  uploadErrorHandler,
  createMyGalleryItem
);
router.put(
  "/my/gallery/:id",
  authMiddleware,
  imageUpload.single("image"),
  uploadErrorHandler,
  updateMyGalleryItem
);
router.post(
  "/my/gallery/:id/save",
  authMiddleware,
  imageUpload.single("image"),
  uploadErrorHandler,
  saveMyGalleryItem
);
router.delete("/my/gallery/:id", authMiddleware, deleteMyGalleryItem);

// Admin routes
router.get(
  "/admin/gallery",
  authMiddleware,
  requirePermission("manage_books"),
  listAdminGallery
);
router.get(
  "/admin/gallery/:id",
  authMiddleware,
  requirePermission("manage_books"),
  getAdminGalleryItem
);
router.post(
  "/admin/gallery",
  authMiddleware,
  requireAnyPermission(["manage_books", "upload_books"]),
  imageUpload.single("image"),
  uploadErrorHandler,
  createAdminGalleryItem
);
router.put(
  "/admin/gallery/:id",
  authMiddleware,
  requirePermission("manage_books"),
  imageUpload.single("image"),
  uploadErrorHandler,
  updateAdminGalleryItem
);
router.post(
  "/admin/gallery/:id/save",
  authMiddleware,
  requirePermission("manage_books"),
  imageUpload.single("image"),
  uploadErrorHandler,
  saveAdminGalleryItem
);
router.delete(
  "/admin/gallery/:id",
  authMiddleware,
  requirePermission("manage_books"),
  deleteAdminGalleryItem
);

module.exports = router;
