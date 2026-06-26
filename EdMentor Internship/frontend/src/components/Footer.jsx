const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="container footer-inner">
        <div className="footer-section">
          <h3>EdMentor Gifting</h3>
          <p>Premium B2B Corporate Gifting Marketplace supplying custom promotional merchandise, gift packs, and corporate stationery.</p>
        </div>
        <div className="footer-section">
          <h4>For Customers</h4>
          <ul>
            <li>Bulk Discount Slabs</li>
            <li>Custom Branding Support</li>
            <li>Request Quotations</li>
            <li>Tax Invoice Downloads</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>For Vendors</h4>
          <ul>
            <li>Vendor Registration</li>
            <li>GST IN Verification</li>
            <li>Inventory Systems</li>
            <li>Fulfillment Control</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} EdMentor Corporate Gifting. All rights reserved.</p>
      </div>

      <style>{`
        .footer-wrapper {
          background-color: var(--primary);
          color: white;
          padding: 3rem 0 1.5rem 0;
          margin-top: auto;
        }

        .footer-inner {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2.5rem;
          margin-bottom: 2rem;
        }

        .footer-section {
          flex: 1;
          min-width: 250px;
        }

        .footer-section h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
        }

        .footer-section h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-section p {
          font-size: 0.875rem;
          color: #94a3b8;
          line-height: 1.6;
        }

        .footer-section ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-section ul li {
          font-size: 0.875rem;
          color: #cbd5e1;
        }

        .footer-bottom {
          border-top: 1px solid var(--primary-light);
          padding-top: 1.5rem;
          text-align: center;
        }

        .footer-bottom p {
          font-size: 0.8125rem;
          color: #64748b;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
