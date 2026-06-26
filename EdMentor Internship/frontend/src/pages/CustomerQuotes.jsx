import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendClient } from '../utils/backendClient';
import { useNotification } from '../context/NotificationContext';
import { FileText, Send, Check, X, Eye } from 'lucide-react';

const CustomerQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const fetchQuotes = async () => {
    try {
      const data = await backendClient.get('/api/quotations');
      setQuotes(data);
    } catch (error) {
      showNotification('Error fetching quotation requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleUpdateStatus = async (quoteId, status) => {
    setSubmittingAction(true);
    try {
      const response = await backendClient.put(`/api/quotations/${quoteId}/status`, { status });
      showNotification(response.message || `Quotation request ${status.toLowerCase()}!`, 'success');
      
      // If customer accepted, an order is automatically created and we navigate to orders!
      if (status === 'Accepted' && response.orderId) {
        navigate('/orders');
      } else {
        fetchQuotes();
        setSelectedQuote(response.quote);
      }
    } catch (error) {
      showNotification(error.message || 'Action failed.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="container quotes-page animate-fade-in">
      <h2>Corporate RFQ Quotations</h2>

      {loading ? (
        <div className="spinner-wrapper">
          <div className="spinner"></div>
        </div>
      ) : quotes.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <FileText size={40} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3>No Quotation Requests</h3>
          <p>You haven't requested any custom bulk quotations yet. Browse product details to request a quote.</p>
        </div>
      ) : (
        <div className="quotes-container-layout">
          {/* Left panel: RFQ requests list */}
          <div className="quotes-list-panel">
            {quotes.map((quote) => (
              <div 
                key={quote._id} 
                className={`quote-list-item card ${selectedQuote?._id === quote._id ? 'active' : ''}`}
                onClick={() => setSelectedQuote(quote)}
              >
                <div className="quote-item-header">
                  <span className="quote-product-name">
                    {quote.product?.name || 'Custom Product'}
                  </span>
                  <span className={`badge ${
                    quote.status === 'Pending' ? 'badge-warning' : 
                    quote.status === 'Responded' ? 'badge-info' : 
                    quote.status === 'Accepted' ? 'badge-success' : 'badge-danger'
                  }`}>
                    {quote.status}
                  </span>
                </div>
                <div className="quote-item-desc">
                  <span>Vendor: <strong>{quote.vendor?.companyName || quote.vendor?.name}</strong></span>
                  <span>Requested Qty: {quote.quantity} units</span>
                </div>
                <div className="quote-item-footer">
                  <span className="quote-date">{new Date(quote.createdAt).toLocaleDateString()}</span>
                  {quote.offeredPricePerUnit && (
                    <span className="quote-offered-price">Offer: Rs {quote.offeredPricePerUnit.toFixed(2)} / unit</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right panel: Details & actions */}
          <div className="quote-details-panel">
            {selectedQuote ? (
              <div className="quote-details-card card animate-fade-in">
                <div className="details-header">
                  <h3>Quotation Details</h3>
                  <span className="details-uuid">RFQ ID: #{selectedQuote._id}</span>
                </div>

                <div className="details-grid grid-2">
                  <div className="detail-item">
                    <label>Product Name</label>
                    <p><strong>{selectedQuote.product?.name}</strong></p>
                  </div>
                  <div className="detail-item">
                    <label>Requested Quantity</label>
                    <p><strong>{selectedQuote.quantity} units</strong></p>
                  </div>
                  <div className="detail-item">
                    <label>Standard Unit Price</label>
                    <p>Rs {selectedQuote.originalPricePerUnit?.toFixed(2)} (excl. GST)</p>
                  </div>
                  <div className="detail-item">
                    <label>Vendor Account</label>
                    <p>{selectedQuote.vendor?.companyName || selectedQuote.vendor?.name}</p>
                  </div>
                </div>

                {/* Custom Specs */}
                {selectedQuote.customSpecs && selectedQuote.customSpecs.length > 0 && (
                  <div className="details-section">
                    <h4>Custom Specifications Requested</h4>
                    <table className="specs-table">
                      <tbody>
                        {selectedQuote.customSpecs.map((spec, i) => (
                          <tr key={i}>
                            <td className="spec-key">{spec.key}</td>
                            <td>{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Notes and Logo */}
                <div className="details-section grid-2">
                  <div>
                    <h4>Customer Branding Notes</h4>
                    <p className="note-text">{selectedQuote.customerNotes || 'No custom notes provided.'}</p>
                  </div>
                  {selectedQuote.customizationLogo && (
                    <div className="logo-preview-box">
                      <h4>Customization Logo File</h4>
                      <img src={selectedQuote.customizationLogo} alt="Custom Logo" className="quote-logo-thumbnail" />
                    </div>
                  )}
                </div>

                {/* Response / Action Cards */}
                {selectedQuote.status === 'Responded' && (
                  <div className="response-card card">
                    <h4>Vendor Price Offer Proposal</h4>
                    <div className="offer-comparison">
                      <div className="offer-column">
                        <span>Original Price</span>
                        <span>Rs {selectedQuote.originalPricePerUnit?.toFixed(2)}</span>
                      </div>
                      <div className="offer-column highlight">
                        <span>Offered Price Unit</span>
                        <span>Rs {selectedQuote.offeredPricePerUnit?.toFixed(2)}</span>
                      </div>
                      <div className="offer-column highlight-green">
                        <span>Approx. Total (excl. GST)</span>
                        <span>Rs {(selectedQuote.offeredPricePerUnit * selectedQuote.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                    {selectedQuote.vendorNotes && (
                      <div className="vendor-notes-box">
                        <strong>Vendor Note:</strong>
                        <p>{selectedQuote.vendorNotes}</p>
                      </div>
                    )}

                    <div className="response-actions-row">
                      <button 
                        onClick={() => handleUpdateStatus(selectedQuote._id, 'Accepted')} 
                        className="btn btn-accent flex-link"
                        disabled={submittingAction}
                      >
                        <Check size={16} /> Accept & Place Order
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedQuote._id, 'Rejected')} 
                        className="btn btn-outline btn-danger-hover flex-link"
                        disabled={submittingAction}
                      >
                        <X size={16} /> Decline Offer
                      </button>
                    </div>
                  </div>
                )}

                {selectedQuote.status === 'Accepted' && (
                  <div className="accepted-alert card">
                    <span className="alert-badge font-success">✓ Quotation Offer Accepted</span>
                    <p>This quotation request has been accepted. A checkout-ready order has been generated automatically in your Order History.</p>
                  </div>
                )}

                {selectedQuote.status === 'Rejected' && (
                  <div className="rejected-alert card">
                    <span className="alert-badge font-danger">✕ Quotation Offer Declined</span>
                    <p>This quotation proposal was declined. You can request a new quote with revised quantities or specifications.</p>
                  </div>
                )}

                {selectedQuote.status === 'Pending' && (
                  <div className="pending-alert card">
                    <span className="alert-badge font-warning">⏱ Waiting for Vendor Response</span>
                    <p>The vendor is reviewing your custom quantity and branding requirements. You will receive an offer here once they submit a unit price proposal.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="select-quote-placeholder card">
                <Eye size={32} style={{ color: 'var(--text-light)', marginBottom: '0.75rem' }} />
                <p>Select a quotation request from the list on the left to see vendor offers and accept prices.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .quotes-page {
          padding: 2.5rem 1.5rem;
        }

        .quotes-page h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
        }

        .quotes-container-layout {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .quotes-container-layout {
            grid-template-columns: 1fr;
          }
        }

        .quotes-list-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 700px;
          overflow-y: auto;
        }

        .quote-list-item {
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .quote-list-item.active {
          border-color: var(--secondary);
          box-shadow: var(--shadow-md);
        }

        .quote-item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          align-items: center;
        }

        .quote-product-name {
          font-weight: 700;
          color: var(--primary);
          font-size: 0.9375rem;
        }

        .quote-item-desc {
          display: flex;
          flex-direction: column;
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .quote-item-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .quote-offered-price {
          font-weight: 600;
          color: var(--secondary);
        }

        /* Detail panel */
        .quote-details-card {
          border-color: var(--border-focus);
        }

        .detail-item {
          margin-bottom: 1.25rem;
        }

        .detail-item label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          display: block;
          margin-bottom: 0.25rem;
        }

        .note-text {
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.5;
        }

        .quote-logo-thumbnail {
          width: 60px;
          height: 60px;
          object-fit: contain;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: #f8fafc;
          padding: 4px;
        }

        .select-quote-placeholder {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-muted);
        }

        /* Offer Compare */
        .response-card {
          background-color: #f8fafc;
          border-color: var(--border-focus);
          margin-top: 2rem;
        }

        .response-card h4 {
          font-size: 0.9375rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .offer-comparison {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .offer-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0.75rem 1rem;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
        }

        .offer-column span:first-child {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .offer-column span:last-child {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--primary);
        }

        .offer-column.highlight {
          border-color: var(--secondary);
          background-color: rgba(99, 102, 241, 0.02);
        }

        .offer-column.highlight span:last-child {
          color: var(--secondary);
        }

        .offer-column.highlight-green {
          border-color: var(--accent);
          background-color: rgba(16, 185, 129, 0.02);
        }

        .offer-column.highlight-green span:last-child {
          color: var(--accent);
        }

        .vendor-notes-box {
          background: white;
          border: 1px solid var(--border);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .vendor-notes-box p {
          color: #475569;
          margin-top: 4px;
        }

        .response-actions-row {
          display: flex;
          gap: 1rem;
        }

        .btn-danger-hover:hover {
          background-color: var(--danger);
          color: white;
          border-color: var(--danger);
        }

        /* Alert blocks */
        .accepted-alert {
          background-color: #d1fae5;
          border-color: #a7f3d0;
          margin-top: 1.5rem;
        }

        .rejected-alert {
          background-color: #fee2e2;
          border-color: #fca5a5;
          margin-top: 1.5rem;
        }

        .pending-alert {
          background-color: #fef3c7;
          border-color: #fde68a;
          margin-top: 1.5rem;
        }

        .alert-badge {
          font-weight: 700;
          font-size: 0.875rem;
          display: block;
          margin-bottom: 4px;
        }

        .font-success { color: #065f46; }
        .font-danger { color: #991b1b; }
        .font-warning { color: #92400e; }

        .accepted-alert p, .rejected-alert p, .pending-alert p {
          font-size: 0.875rem;
          color: #475569;
        }
      `}</style>
    </div>
  );
};

export default CustomerQuotes;
