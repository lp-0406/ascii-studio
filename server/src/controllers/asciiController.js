const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { convertImageToAscii } = require('../services/asciiService');

const generate = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('An image file is required', 400);
  }

  const rawSettings = {
    width: req.body.width,
    charset: req.body.charset,
    invert: req.body.invert === 'true' || req.body.invert === true,
    brightness: req.body.brightness,
    contrast: req.body.contrast,
  };

  const { asciiContent, settings, meta } = await convertImageToAscii(
    req.file.buffer,
    rawSettings,
  );

  res.status(200).json({
    status: 'success',
    data: {
      asciiContent,
      settings,
      meta,
      originalFilename: req.file.originalname,
    },
  });
});

module.exports = { generate };
