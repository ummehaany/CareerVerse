const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getVendors,
  approveVendor,
  rejectVendor,
  updateCommission,
  getAuditLogs,
  getDisputes
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/analytics', verifyToken, isAdmin, getDashboardAnalytics);
router.get('/vendors', verifyToken, isAdmin, getVendors);
router.put('/vendors/:vendorId/approve', verifyToken, isAdmin, approveVendor);
router.put('/vendors/:vendorId/reject', verifyToken, isAdmin, rejectVendor);
router.put('/commission', verifyToken, isAdmin, updateCommission);
router.get('/audit-logs', verifyToken, isAdmin, getAuditLogs);
router.get('/disputes', verifyToken, isAdmin, getDisputes);

module.exports = router;
