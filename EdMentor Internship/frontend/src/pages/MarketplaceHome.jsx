import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { backendClient } from '../utils/backendClient';
import { useNotification } from '../context/NotificationContext';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import StarRating from '../components/StarRating';

const CATEGORIES = ['All', 'Stationery', 'Drinkware', 'Desk Accessories', 'Electronics', 'Gift Hampers', 'Apparel'];

const MarketplaceHome = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minMoq, setMinMoq] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { showNotification } = useNotification();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let queryParams = `?page=${page}&limit=8&sortBy=${sortBy}`;
      
      if (category !== 'All') queryParams += `&category=${encodeURIComponent(category)}`;
      if (search) queryParams += `&search=${encodeURIComponent(search)}`;
      if (minPrice) queryParams += `&minPrice=${minPrice}`;
      if (maxPrice) queryParams += `&maxPrice=${maxPrice}`;
      if (minMoq) queryParams += `&minMoq=${minMoq}`;

      const data = await backendClient.get(`/api/products${queryParams}`);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      showNotification(error.message || 'Error fetching products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setMinMoq('');
    setSortBy('newest');
    setPage(1);
    // Fetching will trigger due to state change
  };

  return (
    <div className="marketplace-layout animate-fade-in">
      {/* Premium B2B Hero Section */}
      <section className="hero-banner">
        <div className="container hero-content">
          <h1>Corporate Gifting, <span className="text-gradient">Elevated</span></h1>
          <p>Direct supply paths from verified manufacturers. Custom branding support, transparent volume-discount slabs, and automated GST billing.</p>
          
          <form onSubmit={handleSearchSubmit} className="search-bar-form">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search premium corporate diaries, smart tumblers, organizer packs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">Search</button>
          </form>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section className="container catalog-section">
        <div className="filter-controls-row">
          <div className="categories-pills">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                className={`category-pill ${category === cat ? 'active' : ''}`}
                onClick={() => { setCategory(cat); setPage(1); }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filter-buttons">
            <button 
              type="button" 
              className={`btn btn-outline filter-toggle-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>

            <div className="sort-wrapper">
              <ArrowUpDown size={16} className="sort-icon" />
              <select 
                value={sortBy} 
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="sort-dropdown"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Detailed Filters Panel */}
        {showFilters && (
          <div className="detailed-filters-panel card animate-fade-in">
            <div className="form-row">
              <div className="form-group">
                <label>Min Price (Rs)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Max Price (Rs)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Max Allowed MOQ</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 50"
                  value={minMoq}
                  onChange={(e) => setMinMoq(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-action-row">
              <button onClick={handleClearFilters} className="btn btn-outline">Clear All</button>
              <button onClick={() => { setPage(1); fetchProducts(); }} className="btn btn-primary">Apply Filters</button>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state-card card">
            <PackageOpen size={48} className="empty-icon" />
            <h3>No Products Found</h3>
            <p>We couldn't find any gifting products matching your search criteria. Try modifying your filters.</p>
            <button onClick={handleClearFilters} className="btn btn-outline">Reset Catalog</button>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map(product => (
                <div key={product._id} className="product-card card card-hover">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className="product-card-img" />
                  ) : (
                    <div className="product-card-img-placeholder">
                      📦 No Image Available
                    </div>
                  )}
                  <div className="product-card-body">
                    <span className="product-category-tag">{product.category}</span>
                    <h3 className="product-card-title">{product.name}</h3>
                    <p className="product-card-vendor">By: {product.vendor?.companyName || product.vendor?.name || 'Verified Vendor'}</p>
                    
                    <div className="rating-row">
                      <StarRating rating={product.averageRating} size={14} />
                      <span className="reviews-count">({product.numReviews || 0})</span>
                    </div>

                    <div className="price-moq-row">
                      <div className="price-tag">Rs {product.price.toFixed(2)}</div>
                      <span className="product-card-moq">MOQ: {product.moq}</span>
                    </div>

                    <Link to={`/product/${product._id}`} className="btn btn-primary btn-sm view-details-btn">
                      View Specifications
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(page - 1)}
                  className="pagination-btn"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="pagination-info">Page {page} of {totalPages}</span>
                <button 
                  disabled={page === totalPages} 
                  onClick={() => setPage(page + 1)}
                  className="pagination-btn"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <style>{`
        .hero-banner {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 5rem 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .hero-content h1 {
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 1.25rem;
        }

        .text-gradient {
          background: linear-gradient(90deg, #6366f1 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-content p {
          font-size: 1.125rem;
          color: #94a3b8;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .search-bar-form {
          display: flex;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-md);
          padding: 6px;
          max-width: 650px;
          margin: 0 auto;
          align-items: center;
        }

        .search-icon {
          color: #94a3b8;
          margin-left: 1rem;
          flex-shrink: 0;
        }

        .search-bar-form input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          padding: 0.75rem 1rem;
          font-size: 0.9375rem;
        }

        .search-bar-form input::placeholder {
          color: #64748b;
        }

        .catalog-section {
          padding: 3rem 0;
        }

        .filter-controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .categories-pills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .category-pill {
          background: white;
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 0.5rem 1rem;
          border-radius: 30px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .category-pill:hover, .category-pill.active {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .filter-buttons {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .filter-toggle-btn.active {
          background-color: #f1f5f9;
          border-color: var(--text-muted);
        }

        .sort-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0 0.75rem;
          background: white;
          gap: 0.5rem;
        }

        .sort-icon {
          color: var(--text-light);
        }

        .sort-dropdown {
          border: none;
          background: transparent;
          outline: none;
          padding: 0.625rem 0;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          color: var(--text-main);
        }

        .detailed-filters-panel {
          margin-bottom: 2rem;
          background-color: white;
        }

        .filter-action-row {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid var(--border);
          padding-top: 1rem;
          margin-top: 1rem;
        }

        .product-card-img-placeholder {
          width: 100%;
          height: 220px;
          background-color: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: var(--text-light);
          font-size: 0.875rem;
        }

        .product-category-tag {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--secondary);
          margin-bottom: 0.25rem;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .reviews-count {
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .price-moq-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .price-tag {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
        }

        .view-details-btn {
          width: 100%;
          margin-top: auto;
        }

        .spinner-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 5rem 0;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border);
          border-top-color: var(--secondary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state-card {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 480px;
          margin: 0 auto;
        }

        .empty-icon {
          color: var(--text-light);
          margin-bottom: 1.5rem;
        }

        .empty-state-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .empty-state-card p {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 3rem;
        }

        .pagination-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .pagination-btn:hover:not(:disabled) {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default MarketplaceHome;
