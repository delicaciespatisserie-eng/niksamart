const express = require('express');
const path = require('path');
const helmet = require('helmet');
const { sanitize: mongoSanitize } = require('express-mongo-sanitize');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { globalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

// ─── WWW → non-www redirect ───
app.use((req, res, next) => {
  if (req.headers.host && req.headers.host.startsWith('www.')) {
    return res.redirect(301, 'https://' + req.headers.host.slice(4) + req.originalUrl);
  }
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://cdn.jsdelivr.net", "https://res.cloudinary.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://via.placeholder.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://res.cloudinary.com"],
      frameSrc: ["'self'", "https://checkout.razorpay.com"],
      objectSrc: ["'none'"],
    },
  },
}));
app.use((req, _res, next) => { ['body','params','headers'].forEach(k => { if (req[k]) req[k] = mongoSanitize(req[k]); }); next(); });
app.use(cors({ origin: process.env.CLIENT_URL || 'https://niksamart.com', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalLimiter);
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── CSRF protection: reject non-GET API requests without custom header ───
app.use('/api', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  if (req.path === '/payment/webhook') return next();
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') return next();
  return res.status(403).json({ success: false, message: 'CSRF validation failed' });
});

// ─── Static: marketing site root files (serves index.html for /) ───
const rootDir = path.join(__dirname, '..');
const blockedPaths = [/^\/\.env/, /^\/server\//, /^\/node_modules\//, /^\/client\/src\//, /^\/\.git\//, /^\/package\.json$/, /^\/package-lock\.json$/, /^\/render\.yaml$/, /^\/readme\.txt$/];
app.use((req, res, next) => {
  if (blockedPaths.some(p => p.test(req.path))) return res.status(403).json({ success: false, message: 'Forbidden' });
  next();
});
app.use(express.static(rootDir, { maxAge: '1h', dotfiles: 'deny' }));

// ─── Static: React SPA build (client/dist) - NO index.html auto-serve ───
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist, { index: false, maxAge: '1y', immutable: true }));

// ─── API routes ───
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Niksa Mart API is running' }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/vendor', require('./routes/vendor.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// ─── SPA fallback: React routes → client/dist/index.html ───
const spaRegex = /^\/(products|cart|checkout|login|register|forgot-password|reset-password|order-success|account|vendor|admin)(\/.*)?$/;
app.get(spaRegex, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));

app.use(notFound);
app.use(errorHandler);
module.exports = app;
