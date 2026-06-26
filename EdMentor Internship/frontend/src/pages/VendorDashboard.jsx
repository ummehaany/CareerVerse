import React, { useState, useEffect } from 'react';
import { backendClient } from '../utils/backendClient';
import { useNotification } from '../context/NotificationContext';
import { DollarSign, ShoppingBag, Truck, Percent, FileClock, HelpCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const VendorDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { showNotification } = useNotification();

  const fetchDashboardData = async () => {
    try {
      const [ordersList, productsList, quotesList] = await Promise.all([
        backendClient.get('/api/orders'),
        backendClient.get('/api/products?limit=100'), // fetch their products
        backendClient.get('/api/quotations')
      ]);

      // Note: Backend filters orders by logged-in user role, so ordersList contains only this vendor's orders
      setOrders(ordersList || []);
      
      // Filter products by vendor ID (client-side fallback filter, though backend product listing is public)
      const savedUser = JSON.parse(localStorage.getItem('user'));
      const vendorProds = (productsList.products || []).filter(p => {
        const vId = p.vendor?._id || p.vendor;
        return vId === savedUser.id;
      });
      setProducts(vendorProds);
      setQuotes(quotesList || []);
    } catch (error) {
      showNotification('Error loading dashboard analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute Metrics
  const nonCancelledOrders = orders.filter(o => o.status !== 'Cancelled');
  const grossSales = nonCancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCommission = nonCancelledOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const netEarnings = nonCancelledOrders.reduce((sum, o) => sum + o.vendorEarnings, 0);
  const activeOrdersCount = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
  
  // Aggregate Monthly Sales for pure CSS charts
  const getMonthlyChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesMap = {};
    
    // Initialize past 5 months + current month
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentDate.getMonth() - i);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      salesMap[key] = 0;
    }

    nonCancelledOrders.forEach(o => {
      const date = new Date(o.createdAt);
      const key = `${months[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`;
      if (salesMap[key] !== undefined) {
        salesMap[key] += o.totalAmount;
      }
    });

    const maxSales = Math.max(...Object.values(salesMap), 1000);

    return Object.entries(salesMap).map(([label, val]) => ({
      label,
      value: val,
      heightPercent: Math.max((val / maxSales) * 100, 5) // ensure at least a small bar is visible if value > 0
    }));
  };

  const chartData = getMonthlyChartData();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="dashboard-main animate-fade-in">
        <header className="dashboard-header">
          <h2 className="dashboard-title">Vendor Overview & Performance</h2>
          <div className="user-profile-menu">
            <span>Role: <strong style={{ color: 'var(--secondary)' }}>Approved Vendor</strong></span>
          </div>
        </header>

        {loading ? (
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="dashboard-content">
            {/* Metrics cards grid */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-info">
                  <span className="metric-label">Gross Sales</span>
                  <span className="metric-value">Rs {grossSales.toFixed(0)}</span>
                </div>
                <div className="metric-icon-box" style={{ backgroundColor: '#e0e7ff', color: 'var(--secondary)' }}>
                  <DollarSign size={20} />
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-info">
                  <span className="metric-label">Platform Fee</span>
                  <span className="metric-value">Rs {totalCommission.toFixed(0)}</span>
                </div>
                <div className="metric-icon-box" style={{ backgroundColor: '#fee2e2', color: 'var(--danger)' }}>
                  <Percent size={20} />
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-info">
                  <span className="metric-label">Net Earnings</span>
                  <span className="metric-value" style={{ color: 'var(--accent)' }}>Rs {netEarnings.toFixed(0)}</span>
                </div>
                <div className="metric-icon-box" style={{ backgroundColor: '#d1fae5', color: 'var(--accent)' }}>
                  <DollarSign size={20} />
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-info">
                  <span className="metric-label">Active Orders</span>
                  <span className="metric-value">{activeOrdersCount}</span>
                </div>
                <div className="metric-icon-box" style={{ backgroundColor: '#dbeafe', color: 'var(--info)' }}>
                  <Truck size={20} />
                </div>
              </div>
            </div>

            {/* Sales Chart Section */}
            <div className="chart-container">
              <h3 className="chart-title">Revenue Statistics (Past 6 Months)</h3>
              <div className="bar-chart-css">
                {chartData.map((bar, i) => (
                  <div key={i} className="chart-bar-wrapper">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${bar.heightPercent}%` }}
                    >
                      <span className="chart-bar-tooltip">Rs {bar.value.toFixed(0)}</span>
                    </div>
                    <span className="chart-label">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Lists */}
            <div className="panel-grid">
              {/* Recent Orders Table */}
              <div className="panel-card">
                <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Fulfillment Requests</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Client</th>
                        <th>Revenue</th>
                        <th>Status</th>
                        <th>Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o._id}>
                          <td>#{o._id.substring(18)}</td>
                          <td>{o.customer?.companyName || o.customer?.name}</td>
                          <td>Rs {o.totalAmount.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${
                              o.status === 'Delivered' ? 'badge-success' : 
                              o.status === 'Cancelled' ? 'badge-danger' : 'badge-info'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            No orders placed with your shop yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quotations and Products Summary Panel */}
              <div className="panel-card">
                <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Operational Summary</h3>
                <div className="summary-list-vertical" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="summary-list-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShoppingBag size={18} style={{ color: 'var(--text-muted)' }} />
                      <span>Total Products Listed</span>
                    </div>
                    <strong style={{ fontSize: '1.125rem' }}>{products.length}</strong>
                  </div>
                  <div className="summary-list-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileClock size={18} style={{ color: 'var(--text-muted)' }} />
                      <span>Pending RFQ Quotes</span>
                    </div>
                    <strong style={{ fontSize: '1.125rem', color: 'var(--warning)' }}>
                      {quotes.filter(q => q.status === 'Pending').length}
                    </strong>
                  </div>
                  <div className="summary-list-item" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Percent size={18} style={{ color: 'var(--text-muted)' }} />
                      <span>Platform Commission Rate</span>
                    </div>
                    <strong style={{ fontSize: '1.125rem' }}>12%</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default VendorDashboard;
