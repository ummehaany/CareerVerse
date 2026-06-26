import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { backendClient } from '../utils/backendClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { ShoppingCart, Heart, FileInput, MessageSquareCode, Image as ImageIcon, Send, ArrowLeft } from 'lucide-react';
import StarRating from '../components/StarRating';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wishlistActive, setWishlistActive] = useState(false);
  
  // Customization
  const [customLogoFile, setCustomLogoFile] = useState(null);
  const [customLogoPreview, setCustomLogoPreview] = useState('');
  
  // Quotation Modal
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteQty, setQuoteQty] = useState(1);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Review inputs
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { isAuthenticated, user, isCustomer } = useAuth();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  const fetchProductDetails = async () => {
    try {
      const data = await backendClient.get(`/api/products/${id}`);
      setProduct(data.product);
      setReviews(data.reviews || []);
      setQuantity(data.product.moq || 1);
      setQuoteQty(data.product.moq || 1);
      
      if (data.product.images && data.product.images.length > 0) {
        setActiveImage(data.product.images[0]);
      }
      
      // If user logged in, check wishlist
      if (isAuthenticated && user?.wishlist) {
        setWishlistActive(user.wishlist.includes(id));
      }
    } catch (error) {
      showNotification('Error loading product details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id, isAuthenticated]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomLogoFile(file);
      setCustomLogoPreview(URL.createObjectURL(file));
      showNotification('Custom branding logo uploaded successfully.', 'success');
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      showNotification('Please sign in to add items to your wishlist.', 'warning');
      navigate('/login');
      return;
    }
    try {
      const response = await backendClient.post('/api/auth/wishlist/toggle', { productId: product._id });
      setWishlistActive(!wishlistActive);
      showNotification(response.message, 'success');
    } catch (error) {
      showNotification('Wishlist modification failed.', 'error');
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showNotification('Please sign in to make purchases.', 'warning');
      navigate('/login');
      return;
    }
    if (quantity < product.moq) {
      showNotification(`Order quantity must be at least the MOQ (${product.moq})`, 'error');
      return;
    }

    // Attach customization logo (we can use the preview URL or profile logo)
    const logoUrl = customLogoPreview || user.companyLogo || '';
    addToCart(product, quantity, logoUrl);
    showNotification(`Added ${quantity} units of "${product.name}" to cart.`, 'success');
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (quoteQty < product.moq) {
      showNotification(`Quotation request quantity must be at least ${product.moq}`, 'error');
      return;
    }

    setSubmittingQuote(true);
    try {
      const formData = new FormData();
      formData.append('productId', product._id);
      formData.append('quantity', quoteQty);
      formData.append('customerNotes', quoteNotes);
      if (customLogoFile) {
        formData.append('logo', customLogoFile);
      }

      await backendClient.post('/api/quotations', formData);
      showNotification('Your quotation request has been transmitted to the vendor.', 'success');
      setShowQuoteModal(false);
      setQuoteNotes('');
    } catch (error) {
      showNotification(error.message || 'RFQ submission failed.', 'error');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userComment) {
      showNotification('Please write a review comment.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      await backendClient.post('/api/products/review', {
        productId: product._id,
        rating: userRating,
        comment: userComment
      });
      showNotification('Your product review has been submitted.', 'success');
      setUserComment('');
      fetchProductDetails(); // refresh reviews
    } catch (error) {
      showNotification(error.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="container product-detail-page animate-fade-in">
      <Link to="/" className="back-link-btn flex-link">
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div className="product-details-container">
        {/* Left Column - Gallery & Logo custom preview */}
        <div className="gallery-container">
          {activeImage ? (
            <div className="main-image-wrapper">
              <img src={activeImage} alt={product.name} className="main-image" />
              {/* Overlay customization logo to simulate preview! */}
              {customLogoPreview && (
                <div className="simulated-logo-overlay">
                  <img src={customLogoPreview} alt="Brand Preview" />
                </div>
              )}
            </div>
          ) : (
            <div className="main-image-placeholder">
              <ImageIcon size={64} className="placeholder-icon" />
              <span>No Product Images Uploaded</span>
            </div>
          )}

          {product.images && product.images.length > 1 && (
            <div className="thumbnail-row">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="thumb"
                  className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                />
              ))}
            </div>
          )}

          {/* Logo Customizer widget */}
          {isCustomer && (
            <div className="logo-customizer-card card">
              <h4>Branding & Customization</h4>
              <p>Upload your company brand logo (.png, .jpg) to preview on gifts and request custom branding.</p>
              
              <div className="file-upload-input-box">
                <input
                  type="file"
                  id="logo-picker"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="logo-picker" className="btn btn-outline w-100 flex-link">
                  <FileInput size={16} /> Choose Custom Logo File
                </label>
              </div>

              {customLogoPreview && (
                <div className="custom-logo-uploaded-preview">
                  <span>Logo Loaded:</span>
                  <img src={customLogoPreview} alt="Logo thumb" />
                  <button onClick={() => { setCustomLogoFile(null); setCustomLogoPreview(''); }} className="btn-remove-logo">✕ Remove</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Purchasing details */}
        <div className="details-info-column">
          <span className="info-category-tag">{product.category}</span>
          <h2 className="info-title">{product.name}</h2>
          
          <div className="info-vendor-row">
            <span>Listed by: <strong>{product.vendor?.companyName || product.vendor?.name}</strong></span>
            <div className="vendor-rating">
              <span className="star-text">★</span>
              <span>{product.vendor?.ratings?.averageRating?.toFixed(1) || '0.0'} ({product.vendor?.ratings?.numReviews || 0} reviews)</span>
            </div>
          </div>

          <div className="rating-row" style={{ margin: '0.75rem 0' }}>
            <StarRating rating={product.averageRating} size={16} />
            <span className="reviews-count">({product.numReviews || 0} customer ratings)</span>
          </div>

          <div className="price-card-details">
            <div className="base-price-info">
              <span className="price-num">Rs {product.price.toFixed(2)}</span>
              <span className="price-help-text">Per unit (GST excl.)</span>
            </div>
            <div className="tax-tag-details">
              <span>+ {product.gstPercentage}% GST Applicable</span>
            </div>
          </div>

          <p className="product-desc-text">{product.description}</p>

          {/* Bulk Discount Slabs */}
          {product.bulkDiscountSlabs && product.bulkDiscountSlabs.length > 0 && (
            <div className="slabs-info-card">
              <h4>Volume-based Discounts</h4>
              <table className="discount-slabs-table">
                <thead>
                  <tr>
                    <th>Minimum Quantity</th>
                    <th>Discount Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {product.bulkDiscountSlabs.map((slab, index) => (
                    <tr key={index}>
                      <td>Buy {slab.minQty}+ units</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>{slab.discountPercentage}% Off</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Action Row */}
          {isCustomer && (
            <div className="purchasing-control-card card">
              <div className="control-row">
                <div className="qty-picker">
                  <label>Order Qty</label>
                  <div className="qty-picker-inner">
                    <button onClick={() => setQuantity(Math.max(product.moq, quantity - 1))} className="qty-button">-</button>
                    <input type="number" value={quantity} readOnly />
                    <button onClick={() => setQuantity(quantity + 1)} className="qty-button">+</button>
                  </div>
                </div>
                <div className="moq-disclaimer">
                  <span>Minimum Order Qty (MOQ): <strong>{product.moq}</strong></span>
                  <span>Stock Left: <strong>{product.stockQuantity}</strong> units</span>
                </div>
              </div>

              <div className="action-buttons-grid">
                <button onClick={handleAddToCart} className="btn btn-primary flex-link" style={{ flex: 2 }}>
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button onClick={() => { setQuoteQty(quantity); setShowQuoteModal(true); }} className="btn btn-secondary flex-link" style={{ flex: 1.5 }}>
                  <MessageSquareCode size={18} /> Request RFQ Quote
                </button>
                <button onClick={handleToggleWishlist} className={`btn btn-outline action-wishlist-btn ${wishlistActive ? 'active' : ''}`}>
                  <Heart size={18} fill={wishlistActive ? 'var(--danger)' : 'none'} stroke={wishlistActive ? 'var(--danger)' : 'currentColor'} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Specifications & Review Section */}
      <div className="specs-reviews-tab-container" style={{ marginTop: '4rem' }}>
        <div className="specs-block">
          <h3>Specifications</h3>
          <table className="specs-table">
            <tbody>
              {product.specifications && product.specifications.length > 0 ? (
                product.specifications.map((spec, i) => (
                  <tr key={i}>
                    <td className="spec-key">{spec.key}</td>
                    <td>{spec.value}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ color: 'var(--text-muted)' }}>No specifications provided.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Customer Reviews block */}
        <div className="reviews-block" style={{ marginTop: '3rem' }}>
          <h3>Customer Reviews ({reviews.length})</h3>

          {/* Submit Review Form (Customer only) */}
          {isAuthenticated && isCustomer && (
            <form onSubmit={handleReviewSubmit} className="add-review-form card" style={{ margin: '1.5rem 0' }}>
              <h4>Write a Review</h4>
              <div className="form-group" style={{ margin: '0.75rem 0' }}>
                <label>Overall Rating</label>
                <StarRating rating={userRating} onRatingChange={setUserRating} size={22} />
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Share your experience with this corporate gift product (e.g. quality, material, customization accuracy)..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm flex-link" disabled={submittingReview}>
                <Send size={14} /> Submit Review
              </button>
            </form>
          )}

          <div className="reviews-list" style={{ marginTop: '1.5rem' }}>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reviews listed yet.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="review-item card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
                  <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{rev.reviewer?.companyName || rev.reviewer?.name}</strong>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <StarRating rating={rev.rating} size={14} />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem', color: '#475569' }}>{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RFQ Quotation Modal */}
      {showQuoteModal && (
        <div className="modal-backdrop">
          <div className="modal-content card animate-fade-in">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Request Bulk Custom Quotation</h3>
              <button onClick={() => setShowQuoteModal(false)} className="btn-close-modal">✕</button>
            </div>
            
            <form onSubmit={handleQuoteSubmit}>
              <div className="form-group">
                <label>Product</label>
                <input type="text" className="form-control" value={product.name} readOnly disabled />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    className="form-control"
                    min={product.moq}
                    value={quoteQty}
                    onChange={(e) => setQuoteQty(Number(e.target.value))}
                    required
                  />
                  <small className="help-text">Minimum quantity allowed: {product.moq}</small>
                </div>
                <div className="form-group">
                  <label>Standard Unit Price</label>
                  <input type="text" className="form-control" value={`Rs ${product.price.toFixed(2)}`} readOnly disabled />
                </div>
              </div>

              <div className="form-group">
                <label>Customization Requirements & Specifications</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Specify branding instructions, color mixes, packaging demands, delivery timelines, etc..."
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                />
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setShowQuoteModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary flex-link" disabled={submittingQuote}>
                  <Send size={14} /> Send Quotation Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .product-detail-page {
          padding: 2.5rem 1.5rem;
        }

        .back-link-btn {
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .main-image-wrapper {
          position: relative;
          width: 100%;
          height: 450px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .simulated-logo-overlay {
          position: absolute;
          bottom: 30px;
          right: 30px;
          width: 70px;
          height: 70px;
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px dashed var(--secondary);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .simulated-logo-overlay img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .main-image-placeholder {
          width: 100%;
          height: 450px;
          background-color: #f1f5f9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-light);
          border-radius: var(--radius-md);
          gap: 1rem;
        }

        .details-info-column {
          display: flex;
          flex-direction: column;
        }

        .info-category-tag {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .info-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--primary);
          line-height: 1.2;
          margin-bottom: 0.75rem;
        }

        .info-vendor-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.75rem;
        }

        .vendor-rating {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .star-text {
          color: var(--warning);
          font-size: 1.125rem;
          line-height: 1;
        }

        .price-card-details {
          background-color: #f8fafc;
          padding: 1.25rem;
          border-radius: var(--radius-sm);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1.5rem 0;
          border: 1px dashed var(--border);
        }

        .base-price-info {
          display: flex;
          flex-direction: column;
        }

        .price-num {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
        }

        .price-help-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .tax-tag-details {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success);
          font-size: 0.8125rem;
          font-weight: 600;
          padding: 0.375rem 0.75rem;
          border-radius: 4px;
        }

        .product-desc-text {
          font-size: 0.9375rem;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .purchasing-control-card {
          border-color: var(--border-focus);
          background-color: white;
        }

        .control-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .qty-picker {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .qty-picker label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .qty-picker-inner {
          display: flex;
          align-items: center;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: white;
        }

        .qty-button {
          width: 36px;
          height: 36px;
          border: none;
          background: #f1f5f9;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .qty-button:hover {
          background: #e2e8f0;
        }

        .qty-picker-inner input {
          width: 50px;
          text-align: center;
          border: none;
          outline: none;
          font-weight: 600;
        }

        .moq-disclaimer {
          display: flex;
          flex-direction: column;
          font-size: 0.8125rem;
          text-align: right;
          color: var(--text-muted);
        }

        .action-buttons-grid {
          display: flex;
          gap: 0.75rem;
        }

        .action-wishlist-btn.active {
          background-color: #fee2e2;
          border-color: #fca5a5;
        }

        .file-upload-input-box {
          margin-top: 0.75rem;
        }

        .custom-logo-uploaded-preview {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.75rem;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .custom-logo-uploaded-preview img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: white;
        }

        .btn-remove-logo {
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          font-weight: 500;
          font-size: 0.75rem;
          margin-left: auto;
        }

        /* Modal styling */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          width: 100%;
          max-width: 550px;
          background-color: white;
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-lg);
        }

        .btn-close-modal {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: var(--text-light);
          cursor: pointer;
        }

        .btn-close-modal:hover {
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
