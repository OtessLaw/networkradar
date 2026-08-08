const express = require('express');
const router = express.Router();
const networkController = require('../controllers/network.controller');

router.get('/', networkController.getNetworks);
router.get('/:code/stats', networkController.getNetworkStats);

module.exports = router;
