import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Product, Category } from '../../types';
import { Package, FolderTree, Plus, Search, Trash2, Edit, CheckCircle, Tag } from 'lucide-react';

const mockCategories: Category[] = [
  { id: 'CAT-001', name: 'Industrial Hardware', slug: 'industrial-hardware', description: 'Heavy duty industrial tools and machinery' },
  { id: 'CAT-002', name: 'Electrical & Electronics', slug: 'electrical-electronics', description: 'Circuit breakers, cables, switches & industrial electronics' },
  { id: 'CAT-003', name: 'Safety Gear & PPE', slug: 'safety-ppe', description: 'Helmets, safety goggles, gloves and boots' },
];

const mockProducts: Product[] = [
  { id: 'PRD-101', name: 'Heavy Duty Angle Grinder 850W', sku: 'SKU-TOOL-001', category: 'Industrial Hardware', price: 3499, stock: 120, sellerId: 'USR-SEL-301', sellerName: 'ABC Traders', captainName: 'Amit Verma', status: 'APPROVED', updatedAt: '2026-08-11' },
  { id: 'PRD-102', name: 'Industrial Circuit Breaker 63A 4P', sku: 'SKU-ELEC-002', category: 'Electrical & Electronics', price: 1250, stock: 450, sellerId: 'USR-SEL-301', sellerName: 'ABC Traders', captainName: 'Amit Verma', status: 'APPROVED', updatedAt: '2026-08-11' },
  { id: 'PRD-103', name: 'Steel Toe Executive Safety Boots', sku: 'SKU-SAFE-003', category: 'Safety Gear & PPE', price: 1899, stock: 200, sellerId: 'USR-SEL-301', sellerName: 'ABC Traders', captainName: 'Amit Verma', status: 'APPROVED', updatedAt: '2026-08-10' },
];

export const SuperAdminCatalogManagement: React.FC = () => {
  const { setNotificationToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CATEGORIES'>('PRODUCTS');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState('');

  // New Category State
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    const newCat: Category = {
      id: `CAT-${Math.floor(100 + Math.random() * 900)}`,
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      description: newCatDesc
    };
    setCategories(prev => [newCat, ...prev]);
    setNotificationToast(`🏷️ Category "${newCatName}" added successfully!`);
    setNewCatName('');
    setNewCatDesc('');
    setShowAddCatModal(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    setNotificationToast(`🗑️ Product "${name}" deleted.`);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <div>
          <h1 className="text-2xl font-bold text-jaxmart-navy">Catalog & Category Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Global governance over products, categories, SKU pricing, and seller catalogs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddCatModal(true)}
            className="px-3.5 py-2 bg-jaxmart-teal text-white rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Category</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('PRODUCTS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
                activeTab === 'PRODUCTS' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products Catalog ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('CATEGORIES')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
                activeTab === 'CATEGORIES' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Category Tree ({categories.length})</span>
            </button>
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-jaxmart-teal"
            />
          </div>
        </div>

        {/* PRODUCTS VIEW */}
        {activeTab === 'PRODUCTS' && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-jaxmart-bg text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Product Name & SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Seller & Captain</th>
                  <th className="p-3">Price & Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/80">
                    <td className="p-3">
                      <div className="font-bold text-jaxmart-navy">{p.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{p.sku}</div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-jaxmart-primary font-semibold rounded text-[10px]">
                        {p.category}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="font-medium text-jaxmart-navy">{p.sellerName}</div>
                      <div className="text-[10px] text-gray-500">Supervised by: {p.captainName}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-extrabold text-jaxmart-navy">₹{p.price.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Stock: {p.stock} units</div>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1 text-gray-400 hover:text-jaxmart-error rounded hover:bg-red-50"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CATEGORIES VIEW */}
        {activeTab === 'CATEGORIES' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-gray-200 bg-jaxmart-bg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-jaxmart-navy text-sm flex items-center space-x-1.5">
                    <Tag className="w-4 h-4 text-jaxmart-teal" />
                    <span>{c.name}</span>
                  </span>
                  <span className="text-[10px] bg-gray-200 text-gray-700 font-mono px-1.5 py-0.5 rounded">{c.slug}</span>
                </div>
                <p className="text-xs text-gray-500">{c.description || 'No description provided.'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD CATEGORY MODAL */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-jaxmart-navy">Add Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Safety Equipment"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Description</label>
                <textarea
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddCatModal(false)} className="px-3 py-1.5 border border-gray-300 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-jaxmart-teal text-white font-semibold rounded-lg">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
