const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const AuditLog = require('../models/auditLog');
const Settings = require('../models/settings');

// Admin Analytics Dashboard
const getDashboardAnalytics = async (req, res, next) => {
  try {
    // 1. Total Sales and Commission
    const salesAggregate = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalCommission: { $sum: '$commissionAmount' },
          totalGst: { $sum: '$gstTotal' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const salesStats = salesAggregate[0] || {
      totalSales: 0,
      totalCommission: 0,
      totalGst: 0,
      totalOrders: 0
    };

    // 2. User Accounts Count by Role
    const userStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const usersCounts = { customer: 0, vendor: 0, admin: 0 };
    userStats.forEach(stat => {
      if (usersCounts[stat._id] !== undefined) {
        usersCounts[stat._id] = stat.count;
      }
    });

    // 3. Products listed
    const totalProducts = await Product.countDocuments();

    // 4. Return request counts
    const totalDisputes = await Order.countDocuments({ 'returnRequest.status': 'Pending' });

    // 5. Recent Orders
    const recentOrders = await Order.find()
      .populate('customer', 'name email companyName')
      .populate('vendor', 'name companyName')
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Monthly sales aggregation (past 6 months) for chart rendering
    const monthlySales = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: '$totalAmount' },
          commission: { $sum: '$commissionAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    // 7. Get platform commission settings
    let platformSettings = await Settings.findOne({ key: 'marketplace_settings' });
    if (!platformSettings) {
      platformSettings = await Settings.create({ key: 'marketplace_settings', commissionRate: 10 });
    }

    res.status(200).json({
      salesStats,
      usersCounts,
      totalProducts,
      totalDisputes,
      recentOrders,
      monthlySales: monthlySales.reverse(),
      commissionRate: platformSettings.commissionRate
    });
  } catch (error) {
    next(error);
  }
};

// Manage vendors listing (all or pending)
const getVendors = async (req, res, next) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(vendors);
  } catch (error) {
    next(error);
  }
};

// Approve Vendor
const approveVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;

    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.isApproved = true;
    await vendor.save();

    // Log Action
    await AuditLog.create({
      actor: req.user.id,
      action: 'VENDOR_APPROVAL',
      details: `Approved vendor account: ${vendor.name} (${vendor.email})`,
      ipAddress: req.ip
    });

    res.status(200).json({ message: `Vendor "${vendor.name}" has been approved successfully.`, vendor });
  } catch (error) {
    next(error);
  }
};

// Reject / Disapprove Vendor
const rejectVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const vendor = await User.findById(vendorId);
    
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Set approval to false or delete. Let's toggle isApproved to false and keep the user
    vendor.isApproved = false;
    await vendor.save();

    await AuditLog.create({
      actor: req.user.id,
      action: 'VENDOR_REJECTION',
      details: `Revoked approval / rejected vendor: ${vendor.name} (${vendor.email})`,
      ipAddress: req.ip
    });

    res.status(200).json({ message: `Vendor "${vendor.name}" approval has been revoked.`, vendor });
  } catch (error) {
    next(error);
  }
};

// Update global commission rate
const updateCommission = async (req, res, next) => {
  try {
    const { commissionRate } = req.body;

    if (commissionRate === undefined || Number(commissionRate) < 0 || Number(commissionRate) > 100) {
      return res.status(400).json({ message: 'Invalid commission rate. Must be between 0 and 100.' });
    }

    let platformSettings = await Settings.findOne({ key: 'marketplace_settings' });
    if (!platformSettings) {
      platformSettings = new Settings({ key: 'marketplace_settings' });
    }

    const oldRate = platformSettings.commissionRate;
    platformSettings.commissionRate = Number(commissionRate);
    await platformSettings.save();

    // Log Action
    await AuditLog.create({
      actor: req.user.id,
      action: 'COMMISSION_CHANGE',
      details: `Changed platform commission rate from ${oldRate}% to ${commissionRate}%`,
      ipAddress: req.ip
    });

    res.status(200).json({ 
      message: `Marketplace commission rate updated to ${commissionRate}%`, 
      commissionRate: platformSettings.commissionRate 
    });
  } catch (error) {
    next(error);
  }
};

// Get Audit Logs
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('actor', 'name email')
      .sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

// Get disputes (Return/Replacement requests)
const getDisputes = async (req, res, next) => {
  try {
    const disputes = await Order.find({ 'returnRequest.status': { $ne: 'None' } })
      .populate('customer', 'name email companyName')
      .populate('vendor', 'name email companyName')
      .sort({ updatedAt: -1 });

    res.status(200).json(disputes);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getVendors,
  approveVendor,
  rejectVendor,
  updateCommission,
  getAuditLogs,
  getDisputes
};
