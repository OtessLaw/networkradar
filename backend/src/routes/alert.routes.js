const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, alertController.getAlerts);
router.post('/', authenticate, alertController.createAlert);
router.delete('/:id', authenticate, alertController.deleteAlert);

module.exports = router;
