const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  addressName: { type: String, default: 'Default' }, // e.g. "HQ", "Warehouse"
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  contactNumber: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer'
  },
  // Customer specific
  companyName: { type: String, trim: true },
  companyLogo: { type: String }, // path/URL to uploaded custom logo
  addresses: [addressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // Vendor specific
  gstNumber: { type: String, trim: true },
  isApproved: { type: Boolean, default: false }, // for vendors, requires admin approval
  ratings: {
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
