import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Mail, KeyRound, Building, Hash, UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'vendor'
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { registerUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    if (role === 'vendor' && !gstNumber) {
      showNotification('GST Number is mandatory for vendor registration.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const details = {
        name,
        email,
        password,
        role,
        companyName,
        gstNumber: role === 'vendor' ? gstNumber : undefined
      };

      const response = await registerUser(details);
      showNotification(response.message || 'Registration completed successfully!', 'success');
      navigate('/login');
    } catch (error) {
      showNotification(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the EdMentor Corporate Gifting Platform</p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="role-tabs">
          <button 
            type="button" 
            className={`role-tab-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => setRole('customer')}
          >
            🏢 Customer
          </button>
          <button 
            type="button" 
            className={`role-tab-btn ${role === 'vendor' ? 'active' : ''}`}
            onClick={() => setRole('vendor')}
          >
            🏭 Vendor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name *</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Corporate Email *</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-control"
                placeholder="procure@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password *</label>
            <div className="input-with-icon">
              <KeyRound size={18} className="input-icon" />
              <input
                type="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Company Name</label>
            <div className="input-with-icon">
              <Building size={18} className="input-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Google Pvt Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>

          {role === 'vendor' && (
            <div className="form-group animate-fade-in">
              <label>GST Registration Number *</label>
              <div className="input-with-icon">
                <Hash size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="29AAAAA1111A1Z1"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  required
                />
              </div>
              <small className="help-text">GSTIN verification is required for vendor activation.</small>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
            {submitting ? 'Registering...' : (
              <>
                <UserPlus size={18} /> Complete Registration
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 600 }}>Sign In</Link></p>
        </div>
      </div>

      <style>{`
        .role-tabs {
          display: flex;
          background-color: #f1f5f9;
          padding: 4px;
          border-radius: var(--radius-sm);
          margin-bottom: 1.5rem;
        }

        .role-tab-btn {
          flex: 1;
          border: none;
          background: none;
          padding: 0.625rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .role-tab-btn.active {
          background-color: white;
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }

        .help-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
          display: block;
        }
      `}</style>
    </div>
  );
};

export default Register;
