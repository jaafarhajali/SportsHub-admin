const Academy = require("../models/academyModel"); // Adjust path as needed
const mongoose = require("mongoose");

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
    
module.exports = {
  getAllAcademies,
  getAcademyById,
};
