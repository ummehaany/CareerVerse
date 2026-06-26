import React, { useState, useEffect } from 'react';
import { backendClient } from '../utils/backendClient';
import { useNotification } from '../context/NotificationContext';
import { Plus, Trash2, Edit3, Save, X, PlusCircle, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState(null); // null means adding a new product
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Stationery');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [gstPercentage, setGstPercentage] = useState(18);
  const [stockQuantity, setStockQuantity] = useState('');
  const [moq, setMoq] = useState(10);
  const [productLink, setProductLink] = useState('');
  
  // Specifications List
  const [specsList, setSpecsList] = useState([]);
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');

  // Discount Slabs List
  const [slabsList, setSlabsList] = useState([]);
  const [slabQty, setSlabQty] = useState('');
  const [slabDiscount, setSlabDiscount] = useState('');

  // Image Upload
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]); // track deleted image paths
  const [submitting, setSubmitting] = useState(false);

  const { showNotification } = useNotification();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await backendClient.get('/api/products?limit=100');
      const savedUser = JSON.parse(localStorage.getItem('user'));
      
      // Filter list to only show products owned by this vendor
      const filtered = (data.products || []).filter(p => {
        const vId = p.vendor?._id || p.vendor;
        return vId === savedUser.id;
      });
      setProducts(filtered);
    } catch (error) {
      showNotification('Error loading product catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Stationery');
    setDescription('');
    setPrice('');
    setGstPercentage(18);
    setStockQuantity('');
    setMoq(10);
    setProductLink('');
    setSpecsList([]);
    setSlabsList([]);
    setImageFiles([]);
    setExistingImages([]);
    setDeleteImages([]);
    setShowForm(true);
  };

  const handleOpenEditForm = (prod) => {
    setEditingId(prod._id);
    setName(prod.name);
    setCategory(prod.category);
    setDescription(prod.description);
    setPrice(prod.price);
    setGstPercentage(prod.gstPercentage || 18);
    setStockQuantity(prod.stockQuantity);
    setMoq(prod.moq || 1);
    setProductLink(prod.productLink || '');
    setSpecsList(prod.specifications || []);
    setSlabsList(prod.bulkDiscountSlabs || []);
    setExistingImages(prod.images || []);
    setImageFiles([]);
    setDeleteImages([]);
    setShowForm(true);
  };

  const handleAddSpec = () => {
    if (!specKey || !specVal) return;
    setSpecsList([...specsList, { key: specKey, value: specVal }]);
    setSpecKey('');
    setSpecVal('');
  };

  const handleRemoveSpec = (idx) => {
    setSpecsList(specsList.filter((_, i) => i !== idx));
  };

  const handleAddSlab = () => {
    if (!slabQty || !slabDiscount) return;
    setSlabsList([...slabsList, { minQty: Number(slabQty), discountPercentage: Number(slabDiscount) }]);
    setSlabQty('');
    setSlabDiscount('');
  };

  const handleRemoveSlab = (idx) => {
    setSlabsList(slabsList.filter((_, i) => i !== idx));
  };

  const handleImagePicker = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);
  };

  const handleRemoveNewImage = (idx) => {
    setImageFiles(imageFiles.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingImage = (imgUrl) => {
    setExistingImages(existingImages.filter(img => img !== imgUrl));
    setDeleteImages([...deleteImages, imgUrl]);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !price || !stockQuantity) {
      showNotification('Please fill in all mandatory product details.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('price', Number(price));
      formData.append('gstPercentage', Number(gstPercentage));
      formData.append('stockQuantity', Number(stockQuantity));
      formData.append('moq', Number(moq));
      formData.append('productLink', productLink);
      
      formData.append('specifications', JSON.stringify(specsList));
      formData.append('bulkDiscountSlabs', JSON.stringify(slabsList));
      
      if (deleteImages.length > 0) {
        formData.append('deleteImages', JSON.stringify(deleteImages));
      }

      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      if (editingId) {
        await backendClient.put(`/api/products/${editingId}`, formData);
        showNotification('Product listed successfully updated.', 'success');
      } else {
        await backendClient.post('/api/products', formData);
        showNotification('New corporate gift product listed successfully.', 'success');
      }

      setShowForm(false);
      fetchProducts();
    } catch (error) {
      showNotification(error.message || 'Error listing product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductDelete = async (prodId) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await backendClient.delete(`/api/products/${prodId}`);
      showNotification('Product successfully removed from marketplace.', 'success');
      fetchProducts();
    } catch (error) {
      showNotification('Error deleting product.', 'error');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main animate-fade-in">
        <header className="dashboard-header">
          <h2 className="dashboard-title">Product Catalog System</h2>
          {!showForm && (
            <button onClick={handleOpenAddForm} className="btn btn-secondary flex-link">
              <Plus size={16} /> Add Product Listing
            </button>
          )}
        </header>

        {showForm ? (
          <div className="dashboard-content">
            <div className="card animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <h3>{editingId ? 'Edit Product Catalog Item' : 'Register New Marketplace Gift'}</h3>
                <button onClick={() => setShowForm(false)} className="btn-close-form">✕ Cancel</button>
              </div>

              <form onSubmit={handleProductSubmit}>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Product Name / Headline *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Smart Smart-Charging Insulated Tumbler 500ml"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      className="form-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Stationery">Stationery</option>
                      <option value="Drinkware">Drinkware</option>
                      <option value="Desk Accessories">Desk Accessories</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Gift Hampers">Gift Hampers</option>
                      <option value="Apparel">Apparel</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Marketplace Product Description *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter detailed description listing materials, packaging options, and design qualities..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Unit Base Price (Rs) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min={0}
                    />
                  </div>
                  <div className="form-group">
                    <label>GST Tax rate *</label>
                    <select
                      className="form-control"
                      value={gstPercentage}
                      onChange={(e) => setGstPercentage(Number(e.target.value))}
                    >
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Stock Qty Available *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      required
                      min={0}
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum Order Qty (MOQ) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={moq}
                      onChange={(e) => setMoq(e.target.value)}
                      required
                      min={1}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>External / Manufacturer Product Link (Optional)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://manufacturer-site.com/detail"
                    value={productLink}
                    onChange={(e) => setProductLink(e.target.value)}
                  />
                </div>

                {/* Sub-Forms for lists (Specs & Slabs) */}
                <div className="grid-2" style={{ margin: '2rem 0' }}>
                  {/* Specifications manager */}
                  <div className="sub-list-section card">
                    <h4>Technical Specifications</h4>
                    <div className="list-adder-row">
                      <input 
                        type="text" 
                        placeholder="Material" 
                        value={specKey} 
                        onChange={(e) => setSpecKey(e.target.value)} 
                        className="form-control sm-input"
                      />
                      <input 
                        type="text" 
                        placeholder="Stainless Steel" 
                        value={specVal} 
                        onChange={(e) => setSpecVal(e.target.value)} 
                        className="form-control sm-input"
                      />
                      <button type="button" onClick={handleAddSpec} className="btn btn-outline btn-icon-only">
                        <PlusCircle size={18} />
                      </button>
                    </div>
                    <div className="added-items-container">
                      {specsList.map((spec, i) => (
                        <div key={i} className="list-item-badge">
                          <span>{spec.key}: {spec.value}</span>
                          <button type="button" onClick={() => handleRemoveSpec(i)} className="btn-remove-badge">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slabs manager */}
                  <div className="sub-list-section card">
                    <h4>Volume Discount Slabs</h4>
                    <div className="list-adder-row">
                      <input 
                        type="number" 
                        placeholder="Min Qty (e.g. 50)" 
                        value={slabQty} 
                        onChange={(e) => setSlabQty(e.target.value)} 
                        className="form-control sm-input"
                      />
                      <input 
                        type="number" 
                        placeholder="Discount % (e.g. 5)" 
                        value={slabDiscount} 
                        onChange={(e) => setSlabDiscount(e.target.value)} 
                        className="form-control sm-input"
                      />
                      <button type="button" onClick={handleAddSlab} className="btn btn-outline btn-icon-only">
                        <PlusCircle size={18} />
                      </button>
                    </div>
                    <div className="added-items-container">
                      {slabsList.map((slab, i) => (
                        <div key={i} className="list-item-badge color-green">
                          <span>{slab.minQty}+ units $\rightarrow$ {slab.discountPercentage}% off</span>
                          <button type="button" onClick={() => handleRemoveSlab(i)} className="btn-remove-badge">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image upload preview */}
                <div className="form-group image-upload-widget card">
                  <h4>Product Imagery Gallery</h4>
                  
                  <div className="image-pickers-row">
                    <input 
                      type="file" 
                      id="gallery-picker" 
                      multiple 
                      accept="image/*"
                      onChange={handleImagePicker}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="gallery-picker" className="btn btn-outline flex-link">
                      <Sparkles size={16} /> Choose Product Images File (Max 5)
                    </label>
                  </div>

                  {/* Previews */}
                  <div className="image-previews-container">
                    {/* Existing */}
                    {existingImages.map((img, i) => (
                      <div key={`exist-${i}`} className="image-preview-tile">
                        <img src={img} alt="exist" />
                        <button type="button" onClick={() => handleRemoveExistingImage(img)} className="btn-remove-img">✕</button>
                      </div>
                    ))}
                    {/* New */}
                    {imageFiles.map((file, i) => (
                      <div key={`new-${i}`} className="image-preview-tile new-file">
                        <img src={URL.createObjectURL(file)} alt="new" />
                        <button type="button" onClick={() => handleRemoveNewImage(i)} className="btn-remove-img">✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-submit-row">
                  <button type="submit" className="btn btn-primary flex-link" disabled={submitting}>
                    <Save size={18} /> {submitting ? 'Saving catalog item...' : 'Save Catalog Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="dashboard-content">
            {loading ? (
              <div className="spinner-wrapper">
                <div className="spinner"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <Sparkles size={40} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
                <h3>No Listed Products</h3>
                <p>You haven't listed any B2B promotional gifts yet. Click "Add Product Listing" above to launch your first product on the marketplace.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Product Info</th>
                      <th>Category</th>
                      <th>Base Price</th>
                      <th>MOQ / Stock</th>
                      <th>Discounts Slabs</th>
                      <th>Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod._id}>
                        <td>
                          <div className="prod-table-cell">
                            {prod.images && prod.images.length > 0 ? (
                              <img src={prod.images[0]} alt="prod" className="table-cell-img" />
                            ) : (
                              <div className="table-cell-img-placeholder">📦</div>
                            )}
                            <div className="prod-cell-desc">
                              <strong>{prod.name}</strong>
                              <span className="prod-cell-rating">★ {prod.averageRating?.toFixed(1) || '0.0'} ({prod.numReviews || 0} reviews)</span>
                            </div>
                          </div>
                        </td>
                        <td>{prod.category}</td>
                        <td>Rs {prod.price.toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>MOQ: {prod.moq}</span>
                            <span style={{ fontSize: '0.75rem', color: prod.stockQuantity < 50 ? 'var(--danger)' : 'var(--text-muted)' }}>
                              Stock: {prod.stockQuantity}
                            </span>
                          </div>
                        </td>
                        <td>{prod.bulkDiscountSlabs?.length || 0} Slabs</td>
                        <td>
                          <div className="row-action-btns">
                            <button 
                              onClick={() => handleOpenEditForm(prod)} 
                              className="action-btn edit" 
                              title="Edit product"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => handleProductDelete(prod._id)} 
                              className="action-btn delete" 
                              title="Delete product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .btn-close-form {
          border: none;
          background: none;
          font-size: 0.9375rem;
          color: var(--text-muted);
          cursor: pointer;
        }

        .btn-close-form:hover {
          color: var(--primary);
        }

        .sm-input {
          padding: 0.5rem;
          font-size: 0.8125rem;
        }

        .list-adder-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .btn-icon-only {
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .added-items-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .list-item-badge {
          background-color: #f1f5f9;
          color: var(--text-main);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .list-item-badge.color-green {
          background-color: #d1fae5;
          color: #065f46;
        }

        .btn-remove-badge {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          font-weight: bold;
        }

        .btn-remove-badge:hover {
          color: var(--danger);
        }

        /* Image preview styles */
        .image-previews-container {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 1rem;
        }

        .image-preview-tile {
          width: 80px;
          height: 80px;
          border-radius: 4px;
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
          background: white;
        }

        .image-preview-tile img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-preview-tile.new-file {
          border-color: var(--secondary);
        }

        .btn-remove-img {
          position: absolute;
          top: 2px;
          right: 2px;
          background: rgba(15, 23, 42, 0.6);
          color: white;
          border: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          font-size: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-submit-row {
          margin-top: 2rem;
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
          display: flex;
          justify-content: flex-end;
        }

        /* Table catalog cell styling */
        .prod-table-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .table-cell-img {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid var(--border);
          background: #f1f5f9;
        }

        .table-cell-img-placeholder {
          width: 48px;
          height: 48px;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          border-radius: 4px;
        }

        .prod-cell-desc {
          display: flex;
          flex-direction: column;
        }

        .prod-cell-rating {
          font-size: 0.75rem;
          color: var(--warning);
          font-weight: 600;
        }

        .row-action-btns {
          display: flex;
          gap: 6px;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          border: 1px solid var(--border);
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .action-btn:hover {
          color: white;
        }

        .action-btn.edit:hover { background-color: var(--secondary); border-color: var(--secondary); }
        .action-btn.delete:hover { background-color: var(--danger); border-color: var(--danger); }
      `}</style>
    </div>
  );
};

export default VendorProducts;
