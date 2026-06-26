import React, { useState } from 'react';
import { useNavigate, Link } from 'react-pointer-router'; // Wait, let's use standard react-router-dom!
import { useNavigate as useNav, Link as RouterLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { backendClient } from '../utils/backendClient';
import { Trash2, ShoppingBag, MapPin, CreditCard, ChevronRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, assignAddress, clearCart, getCartTotals } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNav();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('Credit Card');

  const { items, subtotal, discountTotal, gstTotal, grandTotal, totalItems } = getCartTotals();

  const handleCheckout = async () => {
    // Validate that all items have shipping addresses
    const missingAddress = items.some(item => !item.deliveryAddress);
    if (missingAddress) {
      showNotification('Please assign a delivery shipping address for all items.', 'error');
      return;
    }

    setCheckoutLoading(true);
    try {
      // Structure checkout payload
      const orderPayload = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          customizationLogo: item.customizationLogo,
          deliveryAddress: item.deliveryAddress
        }))
      };

      await backendClient.post('/api/orders', orderPayload);
      showNotification('Corporate purchase completed successfully! Invoices generated.', 'success');
      clearCart();
      navigate('/orders');
    } catch (error) {
      showNotification(error.message || 'Checkout failed. Please review stock and retry.', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container empty-cart-container animate-fade-in">
        <div className="empty-cart-card card">
          <ShoppingBag size={48} className="empty-icon" />
          <h2>Your Cart is Empty</h2>
          <p>Browse the EdMentor marketplace to source premium gifts and custom corporate stationery.</p>
          <RouterLink to="/" className="btn btn-primary">
            Start Sourcing Products
          </RouterLink>
        </div>
        <style>{`
          .empty-cart-container {
            padding: 4rem 1.5rem;
            display: flex;
            justify-content: center;
          }
          .empty-cart-card {
            text-align: center;
            max-width: 480px;
            padding: 3rem;
          }
          .empty-icon {
            color: var(--text-light);
            margin-bottom: 1.5rem;
            margin-left: auto;
            margin-right: auto;
            display: block;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container cart-page-wrapper animate-fade-in">
      <h2>Shopping Cart ({totalItems} items)</h2>
      
      <div className="cart-layout">
        {/* Left Column: Cart items with multi-address selector */}
        <div className="cart-items-column">
          {items.map((item) => (
            <div key={item.id} className="cart-item card">
              <img src={item.image} alt={item.name} className="cart-item-img" />
              
              <div className="cart-item-details">
                <div className="cart-item-meta">
                  <div>
                    <h3 className="cart-item-title">{item.name}</h3>
                    <span className="cart-item-unit-price">
                      Unit price: Rs {item.price.toFixed(2)} (excl. GST)
                    </span>
                  </div>
                  <button 
                    onClick={() => { removeFromCart(item.id); showNotification(`Removed "${item.name}"`, 'info'); }} 
                    className="btn-delete-item"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="cart-item-calculations">
                  {item.discountPercentage > 0 && (
                    <span className="badge badge-success" style={{ marginBottom: '8px', alignSelf: 'flex-start' }}>
                      {item.discountPercentage}% Volume Discount Applied!
                    </span>
                  )}
                  <span className="cart-item-pricing-summary">
                    Subtotal: Rs {(item.price * item.quantity).toFixed(2)} 
                    {item.discountValue > 0 && ` - Discount: Rs ${item.discountValue.toFixed(2)}`}
                    {` + GST (${item.gstPercentage}%): Rs ${((item.price * item.quantity - item.discountValue) * (item.gstPercentage / 100)).toFixed(2)}`}
                  </span>
                </div>

                {/* Multi-address mapping */}
                <div className="cart-item-address-selector">
                  <div className="address-header-row">
                    <MapPin size={16} className="address-icon" />
                    <span>Assign Delivery Address:</span>
                  </div>
                  {user?.addresses && user.addresses.length > 0 ? (
                    <select
                      className="form-control address-select-dropdown"
                      value={item.deliveryAddress ? JSON.stringify(item.deliveryAddress) : ''}
                      onChange={(e) => {
                        const addr = e.target.value ? JSON.parse(e.target.value) : null;
                        assignAddress(item.id, addr);
                      }}
                    >
                      <option value="">-- Choose Shipping Address --</option>
                      {user.addresses.map((addr) => (
                        <option key={addr._id} value={JSON.stringify(addr)}>
                          {addr.addressName} ({addr.city}, {addr.state})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="no-addresses-alert">
                      <span>No registered company addresses.</span>
                      <RouterLink to="/profile" className="profile-link-address">Add Address in Profile</RouterLink>
                    </div>
                  )}
                </div>

                <div className="qty-controls">
                  <span className="qty-label">Qty:</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn">-</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn">+</button>
                  <small className="moq-hint">(MOQ: {item.moq})</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Checkout Billing summary */}
        <div className="cart-summary-column">
          <div className="billing-summary-card card">
            <h3>Billing Summary</h3>
            <div className="summary-row">
              <span>Gross Subtotal</span>
              <span>Rs {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row text-success">
              <span>Volume Discounts</span>
              <span>- Rs {discountTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>GST Taxes</span>
              <span>+ Rs {gstTotal.toFixed(2)}</span>
            </div>
            <hr className="summary-divider" />
            <div className="summary-row grand-total-row">
              <span>Grand Total</span>
              <span>Rs {grandTotal.toFixed(2)}</span>
            </div>

            {/* Payment simulation selection */}
            <div className="payment-select-section">
              <h4>Select Payment Method</h4>
              <div className="payment-options">
                {['Credit Card', 'Bank Transfer', 'Corporate Credit Account'].map((method) => (
                  <label key={method} className={`payment-option-label ${selectedPayment === method ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="payment-method" 
                      value={method} 
                      checked={selectedPayment === method} 
                      onChange={(e) => setSelectedPayment(e.target.value)} 
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={checkoutLoading} 
              className="btn btn-primary w-100 checkout-btn flex-link"
            >
              <CreditCard size={18} /> {checkoutLoading ? 'Processing Checkout...' : 'Place Corporate Order'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .cart-page-wrapper {
          padding: 2.5rem 1.5rem;
        }

        .cart-page-wrapper h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
        }

        .cart-item {
          margin-bottom: 1.5rem;
        }

        .btn-delete-item {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          transition: color var(--transition-fast);
          padding: 4px;
        }

        .btn-delete-item:hover {
          color: var(--danger);
        }

        .cart-item-title {
          font-size: 1.0625rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .cart-item-unit-price {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .cart-item-calculations {
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
        }

        .cart-item-pricing-summary {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .cart-item-address-selector {
          background-color: #f8fafc;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          margin-top: 1rem;
          margin-bottom: 1rem;
          border: 1px solid var(--border);
        }

        .address-header-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.5rem;
        }

        .address-icon {
          color: var(--secondary);
        }

        .address-select-dropdown {
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
        }

        .no-addresses-alert {
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
          color: var(--danger);
          align-items: center;
        }

        .profile-link-address {
          color: var(--secondary);
          font-weight: 600;
        }

        .qty-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .qty-value {
          font-weight: 700;
          font-size: 0.9375rem;
          width: 30px;
          text-align: center;
        }

        .moq-hint {
          font-size: 0.75rem;
          color: var(--text-light);
        }

        /* Billing Summary Card */
        .billing-summary-card h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9375rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }

        .text-success {
          color: var(--success) !important;
        }

        .summary-divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: 1rem 0;
        }

        .grand-total-row {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1.5rem;
        }

        .payment-select-section {
          margin-bottom: 1.5rem;
        }

        .payment-select-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.75rem;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .payment-option-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.625rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .payment-option-label:hover {
          background-color: #f8fafc;
        }

        .payment-option-label.active {
          border-color: var(--secondary);
          background-color: rgba(99, 102, 241, 0.04);
        }

        .checkout-btn {
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Cart;
