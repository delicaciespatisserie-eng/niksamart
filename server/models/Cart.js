const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({ customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true }, items: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, qty: { type: Number, default: 1 }, price: Number, addedAt: { type: Date, default: Date.now } }] }, { timestamps: true });
module.exports = mongoose.model('Cart', cartSchema);
