import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Role, OnboardedCompany, ProductMaster, SkuMaster, GradeMaster } from '../../types';
import { CompanyDetailViewModal } from '../captain/CompanyDetailViewModal';
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
  AlertCircle,
  Eye,
  Layers,
  Scale,
  Maximize2
} from 'lucide-react';

interface FieldProduct {
  id: string;
  captainId: string;
  captainName?: string;
  companyName?: string;
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

  // Field Products State - Fetched strictly from PostgreSQL DB
  const [fieldProducts, setFieldProducts] = useState<FieldProduct[]>([]);

  // Companies, Product Masters & SKUs State - Fetched strictly from PostgreSQL DB
  const [companies, setCompanies] = useState<OnboardedCompany[]>([]);
  const [productMasters, setProductMasters] = useState<ProductMaster[]>([]);
  const [skus, setSkus] = useState<SkuMaster[]>([]);
  const [viewCompanyId, setViewCompanyId] = useState<string | null>(null);

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
    password: ''
  });

  useEffect(() => {
    fetchBackendProducts();
    fetchBackendCompanies();
    fetchBackendProductMasters();
    fetchBackendSkus();

    // Poll for new Captain product & company submissions every 2 seconds & on window focus
    const interval = setInterval(() => {
      fetchBackendProducts();
      fetchBackendCompanies();
      fetchBackendProductMasters();
      fetchBackendSkus();
    }, 2000);

    const onFocus = () => {
      fetchBackendProducts();
      fetchBackendCompanies();
      fetchBackendProductMasters();
      fetchBackendSkus();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const fetchBackendCompanies = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/captain/companies');
      const data = await res.json();
      if (data.success && Array.isArray(data.companies)) {
        const formatted: OnboardedCompany[] = data.companies.map((c: any) => ({
          id: c.id,
          captainId: c.captain_id,
          captainName: c.captain_name || 'Captain',
          companyName: c.company_name,
          ownerName: c.owner_name || '',
          gstin: c.gstin || '',
          mobile: c.mobile || '',
          email: c.email || '',
          city: c.city || 'Surat',
          sellingCategories: c.selling_categories || 'General',
          status: c.status || 'PENDING',
          createdAt: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '2026-08-12'
        }));
        setCompanies(formatted);
      }
    } catch (e) { }
  };

  const handleApproveCompany = async (id: string, name: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: 'APPROVED' as const } : c));
    setNotificationToast(`✅ Company "${name}" APPROVED! Captain can now add products under this company.`);
    try {
      await fetch(`http://localhost:5000/api/admin/companies/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
    } catch (e) { }
  };

  const handleRejectCompany = async (id: string, name: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: 'REJECTED' as const } : c));
    setNotificationToast(`❌ Company "${name}" REJECTED.`);
    try {
      await fetch(`http://localhost:5000/api/admin/companies/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
    } catch (e) { }
  };

  const fetchBackendProductMasters = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/captain/product-masters');
      const data = await res.json();
      if (data.success && Array.isArray(data.productMasters)) {
        setProductMasters(data.productMasters);
      }
    } catch (e) { }
  };

  const handleApproveProductMaster = async (id: string, name: string) => {
    setProductMasters(prev => prev.map(pm => pm.id === id ? { ...pm, status: 'APPROVED' as const } : pm));
    setNotificationToast(`✅ Product Master "${name}" APPROVED!`);
    try {
      await fetch(`http://localhost:5000/api/admin/product-masters/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
    } catch (e) { }
  };

  const handleRejectProductMaster = async (id: string, name: string) => {
    setProductMasters(prev => prev.map(pm => pm.id === id ? { ...pm, status: 'REJECTED' as const } : pm));
    setNotificationToast(`❌ Product Master "${name}" REJECTED.`);
    try {
      await fetch(`http://localhost:5000/api/admin/product-masters/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
    } catch (e) { }
  };

  const fetchBackendSkus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/captain/skus');
      const data = await res.json();
      if (data.success && Array.isArray(data.skus)) {
        setSkus(data.skus);
      }
    } catch (e) { }
  };

  const handleApproveSku = async (id: string, code: string) => {
    setSkus(prev => prev.map(s => s.id === id ? { ...s, status: 'APPROVED' as const } : s));
    setNotificationToast(`✅ SKU Master "${code}" APPROVED!`);
    try {
      await fetch(`http://localhost:5000/api/admin/skus/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
    } catch (e) { }
  };

  const handleRejectSku = async (id: string, code: string) => {
    setSkus(prev => prev.map(s => s.id === id ? { ...s, status: 'REJECTED' as const } : s));
    setNotificationToast(`❌ SKU Master "${code}" REJECTED.`);
    try {
      await fetch(`http://localhost:5000/api/admin/skus/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
    } catch (e) { }
  };

  const fetchBackendProducts = async () => {
    try {
      // Fetch directly from PostgreSQL Backend API
      const res = await fetch('http://localhost:5000/api/captain/field-products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        const backendFormatted: FieldProduct[] = data.products.map((p: any) => {
          const matchedUser = users.find(u => u.id === p.captain_id || u.role === 'CAPTAIN');
          const resolvedName = (p.captain_name && p.captain_name.trim() && p.captain_name.trim() !== 'Captain')
            ? p.captain_name.trim()
            : (matchedUser ? (matchedUser.name || `${matchedUser.firstName} ${matchedUser.lastName}`).trim() : 'Captain');

          return {
            id: p.id,
            captainId: p.captain_id,
            captainName: resolvedName,
            companyId: p.company_id,
            companyName: p.company_name || 'General Company',
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

        setFieldProducts(backendFormatted);
      } else {
        setFieldProducts([]);
      }
    } catch (e) {
      console.error(e);
      setFieldProducts([]);
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
      await fetch(`http://localhost:5000/api/admin/field-products/${id}/status`, {
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
      await fetch(`http://localhost:5000/api/admin/field-products/${id}/status`, {
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
        password: ''
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

      {/* CAPTAIN COMPANY ONBOARDING APPROVALS TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-jaxmart-teal" />
            <h2 className="text-base font-bold text-jaxmart-navy">
              Captain Company Onboarding Approvals ({companies.length})
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Approve Companies so Captains can add products under them
          </span>
        </div>

        {companies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-sm">No Companies Onboarded Yet</p>
            <p className="text-xs text-gray-400 mt-1">When Captains onboard a company, it will appear here for Admin approval.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="py-3 px-4">Company Details</th>
                  <th className="py-3 px-4">Owner / Contact</th>
                  <th className="py-3 px-4">GSTIN & City</th>
                  <th className="py-3 px-4">Selling Categories</th>
                  <th className="py-3 px-4">Captain</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {companies.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-jaxmart-navy">
                      <div>{c.companyName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {c.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      <div className="font-semibold">{c.ownerName || 'N/A'}</div>
                      <div className="text-[11px] text-gray-500">{c.mobile || c.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-mono text-[11px]">
                      <div>GST: {c.gstin || 'N/A'}</div>
                      <div className="text-gray-500 font-sans">{c.city}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-medium">
                      {c.sellingCategories}
                    </td>
                    <td className="py-3.5 px-4 text-gray-800 font-medium">
                      {c.captainName}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : c.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setViewCompanyId(c.id)}
                          className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-jaxmart-blue" />
                          <span>View Master</span>
                        </button>
                        {c.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveCompany(c.id, c.companyName)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px] hover:bg-emerald-700 flex items-center space-x-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectCompany(c.id, c.companyName)}
                              className="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold text-[11px] hover:bg-red-100 flex items-center space-x-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CAPTAIN PRODUCT MASTER APPROVALS TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-jaxmart-blue" />
            <h2 className="text-base font-bold text-jaxmart-navy">
              Captain Product Master Approvals ({productMasters.length})
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Approve Product Families (Product ≠ SKU) so Captains can onboard SKUs under them
          </span>
        </div>

        {productMasters.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-sm">No Product Masters Submitted Yet</p>
            <p className="text-xs text-gray-400 mt-1">When Captains create a Product Family under an approved company, it will appear here for Admin review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Product Family</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Category & Type</th>
                  <th className="py-3 px-4">Base UOM & Industry</th>
                  <th className="py-3 px-4">Captain</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {productMasters.map(pm => (
                  <tr key={pm.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-jaxmart-navy">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-jaxmart-blue" />
                        <span>{pm.productName}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {pm.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">
                      {pm.companyName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-bold">{pm.category}</div>
                      <div className="text-[11px] text-slate-500">{pm.subCategory} ({pm.productType || 'Standard'})</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-jaxmart-blue font-bold text-[11px] mr-2">{pm.baseUom}</span>
                      <span className="text-[11px] text-slate-500">{pm.industry}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {pm.captainName}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        pm.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : pm.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {pm.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {pm.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleApproveProductMaster(pm.id, pm.productName)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px] hover:bg-emerald-700 flex items-center space-x-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectProductMaster(pm.id, pm.productName)}
                            className="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold text-[11px] hover:bg-red-100 flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Action Taken</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CAPTAIN SKU MASTER APPROVALS TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-jaxmart-navy">
              Captain SKU Master Approvals ({skus.length})
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Inspect technical specifications (Grade, Finish, Dimensions, Weight) & approve sellable SKUs
          </span>
        </div>

        {skus.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-sm">No SKU Masters Submitted Yet</p>
            <p className="text-xs text-gray-400 mt-1">When Captains onboard sellable SKU variants, they will appear here for Admin technical review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">SKU Code & ID</th>
                  <th className="py-3 px-4">Product Family & Manufacturer</th>
                  <th className="py-3 px-4">Grade & Finish</th>
                  <th className="py-3 px-4">Dimensions & Weight</th>
                  <th className="py-3 px-4">Price (₹)</th>
                  <th className="py-3 px-4">Captain</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {skus.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-jaxmart-navy">
                      <div className="font-mono text-indigo-950 font-black text-sm">{s.skuCode}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {s.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">
                      <div>📦 {s.productName}</div>
                      <div className="text-[11px] text-slate-500 font-normal">🏢 {s.companyName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-extrabold text-[11px] mr-1 border border-indigo-100">{s.gradeCode}</span>
                      <span className="text-[11px] text-slate-600 font-medium">Finish: {s.finishId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 text-[11px]">
                      <div>Size: <strong>{s.width}x{s.length} {s.widthUom}</strong> | Thick: <strong>{s.thickness} {s.thicknessUom}</strong></div>
                      <div>Weight: <strong>{s.weight} {s.weightUom}</strong> | Standard: <strong>{s.standardId}</strong></div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                      ₹{s.price ? s.price.toLocaleString('en-IN') : 0}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {s.captainName}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        s.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : s.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {s.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleApproveSku(s.id, s.skuCode)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px] hover:bg-emerald-700 flex items-center space-x-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectSku(s.id, s.skuCode)}
                            className="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold text-[11px] hover:bg-red-100 flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Action Taken</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


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
                <label className="font-semibold text-gray-700 block mb-1">Account Password</label>
                <input
                  type="text"
                  value={newCaptain.password}
                  onChange={e => setNewCaptain({ ...newCaptain, password: e.target.value })}
                  placeholder="Type password for this Captain"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal font-mono text-xs font-bold"
                  required
                />
                <span className="text-[10px] text-gray-400">Whatever password you type here will be required for login.</span>
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

      {/* MASTER COMPANY DETAIL VIEWER MODAL FOR ADMIN */}
      <CompanyDetailViewModal
        isOpen={!!viewCompanyId}
        companyId={viewCompanyId}
        onClose={() => setViewCompanyId(null)}
        isAdmin={true}
        onApprove={(id) => {
          const target = companies.find(c => c.id === id);
          handleApproveCompany(id, target?.companyName || 'Company');
        }}
        onReject={(id) => {
          const target = companies.find(c => c.id === id);
          handleRejectCompany(id, target?.companyName || 'Company');
        }}
      />

    </div>
  );
};
