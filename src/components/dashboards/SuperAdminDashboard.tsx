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
  X
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

export const SuperAdminDashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const { users, activityLogs, securityEvents, setSelectedAuditLog, setNotificationToast } = useAuth();

  const [fieldProducts, setFieldProducts] = useState<FieldProduct[]>(() => {
    try {
      let localProducts: FieldProduct[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.includes('field_products')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localProducts.push(...parsed);
          }
        }
      }
      return localProducts;
    } catch (e) {
      return [];
    }
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const totalAdmins = users.filter(u => u.role === 'ADMIN' && u.status === 'ACTIVE' && !u.isDeleted).length;
  const totalCaptains = users.filter(u => u.role === 'CAPTAIN' && u.status === 'ACTIVE' && !u.isDeleted).length;
  const totalSellers = users.filter(u => u.role === 'SELLER' && !u.isDeleted).length;
  const totalCustomers = users.filter(u => u.role === 'CUSTOMER' && !u.isDeleted).length;
  const totalActive = users.filter(u => u.status === 'ACTIVE' && !u.isDeleted).length;
  const totalInactive = users.filter(u => u.status === 'INACTIVE' && !u.isDeleted).length;
  const totalDeleted = users.filter(u => u.isDeleted).length;

  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 3000);
    return () => clearInterval(interval);
  }, [users]);

  const fetchBackendData = async () => {
    // 1. Fetch Field Products
    let localProducts: FieldProduct[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.includes('field_products')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localProducts.push(...parsed);
          }
        }
      }
    } catch (e) {}

    let backendProducts: FieldProduct[] = [];
    try {
      const res = await fetch('http://localhost:5000/api/captain/field-products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        backendProducts = data.products.map((p: any) => {
          const matchedUser = users.find(u => u.id === p.captain_id);
          return {
            id: p.id,
            captainId: p.captain_id,
            captainName: matchedUser ? matchedUser.name : (p.captain_name || `Captain (${p.captain_id})`),
            name: p.name,
            category: p.category,
            subCategory: p.sub_category,
            price: parseFloat(p.price),
            color: p.color || 'Standard',
            imageUrl: p.image_url || '',
            colorImageUrl: p.color_image_url || p.image_url || '',
            status: p.status || 'PENDING',
            createdAt: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '2026-08-14'
          };
        });
      }
    } catch (e) {}

    const mergedProdMap = new Map<string, FieldProduct>();
    localProducts.forEach(p => {
      if (p && p.id) {
        const matchedUser = users.find(u => u.id === p.captainId);
        mergedProdMap.set(p.id, {
          ...p,
          captainName: matchedUser ? matchedUser.name : (p.captainName || 'Captain')
        });
      }
    });
    backendProducts.forEach(p => {
      if (p && p.id) mergedProdMap.set(p.id, p);
    });
    setFieldProducts(Array.from(mergedProdMap.values()));

    // 2. Fetch Attendance Records
    let localAttendance: AttendanceRecord[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.includes('attendance')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localAttendance.push(...parsed);
          }
        }
      }
    } catch (e) {}

    let backendAttendance: AttendanceRecord[] = [];
    try {
      const res = await fetch('http://localhost:5000/api/captain/attendance');
      const data = await res.json();
      if (data.success && Array.isArray(data.attendance)) {
        backendAttendance = data.attendance.map((a: any) => {
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
      }
    } catch (e) {}

    const mergedAttMap = new Map<string, AttendanceRecord>();
    localAttendance.forEach(r => {
      if (r && r.id) {
        const matchedUser = users.find(u => u.id === r.captainId);
        mergedAttMap.set(r.id, {
          ...r,
          captainName: matchedUser ? matchedUser.name : (r.captainName || 'Captain')
        });
      }
    });
    backendAttendance.forEach(r => {
      if (r && r.id) mergedAttMap.set(r.id, r);
    });
    setAttendanceRecords(Array.from(mergedAttMap.values()));
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
    setFieldProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' as const } : p));
    syncLocalStorageProductStatus(id, 'APPROVED');
    setNotificationToast(`✅ Field Product "${name}" APPROVED by Super Admin!`);

    try {
      await fetch(`http://localhost:5000/api/admin/field-products/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectProduct = async (id: string, name: string) => {
    setFieldProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED' as const } : p));
    syncLocalStorageProductStatus(id, 'REJECTED');
    setNotificationToast(`❌ Field Product "${name}" REJECTED.`);

    try {
      await fetch(`http://localhost:5000/api/admin/field-products/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const pendingProducts = fieldProducts.filter(p => p.status === 'PENDING');
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
            <span className="text-xs text-gray-300">| System Status: Operational 100%</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">Super Admin Control Center</h1>
          <p className="text-sm text-gray-200 mt-1 max-w-2xl">
            Unrestricted governance over Admins, Captains, Sellers, Customers, Product Approvals, Live GPS Attendance, RFQs, Orders, and System Audit Logs.
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Admins */}
        <div
          onClick={() => onNavigateTab('users-mgmt')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between cursor-pointer hover:border-jaxmart-teal transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manage Admins</p>
            <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">{totalAdmins}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Full Supervision
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Captains */}
        <div
          onClick={() => onNavigateTab('users-mgmt')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between cursor-pointer hover:border-jaxmart-teal transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manage Captains</p>
            <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">{totalCaptains}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> {activeCaptainsAttendance.length} Active Punched In
            </p>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-jaxmart-teal rounded-xl flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Product Approvals */}
        <div
          onClick={() => onNavigateTab('catalog')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between cursor-pointer hover:border-jaxmart-teal transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Product Approvals</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingProducts.length}</h3>
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-0.5" /> Captain Submissions
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

      </div>

    </div>
  );
};
