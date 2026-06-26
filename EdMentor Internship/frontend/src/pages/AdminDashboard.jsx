import React, { useState, useEffect } from 'react';
import { backendClient } from '../utils/backendClient';
import { useNotification } from '../context/NotificationContext';
import { DollarSign, ShieldCheck, Activity, Users, Settings as SettingsIcon, Save } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Commission settings state
  const [commissionRate, setCommissionRate] = useState(10);
  const [updatingCommission, setUpdatingCommission] = useState(false);

  const { showNotification } = useNotification();

  const fetchAdminData = async () => {
    try {
      const [analyticsData, logsData] = await Promise.all([
        backendClient.get('/api/admin/analytics'),
        backendClient.get('/api/admin/audit-logs')
      ]);
      setStats(analyticsData);
      setAuditLogs(logsData || []);
      setCommissionRate(analyticsData.commissionRate || 10);
    } catch (error) {
      showNotification('Error loading administration metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateCommission = async (e) => {
    e.preventDefault();
    setUpdatingCommission(true);
    try {
      await backendClient.put('/api/admin/commission', { commissionRate: Number(commissionRate) });
      showNotification(`Marketplace commission rate updated to ${commissionRate}%!`, 'success');
      fetchAdminData(); // refresh to log audit
    } catch (error) {
      showNotification(error.message || 'Error updating platform fee.', 'error');
    } finally {
      setUpdatingCommission(false);
    }
  };

  // Convert monthly stats for pure CSS charts
  const getChartData = () => {
    if (!stats || !stats.monthlySales || stats.monthlySales.length === 0) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const maxSales = Math.max(...stats.monthlySales.map(m => m.sales), 1000);

    return stats.monthlySales.map(item => {
      const label = `${months[item._id.month - 1]} ${item._id.year.toString().substring(2)}`;
      return {
        label,
        value: item.sales,
        heightPercent: Math.max((item.sales / maxSales) * 100, 5)
      };
    });
  };

  const chartData = getChartData();

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main animate-fade-in">
        <header className="dashboard-header">
          <h2 className="dashboard-title">Platform Overview & Command Center</h2>
          <div className="user-profile-menu">
            <span>Role: <strong style={{ color: 'var(--danger)' }}>Platform Admin</strong></span>
          </div>
        </header>

        {loading ? (
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="dashboard-content">
            {/* Analytics tiles */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-info">
                  <span className="metric-label">Gross Platform Sales</span>
                  <span className="metric-value">Rs {stats?.salesStats?.totalSales?.toFixed(0) || '0'}</span>
                </div>
                <div className="metric-icon-box" style={{ backgroundColor: '#e0e7ff', color: 'var(--secondary)' }}>
                  <DollarSign size={20} />
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-info">
                  <span className="metric-label">Commission Pool</span>
                  <span className="metric-value" style={{ color: 'var(--success)' }}>
                    Rs {stats?.salesStats?.totalCommission?.toFixed(0) || '0'}
                  </span>
                </div>
                <div className="metric-icon-box" style={{ backgroundColor: '#d1fae5', color: 'var(--accent)' }}>
                  <ShieldCheck size={20} />
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-info">
                  <span className="metric-label">Dispute Backlog</span>
                  <span className="metric-value" style={{ color: stats?.totalDisputes > 0 ? 'var(--danger)' : 'inherit' }}>
                    {stats?.totalDisputes || '0'}
                  </span>
                </div>
                <div className="metric-icon-box" style={{ backgroundColor: '#fee2e2', color: 'var(--danger)' }}>
                  <Activity size={20} />
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-info">
                  <span className="metric-label">Corporate Clients</span>
                  <span className="metric-value">{stats?.usersCounts?.customer || '0'}</span>
                </div>
                <div className="metric-icon-box" style={{ backgroundColor: '#dbeafe', color: 'var(--info)' }}>
                  <Users size={20} />
                </div>
              </div>
            </div>

            {/* Sales Chart Section */}
            <div className="chart-container">
              <h3 className="chart-title">Gross Monthly Sales volumes</h3>
              {chartData.length > 0 ? (
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
              ) : (
                <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>No historical sales logs found for bar charts.</p>
              )}
            </div>

            {/* Panel grids: Settings, Audit logs, Recent orders */}
            <div className="panel-grid">
              
              {/* Audit logs & Platform Settings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Settings Panel */}
                <div className="panel-card card">
                  <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.25rem' }}>
                    <SettingsIcon size={18} /> Platform Configuration
                  </h3>
                  <form onSubmit={handleUpdateCommission}>
                    <div className="form-group">
                      <label>Global Marketplace Commission Rate (%)</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="number"
                          className="form-control"
                          value={commissionRate}
                          onChange={(e) => setCommissionRate(e.target.value)}
                          min={0}
                          max={100}
                          required
                          style={{ width: '120px' }}
                        />
                        <button type="submit" className="btn btn-primary flex-link" disabled={updatingCommission}>
                          <Save size={14} /> Update Rate
                        </button>
                      </div>
                      <small className="help-text" style={{ marginTop: '4px', display: 'block', color: 'var(--text-muted)' }}>
                        Platform commission fees are auto-deducted from gross vendor checkout totals.
                      </small>
                    </div>
                  </form>
                </div>

                {/* Audit Logs list */}
                <div className="panel-card card" style={{ flex: 1 }}>
                  <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Platform Audit Stream</h3>
                  <div className="audit-list" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                    {auditLogs.map((log) => (
                      <div key={log._id} className={`audit-item ${log.action}`}>
                        <div className="audit-meta">
                          <span>{log.actor?.name || 'System Admin'}</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <span className="audit-desc">{log.details}</span>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <p style={{ color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.8125rem' }}>No audit actions logged yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Orders table */}
              <div className="panel-card card" style={{ height: 'fit-content' }}>
                <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Global Sales Stream</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Net Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentOrders?.map((o) => (
                        <tr key={o._id}>
                          <td>#{o._id.substring(18)}</td>
                          <td>{o.customer?.companyName || o.customer?.name}</td>
                          <td>Rs {o.totalAmount.toFixed(0)}</td>
                          <td>
                            <span className={`badge ${
                              o.status === 'Delivered' ? 'badge-success' : 
                              o.status === 'Cancelled' ? 'badge-danger' : 'badge-info'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No global transactions recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
