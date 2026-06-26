const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_key', {
    expiresIn: '30d'
  });
};

// Register User
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, gstNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Setup initial fields
    let userDetails = {
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      isApproved: role === 'vendor' ? false : true // Vendors require admin approval
    };

    if (role === 'vendor') {
      if (!gstNumber) {
        return res.status(400).json({ message: 'GST Number is required for vendor registration' });
      }
      userDetails.gstNumber = gstNumber;
      userDetails.companyName = companyName || name;
    } else if (role === 'customer') {
      userDetails.companyName = companyName || '';
    }

    const user = await User.create(userDetails);

    res.status(201).json({
      message: role === 'vendor' 
        ? 'Registration successful! Your account is pending admin approval.' 
        : 'Registration successful!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        companyName: user.companyName
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login User
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        companyName: user.companyName,
        companyLogo: user.companyLogo,
        addresses: user.addresses,
        gstNumber: user.gstNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password (Mock)
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email' });
    }

    // In production, send email with token. Here, we simulate and print it.
    console.log(`[FORGOT PASSWORD] Reset link requested for ${email}`);
    res.status(200).json({
      message: 'Password reset link sent to your registered email address.'
    });
  } catch (error) {
    next(error);
  }
};

// Get User Profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Update Profile (and upload Logo)
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, companyName, gstNumber } = req.body;

    if (name) user.name = name;
    if (companyName) user.companyName = companyName;
    if (gstNumber && user.role === 'vendor') user.gstNumber = gstNumber;

    if (req.file) {
      // Save the relative path of the uploaded logo
      user.companyLogo = `/uploads/logos/${req.file.filename}`;
    }

    await user.save();
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        companyName: user.companyName,
        companyLogo: user.companyLogo,
        addresses: user.addresses,
        gstNumber: user.gstNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add Address (Customer)
const addAddress = async (req, res, next) => {
  try {
    const { addressName, addressLine1, addressLine2, city, state, postalCode, country, contactNumber } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addresses.push({
      addressName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      contactNumber
    });

    await user.save();
    res.status(201).json({ message: 'Address added successfully', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// Delete Address (Customer)
const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    await user.save();

    res.status(200).json({ message: 'Address deleted successfully', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// Get Wishlist
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json(user.wishlist);
  } catch (error) {
    next(error);
  }
};

// Toggle Wishlist (Add / Remove)
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = user.wishlist.indexOf(productId);
    let message = '';
    if (index >= 0) {
      user.wishlist.splice(index, 1);
      message = 'Product removed from wishlist';
    } else {
      user.wishlist.push(productId);
      message = 'Product added to wishlist';
    }

    await user.save();
    res.status(200).json({ message, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist
};
