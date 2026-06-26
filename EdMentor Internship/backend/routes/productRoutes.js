const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  submitReview
} = require('../controllers/productController');
const { verifyToken, isApprovedVendor, isCustomer } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/', verifyToken, isApprovedVendor, upload.array('images', 5), createProduct);
router.put('/:id', verifyToken, upload.array('images', 5), updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

router.post('/review', verifyToken, isCustomer, submitReview);

module.exports = router;
