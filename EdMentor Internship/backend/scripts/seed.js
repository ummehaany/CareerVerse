const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const Review = require('../models/review');
const Settings = require('../models/settings');
const AuditLog = require('../models/auditLog');
const QuotationRequest = require('../models/quotation');

const seedDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/corporate-gifting';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Settings.deleteMany({});
    await AuditLog.deleteMany({});
    await QuotationRequest.deleteMany({});
    console.log('Cleared existing collections.');

    // Create Settings
    await Settings.create({ key: 'marketplace_settings', commissionRate: 12 });
    console.log('Marketplace commission rate settings created.');

    // Create Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const vendorPassword = await bcrypt.hash('vendor123', salt);
    const customerPassword = await bcrypt.hash('customer123', salt);

    // Admins
    const admin = await User.create({
      name: 'Platform Administrator',
      email: 'admin@marketplace.com',
      password: adminPassword,
      role: 'admin',
      isApproved: true
    });

    // Approved Vendor
    const vendorApproved = await User.create({
      name: 'Premium Gifts Ltd',
      email: 'vendor1@gifts.com',
      password: vendorPassword,
      role: 'vendor',
      companyName: 'Premium Gifts Manufacturing Co.',
      gstNumber: '29AAAAA1111A1Z1',
      isApproved: true,
      ratings: { averageRating: 4.5, numReviews: 2 }
    });

    // Pending Vendor
    const vendorPending = await User.create({
      name: 'Creative Leatherwares',
      email: 'vendor2@leather.com',
      password: vendorPassword,
      role: 'vendor',
      companyName: 'Creative Leather & Co.',
      gstNumber: '27BBBBB2222B2Z2',
      isApproved: false
    });

    // Customers
    const customer1 = await User.create({
      name: 'HR Manager Google',
      email: 'hr@google.com',
      password: customerPassword,
      role: 'customer',
      companyName: 'Google India Pvt Ltd',
      addresses: [
        {
          addressName: 'Bangalore Office',
          addressLine1: 'No 24, RMZ Infinity',
          addressLine2: 'Old Madras Road',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560016',
          country: 'India',
          contactNumber: '9876543210'
        },
        {
          addressName: 'Hyderabad Office',
          addressLine1: 'Survey No 13, Hitec City',
          addressLine2: 'Kondapur',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500081',
          country: 'India',
          contactNumber: '9988776655'
        }
      ]
    });

    const customer2 = await User.create({
      name: 'Procurement Specialist Infosys',
      email: 'procure@infosys.com',
      password: customerPassword,
      role: 'customer',
      companyName: 'Infosys Limited',
      addresses: [
        {
          addressName: 'Pune Phase 2',
          addressLine1: 'Plot No. 24, Hinjawadi',
          addressLine2: 'Phase II',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411057',
          country: 'India',
          contactNumber: '9000100020'
        }
      ]
    });

    console.log('Created Users.');

    // Create Products
    const prod1 = await Product.create({
      name: 'Premium Leather Corporate Diary & Pen Set',
      description: 'An elegant gift set containing a premium faux-leather notebook and a metallic rollerball pen, packaged in a sleek textured gift box. Perfect for welcoming new employees or executive gifting.',
      category: 'Stationery',
      images: [],
      specifications: [
        { key: 'Material', value: 'PU Leather & Stainless Steel' },
        { key: 'Colors Available', value: 'Black, Tan Brown, Navy Blue' },
        { key: 'Branding Option', value: 'Laser Engraving / Debossing' },
        { key: 'Notebook Pages', value: '200 Pages, 80 GSM Ruled' }
      ],
      price: 350.00,
      gstPercentage: 18,
      stockQuantity: 1500,
      moq: 20,
      bulkDiscountSlabs: [
        { minQty: 50, discountPercentage: 5 },
        { minQty: 100, discountPercentage: 10 },
        { minQty: 250, discountPercentage: 15 }
      ],
      vendor: vendorApproved._id,
      averageRating: 4.8,
      numReviews: 1
    });

    const prod2 = await Product.create({
      name: 'Smart Smart-Charging Insulated Tumbler',
      description: 'Temperature-display vacuum insulated beverage tumbler (500ml) with an built-in LED touch screen, made of 304 food-grade stainless steel. Keeps drinks hot for 12 hours or cold for 24 hours.',
      category: 'Drinkware',
      images: [],
      specifications: [
        { key: 'Capacity', value: '500 ml' },
        { key: 'Material', value: 'Double-walled Stainless Steel' },
        { key: 'Smart Tech', value: 'Touch LCD temperature gauge' },
        { key: 'Battery Life', value: 'Non-rechargeable (up to 2 years)' }
      ],
      price: 450.00,
      gstPercentage: 18,
      stockQuantity: 800,
      moq: 15,
      bulkDiscountSlabs: [
        { minQty: 30, discountPercentage: 6 },
        { minQty: 100, discountPercentage: 12 },
        { minQty: 200, discountPercentage: 18 }
      ],
      vendor: vendorApproved._id,
      averageRating: 4.2,
      numReviews: 1
    });

    const prod3 = await Product.create({
      name: 'Sustainable Eco-Friendly Office Desk Organizer',
      description: 'Handcrafted desk organizer made from sustainably sourced premium bamboo. Features a slot for smartphones, business cards, paperclips, and pens.',
      category: 'Desk Accessories',
      images: [],
      specifications: [
        { key: 'Material', value: '100% Natural Bamboo' },
        { key: 'Weight', value: '450g' },
        { key: 'Dimensions', value: '8.5 x 5.2 x 3.1 inches' }
      ],
      price: 280.00,
      gstPercentage: 12,
      stockQuantity: 500,
      moq: 10,
      bulkDiscountSlabs: [
        { minQty: 25, discountPercentage: 4 },
        { minQty: 50, discountPercentage: 8 },
        { minQty: 150, discountPercentage: 12 }
      ],
      vendor: vendorApproved._id,
      averageRating: 0,
      numReviews: 0
    });

    console.log('Created Products.');

    // Create Reviews
    await Review.create({
      reviewer: customer1._id,
      product: prod1._id,
      vendor: vendorApproved._id,
      rating: 5,
      comment: 'Excellent diary set. The leather texture feels very high-end and our company engraving looks perfect!'
    });

    await Review.create({
      reviewer: customer2._id,
      product: prod2._id,
      vendor: vendorApproved._id,
      rating: 4,
      comment: 'The insulation holds temperatures well. Thermometer display is helpful, though the screen is a bit reflective.'
    });

    console.log('Created Reviews.');

    // Create Historic Orders for charts (simulating last 3 months)
    const baseDate = new Date();
    
    // Order 1: Completed, 2 months ago
    const order1Date = new Date();
    order1Date.setMonth(baseDate.getMonth() - 2);
    const order1 = await Order.create({
      customer: customer1._id,
      vendor: vendorApproved._id,
      items: [{
        product: prod1._id,
        quantity: 100, // triggers 10% discount -> price becomes 315.00
        pricePerUnit: 350.00,
        gstPercentage: 18,
        gstAmount: 5670.00, // 31500 * 0.18
        discountPercentage: 10,
        finalPrice: 37170.00, // 31500 + 5670
        customizationLogo: '/uploads/logos/google-logo.png',
        deliveryAddress: customer1.addresses[0]
      }],
      totalAmount: 37170.00,
      gstTotal: 5670.00,
      commissionAmount: 4460.40, // 12% of 37170
      vendorEarnings: 32709.60,
      status: 'Delivered',
      paymentStatus: 'Paid',
      paymentDetails: {
        transactionId: 'TXN-9021839218',
        method: 'Bank Transfer',
        timestamp: order1Date
      },
      trackingDetails: [
        { status: 'Order Placed', timestamp: order1Date, description: 'Order Placed' },
        { status: 'Delivered', timestamp: order1Date, description: 'Delivered successfully' }
      ],
      createdAt: order1Date
    });

    // Order 2: Completed, 1 month ago
    const order2Date = new Date();
    order2Date.setMonth(baseDate.getMonth() - 1);
    await Order.create({
      customer: customer2._id,
      vendor: vendorApproved._id,
      items: [{
        product: prod2._id,
        quantity: 50, // triggers 6% discount -> price: 423.00
        pricePerUnit: 450.00,
        gstPercentage: 18,
        gstAmount: 3807.00, // 21150 * 0.18
        discountPercentage: 6,
        finalPrice: 24957.00,
        customizationLogo: '',
        deliveryAddress: customer2.addresses[0]
      }],
      totalAmount: 24957.00,
      gstTotal: 3807.00,
      commissionAmount: 2994.84, // 12%
      vendorEarnings: 21962.16,
      status: 'Delivered',
      paymentStatus: 'Paid',
      paymentDetails: {
        transactionId: 'TXN-482930489',
        method: 'Net Banking',
        timestamp: order2Date
      },
      trackingDetails: [
        { status: 'Order Placed', timestamp: order2Date, description: 'Order Placed' },
        { status: 'Delivered', timestamp: order2Date, description: 'Delivered successfully' }
      ],
      createdAt: order2Date
    });

    // Order 3: Active Order, placed today
    const order3 = await Order.create({
      customer: customer1._id,
      vendor: vendorApproved._id,
      items: [{
        product: prod1._id,
        quantity: 20, // no discount
        pricePerUnit: 350.00,
        gstPercentage: 18,
        gstAmount: 1260.00, // 7000 * 0.18
        discountPercentage: 0,
        finalPrice: 8260.00,
        customizationLogo: '/uploads/logos/google-logo.png',
        deliveryAddress: customer1.addresses[1]
      }],
      totalAmount: 8260.00,
      gstTotal: 1260.00,
      commissionAmount: 991.20,
      vendorEarnings: 7268.80,
      status: 'Order Placed',
      paymentStatus: 'Paid',
      paymentDetails: {
        transactionId: 'TXN-112348731',
        method: 'Credit Card',
        timestamp: new Date()
      },
      trackingDetails: [
        { status: 'Order Placed', timestamp: new Date(), description: 'Order placed by corporate customer' }
      ],
      createdAt: new Date()
    });

    console.log('Created Seeding Orders.');

    // Create Audit Logs
    await AuditLog.create({
      actor: admin._id,
      action: 'PLATFORM_SEED',
      details: 'Initialized corporate gifting database values.',
      ipAddress: '127.0.0.1'
    });

    await AuditLog.create({
      actor: admin._id,
      action: 'VENDOR_APPROVAL',
      details: `Approved vendor account: ${vendorApproved.name}`,
      ipAddress: '127.0.0.1'
    });

    console.log('Created Audit Logs.');
    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
