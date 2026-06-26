const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Reviewed product
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reviewed vendor
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true }
}, {
  timestamps: true
});

// Single review per user per product/vendor
reviewSchema.index({ reviewer: 1, product: 1 }, { unique: true, sparse: true });
reviewSchema.index({ reviewer: 1, vendor: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
