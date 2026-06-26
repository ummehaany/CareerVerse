const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const Settings = require('../models/settings');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');
const path = require('path');
const fs = require('fs');

// Place order from cart checkout
const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { productId, quantity, customizationLogo, deliveryAddress }
    const customerId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required for checkout.' });
    }

    // Retrieve and validate products
    const dbProducts = await Product.find({ _id: { $in: items.map(i => i.productId) } });
    
    // Group checkout items by Vendor
    const vendorItemsMap = {};
    for (const item of items) {
      const dbProd = dbProducts.find(p => p._id.toString() === item.productId);
      if (!dbProd) {
        return res.status(404).json({ message: `Product ID ${item.productId} not found.` });
      }

      if (item.quantity < dbProd.moq) {
        return res.status(400).json({ 
          message: `Product "${dbProd.name}" requires a minimum order quantity of ${dbProd.moq}` 
        });
      }

      if (dbProd.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Product "${dbProd.name}" only has ${dbProd.stockQuantity} units left in stock.` 
        });
      }

      const vendorId = dbProd.vendor.toString();
      if (!vendorItemsMap[vendorId]) {
        vendorItemsMap[vendorId] = [];
      }
      vendorItemsMap[vendorId].push({ item, dbProd });
    }

    // Fetch commission configuration
    let platformSettings = await Settings.findOne({ key: 'marketplace_settings' });
    const commissionPercent = platformSettings ? platformSettings.commissionRate : Number(process.env.COMMISSION_RATE || 10);

    const createdOrders = [];

    // Create separate orders per Vendor
    for (const vendorId in vendorItemsMap) {
      const vendorBundle = vendorItemsMap[vendorId];
      const orderItems = [];
      let totalAmount = 0;
      let gstTotal = 0;

      for (const bundle of vendorBundle) {
        const { item, dbProd } = bundle;
        
        // Calculate bulk discount based on quantity slabs
        let discountPercentage = 0;
        if (dbProd.bulkDiscountSlabs && dbProd.bulkDiscountSlabs.length > 0) {
          // Sort slabs descending by minQty to find the highest matching threshold
          const sortedSlabs = [...dbProd.bulkDiscountSlabs].sort((a, b) => b.minQty - a.minQty);
          const matchingSlab = sortedSlabs.find(slab => item.quantity >= slab.minQty);
          if (matchingSlab) {
            discountPercentage = matchingSlab.discountPercentage;
          }
        }

        const baseUnitPrice = dbProd.price;
        const discountedUnitPrice = baseUnitPrice * (1 - discountPercentage / 100);
        
        const subtotal = discountedUnitPrice * item.quantity;
        const gstAmount = subtotal * (dbProd.gstPercentage / 100);
        const finalPrice = subtotal + gstAmount;

        orderItems.push({
          product: dbProd._id,
          quantity: item.quantity,
          pricePerUnit: baseUnitPrice,
          gstPercentage: dbProd.gstPercentage,
          gstAmount,
          discountPercentage,
          finalPrice,
          customizationLogo: item.customizationLogo || '',
          deliveryAddress: item.deliveryAddress
        });

        totalAmount += finalPrice;
        gstTotal += gstAmount;

        // Deduct inventory stock
        dbProd.stockQuantity -= item.quantity;
        await dbProd.save();
      }

      const commissionAmount = totalAmount * (commissionPercent / 100);
      const vendorEarnings = totalAmount - commissionAmount;

      // Create order entry
      let order = await Order.create({
        customer: customerId,
        vendor: vendorId,
        items: orderItems,
        totalAmount,
        gstTotal,
        commissionAmount,
        vendorEarnings,
        status: 'Order Placed',
        paymentStatus: 'Paid', // Simulating successful checkout immediately
        paymentDetails: {
          transactionId: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          method: 'Credit Card',
          timestamp: new Date()
        },
        trackingDetails: [{
          status: 'Order Placed',
          description: 'Your corporate gifting order has been placed successfully.'
        }]
      });

      // Generate invoice PDF
      const customerUser = await User.findById(customerId);
      const vendorUser = await User.findById(vendorId);
      const invoicePath = await generateInvoicePDF(order, customerUser, vendorUser);
      
      order.invoiceUrl = invoicePath;
      await order.save();

      createdOrders.push(order);
    }

    res.status(201).json({
      message: 'Checkout completed successfully',
      orders: createdOrders
    });
  } catch (error) {
    next(error);
  }
};

// Get orders based on role
const getOrders = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'vendor') {
      query.vendor = req.user.id;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email companyName')
      .populate('vendor', 'name email companyName')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// Get single order details
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('customer', 'name email companyName companyLogo')
      .populate('vendor', 'name email companyName gstNumber ratings')
      .populate('items.product', 'name price images specifications');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Role check security
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'vendor' && order.vendor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// Update order status (Vendor)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check ownership
    if (order.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update status on this order' });
    }

    order.status = status;
    order.trackingDetails.push({
      status,
      description: description || `Status updated to ${status}`
    });

    await order.save();
    res.status(200).json({ message: `Order status updated to ${status} successfully`, order });
  } catch (error) {
    next(error);
  }
};

// Request Return or Replacement (Customer)
const requestReturnOrReplacement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, type } = req.body; // type: 'Return' or 'Replacement'

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'Returns can only be requested on delivered orders.' });
    }

    order.returnRequest = {
      status: 'Pending',
      reason,
      type
    };

    order.trackingDetails.push({
      status: 'Return Pending',
      description: `Return/Replacement request raised for reason: ${reason}`
    });

    await order.save();
    res.status(200).json({ message: 'Return/Replacement request submitted successfully', order });
  } catch (error) {
    next(error);
  }
};

// Handle Return / Replacement Request (Vendor)
const handleReturnRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, vendorNotes } = req.body; // status: 'Approved' or 'Rejected'

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.returnRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'No active return request is pending on this order.' });
    }

    order.returnRequest.status = status;
    order.returnRequest.vendorNotes = vendorNotes;

    order.trackingDetails.push({
      status: `Return ${status}`,
      description: `Vendor has ${status} the return/replacement request. Note: ${vendorNotes || ''}`
    });

    // If return approved, stock is returned (if return type is Return, not Replacement)
    if (status === 'Approved' && order.returnRequest.type === 'Return') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity }
        });
      }
    }

    await order.save();
    res.status(200).json({ message: `Return request ${status} successfully`, order });
  } catch (error) {
    next(error);
  }
};

// Serves the invoice file for download
const downloadInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Allow Customer, Vendor, and Admin of order
    if (req.user.role === 'customer' && order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.user.role === 'vendor' && order.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!order.invoiceUrl) {
      return res.status(404).json({ message: 'Invoice PDF has not been generated.' });
    }

    const fullPath = path.join(__dirname, '..', order.invoiceUrl);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Invoice file not found on disk.' });
    }

    res.download(fullPath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  requestReturnOrReplacement,
  handleReturnRequest,
  downloadInvoice
};
