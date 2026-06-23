const router = require("express").Router();
const { getProfile, updateProfile, addAddress, updateAddress, deleteAddress, toggleWishlist, getAllUsers, toggleBlockUser, updateUserRole } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../utils/multer");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.post("/address", protect, addAddress);
router.put("/address/:id", protect, updateAddress);
router.delete("/address/:id", protect, deleteAddress);
router.post("/wishlist/:productId", protect, toggleWishlist);
router.get("/admin/all", protect, authorize("admin"), getAllUsers);
router.put("/admin/:id/block", protect, authorize("admin"), toggleBlockUser);
router.put("/admin/:id/role", protect, authorize("admin"), updateUserRole);

module.exports = router;
