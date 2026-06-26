const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Verify JWT token from authorization header
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Check if user is a Customer
const isCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden. Customer access required.' });
  }
};

// Check if user is a Vendor
const isVendor = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden. Vendor access required.' });
  }
};

// Check if vendor is approved
const isApprovedVendor = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    if (req.user.isApproved) {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Vendor account is pending admin approval.' });
    }
  } else {
    return res.status(403).json({ message: 'Forbidden. Vendor access required.' });
  }
};

// Check if user is an Admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden. Admin access required.' });
  }
};

module.exports = {
  verifyToken,
  isCustomer,
  isVendor,
  isApprovedVendor,
  isAdmin
};
