const sharp = require('sharp');

/**
 * Generates a small in-memory PNG buffer for use in upload tests,
 * avoiding the need to commit binary fixture files to the repo.
 */
async function makeTestImageBuffer({ width = 40, height = 40 } = {}) {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 120, g: 150, b: 200 },
    },
  })
    .png()
    .toBuffer();
}

module.exports = { makeTestImageBuffer };
