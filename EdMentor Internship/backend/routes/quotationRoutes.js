const express = require('express');
const router = express.Router();
const {
  requestQuote,
  getQuotes,
  respondToQuote,
  updateQuoteStatus
} = require('../controllers/quotationController');
const { verifyToken, isCustomer, isApprovedVendor } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', verifyToken, isCustomer, upload.single('logo'), requestQuote);
router.get('/', verifyToken, getQuotes);
router.put('/:id/respond', verifyToken, isApprovedVendor, respondToQuote);
router.put('/:id/status', verifyToken, isCustomer, updateQuoteStatus);

module.exports = router;
