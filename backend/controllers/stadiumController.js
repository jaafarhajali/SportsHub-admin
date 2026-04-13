const Stadium = require("../models/stadiumModel"); // Adjust path as needed
const mongoose = require("mongoose");

// Get all stadiums
const getAllStadiums = async (req, res) => {
  try {
    const stadiums = await Stadium.find()
      .populate("ownerId", "username email") // Populate owner info, adjust fields as needed
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stadiums.length,
      data: stadiums,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stadiums",
      error: error.message,
    });
  }
};

// Get stadium by ID
const getStadiumById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stadium ID",
      });
    }

    const stadium = await Stadium.findById(id).populate("ownerId", "username email");

    if (!stadium) {
      return res.status(404).json({
        success: false,
        message: "Stadium not found",
      });
    }

    res.status(200).json({
      success: true,
      data: stadium,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stadium",
      error: error.message,
    });
  }
};


module.exports = {
  getAllStadiums,
  getStadiumById,
};
