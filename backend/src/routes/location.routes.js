const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

router.get('/map-data', locationController.getMapData);
router.get('/search', locationController.searchLocations);
router.get('/:gridCellId/summary', locationController.getCellSummary);

module.exports = router;
