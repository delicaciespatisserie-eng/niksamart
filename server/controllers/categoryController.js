const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");

exports.createCategory = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const r = await uploadToCloudinary(req.file.buffer, "categories");
      data.image = { public_id: r.public_id, url: r.secure_url };
    }
    const category = await Category.create(data);
    res.status(201).json({ success: true, category });
  } catch (error) { next(error); }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort("order");
    res.status(200).json({ success: true, categories, data: categories });
  } catch (error) { next(error); }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return next(new ApiError(404, "Category not found"));
    const subcategories = await Category.find({ parent: category._id, isActive: true });
    res.status(200).json({ success: true, category, subcategories });
  } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ApiError(404, "Category not found"));
    if (req.file) {
      if (category.image.public_id) await deleteFromCloudinary(category.image.public_id);
      const r = await uploadToCloudinary(req.file.buffer, "categories");
      req.body.image = { public_id: r.public_id, url: r.secure_url };
    }
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, category: updated });
  } catch (error) { next(error); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ApiError(404, "Category not found"));
    if (category.image.public_id) await deleteFromCloudinary(category.image.public_id);
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) { next(error); }
};
