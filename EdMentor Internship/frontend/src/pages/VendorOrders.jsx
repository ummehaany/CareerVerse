import React, { useState, useEffect } from 'react';
import { backendClient } from '../utils/backendClient';
import { useNotification } from '../context/NotificationContext';
import { FileDown, Truck, Eye, RefreshCw, Send, Check, X, ShieldAlert } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const ORDER_STATUSES = [
  'Order Placed',
  'Accepted',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status updating states
  const [newStatus, setNewStatus] = useState('Accepted');
  const [statusDesc, setStatusDesc] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Return handling states
  const [returnNotes, setReturnNotes] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const { showNotification } = useNotification();

  const fetchOrders = async () => {
    try {
      const data = await backendClient.get('/api/orders');
      setOrders(data || []);
    } catch (error) {
      showNotification('Error fetching vendor orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      const response = await backendClient.put(`/api/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        description: statusDesc
      });
      showNotification(`Order status updated to ${newStatus}`, 'success');
      setStatusDesc('');
      
      // Update local states
      setSelectedOrder(response.order);
      fetchOrders();
    } catch (error) {
      showNotification(error.message || 'Status update failed.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResolveReturn = async (status) => {
    setSubmittingReturn(true);
    try {
      const response = await backendClient.put(`/api/orders/${selectedOrder._id}/return`, {
        status,
        vendorNotes: returnNotes
      });
      showNotification(`Return request has been ${status.toLowerCase()}!`, 'success');
      setReturnNotes('');
      
      setSelectedOrder(response.order);
      fetchOrders();
    } catch (error) {
      showNotification(error.message || 'Error resolving return request.', 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Invoice file not accessible.');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showNotification('Invoice downloaded.', 'success');
    } catch (error) {
      showNotification('Error downloading invoice.', 'error');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main animate-fade-in">
        <header className="dashboard-header">
          <h2 className="dashboard-title">Order Fulfillment Control</h2>
        </header>

        {loading ? (
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="dashboard-content">
            <div className="card text-center" style={{ padding: '3rem' }}>
              <Truck size={40} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
              <h3>No Incoming Orders</h3>
              <p>Customers haven't purchased any of your gift products yet.</p>
            </div>
          </div>
        ) : (
          <div className="dashboard-content orders-container-layout">
            {/* Left list panel */}
            <div className="orders-list-panel">
              {orders.map((order) => (
                <div 
                  key={order._id} 
                  className={`order-list-item card ${selectedOrder?._id === order._id ? 'active' : ''}`}
                  onClick={() => { setSelectedOrder(order); setNewStatus(order.status); }}
                >
                  <div className="order-item-header">
                    <span className="order-id-label">ID: #{order._id.substring(18)}</span>
                    <span className="order-date-label">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="order-item-desc">
                    <span>Client: <strong>{order.customer?.companyName || order.customer?.name}</strong></span>
                    <span>Units: {order.items?.reduce((acc, i) => acc + i.quantity, 0)}</span>
                  </div>
                  <div className="order-item-footer">
                    <span className="order-amount-label">Rs {order.totalAmount.toFixed(2)}</span>
                    <span className={`badge ${
                      order.status === 'Delivered' ? 'badge-success' : 
                      order.status === 'Cancelled' ? 'badge-danger' : 'badge-info'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right details panel */}
            <div className="order-details-panel">
              {selectedOrder ? (
                <div className="order-details-card card animate-fade-in">
                  <div className="details-header">
                    <div>
                      <h3>Manage Fulfillment</h3>
                      <span className="details-uuid">Order ID: #{selectedOrder._id}</span>
                    </div>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleDownloadInvoice(selectedOrder._id)} 
                        className="btn btn-outline btn-sm flex-link"
                      >
                        <FileDown size={14} /> Tax Invoice
                      </button>
                    </div>
                  </div>

                  {/* Client and customized logo */}
                  <div className="grid-2 details-section" style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div>
                      <strong>Corporate Client:</strong>
                      <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                        {selectedOrder.customer?.companyName || selectedOrder.customer?.name}<br />
                        Email: {selectedOrder.customer?.email}
                      </p>
                    </div>
                    {selectedOrder.items && selectedOrder.items[0]?.customizationLogo && (
                      <div className="custom-logo-display">
                        <strong>Requested Logo Branding:</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <img 
                            src={selectedOrder.items[0].customizationLogo} 
                            alt="Branding logo" 
                            style={{ height: '40px', objectFit: 'contain', border: '1px solid var(--border)', background: 'white', padding: '2px', borderRadius: '4px' }} 
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Apply Custom Stamp</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Items purchased */}
                  <div className="details-section">
                    <h4>Products Checklist</h4>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th style={{ textAlign: 'right' }}>Qty</th>
                            <th style={{ textAlign: 'right' }}>Unit Base Price</th>
                            <th style={{ textAlign: 'right' }}>Discount</th>
                            <th style={{ textAlign: 'right' }}>Total (incl. GST)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.product?.name || 'Custom Gifting Item'}</td>
                              <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                              <td style={{ textAlign: 'right' }}>Rs {item.pricePerUnit.toFixed(2)}</td>
                              <td style={{ textAlign: 'right' }}>{item.discountPercentage}%</td>
                              <td style={{ textAlign: 'right' }}>Rs {item.finalPrice.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="details-section">
                    <h4>Shipping Address</h4>
                    {selectedOrder.items && selectedOrder.items[0]?.deliveryAddress ? (
                      <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>
                        {selectedOrder.items[0].deliveryAddress.addressLine1}, {selectedOrder.items[0].deliveryAddress.addressLine2 || ''}<br />
                        {selectedOrder.items[0].deliveryAddress.city}, {selectedOrder.items[0].deliveryAddress.state} - {selectedOrder.items[0].deliveryAddress.postalCode}<br />
                        <strong>Phone:</strong> {selectedOrder.items[0].deliveryAddress.contactNumber}
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>No address assigned.</p>
                    )}
                  </div>

                  {/* Tracking Updates form */}
                  {selectedOrder.status !== 'Cancelled' && (
                    <div className="details-section card" style={{ backgroundColor: '#f8fafc' }}>
                      <h4>Update Tracking Status</h4>
                      <form onSubmit={handleUpdateStatus} style={{ marginTop: '1rem' }}>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Fulfillment Stage</label>
                            <select 
                              className="form-control"
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                            >
                              {ORDER_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group" style={{ flex: 2 }}>
                            <label>Tracking Comments</label>
                            <input 
                              type="text" 
                              className="form-control"
                              placeholder="e.g. Order accepted, sending to printing press..." 
                              value={statusDesc}
                              onChange={(e) => setStatusDesc(e.target.value)}
                            />
                          </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm flex-link" style={{ marginTop: '1rem' }} disabled={updatingStatus}>
                          <Send size={12} /> Log Progress Update
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Dispute return requests */}
                  {selectedOrder.returnRequest && selectedOrder.returnRequest.status === 'Pending' && (
                    <div className="details-section return-management-card card">
                      <div className="alert-dispute-header" style={{ display: 'flex', gap: '8px', color: '#b91c1c', fontWeight: 700, marginBottom: '0.75rem', alignItems: 'center' }}>
                        <ShieldAlert size={18} />
                        <span>Pending Dispute return request</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>
                        <strong>Type:</strong> {selectedOrder.returnRequest.type}<br />
                        <strong>Customer Reason:</strong> {selectedOrder.returnRequest.reason}
                      </p>

                      <div className="form-group">
                        <label>Vendor Resolution Notes</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="Provide explanation of your decision (e.g. refund approved / replacement dispatched)..."
                          value={returnNotes}
                          onChange={(e) => setReturnNotes(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button 
                          type="button" 
                          onClick={() => handleResolveReturn('Approved')} 
                          className="btn btn-accent btn-sm flex-link"
                          disabled={submittingReturn}
                        >
                          <Check size={12} /> Approve Resolution
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleResolveReturn('Rejected')} 
                          className="btn btn-danger btn-sm flex-link"
                          disabled={submittingReturn}
                        >
                          <X size={12} /> Reject Dispute
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedOrder.returnRequest && selectedOrder.returnRequest.status !== 'None' && selectedOrder.returnRequest.status !== 'Pending' && (
                    <div className="details-section card" style={{ backgroundColor: '#f1f5f9' }}>
                      <h4>Return Status Resolved</h4>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Dispute was <strong>{selectedOrder.returnRequest.status}</strong>.<br />
                        <strong>Notes:</strong> {selectedOrder.returnRequest.vendorNotes || 'No notes left.'}
                      </p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="select-order-placeholder card">
                  <Eye size={32} style={{ color: 'var(--text-light)', marginBottom: '0.75rem' }} />
                  <p>Select an incoming order from the list on the left to handle brand logo specifications, log shipments, or mediate disputes.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      <style>{`
        .return-management-card {
          background-color: #fee2e2;
          border-color: #fca5a5;
        }
      `}</style>
    </div>
  );
};

export default VendorOrders;
