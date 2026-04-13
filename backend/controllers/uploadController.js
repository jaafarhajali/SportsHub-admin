const multer = require("multer");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("express-async-handler");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../public/images/user");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${Date.now()}${ext}`);
  },
});

// Only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Controller method
exports.UploadProfilePhoto = asyncHandler((req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload error" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = `/images/user/${req.file.filename}`;
    // TODO: Save imagePath to database here if needed

    return res.json({ path: imagePath });
  });
});
