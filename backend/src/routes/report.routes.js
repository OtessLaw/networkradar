const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { createReportValidator } = require('../validators/report.validator');
const validate = require('../middleware/validate');
const { reportLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const geoValidate = require('../middleware/geoValidate');

router.post(
  '/',
  authenticate,
  reportLimiter,
  createReportValidator,
  validate,
  geoValidate('latitude', 'longitude'),
  reportController.createReport
);

router.get('/', reportController.getReports);

module.exports = router;
