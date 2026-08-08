const { body } = require('express-validator');

const createReportValidator = [
  body('networkCode').notEmpty().withMessage('Network code (MTN, TELECEL, AT) is required'),
  body('type').isIn([
    'no_service', 'internet_down', 'internet_slow', 'calls_dropping',
    'cannot_call', 'cannot_receive_calls', 'sms_problem',
    'momo_problem', 'weak_signal', 'other'
  ]).withMessage('Valid report problem type is required'),
  body('latitude').isFloat({ min: 4.5, max: 11.5 }).withMessage('Latitude must be within Ghana (4.5 to 11.5)'),
  body('longitude').isFloat({ min: -3.5, max: 1.5 }).withMessage('Longitude must be within Ghana (-3.5 to 1.5)'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
];

module.exports = { createReportValidator };
