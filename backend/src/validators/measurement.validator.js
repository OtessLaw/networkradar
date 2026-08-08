const { body } = require('express-validator');

const createMeasurementValidator = [
  body('networkCode').notEmpty().withMessage('Network code (MTN, TELECEL, AT) is required'),
  body('latitude').isFloat({ min: 4.5, max: 11.5 }).withMessage('Latitude must be within Ghana (4.5 to 11.5)'),
  body('longitude').isFloat({ min: -3.5, max: 1.5 }).withMessage('Longitude must be within Ghana (-3.5 to 1.5)'),
  body('downloadSpeed').optional().isFloat({ min: 0, max: 10000 }).withMessage('Download speed must be positive'),
  body('uploadSpeed').optional().isFloat({ min: 0, max: 10000 }).withMessage('Upload speed must be positive'),
  body('latency').optional().isFloat({ min: 0, max: 60000 }).withMessage('Latency must be valid'),
  body('packetLoss').optional().isFloat({ min: 0, max: 1 }).withMessage('Packet loss must be between 0 and 1'),
  body('connectionSuccess').isBoolean().withMessage('Connection success status is required'),
  body('networkType').optional().isIn(['2G', '3G', '4G', '5G', 'WIFI', 'UNKNOWN']),
  body('source').optional().isIn(['web', 'android', 'api']),
];

module.exports = { createMeasurementValidator };
