const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  pricePerUnit: { type: Number, required: true }, // Base unit price at checkout
  gstPercentage: { type: Number, required: true },
  gstAmount: { type: Number, required: true }, // GST per item * quantity
  discountPercentage: { type: Number, default: 0 }, // Discount applied based on slab
  finalPrice: { type: Number, required: true }, // Total cost for this item (Base + GST - Discount)
  customizationLogo: { type: String }, // Path/URL to logo for branding on gifts
  deliveryAddress: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    contactNumber: { type: String, required: true }
  }
});

const trackingDetailSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  description: { type: String }
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true }, // Gross total paid by customer
  gstTotal: { type: Number, required: true }, // Total GST collected
  commissionAmount: { type: Number, required: true }, // Marketplace platform fee
  vendorEarnings: { type: Number, required: true }, // Net earnings for the vendor (total - commission)
  status: {
    type: String,
    enum: ['Order Placed', 'Accepted', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Order Placed'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  paymentDetails: {
    transactionId: { type: String },
    method: { type: String },
    timestamp: { type: Date }
  },
  returnRequest: {
    status: {
      type: String,
      enum: ['None', 'Pending', 'Approved', 'Rejected'],
      default: 'None'
    },
    reason: { type: String },
    type: { type: String, enum: ['Return', 'Replacement'] },
    vendorNotes: { type: String },
    adminNotes: { type: String }
  },
  invoiceUrl: { type: String }, // Link to download PDF invoice
  trackingDetails: [trackingDetailSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
