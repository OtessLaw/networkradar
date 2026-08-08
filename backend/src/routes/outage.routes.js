const express = require('express');
const router = express.Router();
const outageController = require('../controllers/outage.controller');

router.get('/', outageController.getOutages);
router.get('/active', outageController.getActiveOutages);

module.exports = router;
