const mongoose = require('mongoose');
const random4 = () => Math.floor(1000 + Math.random() * 9000);
const invoiceSchema = new mongoose.Schema({ orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', unique: true, required: true }, invoiceNumber: { type: String, unique: true }, customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, items: [Object], amounts: { subtotal: Number, tax: Number, total: Number }, invoicePDF: String }, { timestamps: true });
invoiceSchema.pre('validate', function(next) { if (!this.invoiceNumber) { const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, ''); this.invoiceNumber = `INV-${stamp}-${random4()}`; } next(); });
module.exports = mongoose.model('Invoice', invoiceSchema);
