const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

// @desc    Get user wishlist
// @route   GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ customerId: req.user._id }).populate({
      path: "products",
      select: "name slug price images rating isFeatured isActive",
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ customerId: req.user._id, products: [] });
    }

    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/toggle/:productId
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return next(new ApiError(404, "Product not found"));

    let wishlist = await Wishlist.findOne({ customerId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ customerId: req.user._id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);
    let message = "";

    if (index === -1) {
      wishlist.products.push(productId);
      message = "Product added to wishlist";
    } else {
      wishlist.products.splice(index, 1);
      message = "Product removed from wishlist";
    }

    await wishlist.save();

    res.status(200).json({ success: true, message, products: wishlist.products });
  } catch (error) {
    next(error);
  }
};
