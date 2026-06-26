const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true }
});

const discountSlabSchema = new mongoose.Schema({
  minQty: { type: Number, required: true }, // e.g. 50+ units
  discountPercentage: { type: Number, required: true } // e.g. 10% off
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  images: [{ type: String }], // Array of uploaded image paths/URLs
  specifications: [specificationSchema],
  price: { type: Number, required: true, min: 0 }, // base price per unit before GST
  gstPercentage: { type: Number, required: true, default: 18 }, // e.g. 18%
  stockQuantity: { type: Number, required: true, default: 0, min: 0 },
  moq: { type: Number, required: true, default: 1, min: 1 }, // Minimum Order Quantity
  bulkDiscountSlabs: [discountSlabSchema],
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productLink: { type: String, trim: true },
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexing for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
