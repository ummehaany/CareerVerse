import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { KeyRound, Mail, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification('Please enter both email and password.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await loginUser(email, password);
      showNotification(`Welcome back, ${loggedUser.name}!`, 'success');
      
      // Redirect based on role
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      showNotification(error.message || 'Invalid email or password.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2>Sign In to EdMentor</h2>
          <p>Access your B2B Gifting Account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
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

          <div className="form-group">
            <div className="label-row">
              <label>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>
                Forgot Password?
              </Link>
            </div>
            <div className="input-with-icon">
              <KeyRound size={18} className="input-icon" />
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
            {submitting ? 'Authenticating...' : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" style={{ color: 'var(--secondary)', fontWeight: 600 }}>Create an account</Link></p>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: calc(100vh - 140px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-light);
        }

        .input-with-icon .form-control {
          padding-left: 40px;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.375rem;
        }

        .label-row label {
          margin-bottom: 0;
        }

        .w-100 {
          width: 100%;
          margin-top: 1.5rem;
        }

        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Login;
