const jwt = require('jsonwebtoken');
const generateAccessToken = (user) => { if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured'); return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '15m' }); };
const generateRefreshToken = (user) => { if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET not configured'); return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }); };
const sendRefreshCookie = (res, token) => res.cookie('refreshToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
const publicUser = (user) => ({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar, address: user.address, isVerified: user.isVerified });
module.exports = { generateAccessToken, generateRefreshToken, sendRefreshCookie, publicUser };
