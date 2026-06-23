const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

// Protect routes - verify access JWT
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new ApiError(401, "Not authorized to access this route"));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return next(new ApiError(401, "User not found with this token"));
    }

    if (!req.user.isActive) {
      return next(new ApiError(403, "Your account has been deactivated"));
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Access token expired. Please refresh."));
    }
    return next(new ApiError(401, "Invalid access token"));
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role (${req.user.role}) is not allowed to access this resource`
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
