const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  customSpecs: [{ key: String, value: String }],
  customizationLogo: { type: String }, // Path/URL to customization logo if uploaded
  customerNotes: { type: String, trim: true },
  status: {
    type: String,
    enum: ['Pending', 'Responded', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  originalPricePerUnit: { type: Number, required: true }, // Base product price at request time
  offeredPricePerUnit: { type: Number }, // Price unit offered by vendor
  vendorNotes: { type: String, trim: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuotationRequest', quotationSchema);
