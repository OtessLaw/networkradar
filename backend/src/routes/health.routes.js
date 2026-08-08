const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');
const { pingLimiter } = require('../middleware/rateLimiter');

router.get('/ping', pingLimiter, healthController.ping);
router.get('/speed-test', healthController.speedTest);
router.get('/status', healthController.status);

module.exports = router;
