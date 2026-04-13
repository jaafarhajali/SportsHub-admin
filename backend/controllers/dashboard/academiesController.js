const Academy = require("../../models/academyModel");
const Notification = require("../../models/notificationModel");
const User = require("../../models/userModel");
const mongoose = require("mongoose");

// GET all academies
const getAllAcademies = async (req, res) => {
  try {
    const academies = await Academy.find().populate("ownerId", "username email");
    res.json({ success: true, data: academies });
  } catch (error) {
    console.error("Error fetching academies:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET academy by ID
const getAcademyById = async (req, res) => {
  try {
    const academy = await Academy.findById(req.params.id).populate("ownerId", "username email");
    if (!academy) {
      return res.status(404).json({ success: false, message: "Academy not found" });
    }
    res.json({ success: true, data: academy });
  } catch (error) {
    console.error("Error fetching academy:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST add academy
const addAcademy = async (req, res) => {
  try {
    if (!req.user || (!req.user.userId && !req.user.id)) {
      return res.status(401).json({ success: false, message: "Unauthorized: User not found." });
    }

    const { name, description, location, phoneNumber, email } = req.body;
    let ownerId;

    // Determine the ownerId based on role
    if (req.user.role === "admin") {
      ownerId = req.body.ownerId;
      if (!ownerId) {
        return res.status(400).json({
          success: false,
          errors: { ownerId: "Owner is required when creating an academy as admin" },
        });
      }
    } else if (req.user.role === "academyOwner") {
      ownerId = req.user.userId || req.user.id;
    } else {
      return res.status(403).json({ success: false, message: "You are not allowed to create an academy" });
    }

    // Manual validation
    const errors = {};
    if (!name || name.trim() === "") errors.name = "Academy name is required";
    if (!location || location.trim() === "") errors.location = "Location is required";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Valid email is required";
    if (!phoneNumber || !/^\+?[1-9]\d{1,14}$/.test(phoneNumber))
      errors.phoneNumber = "Valid international phone number is required";

    const photos = req.files?.map((file) => `/images/academiesImages/${file.filename}`) || [];

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const newAcademy = new Academy({
      name,
      description,
      location,
      phoneNumber,
      email,
      photos,
      ownerId,
    });

    const savedAcademy = await newAcademy.save();

    const users = await User.find({}, "_id");

    const notifications = await Notification.insertMany(
      users.map((user) => ({
        user: user._id,
        message: `A new academy "${savedAcademy.name}" has been added.`,
        type: "academy-added",
        metadata: { academyId: savedAcademy._id },
      }))
    );

    await Promise.all(
      notifications.map((notification) =>
        User.findByIdAndUpdate(notification.user, {
          $push: { notifications: notification._id },
        })
      )
    );

    res.status(201).json({ success: true, data: savedAcademy });
  } catch (error) {
    console.error("Error adding academy:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    res.status(500).json({ success: false, message: "Server error while creating academy" });
  }
};

// PUT update academy
const updateAcademy = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid stadium ID" });
    }

    if (req.files && req.files.length > 0) {
      const photos = req.files?.map((file) => `/images/academiesImages/${file.filename}`) || [];
      updateData.photos = photos;
    }

    updateData.updatedAt = new Date();

    const updatedAcademy = await Academy.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("ownerId", "username email");

    if (!updatedAcademy) {
      return res.status(404).json({ success: false, message: "Academy not found" });
    }

    return res.status(200).json({ success: true, data: updatedAcademy });
  } catch (error) {
    console.error("Error updating academy:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE academy
const deleteAcademy = async (req, res) => {
  try {
    const deleted = await Academy.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Academy not found" });
    }

    // Notify all users
    const users = await User.find({}, "_id");
    const notifications = await Promise.all(
      users.map((user) =>
        Notification.create({
          user: user._id,
          message: `The academy "${deleted.name}" has been deleted.`,
          type: "info",
          metadata: {
            academyId: deleted._id,
          },
        })
      )
    );

    await Promise.all(
      notifications.map((notification) =>
        User.findByIdAndUpdate(notification.user, {
          $push: { notifications: notification._id },
        })
      )
    );

    res.json({ success: true, message: "Academy deleted successfully" });
  } catch (error) {
    console.error("Error deleting academy:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAcademiesByOwner = async (req, res) => {
  try {
    const academies = await Academy.find({ ownerId: req.params.ownerId });
    res.json({ success: true, data: academies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAllAcademies,
  getAcademyById,
  addAcademy,
  updateAcademy,
  deleteAcademy,
  getAcademiesByOwner,
};
