import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Product, Category } from '../../types';
import { Package, FolderTree, Plus, Search, Trash2, Tag, Check, X, Sparkles, Ban } from 'lucide-react';

interface FieldProduct {
  id: string;
  captainId: string;
  captainName?: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  color: string;
  imageUrl: string;
  colorImageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const mockCategories: Category[] = [
  { id: 'CAT-001', name: 'Industrial Hardware', slug: 'industrial-hardware', description: 'Heavy duty industrial tools and machinery' },
  { id: 'CAT-002', name: 'Electrical & Electronics', slug: 'electrical-electronics', description: 'Circuit breakers, cables, switches & industrial electronics' },
  { id: 'CAT-003', name: 'Safety Gear & PPE', slug: 'safety-ppe', description: 'Helmets, safety goggles, gloves and boots' },
  { id: 'CAT-004', name: 'Construction Supplies', slug: 'construction-supplies', description: 'Fasteners, cement, adhesives and scaffolding' },
  { id: 'CAT-005', name: 'Hand Tools', slug: 'hand-tools', description: 'Wrenches, screwdrivers, pliers and measuring tapes' }
];

const mockProducts: Product[] = [];

export const SuperAdminCatalogManagement: React.FC = () => {
  const { setNotificationToast, users } = useAuth();
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CATEGORIES' | 'FIELD_APPROVALS'>('PRODUCTS');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [fieldProducts, setFieldProducts] = useState<FieldProduct[]>([]);
  const [productMasters, setProductMasters] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  // Clear any old fake localStorage field products cache
  useEffect(() => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.includes('field_products')) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) { }
  }, []);

  // New Category State
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 3000);
    return () => clearInterval(interval);
  }, [users]);

  const fetchBackendData = async () => {
    // 1. Fetch Companies
    let currentCompanies: any[] = [];
    try {
      const resCmp = await fetch('http://localhost:5000/api/captain/companies');
      const dataCmp = await resCmp.json();
      if (dataCmp.success && Array.isArray(dataCmp.companies)) {
        currentCompanies = dataCmp.companies;
        setCompanies(dataCmp.companies);
      }
    } catch (e) { }

    // 2. Fetch Field Products
    try {
      const res = await fetch('http://localhost:5000/api/captain/field-products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        const backendProducts: FieldProduct[] = data.products.map((p: any) => {
          const matchedUser = users.find(u => u.id === p.captain_id);
          return {
            id: p.id,
            captainId: p.captain_id,
            captainName: matchedUser ? matchedUser.name : (p.captain_name || `Captain (${p.captain_id})`),
            name: p.name,
            category: p.category,
            subCategory: p.sub_category,
            price: parseFloat(p.price || 0),
            color: p.color || 'Standard',
            imageUrl: p.image_url || '',
            colorImageUrl: p.color_image_url || p.image_url || '',
            status: p.status || 'PENDING',
            createdAt: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '2026-08-14'
          };
        });
        setFieldProducts(backendProducts);
      } else {
        setFieldProducts([]);
      }
    } catch (e) {
      setFieldProducts([]);
    }

    // 3. Fetch Product Masters (Product Families)
    try {
      const resPm = await fetch('http://localhost:5000/api/captain/product-masters');
      const dataPm = await resPm.json();
      if (dataPm.success && Array.isArray(dataPm.productMasters)) {
        setProductMasters(dataPm.productMasters);
      } else {
        setProductMasters([]);
      }
    } catch (e) {
      setProductMasters([]);
    }
  };

  const syncLocalStorageProductStatus = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.includes('field_products')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const list: FieldProduct[] = JSON.parse(raw);
            if (Array.isArray(list) && list.some(p => p.id === id)) {
              const updated = list.map(p => p.id === id ? { ...p, status: newStatus } : p);
              localStorage.setItem(k, JSON.stringify(updated));
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveProduct = async (id: string, name: string) => {
    setProductMasters(prev => prev.map(pm => pm.id === id ? { ...pm, status: 'APPROVED' } : pm));
    setFieldProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' as const } : p));
    syncLocalStorageProductStatus(id, 'APPROVED');
    setNotificationToast(`✅ Product "${name}" APPROVED and added to Products Catalog!`);

    try {
      const endpoint = id.startsWith('PROD-')
        ? `http://localhost:5000/api/admin/product-masters/${id}/status`
        : `http://localhost:5000/api/admin/field-products/${id}/status`;
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeactivateProduct = async (id: string, name: string) => {
    setProductMasters(prev => prev.map(pm => pm.id === id ? { ...pm, status: 'REJECTED' } : pm));
    setFieldProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED' as const } : p));
    syncLocalStorageProductStatus(id, 'REJECTED');
    setNotificationToast(`⚠️ Product "${name}" DEACTIVATED.`);

    try {
      const endpoint = id.startsWith('PROD-')
        ? `http://localhost:5000/api/admin/product-masters/${id}/status`
        : `http://localhost:5000/api/admin/field-products/${id}/status`;
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectProduct = async (id: string, name: string) => {
    setProductMasters(prev => prev.map(pm => pm.id === id ? { ...pm, status: 'REJECTED' } : pm));
    setFieldProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED' as const } : p));
    syncLocalStorageProductStatus(id, 'REJECTED');
    setNotificationToast(`❌ Product "${name}" REJECTED.`);

    try {
      const endpoint = id.startsWith('PROD-')
        ? `http://localhost:5000/api/admin/product-masters/${id}/status`
        : `http://localhost:5000/api/admin/field-products/${id}/status`;
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
    } catch (e) {
      console.error(e);
    }
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

  const handleDeleteProduct = (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    setFieldProducts(prev => prev.filter(p => p.id !== id));
    setProductMasters(prev => prev.filter(pm => pm.id !== id));
    setNotificationToast(`🗑️ Product "${name}" deleted.`);
  };

  const pendingFieldProducts = [
    ...fieldProducts.filter(p => p.status === 'PENDING'),
    ...productMasters.filter(pm => pm.status === 'PENDING').map(pm => {
      const matchedCmp = companies.find(c => c.id === pm.companyId || c.id === pm.company_id);
      const realCmpName = matchedCmp?.companyName || (pm.companyName && pm.companyName !== 'Company' ? pm.companyName : '') || matchedCmp?.legalName || 'Master Business Entity';
      return {
        id: pm.id,
        captainId: pm.captainId || 'USR-CAP-201',
        captainName: pm.captainName || 'Captain',
        name: `${pm.productName || pm.name} (${realCmpName})`,
        category: pm.category,
        subCategory: pm.subCategory || 'General',
        price: pm.price ? parseFloat(pm.price) : 0,
        color: 'Standard',
        imageUrl: pm.image_url || pm.imageUrl || '',
        colorImageUrl: '',
        status: pm.status || 'PENDING',
        createdAt: pm.createdAt || ''
      };
    })
  ];

  const allCatalogProducts: (Product & { realStatus?: string; imageUrl?: string })[] = [
    ...products.map(p => ({ ...p, realStatus: p.status || 'APPROVED' })),
    ...productMasters.map(pm => {
      const matchedCmp = companies.find(c => c.id === pm.companyId || c.id === pm.company_id);
      const realCmpName = matchedCmp?.companyName || (pm.companyName && pm.companyName !== 'Company' ? pm.companyName : '') || matchedCmp?.legalName || 'Master Business Entity';
      return {
        id: pm.id,
        name: pm.productName || pm.name,
        sku: `SKU-${(pm.category || 'GEN').substring(0, 3).toUpperCase()}-MASTER`,
        category: pm.category,
        price: pm.price ? parseFloat(pm.price) : 0,
        stock: 100,
        sellerId: pm.companyId || 'USR-SEL-301',
        sellerName: realCmpName,
        captainName: pm.captainName || 'Captain',
        status: (pm.status === 'APPROVED' ? 'APPROVED' : 'REJECTED') as any,
        realStatus: pm.status || 'APPROVED',
        imageUrl: pm.image_url || pm.imageUrl || '',
        updatedAt: pm.createdAt || ''
      };
    }),
    ...fieldProducts
      .filter(p => !productMasters.some(pm => pm.id === p.id) && !products.some(existing => existing.id === p.id))
      .map(p => ({
        id: p.id,
        name: p.name,
        sku: `SKU-${(p.category || 'GEN').substring(0, 3).toUpperCase()}-FIELD`,
        category: p.category,
        price: p.price,
        stock: 100,
        sellerId: 'USR-SEL-301',
        sellerName: p.captainName ? `${p.captainName}'s Submission` : 'Captain Field Submission',
        captainName: p.captainName || 'Captain',
        status: (p.status === 'APPROVED' ? 'APPROVED' : 'REJECTED') as any,
        realStatus: p.status || 'PENDING',
        imageUrl: p.imageUrl || '',
        updatedAt: p.createdAt
      }))
  ];

  const filteredProducts = allCatalogProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFieldProducts = pendingFieldProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.captainName && p.captainName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <div>
          <h1 className="text-2xl font-bold text-jaxmart-navy">Catalog & Category Governance</h1>
          <p className="text-xs text-gray-500 mt-1">
            Global governance over platform products, categories, SKU pricing, and Captain Field Product Approvals.
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
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 pb-3 gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('PRODUCTS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${activeTab === 'PRODUCTS' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Package className="w-4 h-4" />
              <span>Products Catalog ({allCatalogProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('FIELD_APPROVALS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${activeTab === 'FIELD_APPROVALS' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Captain Submissions Queue ({pendingFieldProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('CATEGORIES')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${activeTab === 'CATEGORIES' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Category Tree ({categories.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
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
                  <th className="p-3">Image</th>
                  <th className="p-3">Product Name & SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Seller / Company & Captain</th>
                  <th className="p-3">Price & Stock</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      No products added yet. Once Captains submit products, they will appear here automatically!
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const isApproved = p.realStatus === 'APPROVED';
                    const isPending = p.realStatus === 'PENDING';
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80">
                        <td className="p-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setSelectedImageModal(p.imageUrl || null)}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-jaxmart-blue font-bold">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </td>
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
                          <div className="text-[10px] text-gray-500">Captain: {p.captainName}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-extrabold text-jaxmart-navy">₹{p.price.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-emerald-600 font-medium">Stock: {p.stock} units</div>
                        </td>

                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            isPending ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                            {isApproved ? 'ACTIVE' : isPending ? 'PENDING' : 'DEACTIVATED'}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isApproved ? (
                              <button
                                onClick={() => handleDeactivateProduct(p.id, p.name)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition-colors shadow-sm inline-flex items-center space-x-1"
                                title="Deactivate Product"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Deactivate</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApproveProduct(p.id, p.name)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-sm inline-flex items-center space-x-1"
                                title="Activate / Approve Product"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{isPending ? 'Approve' : 'Activate'}</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1 text-gray-400 hover:text-jaxmart-error rounded hover:bg-red-50"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}

        {/* CAPTAIN FIELD PRODUCTS SUBMISSIONS APPROVAL VIEW */}
        {activeTab === 'FIELD_APPROVALS' && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-jaxmart-bg text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Image</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Submitted By Captain</th>
                  <th className="p-3">Category & Color</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Super Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredFieldProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      No field products collected by Captains.
                    </td>
                  </tr>
                ) : (
                  filteredFieldProducts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/80">
                      <td className="p-3">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setSelectedImageModal(p.imageUrl || null)}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-jaxmart-navy">{p.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">ID: {p.id}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-jaxmart-navy">{p.captainName}</div>
                        <div className="text-[10px] text-gray-400">ID: {p.captainId}</div>
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-jaxmart-primary block">{p.category}</span>
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">{p.color}</span>
                      </td>

                      <td className="p-3 font-extrabold text-jaxmart-navy">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>

                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'REJECTED' ? 'bg-red-100 text-jaxmart-error' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                          {p.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        {p.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleApproveProduct(p.id, p.name)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-sm inline-flex items-center space-x-1 mr-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        {p.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleRejectProduct(p.id, p.name)}
                            className="px-2.5 py-1 bg-jaxmart-error hover:bg-red-700 text-white rounded text-xs font-bold transition-colors shadow-sm inline-flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
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

      {/* HIGH RES IMAGE ZOOM MODAL */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImageModal(null)}>
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2 border border-white/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-bold text-gray-700">📸 High-Res Product Image Inspection</span>
              <button onClick={() => setSelectedImageModal(null)} className="p-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-950 rounded-b-xl min-h-[350px]">
              <img src={selectedImageModal} alt="Zoomed Product" className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
