const router = require("express").Router();
const { createCategory, getAllCategories, getCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.get("/", getAllCategories);
router.get("/:slug", getCategory);
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
