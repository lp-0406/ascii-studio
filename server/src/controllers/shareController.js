const asyncHandler = require('../utils/asyncHandler');
const shareService = require('../services/shareService');

const createShare = asyncHandler(async (req, res) => {
  const artworkId = Number(req.params.id);
  const result = await shareService.createShareLink(artworkId, req.user.id);
  res.status(201).json({ status: 'success', data: result });
});

const getSharedArtwork = asyncHandler(async (req, res) => {
  const artwork = await shareService.getPublicArtworkByToken(req.params.token);
  res.status(200).json({ status: 'success', data: { artwork } });
});

module.exports = { createShare, getSharedArtwork };
