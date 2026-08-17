const express = require('express');
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const { validateRegister, validateLogin } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

module.exports = router;
