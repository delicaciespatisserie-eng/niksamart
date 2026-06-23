const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({ label: { type: String, default: 'home' }, name: String, phone: String, street: String, city: String, state: String, pincode: String, isDefault: { type: Boolean, default: false } }, { _id: true });
const userSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true, trim: true }, phone: { type: String, required: true, trim: true }, password: { type: String, required: true, minlength: 6, select: false }, role: { type: String, enum: ['customer', 'vendor', 'admin', 'superadmin'], default: 'customer' }, address: [addressSchema], addresses: [addressSchema], avatar: String, isVerified: { type: Boolean, default: false }, isActive: { type: Boolean, default: true }, refreshToken: String, resetPasswordToken: String, resetPasswordExpire: Date }, { timestamps: true });
userSchema.pre('save', async function(next) { if (!this.isModified('password')) return next(); this.password = await bcrypt.hash(this.password, 12); next(); });
userSchema.methods.comparePassword = function(password) { return bcrypt.compare(password, this.password); };
userSchema.methods.getResetPasswordToken = function() { const token = crypto.randomBytes(32).toString('hex'); this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex'); this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; return token; };
module.exports = mongoose.model('User', userSchema);
