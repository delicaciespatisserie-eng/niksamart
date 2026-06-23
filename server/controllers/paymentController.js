const crypto = require("crypto");
const Order = require("../models/Order");

exports.razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const rawBody = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);
    const expectedSig = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

    if (expectedSig !== req.headers["x-razorpay-signature"]) {
      return res.status(400).json({ status: "invalid signature" });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = body.event;

    if (event === "payment.failed") {
      const paymentData = body.payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: paymentData.order_id });
      if (order) {
        order.paymentStatus = "failed";
        order.timeline.push({ status: "Payment Failed", message: paymentData.error_description || "Payment gateway reported a failure." });
        await order.save();
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};
