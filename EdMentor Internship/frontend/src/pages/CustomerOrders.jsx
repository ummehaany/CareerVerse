import React, { useState, useEffect } from 'react';
import { backendClient } from '../utils/backendClient';
import { useNotification } from '../context/NotificationContext';
import { FileDown, HelpCircle, Package, ArrowRight, RefreshCw, Send } from 'lucide-react';

const ORDER_STATUS_STEPS = [
  'Order Placed',
  'Accepted',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Return request form
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnType, setReturnType] = useState('Return'); // 'Return' or 'Replacement'
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const { showNotification } = useNotification();

  const fetchOrders = async () => {
    try {
      const data = await backendClient.get('/api/orders');
      setOrders(data);
    } catch (error) {
      showNotification('Error fetching order history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Invoice file not ready or accessible.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showNotification('Invoice PDF download initiated.', 'success');
    } catch (error) {
      showNotification(error.message || 'Invoice download failed.', 'error');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnReason) {
      showNotification('Please enter a reason for the return/replacement.', 'error');
      return;
    }

    setSubmittingReturn(true);
    try {
      const response = await backendClient.post(`/api/orders/${selectedOrder._id}/return`, {
        reason: returnReason,
        type: returnType
      });
      showNotification(response.message || 'Return request submitted.', 'success');
      setShowReturnForm(false);
      setReturnReason('');
      
      // Update selected order view
      setSelectedOrder(response.order);
      fetchOrders(); // refresh lists
    } catch (error) {
      showNotification(error.message || 'Failed to submit return request.', 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getStepIndex = (status) => {
    return ORDER_STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="container orders-page animate-fade-in">
      <h2>My Order History</h2>

      {loading ? (
        <div className="spinner-wrapper">
          <div className="spinner"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <Package size={40} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3>No Orders Placed Yet</h3>
          <p>You haven't checked out any orders on this account yet.</p>
        </div>
      ) : (
        <div className="orders-container-layout">
          {/* Left panel: list of orders */}
          <div className="orders-list-panel">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className={`order-list-item card ${selectedOrder?._id === order._id ? 'active' : ''}`}
                onClick={() => { setSelectedOrder(order); setShowReturnForm(false); }}
              >
                <div className="order-item-header">
                  <span className="order-id-label">ID: #{order._id.substring(18)}</span>
                  <span className="order-date-label">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="order-item-desc">
                  <span>Vendor: <strong>{order.vendor?.companyName || order.vendor?.name}</strong></span>
                  <span>Items Count: {order.items?.reduce((acc, i) => acc + i.quantity, 0)} units</span>
                </div>
                <div className="order-item-footer">
                  <span className="order-amount-label">Rs {order.totalAmount.toFixed(2)}</span>
                  <span className={`badge ${order.status === 'Delivered' ? 'badge-success' : order.status === 'Cancelled' ? 'badge-danger' : 'badge-info'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right panel: details of selected order */}
          <div className="order-details-panel">
            {selectedOrder ? (
              <div className="order-details-card card animate-fade-in">
                <div className="details-header">
                  <div>
                    <h3>Order Details</h3>
                    <span className="details-uuid">Order ID: #{selectedOrder._id}</span>
                  </div>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleDownloadInvoice(selectedOrder._id)} 
                      className="btn btn-outline btn-sm flex-link"
                      title="Download Invoice PDF"
                    >
                      <FileDown size={14} /> Invoice PDF
                    </button>
                  </div>
                </div>

                {/* Status stepper tracker */}
                {selectedOrder.status !== 'Cancelled' && (
                  <div className="tracker-card card">
                    <h4>Delivery Progress</h4>
                    <div className="stepper-container">
                      <div 
                        className="stepper-progress" 
                        style={{ width: `${(getStepIndex(selectedOrder.status) / (ORDER_STATUS_STEPS.length - 1)) * 100}%` }}
                      ></div>
                      {ORDER_STATUS_STEPS.map((step, idx) => {
                        const isCompleted = getStepIndex(selectedOrder.status) >= idx;
                        const isActive = selectedOrder.status === step;
                        return (
                          <div key={step} className={`step-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                            <div className="step-circle">{idx + 1}</div>
                            <span className="step-label">{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="details-section">
                  <h4>Items Summary</h4>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Item Description</th>
                          <th style={{ textAlign: 'right' }}>Qty</th>
                          <th style={{ textAlign: 'right' }}>Price (excl. GST)</th>
                          <th style={{ textAlign: 'right' }}>Discount</th>
                          <th style={{ textAlign: 'right' }}>Final Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="order-item-info">
                                <strong>{item.product?.name || 'Custom Gift'}</strong>
                                {item.customizationLogo && (
                                  <span className="custom-logo-indicator">✓ Customized Branding</span>
                                )}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right' }}>Rs {item.pricePerUnit.toFixed(2)}</td>
                            <td style={{ textAlign: 'right' }} className="text-success">{item.discountPercentage}%</td>
                            <td style={{ textAlign: 'right' }}>Rs {item.finalPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Shipping & Payment details */}
                <div className="grid-2 details-section">
                  <div className="shipping-details-box">
                    <h4>Delivery Mapping</h4>
                    {selectedOrder.items && selectedOrder.items[0]?.deliveryAddress ? (
                      <p className="address-text">
                        <strong>Address:</strong> {selectedOrder.items[0].deliveryAddress.addressLine1}, {selectedOrder.items[0].deliveryAddress.addressLine2 || ''}<br />
                        {selectedOrder.items[0].deliveryAddress.city}, {selectedOrder.items[0].deliveryAddress.state} - {selectedOrder.items[0].deliveryAddress.postalCode}<br />
                        <strong>Phone:</strong> {selectedOrder.items[0].deliveryAddress.contactNumber}
                      </p>
                    ) : (
                      <p>No delivery mapping registered.</p>
                    )}
                  </div>
                  <div className="payment-details-box">
                    <h4>Payment Information</h4>
                    <p className="payment-text">
                      <strong>Method:</strong> {selectedOrder.paymentDetails?.method || 'N/A'}<br />
                      <strong>Txn ID:</strong> {selectedOrder.paymentDetails?.transactionId || 'N/A'}<br />
                      <strong>Paid on:</strong> {selectedOrder.paymentDetails?.timestamp ? new Date(selectedOrder.paymentDetails.timestamp).toLocaleString() : 'N/A'}<br />
                      <strong>GST Amount:</strong> Rs {selectedOrder.gstTotal.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Dispute / Return Replacement Actions */}
                {selectedOrder.status === 'Delivered' && (
                  <div className="details-section return-dispute-section">
                    <h4>Dispute resolution</h4>
                    {selectedOrder.returnRequest && selectedOrder.returnRequest.status !== 'None' ? (
                      <div className="return-request-status card">
                        <div className="status-row">
                          <span>Dispute Type: <strong>{selectedOrder.returnRequest.type}</strong></span>
                          <span>Dispute Status: 
                            <strong className={`badge ${
                              selectedOrder.returnRequest.status === 'Pending' ? 'badge-warning' : 
                              selectedOrder.returnRequest.status === 'Approved' ? 'badge-success' : 'badge-danger'
                            }`}>
                              {selectedOrder.returnRequest.status}
                            </strong>
                          </span>
                        </div>
                        <p><strong>Reason:</strong> {selectedOrder.returnRequest.reason}</p>
                        {selectedOrder.returnRequest.vendorNotes && (
                          <p><strong>Vendor Note:</strong> {selectedOrder.returnRequest.vendorNotes}</p>
                        )}
                      </div>
                    ) : showReturnForm ? (
                      <form onSubmit={handleReturnSubmit} className="return-form-card card animate-fade-in">
                        <h5>Raise Return / Replacement Request</h5>
                        
                        <div className="form-group" style={{ margin: '0.75rem 0' }}>
                          <label>Request Type</label>
                          <div className="radio-group" style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                              <input 
                                type="radio" 
                                name="return-type" 
                                value="Return" 
                                checked={returnType === 'Return'} 
                                onChange={() => setReturnType('Return')} 
                              />
                              Return (Money Refund)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                              <input 
                                type="radio" 
                                name="return-type" 
                                value="Replacement" 
                                checked={returnType === 'Replacement'} 
                                onChange={() => setReturnType('Replacement')} 
                              />
                              Replacement (Product Exchange)
                            </label>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Reason for Request *</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            placeholder="Please explain in detail (e.g. damaged goods, logo misprint, incorrect sizing)..."
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button type="submit" className="btn btn-primary btn-sm flex-link" disabled={submittingReturn}>
                            <Send size={12} /> Submit Dispute
                          </button>
                          <button type="button" onClick={() => setShowReturnForm(false)} className="btn btn-outline btn-sm">
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button 
                        onClick={() => setShowReturnForm(true)} 
                        className="btn btn-danger btn-sm flex-link"
                      >
                        <RefreshCw size={14} /> Request Return / Replacement
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="select-order-placeholder card">
                <HelpCircle size={32} style={{ color: 'var(--text-light)', marginBottom: '0.75rem' }} />
                <p>Select an order from the list on the left to see full billing tracking and invoice downloads.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .orders-page {
          padding: 2.5rem 1.5rem;
        }

        .orders-page h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
        }

        .orders-container-layout {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .orders-container-layout {
            grid-template-columns: 1fr;
          }
        }

        .orders-list-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 700px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .order-list-item {
          cursor: pointer;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .order-list-item.active {
          border-color: var(--secondary);
          box-shadow: var(--shadow-md);
        }

        .order-item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .order-id-label {
          font-weight: 700;
          color: var(--primary);
        }

        .order-date-label {
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .order-item-desc {
          display: flex;
          flex-direction: column;
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }

        .order-item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .order-amount-label {
          font-weight: 700;
          font-size: 1.0625rem;
          color: var(--primary);
        }

        /* Detail panel */
        .order-details-card {
          border-color: var(--border-focus);
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
        }

        .details-header h3 {
          font-size: 1.125rem;
          font-weight: 700;
        }

        .details-uuid {
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .tracker-card {
          margin-bottom: 1.5rem;
          background-color: #f8fafc;
        }

        .tracker-card h4 {
          font-size: 0.875rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .details-section {
          margin-bottom: 2rem;
        }

        .details-section h4 {
          font-size: 0.875rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .order-item-info {
          display: flex;
          flex-direction: column;
        }

        .custom-logo-indicator {
          font-size: 0.6875rem;
          color: var(--success);
          font-weight: 600;
          margin-top: 2px;
        }

        .address-text, .payment-text {
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.6;
        }

        .select-order-placeholder {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-muted);
          font-size: 0.9375rem;
        }

        .return-request-status {
          background-color: #f8fafc;
        }

        .return-request-status .status-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .return-request-status p {
          font-size: 0.875rem;
          color: #475569;
          margin-top: 4px;
        }

        .return-form-card {
          background-color: #fee2e2;
          border-color: #fca5a5;
        }

        .return-form-card h5 {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #991b1b;
        }
      `}</style>
    </div>
  );
};

export default CustomerOrders;
