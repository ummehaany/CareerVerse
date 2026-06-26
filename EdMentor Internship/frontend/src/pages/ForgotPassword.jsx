import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { backendClient } from '../utils/backendClient';
import { useNotification } from '../context/NotificationContext';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showNotification('Please enter your email address.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await backendClient.post('/api/auth/forgot-password', { email });
      setSuccess(true);
      showNotification('Password reset link generated successfully.', 'success');
    } catch (error) {
      showNotification(error.message || 'Error requesting reset link.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>We'll email you instructions to reset your password.</p>
        </div>

        {success ? (
          <div className="reset-success-box animate-fade-in">
            <div className="success-icon">✓</div>
            <h4>Check your Email</h4>
            <p>A password reset link has been dispatched to <strong>{email}</strong>.</p>
            <Link to="/login" className="btn btn-primary w-100">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Corporate Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-control"
                  placeholder="manager@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
              {submitting ? 'Sending...' : (
                <>
                  <Send size={16} /> Send Reset Link
                </>
              )}
            </button>

            <div className="back-to-signin">
              <Link to="/login" className="flex-link" style={{ justifyContent: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .reset-success-box {
          text-align: center;
          padding: 1rem 0;
        }

        .success-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: #d1fae5;
          color: var(--success);
          font-size: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem auto;
        }

        .reset-success-box h4 {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.5rem;
        }

        .reset-success-box p {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .back-to-signin {
          text-align: center;
          margin-top: 1.5rem;
        }

        .back-to-signin a:hover {
          color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
