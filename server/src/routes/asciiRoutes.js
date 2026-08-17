const express = require('express');
const asciiController = require('../controllers/asciiController');
const requireAuth = require('../middleware/requireAuth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/generate', requireAuth, upload.single('image'), asciiController.generate);

module.exports = router;
