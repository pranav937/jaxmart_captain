import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  UserCheck,
  Store,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ChevronRight,
  FileText,
  KeyRound,
  Lock,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  Trash2,
  UserPlus,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Check,
  X,
  Building2,
  Layers,
  Building
} from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

interface AttendanceRecord {
  id: string;
  captainId: string;
  captainName?: string;
  date: string;
  punchInTime: string;
  punchInLocation: string;
  punchOutTime?: string;
  punchOutLocation?: string;
  totalHours?: string;
  status: 'PUNCHED_IN' | 'PUNCHED_OUT';
}

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

interface OnboardedCompany {
  id: string;
  captainId: string;
  captainName?: string;
  companyName: string;
  legalName?: string;
  ownerName: string;
  gstin: string;
  mobile: string;
  email: string;
  city: string;
  sellingCategories: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface ProductMaster {
  id: string;
  companyId: string;
  companyName: string;
  captainId: string;
  captainName?: string;
  productName: string;
  category: string;
  subCategory: string;
  productType: string;
  description: string;
  baseUom: string;
  industry: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  skusCount?: number;
}

export const SuperAdminDashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const { users, setSelectedAuditLog, setNotificationToast } = useAuth();

  const [fieldProducts, setFieldProducts] = useState<FieldProduct[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [companies, setCompanies] = useState<OnboardedCompany[]>([]);
  const [productMasters, setProductMasters] = useState<ProductMaster[]>([]);

  const totalAdmins = users.filter(u => u.role === 'ADMIN' && u.status === 'ACTIVE' && !u.isDeleted).length;
  const totalCaptains = users.filter(u => u.role === 'CAPTAIN' && u.status === 'ACTIVE' && !u.isDeleted).length;

  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 3000);
    return () => clearInterval(interval);
  }, [users]);

  const fetchBackendData = async () => {
    // 1. Fetch Field Products
    try {
      const res = await fetch('http://localhost:5000/api/captain/field-products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        const backendProducts = data.products.map((p: any) => {
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
            createdAt: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          };
        });
        setFieldProducts(backendProducts);
      }
    } catch (e) { }

    // 2. Fetch Companies
    try {
      const res = await fetch('http://localhost:5000/api/captain/companies');
      const data = await res.json();
      if (data.success && Array.isArray(data.companies)) {
        const formatted: OnboardedCompany[] = data.companies.map((c: any) => ({
          id: c.id,
          captainId: c.captain_id || c.captainId,
          captainName: c.captain_name || c.captainName || 'Captain',
          companyName: c.company_name || c.companyName || c.legal_name || c.legalName || 'Business Entity',
          ownerName: c.owner_name || c.ownerName || c.contact_person || 'Owner',
          gstin: c.gstin || '',
          mobile: c.mobile || c.phone || '',
          email: c.email || '',
          city: c.city || 'Ahmedabad',
          sellingCategories: c.selling_categories || c.sellingCategories || 'General',
          status: c.status || 'PENDING',
          createdAt: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));
        setCompanies(formatted);
      }
    } catch (e) { }

    // 3. Fetch Product Masters
    try {
      const res = await fetch('http://localhost:5000/api/captain/product-masters');
      const data = await res.json();
      if (data.success && Array.isArray(data.productMasters)) {
        const formatted: ProductMaster[] = data.productMasters.map((pm: any) => ({
          id: pm.id,
          companyId: pm.companyId || pm.company_id,
          companyName: pm.companyName || pm.company_name || 'Business Entity',
          captainId: pm.captainId || pm.captain_id,
          captainName: pm.captainName || pm.captain_name || 'Captain',
          productName: pm.productName || pm.product_name,
          category: pm.category,
          subCategory: pm.subCategory || pm.sub_category,
          productType: pm.productType || pm.product_type || 'Standard',
          description: pm.description || '',
          baseUom: pm.baseUom || pm.base_uom || 'KG',
          industry: pm.industry || 'General',
          status: pm.status || 'PENDING',
          createdAt: pm.createdAt || (pm.created_at ? new Date(pm.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          skusCount: pm.skusCount
        }));
        setProductMasters(formatted);
      }
    } catch (e) { }

    // 4. Fetch Attendance Records
    try {
      const res = await fetch('http://localhost:5000/api/captain/attendance');
      const data = await res.json();
      if (data.success && Array.isArray(data.attendance)) {
        const backendAttendance = data.attendance.map((a: any) => {
          const matchedUser = users.find(u => u.id === a.captain_id);
          return {
            id: a.id,
            captainId: a.captain_id,
            captainName: matchedUser ? matchedUser.name : (a.captain_name || `Captain (${a.captain_id})`),
            date: a.date,
            punchInTime: a.punch_in_time,
            punchInLocation: a.punch_in_location || 'GPS Verified Field Location',
            punchOutTime: a.punch_out_time,
            punchOutLocation: a.punch_out_location,
            totalHours: a.total_hours,
            status: a.status || 'PUNCHED_IN'
          };
        });
        setAttendanceRecords(backendAttendance);
      }
    } catch (e) { }
  };

  const handleApproveCompany = async (id: string, name: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: 'APPROVED' as const } : c));
    setNotificationToast(`✅ Company "${name}" APPROVED!`);
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

  const handleApproveFieldProduct = async (id: string, name: string) => {
    setFieldProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' as const } : p));
    setNotificationToast(`✅ Field Product "${name}" APPROVED!`);
    try {
      await fetch(`http://localhost:5000/api/admin/field-products/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
    } catch (e) { }
  };

  const handleRejectFieldProduct = async (id: string, name: string) => {
    setFieldProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED' as const } : p));
    setNotificationToast(`❌ Field Product "${name}" REJECTED.`);
    try {
      await fetch(`http://localhost:5000/api/admin/field-products/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
    } catch (e) { }
  };

  const activeCaptainsAttendance = attendanceRecords.filter(a => a.status === 'PUNCHED_IN');

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-jaxmart-navy via-jaxmart-primary to-jaxmart-mediumBlue text-white p-6 rounded-xl shadow-jaxmart-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-jaxmart-teal/20 text-jaxmart-teal border border-jaxmart-teal/40 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              100% Super Admin Unrestricted Access
            </span>
            <span className="text-xs text-gray-300">| Live PostgreSQL Database Sync</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">Super Admin Control Center</h1>
          <p className="text-sm text-gray-200 mt-1 max-w-2xl">
            Real-time governance over Companies, Product Masters, Field Submissions, Users, GPS Attendance, and System Audit Logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('users-mgmt')}
            className="px-4 py-2 bg-jaxmart-teal text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors shadow-sm flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage All Users</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Companies */}
        <div
          onClick={() => onNavigateTab('catalog')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between cursor-pointer hover:border-jaxmart-teal transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Onboarded Companies</p>
            <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">{companies.length}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1" /> {companies.filter(c => c.status === 'APPROVED').length} Approved
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* Product Master Families */}
        <div
          onClick={() => onNavigateTab('catalog')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between cursor-pointer hover:border-jaxmart-teal transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Master Families</p>
            <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">{productMasters.length}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1" /> {productMasters.filter(pm => pm.status === 'APPROVED').length} Approved
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Manage Captains */}
        <div
          onClick={() => onNavigateTab('users-mgmt')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between cursor-pointer hover:border-jaxmart-teal transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Captains</p>
            <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">{totalCaptains}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> {activeCaptainsAttendance.length} Punched In
            </p>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-jaxmart-teal rounded-xl flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Product Submissions */}
        <div
          onClick={() => onNavigateTab('catalog')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between cursor-pointer hover:border-jaxmart-teal transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Field Product Entries</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{fieldProducts.length}</h3>
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-0.5" /> {fieldProducts.filter(p => p.status === 'PENDING').length} Pending Review
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 1. Onboarded Companies Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-jaxmart-navy" />
            <h2 className="text-base font-bold text-jaxmart-navy">Onboarded Companies Master ({companies.length})</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">PostgreSQL Persistence</span>
        </div>

        {companies.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs font-medium">
            No companies onboarded yet. Captains can onboard company profiles to start adding products.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Company & GSTIN</th>
                  <th className="p-3">Owner / Contact</th>
                  <th className="p-3">City & Location</th>
                  <th className="p-3">Selling Categories</th>
                  <th className="p-3">Captain</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {companies.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/80">
                    <td className="p-3">
                      <div className="font-extrabold text-jaxmart-navy text-sm">{c.companyName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">GST: {c.gstin || 'N/A'}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-gray-800">{c.ownerName}</div>
                      <div className="text-[11px] text-gray-500">{c.mobile || c.email || 'N/A'}</div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                        {c.city}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="text-gray-700 font-medium">{c.sellingCategories}</span>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-gray-800">{c.captainName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{c.captainId}</div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        c.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      {c.status === 'PENDING' ? (
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleApproveCompany(c.id, c.companyName)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors shadow-sm flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectCompany(c.id, c.companyName)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition-colors shadow-sm flex items-center space-x-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-semibold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Product Master (Product Families) Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-jaxmart-navy" />
            <h2 className="text-base font-bold text-jaxmart-navy">Product Master Families ({productMasters.length})</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">PostgreSQL Persistence</span>
        </div>

        {productMasters.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs font-medium">
            No Product Masters onboarded yet. Captains can onboard Product Masters under approved companies.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Product Family</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Category & Type</th>
                  <th className="p-3">UOM & Industry</th>
                  <th className="p-3">Captain</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {productMasters.map(pm => (
                  <tr key={pm.id} className="hover:bg-gray-50/80">
                    <td className="p-3">
                      <div className="font-extrabold text-jaxmart-navy text-sm">{pm.productName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{pm.id}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-blue-900">{pm.companyName}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-gray-800">{pm.category}</div>
                      <div className="text-[10px] text-gray-500">{pm.subCategory} ({pm.productType})</div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-800 font-bold rounded text-[10px]">
                        UOM: {pm.baseUom}
                      </span>
                      <div className="text-[10px] text-gray-500 mt-0.5">{pm.industry}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-gray-800">{pm.captainName}</div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        pm.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        pm.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {pm.status}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      {pm.status === 'PENDING' ? (
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleApproveProductMaster(pm.id, pm.productName)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors shadow-sm flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectProductMaster(pm.id, pm.productName)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition-colors shadow-sm flex items-center space-x-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-semibold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Captain Field Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-jaxmart-navy">Captain Field Products Submissions ({fieldProducts.length})</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">PostgreSQL Persistence</span>
        </div>

        {fieldProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs font-medium">
            No field products submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Product & Photo</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price & Color</th>
                  <th className="p-3">Captain</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {fieldProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/80">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">
                            No Img
                          </div>
                        )}
                        <div>
                          <div className="font-extrabold text-jaxmart-navy text-sm">{p.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{p.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-gray-800">{p.category}</div>
                      <div className="text-[10px] text-gray-500">{p.subCategory}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-extrabold text-jaxmart-navy">₹{p.price.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-gray-500">Color: {p.color}</span>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-gray-800">{p.captainName}</div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        p.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      {p.status === 'PENDING' ? (
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleApproveFieldProduct(p.id, p.name)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors shadow-sm flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectFieldProduct(p.id, p.name)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition-colors shadow-sm flex items-center space-x-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-semibold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default SuperAdminDashboard;
