const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerification");


// your existing updateUserProfile...
exports.updateUserProfile = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;
    const { username, email, phoneNumber } = req.body;
    const profilePhoto = req.file ? `/images/user/${req.file.filename}` : undefined;

    // Check for duplicates
    const existingUsername = username ? await User.findOne({ username, _id: { $ne: userId } }) : null;
    const existingEmail = email ? await User.findOne({ email, _id: { $ne: userId } }) : null;
    const existingPhone = phoneNumber ? await User.findOne({ phoneNumber, _id: { $ne: userId } }) : null;

    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    if (existingPhone) {
      return res.status(400).json({ error: "Phone number is already used" });
    }

    const updatedFields = {};
    if (username) updatedFields.username = username;
    if (email) updatedFields.email = email;
    if (phoneNumber) updatedFields.phoneNumber = phoneNumber;
    if (profilePhoto) updatedFields.profilePhoto = profilePhoto;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate new token
    const token = jwt.sign(
      {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        profilePhoto: updatedUser.profilePhoto,
        role: updatedUser.role.name,
        isActive: updatedUser.isActive,
        termsAccepted: updatedUser.termsAccepted,
        team: updatedUser.team,
        wallet: updatedUser.wallet,
        isVerified: updatedUser.isVerified,
        createdBy: updatedUser.createdBy,
        updatedBy: updatedUser.updatedBy,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      token,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

exports.sendEmailVerification = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.isVerified) return res.status(400).json({ message: "User is already verified" });

  const token = crypto.randomBytes(32).toString("hex");
  user.verificationToken = token;
  user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  await user.save({ validateBeforeSave: false });

  const platform = req.query.platform;
  let verifyURL;

  if (platform === "mobile") {
    console.log("Sending verification for mobile...");
    verifyURL = `https://jaafarhajali.github.io/varification/?verifyToken=${token}`;
  } else {
    verifyURL = `http://localhost:3000/verify-email?token=${token}`;
  }

  const message = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Email Verification</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .btn {
                display: inline-block;
                background-color: #4CAF50;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin-top: 20px;
            }
            .link {
                margin-top: 10px;
                font-size: 14px;
                word-break: break-word;
                background-color: #f0f0f0;
                padding: 10px;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <h2>Email Verification - SportsHub</h2>
        <p>Hello ${user.username},</p>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verifyURL}" class="btn">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <div class="link">${verifyURL}</div>
        <p><strong>This link will expire in 24 hours.</strong></p>
    </body>
    </html>
  `;

  try {
    await sendVerificationEmail({
      email: user.email,
      subject: "Verify Your Email - SportsHub",
      message,
    });

    res.status(200).json({ message: "Verification email sent" });
  } catch (err) {
    console.error("Verification email failed:", err);
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: "Failed to send verification email" });
  }
});


exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired verification token" });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const newToken = user.getSignedJwtToken(); // ✅ generate new token

  res.status(200).json({
    message: "Email verified successfully",
    token: newToken, // ✅ return token to frontend
  });
});


