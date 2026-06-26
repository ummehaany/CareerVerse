const QuotationRequest = require('../models/quotation');
const Product = require('../models/product');
const Order = require('../models/order');
const Settings = require('../models/settings');

// Request a quotation (Customer)
const requestQuote = async (req, res, next) => {
  try {
    const { productId, quantity, customSpecs, customerNotes } = req.body;
    const customerId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (Number(quantity) < product.moq) {
      return res.status(400).json({ 
        message: `Quotation quantity (${quantity}) cannot be lower than the product's Minimum Order Quantity (${product.moq})` 
      });
    }

    const parsedSpecs = typeof customSpecs === 'string' ? JSON.parse(customSpecs) : (customSpecs || []);

    let logoPath = '';
    if (req.file) {
      logoPath = `/uploads/logos/${req.file.filename}`;
    } else {
      // Fallback to customer's profile logo if already uploaded
      logoPath = req.user.companyLogo || '';
    }

    const quote = await QuotationRequest.create({
      customer: customerId,
      vendor: product.vendor,
      product: productId,
      quantity: Number(quantity),
      customSpecs: parsedSpecs,
      customizationLogo: logoPath,
      customerNotes,
      originalPricePerUnit: product.price,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Quotation request submitted successfully', quote });
  } catch (error) {
    next(error);
  }
};

// Get all quotes (Role based filters)
const getQuotes = async (req, res, next) => {
  try {
    let query = {};
    
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'vendor') {
      query.vendor = req.user.id;
    } // Admin gets all

    const quotes = await QuotationRequest.find(query)
      .populate('customer', 'name email companyName companyLogo')
      .populate('vendor', 'name email companyName')
      .populate('product', 'name price images moq')
      .sort({ createdAt: -1 });

    res.status(200).json(quotes);
  } catch (error) {
    next(error);
  }
};

// Respond to quote with price offer (Vendor)
const respondToQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { offeredPricePerUnit, vendorNotes } = req.body;

    const quote = await QuotationRequest.findById(id);
    if (!quote) {
      return res.status(404).json({ message: 'Quotation request not found' });
    }

    // Check if the vendor is indeed the owner of the product
    if (quote.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to respond to this quote' });
    }

    quote.offeredPricePerUnit = Number(offeredPricePerUnit);
    quote.vendorNotes = vendorNotes;
    quote.status = 'Responded';

    await quote.save();
    res.status(200).json({ message: 'Quotation response sent successfully', quote });
  } catch (error) {
    next(error);
  }
};

// Customer accepts or rejects quotation
const updateQuoteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Accepted' or 'Rejected'

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update. Must be Accepted or Rejected.' });
    }

    const quote = await QuotationRequest.findById(id).populate('product');
    if (!quote) {
      return res.status(404).json({ message: 'Quotation request not found' });
    }

    if (quote.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this quote' });
    }

    quote.status = status;
    await quote.save();

    // If accepted, we simulate creating a checkout-ready pending order
    if (status === 'Accepted') {
      // Find platform settings for commission
      let platformSettings = await Settings.findOne({ key: 'marketplace_settings' });
      const commissionPercent = platformSettings ? platformSettings.commissionRate : Number(process.env.COMMISSION_RATE || 10);

      // Calculations
      const basePrice = quote.offeredPricePerUnit || quote.originalPricePerUnit;
      const gstPercentage = quote.product.gstPercentage || 18;
      
      const subtotal = basePrice * quote.quantity;
      const gstAmount = subtotal * (gstPercentage / 100);
      const totalAmount = subtotal + gstAmount;

      const commissionAmount = totalAmount * (commissionPercent / 100);
      const vendorEarnings = totalAmount - commissionAmount;

      // Use customer's first address or blank address template to be completed at payment
      const defaultAddress = req.user.addresses && req.user.addresses.length > 0
        ? req.user.addresses[0]
        : {
            addressLine1: 'Pending Confirmation',
            city: 'Pending',
            state: 'Pending',
            postalCode: '000000',
            country: 'Pending',
            contactNumber: '0000000000'
          };

      const order = await Order.create({
        customer: quote.customer,
        vendor: quote.vendor,
        items: [{
          product: quote.product._id,
          quantity: quote.quantity,
          pricePerUnit: basePrice,
          gstPercentage,
          gstAmount,
          discountPercentage: 0, // customized quote is already discounted
          finalPrice: totalAmount,
          customizationLogo: quote.customizationLogo,
          deliveryAddress: defaultAddress
        }],
        totalAmount,
        gstTotal: gstAmount,
        commissionAmount,
        vendorEarnings,
        status: 'Order Placed',
        paymentStatus: 'Pending',
        trackingDetails: [{
          status: 'Order Placed',
          description: 'Order automatically created via accepted bulk quotation'
        }]
      });

      return res.status(200).json({ 
        message: 'Quotation accepted and order created successfully', 
        quote, 
        orderId: order._id 
      });
    }

    res.status(200).json({ message: `Quotation request has been ${status}`, quote });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestQuote,
  getQuotes,
  respondToQuote,
  updateQuoteStatus
};
