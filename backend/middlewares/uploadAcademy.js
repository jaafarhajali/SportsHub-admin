// uploadStadium.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/academiesImages"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `academy-${timestamp}${ext}`);
  },
});

const uploadAcademy = multer({ storage });

module.exports = uploadAcademy;
