const express = require('express');
const artworkController = require('../controllers/artworkController');
const shareController = require('../controllers/shareController');
const requireAuth = require('../middleware/requireAuth');
const { validateCreateArtwork, validateUpdateArtwork } = require('../validators/artworkValidators');

const router = express.Router();

router.use(requireAuth);

router.get('/', artworkController.list);
router.post('/', validateCreateArtwork, artworkController.create);
router.get('/:id', artworkController.getOne);
router.put('/:id', validateUpdateArtwork, artworkController.update);
router.delete('/:id', artworkController.remove);
router.post('/:id/share', shareController.createShare);

module.exports = router;
