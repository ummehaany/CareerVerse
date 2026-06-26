const Product = require('../models/product');
const Review = require('../models/review');
const User = require('../models/user');

// Get all products (Public with filters, sorting, search, pagination)
const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, minMoq, sortBy, page = 1, limit = 12 } = req.query;

    const query = {};

    // Filters
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$text = { $search: search };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minMoq) {
      query.moq = { $lte: Number(minMoq) };
    }

    // Sorting
    let sortOptions = {};
    if (sortBy === 'price_asc') sortOptions.price = 1;
    else if (sortBy === 'price_desc') sortOptions.price = -1;
    else if (sortBy === 'rating') sortOptions.averageRating = -1;
    else sortOptions.createdAt = -1; // Default: newest first

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate('vendor', 'name companyName ratings')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / Number(limit)),
      totalProducts
    });
  } catch (error) {
    next(error);
  }
};

// Get single product details
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('vendor', 'name companyName ratings isApproved');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch reviews for this product
    const reviews = await Review.find({ product: id }).populate('reviewer', 'name companyName');

    res.status(200).json({ product, reviews });
  } catch (error) {
    next(error);
  }
};

// Create product (Approved Vendors)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, gstPercentage, stockQuantity, moq, bulkDiscountSlabs, specifications, productLink } = req.body;

    // Check if the slabs is string (because of multipart form data) and parse it
    let parsedSlabs = [];
    if (bulkDiscountSlabs) {
      parsedSlabs = typeof bulkDiscountSlabs === 'string' ? JSON.parse(bulkDiscountSlabs) : bulkDiscountSlabs;
    }

    let parsedSpecs = [];
    if (specifications) {
      parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
    }

    // Get images
    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        imagePaths.push(`/uploads/products/${file.filename}`);
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price: Number(price),
      gstPercentage: Number(gstPercentage || 18),
      stockQuantity: Number(stockQuantity || 0),
      moq: Number(moq || 1),
      bulkDiscountSlabs: parsedSlabs,
      specifications: parsedSpecs,
      images: imagePaths,
      vendor: req.user.id,
      productLink
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    next(error);
  }
};

// Update product
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only product vendor or admin can edit
    if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    const { name, description, category, price, gstPercentage, stockQuantity, moq, bulkDiscountSlabs, specifications, productLink, deleteImages } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price) product.price = Number(price);
    if (gstPercentage) product.gstPercentage = Number(gstPercentage);
    if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
    if (moq) product.moq = Number(moq);
    if (productLink !== undefined) product.productLink = productLink;

    if (bulkDiscountSlabs) {
      product.bulkDiscountSlabs = typeof bulkDiscountSlabs === 'string' ? JSON.parse(bulkDiscountSlabs) : bulkDiscountSlabs;
    }
    if (specifications) {
      product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
    }

    // Handle image deletions
    let parsedDeleteImages = [];
    if (deleteImages) {
      parsedDeleteImages = typeof deleteImages === 'string' ? JSON.parse(deleteImages) : deleteImages;
      product.images = product.images.filter(img => !parsedDeleteImages.includes(img));
    }

    // Handle new uploads
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        product.images.push(`/uploads/products/${file.filename}`);
      });
    }

    await product.save();
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    next(error);
  }
};

// Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Submit product / vendor review (Customer only)
const submitReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const customerId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    let review = await Review.findOne({ reviewer: customerId, product: productId });

    if (review) {
      review.rating = Number(rating);
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        reviewer: customerId,
        product: productId,
        vendor: product.vendor,
        rating: Number(rating),
        comment
      });
    }

    // Recalculate Product Ratings
    const productReviews = await Review.find({ product: productId });
    const totalProdRating = productReviews.reduce((sum, rev) => sum + rev.rating, 0);
    product.averageRating = totalProdRating / productReviews.length;
    product.numReviews = productReviews.length;
    await product.save();

    // Recalculate Vendor Ratings
    const vendorReviews = await Review.find({ vendor: product.vendor });
    const totalVendRating = vendorReviews.reduce((sum, rev) => sum + rev.rating, 0);
    
    await User.findByIdAndUpdate(product.vendor, {
      'ratings.averageRating': totalVendRating / vendorReviews.length,
      'ratings.numReviews': vendorReviews.length
    });

    res.status(200).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  submitReview
};
