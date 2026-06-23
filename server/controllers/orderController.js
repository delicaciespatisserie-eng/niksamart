const Razorpay = require("razorpay");
const crypto = require("crypto");
const puppeteer = require("puppeteer");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");
const { uploadToCloudinary } = require("../utils/cloudinary");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper: Generate Invoice PDF
const generateInvoiceAndUpload = async (order, invoiceNumber, customer, vendor) => {
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
        <h1 style="color: #000080;">Invoice: ${invoiceNumber}</h1>
        <p><strong>Niksa Mart</strong></p>
        <hr/>
        <p><strong>Order No:</strong> ${order.orderNumber}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <br/>
        <h3>Bill To:</h3>
        <p>${customer.name}<br/>${customer.email}</p>
        <h3>Sold By:</h3>
        <p>${vendor.shopName}</p>
        <br/>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #ddd;">Item</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Qty</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Price</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Total</th>
          </tr>
          ${order.items.map(item => `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.qty}</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Rs ${item.price}</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Rs ${item.subtotal}</td>
            </tr>
          `).join('')}
        </table>
        <h3 style="text-align: right; margin-top: 20px;">Total Amount: Rs ${order.totalAmount}</h3>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();

  const result = await uploadToCloudinary(pdfBuffer, "invoices");
  return result.secure_url;
};

// @desc    Create new order & Razorpay intent
// @route   POST /api/orders/create
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    const cart = await Cart.findOne({ customerId: req.user._id }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return next(new ApiError(400, "Your cart is empty"));
    }

    let subtotal = 0;
    const orderItems = [];

    // Validate stock and calculate prices
    for (const item of cart.items) {
      if (item.productId.stock < item.qty) {
        return next(new ApiError(400, `Insufficient stock for ${item.productId.name}`));
      }
      const itemSubtotal = item.price * item.qty;
      subtotal += itemSubtotal;
      
      orderItems.push({
        productId: item.productId._id,
        vendorId: item.vendorId,
        name: item.productId.name,
        image: item.productId.thumbnail,
        price: item.price,
        qty: item.qty,
        subtotal: itemSubtotal,
        status: "pending",
      });
    }

    const deliveryCharge = subtotal > 499 ? 0 : 49;
    const tax = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + deliveryCharge + tax;

    // Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // Save pending order to DB
    const order = await Order.create({
      customerId: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      razorpayOrderId: razorpayOrder.id,
      orderStatus: "pending",
      subtotal,
      deliveryCharge,
      tax,
      totalAmount,
      notes,
      timeline: [{ status: "Order Placed", message: "Awaiting payment verification" }],
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature and complete order
// @route   POST /api/orders/verify-payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return next(new ApiError(400, "Invalid payment signature"));
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id }).populate("customerId");
    if (!order) return next(new ApiError(404, "Order not found"));

    order.paymentStatus = "completed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.orderStatus = "confirmed";
    order.timeline.push({ status: "Payment Confirmed", message: "Payment successful" });

    // Reduce Stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty }
      });
    }

    await order.save();

    // Clear Cart
    await Cart.findOneAndUpdate({ customerId: order.customerId._id }, { items: [] });

    // Determine unique vendors involved
    const vendorIds = [...new Set(order.items.map(item => item.vendorId.toString()))];

    for (const vId of vendorIds) {
      const vendorItems = order.items.filter(item => item.vendorId.toString() === vId);
      const vendor = await Vendor.findById(vId).populate("userId");
      
      const invoiceNumber = `INV-${order.orderNumber.split('-')[1]}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Generate Invoice
      const pdfUrl = await generateInvoiceAndUpload(order, invoiceNumber, order.customerId, vendor);

      await Invoice.create({
        orderId: order._id,
        invoiceNumber,
        customerId: order.customerId._id,
        vendorId: vId,
        items: vendorItems,
        amounts: {
          subtotal: order.subtotal,
          tax: order.tax,
          deliveryCharge: order.deliveryCharge,
          totalAmount: order.totalAmount,
        },
        invoicePDF: pdfUrl,
      });

      // Email Vendor
      await sendEmail({
        email: vendor.userId.email,
        subject: "New Order Received - Niksa Mart",
        htmlContent: `<p>You have received a new order (${order.orderNumber}). Check your vendor dashboard.</p>`,
      });
    }

    // Email Customer
    await sendEmail({
      email: order.customerId.email,
      subject: "Order Confirmed - Niksa Mart",
      htmlContent: `<p>Your order <strong>${order.orderNumber}</strong> has been confirmed successfully!</p>`,
    });

    res.status(200).json({ success: true, message: "Payment verified and order confirmed", order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user._id }).sort("-createdAt");
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order detail
// @route   GET /api/orders/:orderNumber
exports.getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return next(new ApiError(404, "Order not found"));
    
    if (order.customerId.toString() !== req.user._id.toString() && !['admin', 'vendor'].includes(req.user.role)) {
      return next(new ApiError(403, "Not authorized"));
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (if pending)
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ApiError(404, "Order not found"));

    if (order.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ApiError(403, "Not authorized"));
    }

    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      return next(new ApiError(400, "You cannot cancel this order anymore"));
    }

    if (order.orderStatus === "confirmed") {
      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } });
      }
      order.paymentStatus = "refunded";
    }

    order.orderStatus = "cancelled";
    order.timeline.push({ status: "Cancelled", message: "Order cancelled by customer" });
    await order.save();

    res.status(200).json({ success: true, message: "Order cancelled", order });
  } catch (error) {
    next(error);
  }
};

// DELIVERY APIs

// @desc    Confirm order (Vendor/Admin)
// @route   PUT /api/orders/:id/confirm
exports.confirmDeliveryOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ApiError(404, "Order not found"));
    
    order.orderStatus = "processing";
    order.timeline.push({ status: "Processing", message: "Order is being packed" });
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispatch order (Vendor/Admin)
// @route   PUT /api/orders/:id/dispatch
exports.dispatchOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("customerId");
    if (!order) return next(new ApiError(404, "Order not found"));

    // Generate delivery OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    order.deliveryOTP = otp;
    order.orderStatus = "shipped";
    order.timeline.push({ status: "Shipped", message: "Order dispatched. Out for delivery soon." });
    
    await order.save();

    await sendEmail({
      email: order.customerId.email,
      subject: "Order Dispatched - Niksa Mart",
      htmlContent: `<p>Your order is on the way! Please share this OTP with the delivery agent: <strong>${otp}</strong></p>`,
    });

    res.status(200).json({ success: true, message: "Order dispatched. OTP sent to customer.", order });
  } catch (error) {
    next(error);
  }
};

// @desc    Deliver order (Vendor/Admin)
// @route   PUT /api/orders/:id/deliver
exports.deliverOrder = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ApiError(404, "Order not found"));

    if (order.deliveryOTP !== otp) {
      return next(new ApiError(400, "Invalid Delivery OTP"));
    }

    order.orderStatus = "delivered";
    order.timeline.push({ status: "Delivered", message: "Order successfully delivered to customer." });
    await order.save();

    res.status(200).json({ success: true, message: "Order marked as delivered", order });
  } catch (error) {
    next(error);
  }
};
