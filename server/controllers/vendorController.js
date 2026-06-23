const Vendor = require("../models/Vendor");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");
const { clearCachePrefix } = require("../utils/redis");

// Get Vendor Object helper
const getVendorObj = async (userId) => {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");
  return vendor;
};

// @desc    Register / Setup Vendor Profile
// @route   POST /api/vendor/register
exports.registerVendor = async (req, res, next) => {
  try {
    const existing = await Vendor.findOne({ userId: req.user._id });
    if (existing) {
      return next(new ApiError(400, "Vendor profile already exists"));
    }

    const { shopName, shopDescription, gstNumber, fssaiNumber, panNumber, bankDetails } = req.body;
    
    let shopLogo = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "vendors");
      shopLogo = result.secure_url;
    }

    const vendor = await Vendor.create({
      userId: req.user._id,
      shopName,
      shopDescription,
      shopLogo,
      gstNumber,
      fssaiNumber,
      panNumber,
      bankDetails: bankDetails ? JSON.parse(bankDetails) : {},
    });

    // Update user role
    await User.findByIdAndUpdate(req.user._id, { role: "vendor" });

    res.status(201).json({ success: true, vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Vendor Dashboard Stats
// @route   GET /api/vendor/dashboard
exports.getVendorDashboard = async (req, res, next) => {
  try {
    const vendor = await getVendorObj(req.user._id);

    const totalProducts = await Product.countDocuments({ vendorId: vendor._id });
    
    // Aggregate order stats for this vendor
    const orders = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.vendorId": vendor._id } }
    ]);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.items.status === "pending").length;

    res.status(200).json({
      success: true,
      stats: {
        totalEarnings: vendor.totalEarnings,
        totalProducts,
        totalOrders,
        pendingOrders,
        rating: vendor.rating,
        commissionRate: vendor.commissionRate,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new product
// @route   POST /api/vendor/products
exports.addProduct = async (req, res, next) => {
  try {
    const vendor = await getVendorObj(req.user._id);
    
    if (!vendor.isApproved) {
      return next(new ApiError(403, "Your vendor account is pending approval"));
    }

    const images = [];
    let thumbnail = "";

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await uploadToCloudinary(req.files[i].buffer, "products");
        images.push(result.secure_url);
        if (i === 0) thumbnail = result.secure_url; // First image as thumbnail
      }
    }

    const productData = {
      ...req.body,
      vendorId: vendor._id,
      images,
      thumbnail,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      variants: req.body.variants ? JSON.parse(req.body.variants) : [],
    };

    const product = await Product.create(productData);

    await clearCachePrefix("products:");

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/vendor/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const vendor = await getVendorObj(req.user._id);
    const product = await Product.findOne({ _id: req.params.id, vendorId: vendor._id });

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    // Optional: handle image replacing
    if (req.files && req.files.length > 0) {
      const images = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "products");
        images.push(result.secure_url);
      }
      req.body.images = [...product.images, ...images];
      req.body.thumbnail = req.body.images[0];
    }

    if (req.body.tags && typeof req.body.tags === 'string') req.body.tags = JSON.parse(req.body.tags);
    if (req.body.variants && typeof req.body.variants === 'string') req.body.variants = JSON.parse(req.body.variants);

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await clearCachePrefix("products:");

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/vendor/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const vendor = await getVendorObj(req.user._id);
    const product = await Product.findOneAndDelete({ _id: req.params.id, vendorId: vendor._id });

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    await clearCachePrefix("products:");

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    List own products
// @route   GET /api/vendor/products
exports.getVendorProducts = async (req, res, next) => {
  try {
    const vendor = await getVendorObj(req.user._id);
    const products = await Product.find({ vendorId: vendor._id }).sort("-createdAt");

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    List vendor orders
// @route   GET /api/vendor/orders
exports.getVendorOrders = async (req, res, next) => {
  try {
    const vendor = await getVendorObj(req.user._id);

    // Only fetch orders that contain items from this vendor
    const orders = await Order.find({ "items.vendorId": vendor._id })
      .populate("customerId", "name email phone")
      .sort("-createdAt");

    // Filter items array to only show the vendor's items in the response
    const filteredOrders = orders.map(order => {
      const vendorItems = order.items.filter(item => item.vendorId.toString() === vendor._id.toString());
      return {
        ...order._doc,
        items: vendorItems
      };
    });

    res.status(200).json({ success: true, count: filteredOrders.length, orders: filteredOrders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order item status
// @route   PUT /api/vendor/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const vendor = await getVendorObj(req.user._id);
    const { status, itemId } = req.body; // Needs the specific item ID since order has multiple items

    const order = await Order.findOne({ _id: req.params.id, "items.vendorId": vendor._id });
    if (!order) return next(new ApiError(404, "Order not found"));

    const itemIndex = order.items.findIndex(
      (i) => i._id.toString() === itemId && i.vendorId.toString() === vendor._id.toString()
    );

    if (itemIndex === -1) return next(new ApiError(404, "Item not found in this order for your vendor account"));

    order.items[itemIndex].status = status;
    order.timeline.push({ status: `Item ${order.items[itemIndex].name} updated to ${status}`, message: "Updated by vendor" });

    // Logic to update master order status if all items are delivered
    const allDelivered = order.items.every(i => i.status === "delivered");
    if (allDelivered) order.orderStatus = "delivered";

    await order.save();

    res.status(200).json({ success: true, message: "Order status updated", order });
  } catch (error) {
    next(error);
  }
};
