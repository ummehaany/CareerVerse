const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  requestReturnOrReplacement,
  handleReturnRequest,
  downloadInvoice
} = require('../controllers/orderController');
const { verifyToken, isCustomer } = require('../middleware/auth');

router.post('/', verifyToken, isCustomer, createOrder);
router.get('/', verifyToken, getOrders);
router.get('/:id', verifyToken, getOrderById);

router.put('/:id/status', verifyToken, updateOrderStatus);
router.post('/:id/return', verifyToken, isCustomer, requestReturnOrReplacement);
router.put('/:id/return', verifyToken, handleReturnRequest);
router.get('/:id/invoice', verifyToken, downloadInvoice);

module.exports = router;
