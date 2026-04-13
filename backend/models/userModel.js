const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter a username"],
    maxLength: [30, "Please enter a username less than 30 characters"],
    minLength: [3, "Please enter a username more than 3 characters"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        // Allows letters and spaces only
        return /^[A-Za-z\s]+$/.test(v);
      },
      message: "Username should only contain alphabetic characters and spaces",
    },
  },

  email: {
    type: String,
    required: [true, "User must have an email"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },

  password: {
    type: String,
    required: [true, "User must have a password"],
    minlength: [8, "Password should be at least 8 characters long"],
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, "Confirm password is required"],
    validate: {
      // This only works on CREATE or SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match",
    },
  },

  phoneNumber: {
    type: String,
    required: function () {
      return this.authProvider !== "google"; // Only require if not from Google
    },
  },

  profilePhoto: String,

  passwordChangedAt: {
    type: Date,
  },

  passwordResetToken: String,

  passwordResetExpiresAt: Date,

  isActive: {
    type: Boolean,
    default: true,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  verificationToken: String,

  verificationTokenExpires: Date,

  termsAccepted: {
    type: Boolean,
    required: [true, "You must accept the terms and conditions and privacy policy"],
    default: false,
  },

  role: {
    type: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
      name: { type: String },
    },
    required: true,
  },

  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },

  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],

  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },

  wallet: {
    type: Number,
    default: 100000000,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined; // Don't send this field in response
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // -1 second to avoid false positive
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role.name,
      username: this.username,
      email: this.email,
      phoneNumber: this.phoneNumber,
      profilePhoto: this.profilePhoto,
      isActive: this.isActive,
      termsAccepted: this.termsAccepted,
      isVerified: this.isVerified,
      team: this.team,
      wallet: this.wallet,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN } // this reads "7d"
  );
};

const User = mongoose.model("User", userSchema);

module.exports = User;
