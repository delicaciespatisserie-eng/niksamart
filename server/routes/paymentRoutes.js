const express = require('express');
const router = express.Router();
const { razorpayWebhook } = require("../controllers/paymentController");

// Public webhook route that Razorpay hits (must use raw body for sig verification)
router.post("/webhook", express.raw({ type: '*/*' }), razorpayWebhook);

module.exports = router;
