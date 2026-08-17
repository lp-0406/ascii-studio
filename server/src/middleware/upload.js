const path = require('path');
const multer = require('multer');
const AppError = require('../utils/AppError');
const { maxUploadSizeMb } = require('../config/env');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Files are kept in memory only long enough to be processed by sharp;
// nothing is written to disk, which keeps uploaded user files out of git
// and avoids orphaned files on disk.
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new AppError('Only JPG, JPEG, PNG, and WEBP images are allowed', 400));
  }
  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxUploadSizeMb * 1024 * 1024,
  },
});

module.exports = upload;
