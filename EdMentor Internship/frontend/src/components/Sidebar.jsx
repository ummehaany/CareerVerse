import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Truck, 
  FileText, 
  UserCheck, 
  AlertOctagon, 
  Sliders, 
  Briefcase,
  ChevronLeft,
  Store
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const isVendor = user?.role === 'vendor';
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <Store size={22} className="header-icon" />
        <span className="sidebar-logo-text">
          {isVendor ? 'Vendor Portal' : 'Admin Panel'}
        </span>
      </div>

      <ul className="sidebar-menu">
        {/* Vendor Menu */}
        {isVendor && (
          <>
            <li className="sidebar-menu-item">
              <NavLink 
                to="/vendor/dashboard" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li className="sidebar-menu-item">
              <NavLink 
                to="/vendor/products" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <ShoppingBag size={18} />
                <span>My Products</span>
              </NavLink>
            </li>
            <li className="sidebar-menu-item">
              <NavLink 
                to="/vendor/orders" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Truck size={18} />
                <span>Orders</span>
              </NavLink>
            </li>
            <li className="sidebar-menu-item">
              <NavLink 
                to="/vendor/quotes" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <FileText size={18} />
                <span>RFQ Quotes</span>
              </NavLink>
            </li>
            <li className="sidebar-menu-item">
              <NavLink 
                to="/vendor/profile" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Briefcase size={18} />
                <span>GST & Profile</span>
              </NavLink>
            </li>
          </>
        )}

        {/* Admin Menu */}
        {isAdmin && (
          <>
            <li className="sidebar-menu-item">
              <NavLink 
                to="/admin/dashboard" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Overview Analytics</span>
              </NavLink>
            </li>
            <li className="sidebar-menu-item">
              <NavLink 
                to="/admin/vendors" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <UserCheck size={18} />
                <span>Approve Vendors</span>
              </NavLink>
            </li>
            <li className="sidebar-menu-item">
              <NavLink 
                to="/admin/disputes" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <AlertOctagon size={18} />
                <span>Disputes & Returns</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="sidebar-footer-link-box">
        <NavLink to="/" className="sidebar-back-link">
          <ChevronLeft size={16} />
          <span>Back to Marketplace</span>
        </NavLink>
      </div>

      <style>{`
        .sidebar-header .header-icon {
          color: var(--secondary);
        }

        .sidebar-footer-link-box {
          padding: 1.5rem;
          border-top: 1px solid var(--primary-light);
        }

        .sidebar-back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: #94a3b8;
          font-weight: 500;
          transition: color var(--transition-fast);
        }

        .sidebar-back-link:hover {
          color: white;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
