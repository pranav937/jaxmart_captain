import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Product, Category } from '../../types';
import { Package, FolderTree, Plus, Search, Tag, CheckCircle } from 'lucide-react';

const mockCategories: Category[] = [
  { id: 'CAT-001', name: 'Industrial Hardware', slug: 'industrial-hardware', description: 'Heavy duty industrial tools and machinery' },
  { id: 'CAT-002', name: 'Electrical & Electronics', slug: 'electrical-electronics', description: 'Circuit breakers, cables, switches & industrial electronics' },
  { id: 'CAT-003', name: 'Safety Gear & PPE', slug: 'safety-ppe', description: 'Helmets, safety goggles, gloves and boots' },
];

export const AdminCatalogOperations: React.FC = () => {
  const { setNotificationToast, users } = useAuth();
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CATEGORIES'>('PRODUCTS');
  const [productMasters, setProductMasters] = useState<any[]>([]);
  const [fieldProducts, setFieldProducts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState('');

  // New Category State
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  useEffect(() => {
    fetchBackendCatalog();
    const interval = setInterval(fetchBackendCatalog, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchBackendCatalog = async () => {
    try {
      const resCmp = await fetch('http://localhost:5000/api/captain/companies');
      const dataCmp = await resCmp.json();
      if (dataCmp.success && Array.isArray(dataCmp.companies)) {
        setCompanies(dataCmp.companies);
      }
    } catch (e) {}

    try {
      const resPm = await fetch('http://localhost:5000/api/captain/product-masters');
      const dataPm = await resPm.json();
      if (dataPm.success && Array.isArray(dataPm.productMasters)) {
        setProductMasters(dataPm.productMasters);
      }
    } catch (e) {}

    try {
      const resFp = await fetch('http://localhost:5000/api/captain/field-products');
      const dataFp = await resFp.json();
      if (dataFp.success && Array.isArray(dataFp.products)) {
        setFieldProducts(dataFp.products);
      }
    } catch (e) {}
  };

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

  const allLiveProducts = [
    ...productMasters.map(pm => {
      const matchedCmp = companies.find(c => c.id === pm.companyId || c.id === pm.company_id);
      const realCmpName = matchedCmp?.companyName || (pm.companyName && pm.companyName !== 'Company' ? pm.companyName : '') || matchedCmp?.legalName || 'Business Entity';
      return {
        id: pm.id,
        name: pm.productName || pm.product_name,
        sku: `SKU-${(pm.category || 'GEN').substring(0, 3).toUpperCase()}-MASTER`,
        category: pm.category || 'General',
        price: pm.price ? parseFloat(pm.price) : 0,
        stock: 100,
        sellerName: realCmpName,
        captainName: pm.captainName || pm.captain_name || 'Captain',
        status: pm.status || 'APPROVED'
      };
    }),
    ...fieldProducts.map(p => ({
      id: p.id,
      name: p.name,
      sku: `SKU-${(p.category || 'GEN').substring(0, 3).toUpperCase()}-FIELD`,
      category: p.category || 'General',
      price: parseFloat(p.price || 0),
      stock: 100,
      sellerName: p.company_name || 'Field Entry',
      captainName: p.captain_name || 'Captain',
      status: p.status || 'APPROVED'
    }))
  ];

  const filteredProducts = allLiveProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <div>
          <h1 className="text-2xl font-bold text-jaxmart-navy">Products & Categories Operations</h1>
          <p className="text-xs text-gray-500 mt-1">
            Supervise live product listings, manage categories, and verify seller SKUs from PostgreSQL Database.
          </p>
        </div>

        <button
          onClick={() => setShowAddCatModal(true)}
          className="px-3.5 py-2 bg-jaxmart-teal text-white rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Category</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('PRODUCTS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${activeTab === 'PRODUCTS' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Package className="w-4 h-4" />
              <span>Managed Products ({allLiveProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('CATEGORIES')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${activeTab === 'CATEGORIES' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Categories ({categories.length})</span>
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
                  <th className="p-3">Seller / Company & Captain</th>
                  <th className="p-3">Price & Stock</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500 text-xs">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => (
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
                        <div className="font-bold text-jaxmart-navy">{p.sellerName}</div>
                        <div className="text-[10px] text-gray-500">Captain: {p.captainName}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-extrabold text-jaxmart-navy">₹{p.price.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-emerald-600 font-medium">Stock: {p.stock} units</div>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 font-bold text-[10px] rounded flex items-center w-fit space-x-1 ${
                          p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          <CheckCircle className="w-3 h-3" />
                          <span>{p.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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

