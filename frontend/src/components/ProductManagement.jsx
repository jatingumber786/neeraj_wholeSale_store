import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, AlertCircle, AlertTriangle, Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import { productService } from '../services/api';

const ProductManagement = ({ products, onProductUpdated }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Grains & Rice',
    price: '',
    stock: '',
    unit: '25kg bag',
    minOrderQty: 1,
    image: '',
    description: '',
    outOfStock: false
  });

  const categories = ['Grains & Rice', 'Edible Oils', 'Flour & Atta', 'Sugar & Salt', 'Pulses & Lentils', 'Spices', 'General Grocery'];

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Grains & Rice',
      price: '',
      stock: '',
      unit: '25kg bag',
      minOrderQty: 1,
      image: '',
      description: '',
      outOfStock: false
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      stock: prod.stock,
      unit: prod.unit || 'Unit',
      minOrderQty: prod.minOrderQty || 1,
      image: prod.image || '',
      description: prod.description || '',
      outOfStock: Boolean(prod.outOfStock)
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
      } else {
        await productService.createProduct(formData);
      }
      setModalOpen(false);
      if (onProductUpdated) onProductUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStock = async (product) => {
    try {
      const nextOutOfStock = !product.outOfStock;
      await productService.updateProduct(product._id, {
        outOfStock: nextOutOfStock,
        stock: nextOutOfStock ? 0 : (product.stock === 0 ? 10 : product.stock)
      });
      if (onProductUpdated) onProductUpdated();
    } catch (err) {
      alert('Error updating stock status');
    }
  };

  const handleStockDelta = async (product, delta) => {
    const nextStock = Math.max(0, product.stock + delta);
    try {
      await productService.updateProduct(product._id, {
        stock: nextStock,
        outOfStock: nextStock === 0
      });
      if (onProductUpdated) onProductUpdated();
    } catch (err) {
      alert('Error updating stock count');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from wholesale inventory?`)) {
      try {
        await productService.deleteProduct(id);
        if (onProductUpdated) onProductUpdated();
      } catch (err) {
        alert('Error deleting product');
      }
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2 flex-1 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white outline-none flex-1 max-w-xs"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none font-medium"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-dealer-900 hover:bg-dealer-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Product Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500">
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price / Unit</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    No products matching search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const isOut = prod.outOfStock || prod.stock <= 0;
                  const isLow = !isOut && prod.stock < 10;

                  return (
                    <tr key={prod._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{prod.name}</p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{prod.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">
                          {prod.category}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900">₹{prod.price?.toLocaleString('en-IN')}</span>
                        <span className="text-slate-400 block text-[11px]">per {prod.unit}</span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStockDelta(prod, -5)}
                            disabled={prod.stock <= 0}
                            className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                            title="Decrease 5"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-slate-900 w-8 text-center">
                            {prod.stock}
                          </span>
                          <button
                            onClick={() => handleStockDelta(prod, 5)}
                            className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-slate-600 hover:bg-slate-200"
                            title="Increase 5"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <AlertCircle className="w-3 h-3" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock ({prod.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3" />
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Out of stock */}
                          <button
                            onClick={() => handleToggleStock(prod)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              prod.outOfStock
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                            title="Toggle In/Out of Stock"
                          >
                            {prod.outOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}
                          </button>

                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(prod._id, prod.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingProduct ? 'Edit Wholesale Product' : 'Add Wholesale Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Basmati Rice Premium (25kg)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-dealer-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Packaging Unit *</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. 25kg bag, 15L tin, Box"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1850"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Order Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minOrderQty}
                    onChange={(e) => setFormData({ ...formData, minOrderQty: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Grade details, packaging specs..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="outOfStockToggle"
                  checked={formData.outOfStock}
                  onChange={(e) => setFormData({ ...formData, outOfStock: e.target.checked })}
                  className="w-4 h-4 text-dealer-600 rounded"
                />
                <label htmlFor="outOfStockToggle" className="font-semibold text-slate-700 select-none">
                  Mark as Out of Stock immediately
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-dealer-900 hover:bg-dealer-800 text-white font-bold rounded-xl shadow-sm"
                >
                  {loading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
