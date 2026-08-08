const express = require('express');
const router = express.Router();
const businessController = require('../controllers/business.controller');

router.get('/network-quality', businessController.getNetworkQuality);

module.exports = router;
