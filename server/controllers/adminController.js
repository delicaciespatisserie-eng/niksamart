const Vendor = require("../models/Vendor");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

// @desc    List all vendors
// @route   GET /api/admin/vendors
exports.getAllVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find()
      .populate("userId", "name email phone isVerified isActive")
      .sort("-createdAt");

    res.status(200).json({ success: true, count: vendors.length, vendors });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a vendor
// @route   PUT /api/admin/vendors/:id/approve
exports.approveVendor = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return next(new ApiError(404, "Vendor not found"));
    }

    res.status(200).json({ 
      success: true, 
      message: `Vendor successfully ${isApproved ? "approved" : "rejected"}`,
      vendor 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform orders
// @route   GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find()
      .populate("customerId", "name email phone")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const totalOrders = await Order.countDocuments();

    res.status(200).json({ 
      success: true, 
      totalOrders,
      totalPages: Math.ceil(totalOrders / Number(limit)),
      currentPage: Number(page),
      orders 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform stats (Dashboard)
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalVendors = await Vendor.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders: orderStats.length > 0 ? orderStats[0].totalOrders : 0,
        totalRevenue: orderStats.length > 0 ? orderStats[0].totalRevenue : 0,
      }
    });
  } catch (error) {
    next(error);
  }
};
