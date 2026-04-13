const mongoose = require("mongoose");

const academySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: {
    type: String,
    required: [true, "Academy name is required"],
    trim: true,
  },

  description: {
    type: String,
    trim: true,
  },

  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
  },

  photos: {
    type: [String], // Array of image URLs or paths
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.every(url => typeof url === 'string');
      },
      message: "Each photo must be a valid URL or path string",
    },
    default: [],
  },

  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    validate: {
      validator: function (v) {
        // Validates international phone numbers
        return /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number! Please use international format (e.g., +1234567890)`,
    },
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`,
    },
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

// Middleware to update `updatedAt` on every save
// academySchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

const Academy = mongoose.model("Academy", academySchema);

module.exports = Academy;
