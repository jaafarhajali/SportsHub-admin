const User = require("../models/userModel");
const Role = require("../models/roleModel");
const asyncHandler = require("express-async-handler");
const validator = require("validator");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const logger = require("../utils/logger");

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password, passwordConfirm, phoneNumber, termsAccepted } = req.body;

  // Find default user role
  const userRole = await Role.findOne({ name: "user" });

  if (!userRole) {
    return res.status(400).json({
      status: "fail",
      message: "Default role 'user' not found",
    });
  }

  try {
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      phoneNumber,
      passwordConfirm,
      isActive: true,
      profilePhoto: null,
      termsAccepted,
      role: {
        id: userRole._id,
        name: userRole.name,
      },
      createdBy: req.user ? req.user._id : null,
      updatedBy: req.user ? req.user._id : null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    // Handle duplicate fields (e.g. email or username)
    if (err.code === 11000) {
      const duplicatedField = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `The ${duplicatedField} "${err.keyValue[duplicatedField]}" is already in use.`,
        field: duplicatedField,
      });
    }

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const errors = {};
      Object.values(err.errors).forEach((el) => {
        errors[el.path] = el.message;
      });

      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors,
      });
    }

    // Fallback for unexpected errors
    logger.error("Auth register failed", { error: err.message });
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });
  }
});

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    emailErrorMsg: null,
    passwordErrorMsg: null,
  };

  // Email validation
  if (!email) {
    errors.emailErrorMsg = "User must have an email";
  } else if (!validator.isEmail(email)) {
    errors.emailErrorMsg = "Please enter a valid email";
  }

  // Password validation
  if (!password) {
    errors.passwordErrorMsg = "User must have a password";
  } else if (password.length < 8) {
    errors.passwordErrorMsg = "Password must be at least 8 characters long";
  }

  // Check if any error message exists
  if (errors.emailErrorMsg || errors.passwordErrorMsg) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  const foundUser = await User.findOne({ email }).select("+password");

  // Check credentials
  if (!foundUser || !(await foundUser.correctPassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // ❌ Check if user is inactive
  if (!foundUser.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account is deactivated. Please contact support.",
    });
  }

  // ✅ All checks passed — send token
  sendTokenResponse(foundUser, 200, res);
});


// @desc      Logout user
// @route     GET /api/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
    data: {},
  });
});

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: "roles",
    populate: {
      path: "permissions",
    },
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: "If that email is in our system, you will receive a reset link." });
  }

  const platform = req.query.platform;
  logger.debug("Password reset requested", { platform });
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  let resetURL;

  if (platform === "mobile") {
    
    resetURL = `https://jaafarhajali.github.io/redirect?token=${resetToken}`;
  } else {
    resetURL = `http://localhost:3000/auth/reset-password/${resetToken}`;
  }
  const message = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
                background-color: #2196F3 !important; 
                color: white !important; 
                padding: 15px 30px !important; 
                text-decoration: none !important; 
                border-radius: 5px !important; 
                display: inline-block !important; 
                font-size: 16px !important; 
                font-weight: bold !important;
                margin: 20px 0 !important;
                text-align: center !important;
                min-width: 200px !important;
            }
            .link { word-break: break-all; color: #2196F3; font-size: 14px; background-color: #f0f0f0; padding: 10px; border-radius: 5px; }
            @media only screen and (max-width: 600px) {
                .container { padding: 10px !important; }
                .button { width: 90% !important; padding: 20px !important; font-size: 18px !important; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2 style="color: #2196F3; text-align: center;">SportsHub Password Reset</h2>
            <p>Hello ${user.username},</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetURL}" class="button">Reset Your Password</a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="link">${resetURL}</div>
            
            <p><strong>This link will expire in 10 minutes.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666; text-align: center;">
                This is an automated email from SportsHub. Please do not reply to this email.
            </p>
        </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Reset link sent to your email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error("Email send failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Failed to send reset email" });
  }
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const { password, passwordConfirm } = req.body;
  if (!password || !passwordConfirm || password !== passwordConfirm) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    // Set cookie expiration by adding JWT_EXPIRES_IN days to current time
    expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000),
    // Prevent JavaScript access to cookie (XSS protection)
    httpOnly: true,
    // Only send cookie in first-party context (CSRF protection)
    sameSite: "strict",
    // Specifies that the cookie is accessible from all paths/routes within the domain
    // Without this, cookie would only be accessible from the specific path it was set from
    path: "/",
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  // Set token cookie and send response
  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};
