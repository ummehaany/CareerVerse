import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, FileText } from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar-wrapper">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏢</span>
          <span className="logo-text">EdMentor <span className="logo-accent">B2B</span></span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-item">Marketplace</Link>
          
          {isAuthenticated && user?.role === 'customer' && (
            <>
              <Link to="/quotes" className="nav-item flex-link"><FileText size={16} /> RFQ Quotes</Link>
              <Link to="/orders" className="nav-item flex-link">My Orders</Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-nav-group">
              {/* Display Dashboard link depending on role */}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="btn btn-outline btn-sm flex-link">
                  <LayoutDashboard size={16} /> Admin Panel
                </Link>
              )}
              {user.role === 'vendor' && (
                <Link to="/vendor/dashboard" className="btn btn-outline btn-sm flex-link">
                  <LayoutDashboard size={16} /> Vendor Panel
                </Link>
              )}

              {/* Wishlist and Cart for Customer */}
              {user.role === 'customer' && (
                <>
                  <Link to="/wishlist" className="action-icon-btn" title="Wishlist">
                    <Heart size={20} />
                  </Link>
                  <Link to="/cart" className="action-icon-btn cart-bubble-btn" title="Cart">
                    <ShoppingCart size={20} />
                    {cartItems.length > 0 && (
                      <span className="cart-badge">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
                    )}
                  </Link>
                </>
              )}

              {/* Profile Card & Custom Logo */}
              <Link to={user.role === 'vendor' ? '/vendor/profile' : '/profile'} className="user-profile-summary">
                {user.companyLogo ? (
                  <img src={user.companyLogo} alt="Logo" className="nav-company-logo" />
                ) : (
                  <div className="nav-user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="profile-details-nav">
                  <span className="profile-name">{user.name}</span>
                  <span className="profile-company">{user.companyName || user.role}</span>
                </div>
              </Link>

              <button onClick={handleLogout} className="action-icon-btn logout-btn" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="auth-btn-group">
              <Link to="/login" className="btn btn-outline">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar-wrapper {
          height: 70px;
          background-color: var(--surface);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-inner {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .logo-icon {
          font-size: 1.5rem;
        }

        .logo-text {
          font-weight: 800;
          font-size: 1.25rem;
          color: var(--primary);
          letter-spacing: -0.02em;
        }

        .logo-accent {
          color: var(--secondary);
        }

        .navbar-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .nav-item {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .nav-item:hover {
          color: var(--primary);
        }

        .flex-link {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
        }

        .user-nav-group {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .auth-btn-group {
          display: flex;
          gap: 0.75rem;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
        }

        .action-icon-btn {
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color var(--transition-fast);
          padding: 6px;
          border-radius: 50%;
        }

        .action-icon-btn:hover {
          color: var(--secondary);
          background-color: #f1f5f9;
        }

        .cart-bubble-btn {
          position: relative;
        }

        .cart-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background-color: var(--danger);
          color: white;
          font-size: 0.6875rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--surface);
        }

        .user-profile-summary {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 4px 8px;
          border-radius: 30px;
          transition: background-color var(--transition-fast);
        }

        .user-profile-summary:hover {
          background-color: #f1f5f9;
        }

        .nav-company-logo {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border);
        }

        .nav-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--secondary);
          color: white;
          font-weight: bold;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-details-nav {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .profile-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .profile-company {
          font-size: 0.6875rem;
          color: var(--text-muted);
        }

        .logout-btn:hover {
          color: var(--danger) !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
