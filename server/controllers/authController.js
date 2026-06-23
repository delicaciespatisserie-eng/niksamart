const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");

const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = user.getAccessToken();
  const refreshToken = user.getRefreshToken();

  const options = {
    expires: new Date(Date.now() + (process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res
    .status(statusCode)
    .cookie("refreshToken", refreshToken, options)
    .json({
      success: true,
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(400, "User already exists with this email"));
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role && ["customer", "vendor"].includes(role) ? role : "customer",
    });

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    const htmlContent = `
      <p>Hello ${user.name},</p>
      <p>Thank you for registering at Niksa Mart. Please use the following OTP to verify your email address:</p>
      <div class="box">${otp}</div>
      <p>This OTP is valid for 10 minutes.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Niksa Mart - Email Verification OTP",
        htmlContent,
      });

      res.status(201).json({
        success: true,
        message: "Registration successful. Please check your email for the OTP.",
      });
    } catch (error) {
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ApiError(500, "Email could not be sent"));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      otp: hashedOTP,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError(400, "Invalid or expired OTP"));
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, "Please provide an email and password"));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    if (!user.isActive) {
      return next(new ApiError(403, "Your account is deactivated. Please contact support."));
    }

    if (!user.isVerified) {
      return next(new ApiError(403, "Please verify your email address first"));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Token
// @route   POST /api/v1/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(new ApiError(401, "Refresh token is missing"));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return next(new ApiError(401, "User not found or deactivated"));
    }

    const accessToken = user.getAccessToken();

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired refresh token"));
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
exports.logout = async (req, res, next) => {
  try {
    res.cookie("refreshToken", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ApiError(404, "There is no user with that email"));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Ensure CLIENT_URL is available to construct the reset link
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const htmlContent = `
      <p>You are receiving this email because you (or someone else) requested a password reset.</p>
      <p>Please click the button below to reset your password:</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Niksa Mart - Password Reset Request",
        htmlContent,
      });

      res.status(200).json({ success: true, message: "Email sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ApiError(500, "Email could not be sent"));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/v1/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError(400, "Invalid or expired token"));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new ApiError(400, "Current password is incorrect"));
    }

    user.password = newPassword;
    await user.save();

    // Optionally you could send a new token response here
    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};
