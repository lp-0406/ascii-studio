const express = require('express');
const shareController = require('../controllers/shareController');

const router = express.Router();

// Public - no auth required. Only artworks explicitly marked public
// are exposed via shareService.getPublicArtworkByToken.
router.get('/:token', shareController.getSharedArtwork);

module.exports = router;
