const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

// @desc    Get cart with populated products
// @route   GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customerId: req.user._id }).populate({
      path: "items.productId",
      select: "name slug price images stock isActive",
    });

    if (!cart) {
      cart = await Cart.create({ customerId: req.user._id, items: [] });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, qty } = req.body;

    const product = await Product.findById(productId);
    if (!product) return next(new ApiError(404, "Product not found"));
    if (!product.isActive) return next(new ApiError(400, "Product is no longer active"));
    if (product.stock < qty) return next(new ApiError(400, "Not enough stock"));

    let cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) {
      cart = new Cart({ customerId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // Update quantity if already in cart
      const newQty = cart.items[itemIndex].qty + qty;
      if (product.stock < newQty) return next(new ApiError(400, "Not enough stock for requested quantity"));
      cart.items[itemIndex].qty = newQty;
      cart.items[itemIndex].price = product.price; // Update to latest price
    } else {
      // Add new item
      cart.items.push({
        productId,
        vendorId: product.vendorId,
        qty,
        price: product.price,
      });
    }

    await cart.save();
    
    // Return populated cart
    cart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "name slug price images stock",
    });

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity
// @route   PUT /api/cart/update
exports.updateCart = async (req, res, next) => {
  try {
    const { productId, qty } = req.body;
    if (qty < 1) return next(new ApiError(400, "Quantity must be at least 1"));

    const product = await Product.findById(productId);
    if (!product) return next(new ApiError(404, "Product not found"));
    if (product.stock < qty) return next(new ApiError(400, "Not enough stock"));

    const cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) return next(new ApiError(404, "Cart not found"));

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex === -1) return next(new ApiError(404, "Item not in cart"));

    cart.items[itemIndex].qty = qty;
    cart.items[itemIndex].price = product.price;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "name slug price images stock",
    });

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) return next(new ApiError(404, "Cart not found"));

    cart.items = cart.items.filter((item) => item.productId.toString() !== req.params.productId);
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "name slug price images stock",
    });

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    res.status(200).json({ success: true, message: "Cart cleared", cart });
  } catch (error) {
    next(error);
  }
};
