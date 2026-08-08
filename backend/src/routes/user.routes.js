const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, userController.getMe);
router.put('/me', authenticate, userController.updateMe);
router.delete('/me', authenticate, userController.deleteMe);
router.get('/me/reports', authenticate, userController.getMyReports);
router.get('/me/measurements', authenticate, userController.getMyMeasurements);

module.exports = router;
