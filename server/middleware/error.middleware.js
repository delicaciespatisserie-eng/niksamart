const notFound = (req, res, next) => { const error = new Error(`Route not found: ${req.originalUrl}`); error.statusCode = 404; next(error); };
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  if (err.name === 'CastError') { statusCode = 400; message = `Resource not found. Invalid: ${err.path}`; }
  if (err.code === 11000) { const field = Object.keys(err.keyValue)[0]; statusCode = 400; message = `Duplicate value for ${field}. Please use another value.`; }
  if (err.name === 'ValidationError') { const messages = Object.values(err.errors).map((val) => val.message); statusCode = 400; message = messages.join('. '); }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token. Please login again.'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired. Please login again.'; }
  res.status(statusCode).json({ success: false, message, ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
};
module.exports = { notFound, errorHandler };
