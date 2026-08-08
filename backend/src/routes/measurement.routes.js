const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurement.controller');
const { createMeasurementValidator } = require('../validators/measurement.validator');
const validate = require('../middleware/validate');
const { measurementLimiter } = require('../middleware/rateLimiter');
const { optionalAuth } = require('../middleware/auth');
const geoValidate = require('../middleware/geoValidate');

router.post(
  '/',
  measurementLimiter,
  optionalAuth,
  createMeasurementValidator,
  validate,
  geoValidate('latitude', 'longitude'),
  measurementController.createMeasurement
);

module.exports = router;
