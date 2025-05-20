const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  getAllUsers,
  updateUserProfile,
  deleteUser,
  creditReferrer,
} = require("../controls/AuthController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Authentication routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// User management routes (admin-only)
router.get("/users", protect, restrictTo("admin"), getAllUsers);
router.patch("/:userId", protect, restrictTo("admin"), updateUserProfile);
router.delete("/:userId", protect, restrictTo("admin"), deleteUser);
router.post("/credit-referrer", protect, restrictTo("admin"), creditReferrer);

module.exports = router;
