const express = require("express");
const {
  treeUpload,
  listAdminTrees,
  getAdminTree,
  updateAdminTree,
  deleteAdminTree,
  listPublicTrees,
  getPublicTree,
  downloadPublicGedcom,
  listMyTrees,
  getMyTree,
  createMyTree,
  updateMyTree,
  saveMyTree,
  deleteMyTree,
  downloadMyGedcom,
} = require("../controllers/treeController");
const { authMiddleware, requirePermission, requireAnyPermission } = require("../middlewares/auth");
const { uploadErrorHandler } = require("../middlewares/uploadErrorHandler");

const router = express.Router();

// Health check endpoint
router.get("/trees/health", (_req, res) => {
  res.json({
    status: "ok",
    route: "trees",
    time: new Date().toISOString(),
  });
});

router.get(
  "/admin/trees",
  authMiddleware,
  requirePermission("manage_all_trees"),
  listAdminTrees
);
router.get(
  "/admin/trees/:id",
  authMiddleware,
  requirePermission("manage_all_trees"),
  getAdminTree
);
router.put(
  "/admin/trees/:id",
  authMiddleware,
  requirePermission("manage_all_trees"),
  treeUpload.single("file"),
  uploadErrorHandler,
  updateAdminTree
);
router.delete(
  "/admin/trees/:id",
  authMiddleware,
  requirePermission("manage_all_trees"),
  deleteAdminTree
);

router.get("/trees", listPublicTrees);
router.get("/trees/:id", getPublicTree);
router.get("/trees/:id/gedcom", downloadPublicGedcom);

router.get(
  "/my/trees",
  authMiddleware,
  requireAnyPermission(["manage_own_trees", "manage_all_trees"]),
  listMyTrees
);
router.get(
  "/my/trees/:id",
  authMiddleware,
  requireAnyPermission(["manage_own_trees", "manage_all_trees"]),
  getMyTree
);
router.post(
  "/my/trees",
  authMiddleware,
  requireAnyPermission(["manage_own_trees", "manage_all_trees"]),
  treeUpload.single("file"),
  uploadErrorHandler,
  createMyTree
);
router.put(
  "/my/trees/:id",
  authMiddleware,
  requireAnyPermission(["manage_own_trees", "manage_all_trees"]),
  treeUpload.single("file"),
  uploadErrorHandler,
  updateMyTree
);
router.post(
  "/my/trees/:id/save",
  authMiddleware,
  requireAnyPermission(["manage_own_trees", "manage_all_trees"]),
  treeUpload.single("file"),
  uploadErrorHandler,
  saveMyTree
);
router.delete(
  "/my/trees/:id",
  authMiddleware,
  requireAnyPermission(["manage_own_trees", "manage_all_trees"]),
  deleteMyTree
);
router.get("/my/trees/:id/gedcom", authMiddleware, downloadMyGedcom);

module.exports = router;
