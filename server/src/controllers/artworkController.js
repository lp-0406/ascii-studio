const asyncHandler = require('../utils/asyncHandler');
const artworkService = require('../services/artworkService');

const list = asyncHandler(async (req, res) => {
  const artworks = await artworkService.listArtworksForUser(req.user.id);
  res.status(200).json({ status: 'success', data: { artworks } });
});

const getOne = asyncHandler(async (req, res) => {
  const artwork = await artworkService.getOwnedArtwork(Number(req.params.id), req.user.id);
  res.status(200).json({ status: 'success', data: { artwork } });
});

const create = asyncHandler(async (req, res) => {
  const { title, asciiContent, originalFilename, settings } = req.body;
  const artwork = await artworkService.createArtwork(req.user.id, {
    title, asciiContent, originalFilename, settings,
  });
  res.status(201).json({ status: 'success', data: { artwork } });
});

const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { title, asciiContent, settings } = req.body;
  const artwork = await artworkService.updateArtwork(id, req.user.id, {
    title, asciiContent, settings,
  });
  res.status(200).json({ status: 'success', data: { artwork } });
});

const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await artworkService.deleteArtwork(id, req.user.id);
  res.status(200).json({ status: 'success', message: 'Artwork deleted' });
});

module.exports = { list, getOne, create, update, remove };
