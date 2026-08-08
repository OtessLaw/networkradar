const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { registerValidator, loginValidator, refreshValidator } = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh', refreshValidator, validate, authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
