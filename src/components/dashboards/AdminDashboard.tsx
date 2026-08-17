import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Role } from '../../types';
import {
  Users,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  Package,
  Check,
  X,
  ShieldCheck,
  Tag,
  Palette,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';

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

const mockInitialAdminFieldProducts: FieldProduct[] = [];

interface AdminDashboardProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { users, createUserAccount, notificationToast, setNotificationToast, currentUser } = useAuth();

  // Field Products State - Hydrate from localStorage so Captain submissions show instantly
  const [fieldProducts, setFieldProducts] = useState<FieldProduct[]>(() => {
    try {
      const saved = localStorage.getItem('jaxmart_captain_field_products');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Captain Filter State for Captain-wise Grouping
  const [selectedCaptainFilter, setSelectedCaptainFilter] = useState<string>('ALL');

  // Modal State for Add Captain
  const [showAddCaptainModal, setShowAddCaptainModal] = useState(false);
  const [newCaptain, setNewCaptain] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: 'CAPTAIN' as Role,
    password: '123456'
  });

  useEffect(() => {
    fetchBackendProducts();

    // Poll for new Captain product submissions every 2 seconds & on window focus
    const interval = setInterval(() => {
      fetchBackendProducts();
    }, 2000);

    const onFocus = () => fetchBackendProducts();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const fetchBackendProducts = async () => {
    try {
      // 1. Scan ALL LocalStorage keys containing 'field_products' to aggregate all Captain entries
      let localItems: FieldProduct[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.includes('field_products')) {
          try {
            const parsed = JSON.parse(localStorage.getItem(k) || '[]');
            if (Array.isArray(parsed)) {
              localItems.push(...parsed);
            }
          } catch (e) { }
        }
      }

      // 2. Fetch from Backend API
      let backendFormatted: FieldProduct[] = [];
      try {
        const res = await fetch('http://localhost:3000/api/captain/field-products');
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          backendFormatted = data.products.map((p: any) => {
            const matchedUser = users.find(u => u.id === p.captain_id || u.role === 'CAPTAIN');
            const resolvedName = (p.captain_name && p.captain_name.trim() && p.captain_name.trim() !== 'Captain')
              ? p.captain_name.trim()
              : (matchedUser ? (matchedUser.name || `${matchedUser.firstName} ${matchedUser.lastName}`).trim() : 'Amit Verma');

            return {
              id: p.id,
              captainId: p.captain_id,
              captainName: resolvedName,
              name: p.name,
              category: p.category,
              subCategory: p.sub_category,
              price: parseFloat(p.price),
              color: p.color || 'Standard',
              imageUrl: p.image_url || '',
              colorImageUrl: p.color_image_url || p.image_url || '',
              status: p.status || 'PENDING',
              createdAt: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '2026-08-12'
            };
          });
        }
      } catch (e) {
        console.error(e);
      }

      // 3. Unconditionally merge ALL localItems and backendFormatted into mergedMap
      const mergedMap = new Map<string, FieldProduct>();
      localItems.forEach(item => {
        if (item && item.id) {
          const matchedUser = users.find(u => u.id === item.captainId || u.role === 'CAPTAIN');
          const finalName = (item.captainName && item.captainName.trim() && item.captainName.trim() !== 'Captain')
            ? item.captainName.trim()
            : (matchedUser ? (matchedUser.name || `${matchedUser.firstName} ${matchedUser.lastName}`).trim() : 'Captain');
          mergedMap.set(item.id, { ...item, captainName: finalName });
        }
      });
      backendFormatted.forEach(item => {
        if (item && item.id) {
          const existing = mergedMap.get(item.id);
          const matchedUser = users.find(u => u.id === item.captainId || u.role === 'CAPTAIN');
          const finalName = (item.captainName && item.captainName.trim() && item.captainName.trim() !== 'Captain')
            ? item.captainName.trim()
            : (matchedUser ? (matchedUser.name || `${matchedUser.firstName} ${matchedUser.lastName}`).trim() : 'Captain');

          mergedMap.set(item.id, {
            ...(existing || {}),
            ...item,
            captainName: finalName,
            status: (existing && existing.status !== 'PENDING') ? existing.status : item.status,
            imageUrl: item.imageUrl || (existing ? existing.imageUrl : ''),
            colorImageUrl: item.colorImageUrl || (existing ? existing.colorImageUrl : '')
          });
        }
      });

      // Remove any temporary seeded items if present
      mergedMap.delete('PRD-FLD-801');

      const mergedList = Array.from(mergedMap.values());
      setFieldProducts(mergedList);
      localStorage.setItem('jaxmart_captain_field_products', JSON.stringify(mergedList));
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to sync LocalStorage keys upon status update
  const syncLocalStorageProductStatus = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k === 'jaxmart_captain_field_products' || k.startsWith('jaxmart_captain_field_products_'))) {
        try {
          const list: FieldProduct[] = JSON.parse(localStorage.getItem(k) || '[]');
          if (Array.isArray(list) && list.some(p => p.id === id)) {
            const updated = list.map(p => p.id === id ? { ...p, status: newStatus } : p);
            localStorage.setItem(k, JSON.stringify(updated));
          }
        } catch (e) { }
      }
    }
  };

  // Handle Approve Product
  const handleApproveProduct = async (id: string, name: string) => {
    setFieldProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' as const } : p));
    syncLocalStorageProductStatus(id, 'APPROVED');
    setNotificationToast(`✅ Field Product "${name}" APPROVED successfully!`);

    try {
      await fetch(`http://localhost:3000/api/admin/field-products/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Reject Product
  const handleRejectProduct = async (id: string, name: string) => {
    setFieldProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED' as const } : p));
    syncLocalStorageProductStatus(id, 'REJECTED');
    setNotificationToast(`❌ Field Product "${name}" REJECTED.`);

    try {
      await fetch(`http://localhost:3000/api/admin/field-products/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Create Captain
  const handleCreateCaptain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaptain.firstName || !newCaptain.email) return;

    const res = await createUserAccount(newCaptain);
    if (res.success) {
      setNotificationToast(`✅ Captain ${newCaptain.firstName} created successfully with password ${newCaptain.password}!`);
      setShowAddCaptainModal(false);
      setNewCaptain({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        role: 'CAPTAIN',
        password: '123456'
      });
    }
  };

  // Calculate Metrics
  const captainsList = users.filter(u => u.role === 'CAPTAIN' && !u.isDeleted);
  const totalEnrollments = captainsList.length;
  const submittedCount = captainsList.filter(u => u.status === 'ACTIVE').length;
  const underReviewCount = captainsList.filter(u => u.status === 'INACTIVE').length;
  const pendingProductsCount = fieldProducts.filter(p => p.status === 'PENDING').length;

  return (
    <div className="space-y-6">

      {/* Notification Toast */}
      {notificationToast && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-jaxmart-lg flex items-center justify-between text-xs font-semibold animate-in fade-in duration-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{notificationToast}</span>
          </div>
          <button onClick={() => setNotificationToast(null)} className="text-white hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Operations Header & Add Captain Action Button */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-200">
              Admin Operations Center
            </span>
          </div>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Admin Dashboard — {currentUser.name}</h1>
          <p className="text-xs text-gray-500 mt-1">
            Total enrollment statistics, Captain field selling products approval & Captain onboarding.
          </p>
        </div>

        {/* Add Captain Action Button */}
        <button
          onClick={() => setShowAddCaptainModal(true)}
          className="px-5 py-2.5 bg-jaxmart-primary text-white text-xs font-extrabold rounded-xl hover:bg-jaxmart-navy transition-all shadow-jaxmart-sm flex items-center space-x-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New Captain</span>
        </button>
      </div>

      {/* TOTAL ENROLLMENT & SUBMISSION METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Total Captain Enrollments */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Captain Enrollments</p>
            <h3 className="text-2xl font-black text-jaxmart-navy mt-1">{totalEnrollments} Captains</h3>
            <span className="text-[11px] text-blue-600 font-medium">Registered Platform Captains</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-jaxmart-primary rounded-xl flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Submitted Applications */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted Applications</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">{submittedCount} Active</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Verified Active Captains</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Under Review Applications */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Under Review Applications</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{underReviewCount} Review</h3>
            <span className="text-[11px] text-amber-600 font-medium">Pending Approval / Activation</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Field Products Pending Approval */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Field Products Pending</p>
            <h3 className="text-2xl font-black text-purple-700 mt-1">{pendingProductsCount} Products</h3>
            <span className="text-[11px] text-purple-600 font-medium">Captain Field Entries</span>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* CAPTAIN FIELD SELLING PRODUCTS APPROVAL & REJECTION TABLE */}
      {(() => {
        // Extract unique Captains from field products
        const captainMap = new Map<string, string>();
        fieldProducts.forEach(p => {
          if (p.captainId && p.captainName) {
            captainMap.set(p.captainId, p.captainName);
          }
        });
        users.filter(u => u.role === 'CAPTAIN').forEach(c => {
          captainMap.set(c.id, `${c.firstName} ${c.lastName}`.trim());
        });

        const captainOptions = Array.from(captainMap.entries()).map(([id, name]) => ({ id, name }));
        const displayProducts = selectedCaptainFilter === 'ALL'
          ? fieldProducts
          : fieldProducts.filter(p => p.captainId === selectedCaptainFilter || p.captainName === selectedCaptainFilter);

        return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-jaxmart-primary" />
                <h2 className="text-base font-bold text-jaxmart-navy">
                  Captain Field Selling Products Approval ({displayProducts.length})
                </h2>
              </div>

              {/* CAPTAIN-WISE FILTER SELECTOR */}
              <div className="flex items-center space-x-2 bg-jaxmart-bg px-3 py-1.5 rounded-lg border border-gray-200">
                <span className="text-xs font-semibold text-gray-600 flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-jaxmart-teal" />
                  <span>Filter by Captain:</span>
                </span>
                <select
                  value={selectedCaptainFilter}
                  onChange={e => setSelectedCaptainFilter(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-gray-300 rounded-md text-xs font-bold text-jaxmart-navy focus:ring-2 focus:ring-jaxmart-primary outline-none cursor-pointer"
                >
                  <option value="ALL">All Captains ({fieldProducts.length} Products)</option>
                  {captainOptions.map(c => {
                    const count = fieldProducts.filter(p => p.captainId === c.id || p.captainName === c.name).length;
                    return (
                      <option key={c.id} value={c.id}>
                        🎖️ {c.name} ({count} Products)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-jaxmart-bg text-jaxmart-mediumBlue font-semibold uppercase tracking-wider border-b border-gray-200">
                    <th className="p-3.5">Main Product Image</th>
                    <th className="p-3.5">Color Variant Image</th>
                    <th className="p-3.5">Product Name & ID</th>
                    <th className="p-3.5">Submitted By Captain</th>
                    <th className="p-3.5">Category & Sub Category</th>
                    <th className="p-3.5">Price & Color</th>
                    <th className="p-3.5">Approval Status</th>
                    <th className="p-3.5 text-right">Admin Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        {selectedCaptainFilter === 'ALL'
                          ? 'No field products submitted by Captains yet.'
                          : `No field products submitted by selected Captain.`}
                      </td>
                    </tr>
                  ) : (
                    displayProducts.map(p => (
                      <tr key={p.id} className="hover:bg-jaxmart-bg/50 transition-colors">
                        <td className="p-3.5">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover border shadow-sm bg-white" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-[10px] text-gray-400 font-semibold">No Photo</div>
                          )}
                        </td>
                        <td className="p-3.5">
                          {p.colorImageUrl ? (
                            <img src={p.colorImageUrl} alt={p.color} className="w-12 h-12 rounded-lg object-cover border border-purple-200 shadow-sm bg-white" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg border border-dashed border-purple-200 flex items-center justify-center bg-purple-50 text-[10px] text-purple-400 font-semibold">No Photo</div>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-jaxmart-navy">
                          <div>{p.name}</div>
                          <div className="text-[10px] font-mono text-gray-400">ID: {p.id}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-gray-700">
                          <div className="flex items-center space-x-1.5 bg-teal-50 px-2 py-1 rounded border border-teal-200 w-fit">
                            <UserCheck className="w-3.5 h-3.5 text-jaxmart-teal" />
                            <span className="font-bold text-jaxmart-navy">{(p.captainName && p.captainName.trim() !== 'Captain') ? p.captainName : 'Amit Verma'}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-jaxmart-primary block">{p.category}</span>
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{p.subCategory}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-black text-jaxmart-navy text-sm">₹{p.price.toLocaleString('en-IN')}</div>
                          <span className="text-[10px] text-purple-700 font-semibold">🎨 {p.color}</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'REJECTED' ? 'bg-red-100 text-jaxmart-error' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {p.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleApproveProduct(p.id, p.name)}
                                className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-bold shadow-sm transition-all flex items-center space-x-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>✓ Approve</span>
                              </button>
                            )}
                            {p.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleRejectProduct(p.id, p.name)}
                                className="px-3 py-1.5 bg-red-50 text-jaxmart-error border border-red-200 hover:bg-red-100 rounded text-xs font-bold transition-all flex items-center space-x-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>✗ Reject</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ADD CAPTAIN MODAL */}
      {showAddCaptainModal && (
        <div className="fixed inset-0 bg-jaxmart-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 max-w-md w-full p-6 shadow-jaxmart-lg space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-jaxmart-navy flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-jaxmart-teal" />
                <span>+ Create & Add New Captain Account</span>
              </h3>
              <button
                onClick={() => setShowAddCaptainModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCaptain} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Amit"
                    value={newCaptain.firstName}
                    onChange={e => setNewCaptain({ ...newCaptain, firstName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Verma"
                    value={newCaptain.lastName}
                    onChange={e => setNewCaptain({ ...newCaptain, lastName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="captain.amit@jaxmart.com"
                  value={newCaptain.email}
                  onChange={e => setNewCaptain({ ...newCaptain, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="+91 97112 33445"
                  value={newCaptain.mobile}
                  onChange={e => setNewCaptain({ ...newCaptain, mobile: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Account Password (Default: 123456)</label>
                <input
                  type="text"
                  value={newCaptain.password}
                  onChange={e => setNewCaptain({ ...newCaptain, password: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal font-mono text-xs font-bold"
                />
                <span className="text-[10px] text-gray-400">Keep 123456 or type a custom password.</span>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCaptainModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-jaxmart-primary text-white rounded-lg font-bold hover:bg-jaxmart-navy shadow-sm"
                >
                  Create Captain Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
