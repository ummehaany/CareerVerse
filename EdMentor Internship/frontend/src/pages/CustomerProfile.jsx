import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Building, MapPin, Trash2, Save, FileImage, Plus } from 'lucide-react';

const CustomerProfile = () => {
  const { user, updateUserProfile, addUserAddress, deleteUserAddress } = useAuth();
  const { showNotification } = useNotification();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(user?.companyLogo || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address fields
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressName, setAddressName] = useState('Office HQ');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [contactNumber, setContactNumber] = useState('');
  const [addingAddress, setAddingAddress] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('companyName', companyName);
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      await updateUserProfile(formData);
      showNotification('Company profile updated successfully.', 'success');
    } catch (error) {
      showNotification(error.message || 'Profile update failed.', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressLine1 || !city || !state || !postalCode || !contactNumber) {
      showNotification('Please fill in all mandatory address fields.', 'error');
      return;
    }

    setAddingAddress(true);
    try {
      await addUserAddress({
        addressName,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        contactNumber
      });
      showNotification('Delivery address added to profile.', 'success');
      setShowAddressForm(false);
      
      // Reset form
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPostalCode('');
      setContactNumber('');
    } catch (error) {
      showNotification(error.message || 'Error adding address.', 'error');
    } finally {
      setAddingAddress(false);
    }
  };

  const handleAddressDelete = async (addressId) => {
    try {
      await deleteUserAddress(addressId);
      showNotification('Address removed successfully.', 'success');
    } catch (error) {
      showNotification('Error removing address.', 'error');
    }
  };

  return (
    <div className="container profile-page animate-fade-in">
      <h2>Corporate Profile Settings</h2>

      <div className="profile-layout-grid">
        {/* Left Column: Profile Info & Company Logo */}
        <div className="profile-info-column card">
          <h3>Company Information</h3>
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="logo-preview-area">
              {logoPreview ? (
                <img src={logoPreview} alt="Company Logo" className="profile-logo-img" />
              ) : (
                <div className="profile-logo-placeholder">
                  <Building size={32} />
                  <span>No logo uploaded</span>
                </div>
              )}

              <input
                type="file"
                id="logo-input"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="logo-input" className="btn btn-outline btn-sm flex-link">
                <FileImage size={14} /> Upload Logo
              </label>
            </div>

            <div className="form-group">
              <label>Contact Manager Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Registered Company Name</label>
              <input
                type="text"
                className="form-control"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Registered Email</label>
              <input
                type="email"
                className="form-control"
                value={user?.email}
                disabled
                readOnly
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 flex-link" disabled={updatingProfile}>
              <Save size={16} /> {updatingProfile ? 'Saving...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Right Column: Address Manager */}
        <div className="profile-addresses-column card">
          <div className="address-header">
            <h3>Corporate Delivery Addresses</h3>
            {!showAddressForm && (
              <button 
                onClick={() => setShowAddressForm(true)} 
                className="btn btn-secondary btn-sm flex-link"
              >
                <Plus size={14} /> Add Address
              </button>
            )}
          </div>

          {showAddressForm ? (
            <form onSubmit={handleAddressSubmit} className="address-form card animate-fade-in">
              <h4>Add Shipping Address</h4>
              
              <div className="form-group">
                <label>Address Name / Label *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Office HQ, Warehouse Delhi"
                  value={addressName}
                  onChange={(e) => setAddressName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address Line 1 *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Plot / Street / Suite number"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Locality, landmark"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={addingAddress}>
                  {addingAddress ? 'Saving...' : 'Save Address'}
                </button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="addresses-list-box">
              {user?.addresses && user.addresses.length > 0 ? (
                <div className="addresses-grid">
                  {user.addresses.map((addr) => (
                    <div key={addr._id} className="address-tile card">
                      <div className="address-tile-header">
                        <span className="address-tag-label">
                          <MapPin size={14} className="tag-icon" /> {addr.addressName}
                        </span>
                        <button 
                          onClick={() => handleAddressDelete(addr._id)}
                          className="btn-delete-addr"
                          title="Remove Address"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="address-tile-body">
                        {addr.addressLine1}, {addr.addressLine2 || ''}<br />
                        {addr.city}, {addr.state} - {addr.postalCode}<br />
                        <strong>Phone:</strong> {addr.contactNumber}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-address-hint">No shipping addresses listed. Adding addresses facilitates multi-delivery checkouts.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-page {
          padding: 2.5rem 1.5rem;
        }

        .profile-page h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
        }

        .profile-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .profile-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        .profile-info-column h3, .profile-addresses-column h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.5rem;
        }

        .logo-preview-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
          background-color: #f8fafc;
          padding: 1.5rem;
          border-radius: var(--radius-sm);
          border: 1px dashed var(--border);
        }

        .profile-logo-img {
          width: 80px;
          height: 80px;
          object-fit: contain;
          background-color: white;
          border: 1px solid var(--border);
          border-radius: 50%;
        }

        .profile-logo-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #cbd5e1;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 0.625rem;
          gap: 4px;
        }

        .address-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .address-header h3 {
          margin-bottom: 0;
          border: none;
          padding: 0;
        }

        .addresses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
        }

        .address-tile {
          padding: 1rem;
          background-color: #f8fafc;
        }

        .address-tile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .address-tag-label {
          font-weight: 700;
          font-size: 0.8125rem;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tag-icon {
          color: var(--secondary);
        }

        .btn-delete-addr {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .btn-delete-addr:hover {
          color: var(--danger);
        }

        .address-tile-body {
          font-size: 0.8125rem;
          color: #475569;
          line-height: 1.5;
        }

        .no-address-hint {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default CustomerProfile;
