import React, { useState, useEffect } from 'react';
import { backendClient } from '../utils/backendClient';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle, XCircle, Users, Mail, Hash, Building } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);

  const { showNotification } = useNotification();

  const fetchVendors = async () => {
    try {
      const data = await backendClient.get('/api/admin/vendors');
      setVendors(data || []);
    } catch (error) {
      showNotification('Error retrieving vendor listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApproveVendor = async (vendorId, vendorName) => {
    if (!window.confirm(`Are you sure you want to approve "${vendorName}" as an active supplier?`)) return;
    setSubmittingAction(true);
    try {
      await backendClient.put(`/api/admin/vendors/${vendorId}/approve`);
      showNotification(`Vendor "${vendorName}" has been approved.`, 'success');
      fetchVendors();
    } catch (error) {
      showNotification('Failed to approve vendor.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRevokeVendor = async (vendorId, vendorName) => {
    if (!window.confirm(`Are you sure you want to revoke approval / reject vendor "${vendorName}"?`)) return;
    setSubmittingAction(true);
    try {
      await backendClient.put(`/api/admin/vendors/${vendorId}/reject`);
      showNotification(`Vendor "${vendorName}" approval has been revoked.`, 'info');
      fetchVendors();
    } catch (error) {
      showNotification('Failed to revoke vendor approval.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main animate-fade-in">
        <header className="dashboard-header">
          <h2 className="dashboard-title">Vendor Activation & Onboarding</h2>
        </header>

        {loading ? (
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="dashboard-content">
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                Registered Suppliers Directory
              </h3>

              {vendors.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem' }}>No vendors registered on this platform.</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Supplier Info</th>
                        <th>Company name</th>
                        <th>GSTIN Details</th>
                        <th>Platform Status</th>
                        <th>Action command</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map((vendor) => (
                        <tr key={vendor._id}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <strong>{vendor.name}</strong>
                              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{vendor.email}</span>
                            </div>
                          </td>
                          <td>{vendor.companyName || 'N/A'}</td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 600 }}>
                              {vendor.gstNumber || 'No GSTIN provided'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${vendor.isApproved ? 'badge-success' : 'badge-warning'}`}>
                              {vendor.isApproved ? 'Active Approved' : 'Pending Review'}
                            </span>
                          </td>
                          <td>
                            {vendor.isApproved ? (
                              <button
                                onClick={() => handleRevokeVendor(vendor._id, vendor.name)}
                                className="btn btn-outline btn-sm btn-revoke flex-link"
                                disabled={submittingAction}
                                style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                              >
                                <XCircle size={14} /> Revoke Activation
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApproveVendor(vendor._id, vendor.name)}
                                className="btn btn-accent btn-sm flex-link"
                                disabled={submittingAction}
                              >
                                <CheckCircle size={14} /> Approve Supplier
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .btn-revoke:hover {
          background-color: var(--danger) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default AdminVendors;
