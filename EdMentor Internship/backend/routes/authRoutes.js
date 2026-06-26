const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist
} = require('../controllers/authController');
const { verifyToken, isCustomer } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, upload.single('logo'), updateProfile);

router.post('/address', verifyToken, isCustomer, addAddress);
router.delete('/address/:addressId', verifyToken, isCustomer, deleteAddress);

router.get('/wishlist', verifyToken, isCustomer, getWishlist);
router.post('/wishlist/toggle', verifyToken, isCustomer, toggleWishlist);

module.exports = router;
