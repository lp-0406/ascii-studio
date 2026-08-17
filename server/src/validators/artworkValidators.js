const AppError = require('../utils/AppError');

function validateCreateArtwork(req, res, next) {
  const { title, asciiContent, originalFilename } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new AppError('Title is required', 400));
  }
  if (title.length > 150) {
    return next(new AppError('Title must be 150 characters or fewer', 400));
  }
  if (!asciiContent || typeof asciiContent !== 'string') {
    return next(new AppError('asciiContent is required', 400));
  }
  if (!originalFilename || typeof originalFilename !== 'string') {
    return next(new AppError('originalFilename is required', 400));
  }
  return next();
}

function validateUpdateArtwork(req, res, next) {
  const { title } = req.body;
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return next(new AppError('Title cannot be empty', 400));
    }
    if (title.length > 150) {
      return next(new AppError('Title must be 150 characters or fewer', 400));
    }
  }
  return next();
}

module.exports = { validateCreateArtwork, validateUpdateArtwork };
