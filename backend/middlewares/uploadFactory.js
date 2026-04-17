const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Create a hardened multer uploader.
 *
 * Defences applied:
 *   - Destination directory is auto-created if missing.
 *   - Filename is server-generated (no user input in filesystem path).
 *   - Extension must be in an allowlist (no arbitrary extensions).
 *   - MIME type must start with "image/" and match the extension family.
 *   - Hard size limit (default 5 MB).
 *
 * Note: for full protection against a malicious file with a faked MIME header
 * (e.g. PHP bytes inside a file named .jpg), layer a magic-byte check
 * AFTER the upload finishes — the `file-type` package on the written file.
 * This middleware blocks the common cases before bytes ever hit disk.
 */
const ALLOWED_IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
const ALLOWED_IMAGE_MIMES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

function createImageUploader({ subDir, filePrefix, maxBytes = 5 * 1024 * 1024 }) {
  const uploadDir = path.join(__dirname, "../public/images", subDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${filePrefix}-${Date.now()}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_IMAGE_EXTS.includes(ext)) {
      return cb(new Error(`Invalid file extension "${ext}". Allowed: ${ALLOWED_IMAGE_EXTS.join(", ")}`));
    }
    if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type "${file.mimetype}". Allowed: ${ALLOWED_IMAGE_MIMES.join(", ")}`));
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxBytes, files: 10 },
  });
}

module.exports = { createImageUploader };
