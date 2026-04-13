const express = require("express");
const { UploadProfilePhoto } = require("../controllers/uploadController");

const router = express.Router();

router.post("/profilePhoto", UploadProfilePhoto);

module.exports = router;
