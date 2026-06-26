import React, { useState, useEffect } from 'react';
import { backendClient } from '../utils/backendClient';
import { useNotification } from '../context/NotificationContext';
import { FileText, Eye, Send, Check } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const VendorQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Proposal states
  const [offeredPrice, setOfferedPrice] = useState('');
  const [vendorNotes, setVendorNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showNotification } = useNotification();

  const fetchQuotes = async () => {
    try {
      const data = await backendClient.get('/api/quotations');
      setQuotes(data || []);
    } catch (error) {
      showNotification('Error fetching RFQ quotes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleSendProposal = async (e) => {
    e.preventDefault();
    if (!offeredPrice || Number(offeredPrice) <= 0) {
      showNotification('Please enter a valid offered price.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await backendClient.put(`/api/quotations/${selectedQuote._id}/respond`, {
        offeredPricePerUnit: Number(offeredPrice),
        vendorNotes
      });
      showNotification('Your custom price proposal has been sent to the customer.', 'success');
      setOfferedPrice('');
      setVendorNotes('');
      
      setSelectedQuote(response.quote);
      fetchQuotes();
    } catch (error) {
      showNotification(error.message || 'Error submitting price proposal.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main animate-fade-in">
        <header className="dashboard-header">
          <h2 className="dashboard-title">RFQ Custom Pricing Console</h2>
        </header>

        {loading ? (
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
        ) : quotes.length === 0 ? (
          <div className="dashboard-content">
            <div className="card text-center" style={{ padding: '3rem' }}>
              <FileText size={40} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
              <h3>No RFQ Requests</h3>
              <p>Corporate customers haven't requested any custom bulk quotes for your products yet.</p>
            </div>
          </div>
        ) : (
          <div className="dashboard-content quotes-container-layout">
            {/* Left list panel */}
            <div className="quotes-list-panel">
              {quotes.map((quote) => (
                <div 
                  key={quote._id} 
                  className={`quote-list-item card ${selectedQuote?._id === quote._id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedQuote(quote);
                    setOfferedPrice(quote.offeredPricePerUnit || quote.originalPricePerUnit || '');
                    setVendorNotes(quote.vendorNotes || '');
                  }}
                >
                  <div className="quote-item-header">
                    <span className="quote-product-name">{quote.product?.name || 'Custom Product'}</span>
                    <span className={`badge ${
                      quote.status === 'Pending' ? 'badge-warning' : 
                      quote.status === 'Responded' ? 'badge-info' : 
                      quote.status === 'Accepted' ? 'badge-success' : 'badge-danger'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                  <div className="quote-item-desc">
                    <span>Client: <strong>{quote.customer?.companyName || quote.customer?.name}</strong></span>
                    <span>Requested Qty: {quote.quantity} units</span>
                  </div>
                  <div className="quote-item-footer">
                    <span>{new Date(quote.createdAt).toLocaleDateString()}</span>
                    {quote.offeredPricePerUnit && (
                      <span className="quote-offered-price">Bid: Rs {quote.offeredPricePerUnit.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right details panel */}
            <div className="quote-details-panel">
              {selectedQuote ? (
                <div className="quote-details-card card animate-fade-in">
                  <div className="details-header">
                    <h3>RFQ Bid Proposal</h3>
                    <span className="details-uuid">RFQ ID: #{selectedQuote._id}</span>
                  </div>

                  <div className="details-grid grid-2">
                    <div className="detail-item">
                      <label>Product Catalog Item</label>
                      <p><strong>{selectedQuote.product?.name}</strong></p>
                    </div>
                    <div className="detail-item">
                      <label>Requested Quantity</label>
                      <p><strong>{selectedQuote.quantity} units</strong> (MOQ: {selectedQuote.product?.moq || 1})</p>
                    </div>
                    <div className="detail-item">
                      <label>Corporate Client</label>
                      <p>{selectedQuote.customer?.companyName || selectedQuote.customer?.name}</p>
                    </div>
                    <div className="detail-item">
                      <label>Standard Unit Price</label>
                      <p>Rs {selectedQuote.originalPricePerUnit?.toFixed(2)} (excl. GST)</p>
                    </div>
                  </div>

                  {/* Custom specs */}
                  {selectedQuote.customSpecs && selectedQuote.customSpecs.length > 0 && (
                    <div className="details-section">
                      <h4>Custom Specs Requested</h4>
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

                  {/* Notes & Logo */}
                  <div className="details-section grid-2">
                    <div>
                      <h4>Customer branding notes</h4>
                      <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>
                        {selectedQuote.customerNotes || 'No custom notes provided.'}
                      </p>
                    </div>
                    {selectedQuote.customizationLogo && (
                      <div className="logo-preview-box">
                        <h4>Branding Logo File</h4>
                        <img 
                          src={selectedQuote.customizationLogo} 
                          alt="Custom Logo" 
                          style={{ height: '60px', objectFit: 'contain', border: '1px solid var(--border)', background: '#f8fafc', padding: '4px', borderRadius: '4px' }} 
                        />
                      </div>
                    )}
                  </div>

                  {/* Bid Submitter form */}
                  {selectedQuote.status === 'Pending' && (
                    <div className="response-card card" style={{ marginTop: '2rem' }}>
                      <h4>Propose Special Unit Price</h4>
                      <form onSubmit={handleSendProposal} style={{ marginTop: '1rem' }}>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Unit Price Bid (Rs) *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={offeredPrice}
                              onChange={(e) => setOfferedPrice(e.target.value)}
                              required
                              min={1}
                              placeholder="e.g. 310"
                            />
                            <small className="help-text">Standard base price is Rs {selectedQuote.originalPricePerUnit?.toFixed(2)}</small>
                          </div>
                          <div className="form-group" style={{ flex: 2 }}>
                            <label>Offer Comments / Terms</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. Adjusted price for bulk printing setup..."
                              value={vendorNotes}
                              onChange={(e) => setVendorNotes(e.target.value)}
                            />
                          </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-sm flex-link" style={{ marginTop: '1rem' }} disabled={submitting}>
                          <Send size={12} /> Dispatch Price Offer
                        </button>
                      </form>
                    </div>
                  )}

                  {selectedQuote.status === 'Responded' && (
                    <div className="pending-alert card" style={{ marginTop: '2.5rem' }}>
                      <span className="alert-badge font-info">✓ Bid Proposal Transmitted</span>
                      <p>You offered <strong>Rs {selectedQuote.offeredPricePerUnit?.toFixed(2)} / unit</strong>.<br />
                      Waiting for the customer to approve or decline this bulk contract.</p>
                    </div>
                  )}

                  {selectedQuote.status === 'Accepted' && (
                    <div className="accepted-alert card" style={{ marginTop: '2.5rem' }}>
                      <span className="alert-badge font-success">✓ RFQ Accepted & Order Created</span>
                      <p>The customer accepted your unit price proposal. An order has been placed in your Orders management tab.</p>
                    </div>
                  )}

                  {selectedQuote.status === 'Rejected' && (
                    <div className="rejected-alert card" style={{ marginTop: '2.5rem' }}>
                      <span className="alert-badge font-danger">✕ RFQ Offer Declined</span>
                      <p>The customer declined this bulk contract proposal.</p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="select-quote-placeholder card">
                  <Eye size={32} style={{ color: 'var(--text-light)', marginBottom: '0.75rem' }} />
                  <p>Select an RFQ request from the list on the left to submit a custom price proposal.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorQuotes;
