const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const { getCache, setCache } = require("../utils/redis");

// @desc    Get all products with filters, sorting, search, and pagination
// @route   GET /api/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const cacheKey = `products:${req.originalUrl}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const { category, minPrice, maxPrice, rating, sort, page = 1, limit = 12, search } = req.query;

    const query = { isActive: true };

    // Filters
    if (category) query.category = category;
    if (rating) query.rating = { $gte: Number(rating) };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Full text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === "price") sortObj = { price: 1 };
    if (sort === "-price") sortObj = { price: -1 };
    if (sort === "rating") sortObj = { rating: -1 };
    if (sort === "new") sortObj = { createdAt: -1 };
    if (search) sortObj = { score: { $meta: "textScore" } };

    const skip = (Number(page) - 1) * Number(limit);

    // Fetch products
    const products = await Product.find(query, search ? { score: { $meta: "textScore" } } : {})
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .populate("vendorId", "shopName shopLogo");

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / Number(limit));

    const responseData = {
      success: true,
      totalProducts,
      totalPages,
      currentPage: Number(page),
      products,
    };

    // Cache for 5 mins
    await setCache(cacheKey, responseData, 300);

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
      "vendorId",
      "shopName shopLogo rating totalReviews"
    );

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const cacheKey = "products:featured";
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const products = await Product.find({ isFeatured: true, isActive: true })
      .limit(8)
      .populate("vendorId", "shopName");

    const responseData = { success: true, products };
    await setCache(cacheKey, responseData, 300);

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 12;
    const products = await Product.find({
      category: req.params.category,
      isActive: true,
    })
      .limit(limit)
      .populate("vendorId", "shopName");

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};
