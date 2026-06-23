const jwt = require("jsonwebtoken");

// Generate JWT token and set as HTTP-only cookie
const generateToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    token,
    user,
  });
};

module.exports = generateToken;
