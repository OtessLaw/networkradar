const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// All admin routes require auth + admin role
router.use(authenticate, adminOnly);

router.get('/stats', adminController.getAdminStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/reputation', adminController.updateUserReputation);

router.get('/reports', adminController.getAdminReports);
router.put('/reports/:id', adminController.updateReportStatus);

router.get('/outages', adminController.getAdminOutages);
router.put('/outages/:id', adminController.updateOutageStatus);

router.get('/scoring-config', adminController.getScoringConfig);
router.put('/scoring-config', adminController.updateScoringConfig);

router.get('/networks', adminController.getAdminNetworks);

module.exports = router;
