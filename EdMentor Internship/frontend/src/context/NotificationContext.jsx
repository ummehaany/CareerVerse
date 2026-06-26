import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Toast Render Portal Container */}
      <div className="toast-portal-container">
        {notifications.map(toast => (
          <div 
            key={toast.id} 
            className={`toast-notification toast-${toast.type} animate-fade-in`}
            onClick={() => removeNotification(toast.id)}
          >
            <div className="toast-icon">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'warning' && '⚠'}
              {toast.type === 'info' && 'ℹ'}
            </div>
            <div className="toast-message">{toast.message}</div>
            <div className="toast-close">×</div>
          </div>
        ))}
      </div>

      <style>{`
        .toast-portal-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 400px;
          width: 90%;
        }

        .toast-notification {
          background-color: white;
          border-radius: 8px;
          border: 1px solid var(--border);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease;
          position: relative;
        }

        .toast-notification:hover {
          transform: translateY(-2px);
        }

        .toast-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8125rem;
          flex-shrink: 0;
        }

        .toast-success { border-left: 4px solid var(--success); }
        .toast-success .toast-icon { background-color: #d1fae5; color: var(--success); }

        .toast-error { border-left: 4px solid var(--danger); }
        .toast-error .toast-icon { background-color: #fee2e2; color: var(--danger); }

        .toast-warning { border-left: 4px solid var(--warning); }
        .toast-warning .toast-icon { background-color: #fef3c7; color: var(--warning); }

        .toast-info { border-left: 4px solid var(--info); }
        .toast-info .toast-icon { background-color: #dbeafe; color: var(--info); }

        .toast-message {
          font-size: 0.875rem;
          color: var(--text-main);
          font-weight: 500;
          flex-grow: 1;
        }

        .toast-close {
          color: var(--text-light);
          font-size: 1.25rem;
          line-height: 1;
          margin-left: 8px;
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
