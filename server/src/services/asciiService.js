const sharp = require('sharp');
const AppError = require('../utils/AppError');

const DEFAULT_CHARSET = '@%#*+=-:. ';
const MIN_WIDTH = 20;
const MAX_WIDTH = 300;

// Terminal/monospace characters are roughly twice as tall as they are
// wide, so we compress the vertical sample count to keep the output
// looking proportionate to the source image.
const CHAR_ASPECT_RATIO = 0.55;

/**
 * Clamp a numeric setting into a safe range, falling back to a default
 * when the input is missing or not a finite number.
 */
function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

/**
 * Normalizes and validates raw conversion settings coming from the
 * client/request body into a safe, bounded settings object.
 */
function parseSettings(rawSettings = {}) {
  const width = Math.round(clampNumber(rawSettings.width, MIN_WIDTH, MAX_WIDTH, 100));
  const charset = typeof rawSettings.charset === 'string' && rawSettings.charset.length >= 2
    ? rawSettings.charset
    : DEFAULT_CHARSET;
  const invert = Boolean(rawSettings.invert);
  // brightness/contrast are applied as -100..100 adjustments
  const brightness = Math.round(clampNumber(rawSettings.brightness, -100, 100, 0));
  const contrast = Math.round(clampNumber(rawSettings.contrast, -100, 100, 0));

  return { width, charset, invert, brightness, contrast };
}

/**
 * Applies brightness/contrast adjustment to a single grayscale pixel
 * value (0-255), returning a clamped 0-255 result.
 */
function adjustPixel(value, brightness, contrast) {
  // Contrast factor formula (classic photo-editing contrast curve)
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  let result = factor * (value - 128) + 128; // contrast around midpoint
  result += (brightness / 100) * 128; // brightness shift
  return Math.min(255, Math.max(0, result));
}

/**
 * Converts an uploaded image buffer into ASCII art text.
 *
 * @param {Buffer} imageBuffer - raw image bytes
 * @param {object} rawSettings - { width, charset, invert, brightness, contrast }
 * @returns {Promise<{ asciiContent: string, settings: object, meta: object }>}
 */
async function convertImageToAscii(imageBuffer, rawSettings) {
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new AppError('No image data provided', 400);
  }

  const settings = parseSettings(rawSettings);

  let image = sharp(imageBuffer, { failOn: 'none' });
  const metadata = await image.metadata().catch(() => {
    throw new AppError('Unable to read image metadata - file may be corrupt', 400);
  });

  if (!metadata.width || !metadata.height) {
    throw new AppError('Unable to read image dimensions', 400);
  }

  const outputWidth = settings.width;
  const outputHeight = Math.max(
    1,
    Math.round(((metadata.height / metadata.width) * outputWidth) * CHAR_ASPECT_RATIO),
  );

  const { data, info } = await image
    .rotate() // respect EXIF orientation
    .resize(outputWidth, outputHeight, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const charset = settings.invert
    ? settings.charset.split('').reverse().join('')
    : settings.charset;
  const rampLength = charset.length;

  let asciiContent = '';
  for (let y = 0; y < info.height; y += 1) {
    let row = '';
    for (let x = 0; x < info.width; x += 1) {
      const idx = (y * info.width + x) * info.channels;
      const rawValue = data[idx];
      const adjusted = adjustPixel(rawValue, settings.brightness, settings.contrast);
      const charIndex = Math.min(
        rampLength - 1,
        Math.floor(((255 - adjusted) / 255) * rampLength),
      );
      row += charset[charIndex];
    }
    asciiContent += `${row}\n`;
  }

  return {
    asciiContent: asciiContent.trimEnd(),
    settings,
    meta: {
      originalWidth: metadata.width,
      originalHeight: metadata.height,
      outputWidth,
      outputHeight,
      format: metadata.format,
    },
  };
}

module.exports = { convertImageToAscii, parseSettings, DEFAULT_CHARSET };
