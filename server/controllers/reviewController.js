const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

// @desc    Add review
// @route   POST /api/reviews/:productId
exports.addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, images } = req.body;

    const product = await Product.findById(productId);
    if (!product) return next(new ApiError(404, "Product not found"));

    // Check if user has already reviewed
    const existingReview = await Review.findOne({ customerId: req.user._id, productId });
    if (existingReview) return next(new ApiError(400, "You have already reviewed this product"));

    // Check if user purchased the product
    const order = await Order.findOne({
      customerId: req.user._id,
      "items.productId": productId,
      orderStatus: "delivered"
    });

    if (!order) {
      return next(new ApiError(403, "You can only review products you have purchased and received."));
    }

    const review = await Review.create({
      productId,
      orderId: order._id,
      customerId: req.user._id,
      vendorId: product.vendorId,
      rating,
      title,
      comment,
      images: images || [],
      isVerified: true,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product reviews
// @route   GET /api/reviews/:productId
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate("customerId", "name avatar")
      .sort("-createdAt");

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!review) return next(new ApiError(404, "Review not found"));

    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};
