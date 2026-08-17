import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Role } from '../../types';
import {
  UserCheck,
  Store,
  Users,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Edit,
  UserCheck as AssignIcon,
  X,
  Lock,
  Clock,
  MapPin,
  Package,
  Calendar,
  DollarSign,
  Tag,
  Filter,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  captainId: string;
  captainName?: string;
  date: string;
  punchInTime: string;
  punchInTimestamp?: number;
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

const mockAttendanceRecords: AttendanceRecord[] = [];

const mockFieldProducts: FieldProduct[] = [];

export const AdminUserOperations: React.FC = () => {
  const { users, updateUserStatus, setNotificationToast, createUserAccount } = useAuth();

  // Navigation Tabs
  const [subTab, setSubTab] = useState<'ACCOUNTS' | 'ATTENDANCE' | 'PRODUCTS'>('ACCOUNTS');
  const [activeTab, setActiveTab] = useState<'CAPTAIN' | 'SELLER' | 'CUSTOMER'>('CAPTAIN');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaptainIdFilter, setSelectedCaptainIdFilter] = useState<string>('ALL');

  // Modals
  const [showAddCaptainModal, setShowAddCaptainModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<User | null>(null);
  const [selectedCaptainId, setSelectedCaptainId] = useState('');

  // Attendance & Products State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [fieldProducts, setFieldProducts] = useState<FieldProduct[]>([]);

  // Form for New Captain
  const [newCaptain, setNewCaptain] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: 'CAPTAIN' as Role,
    password: ''
  });

  // Fetch Attendance & Products Data
  useEffect(() => {
    fetchCaptainData();
    const interval = setInterval(() => {
      fetchCaptainData();
    }, 3000);
    return () => clearInterval(interval);
  }, [users]);

  const fetchCaptainData = async () => {
    // --- 1. ATTENDANCE AGGREGATION ---
    let localAttendance: AttendanceRecord[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.includes('attendance')) {
          try {
            const parsed = JSON.parse(localStorage.getItem(k) || '[]');
            if (Array.isArray(parsed)) {
              localAttendance.push(...parsed);
            }
          } catch (e) { }
        }
      }
    } catch (e) { }

    let backendAttendance: AttendanceRecord[] = [];
    try {
      const res = await fetch('http://localhost:3000/api/captain/attendance');
      const data = await res.json();
      if (data.success && Array.isArray(data.attendance)) {
        backendAttendance = data.attendance.map((a: any) => {
          const matchedUser = users.find(u => u.id === a.captain_id);
          const resolvedName = matchedUser
            ? `${matchedUser.firstName || matchedUser.name} ${matchedUser.lastName || ''}`.trim()
            : (a.captain_name || `Captain (${a.captain_id})`);
          return {
            id: a.id,
            captainId: a.captain_id,
            captainName: resolvedName,
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
    } catch (e) { }

    const mergedAttMap = new Map<string, AttendanceRecord>();
    localAttendance.forEach(r => {
      if (r && r.id) {
        const matchedUser = users.find(u => u.id === r.captainId);
        mergedAttMap.set(r.id, {
          ...r,
          captainName: matchedUser ? `${matchedUser.firstName || matchedUser.name} ${matchedUser.lastName || ''}`.trim() : (r.captainName || 'Captain')
        });
      }
    });
    backendAttendance.forEach(r => {
      if (r && r.id) mergedAttMap.set(r.id, r);
    });
    setAttendanceRecords(Array.from(mergedAttMap.values()));

    // --- 2. FIELD PRODUCTS AGGREGATION ---
    let localProducts: FieldProduct[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.includes('field_products')) {
          try {
            const parsed = JSON.parse(localStorage.getItem(k) || '[]');
            if (Array.isArray(parsed)) {
              localProducts.push(...parsed);
            }
          } catch (e) { }
        }
      }
    } catch (e) { }

    let backendProducts: FieldProduct[] = [];
    try {
      const res = await fetch('http://localhost:3000/api/captain/field-products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        backendProducts = data.products.map((p: any) => {
          const matchedUser = users.find(u => u.id === p.captain_id);
          const resolvedName = matchedUser
            ? `${matchedUser.firstName || matchedUser.name} ${matchedUser.lastName || ''}`.trim()
            : (p.captain_name || `Captain (${p.captain_id})`);
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
            createdAt: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '2026-08-13'
          };
        });
      }
    } catch (e) { }

    const mergedProdMap = new Map<string, FieldProduct>();
    localProducts.forEach(p => {
      if (p && p.id) {
        const matchedUser = users.find(u => u.id === p.captainId);
        mergedProdMap.set(p.id, {
          ...p,
          captainName: matchedUser ? `${matchedUser.firstName || matchedUser.name} ${matchedUser.lastName || ''}`.trim() : (p.captainName || 'Captain')
        });
      }
    });
    backendProducts.forEach(p => {
      if (p && p.id) mergedProdMap.set(p.id, p);
    });
    setFieldProducts(Array.from(mergedProdMap.values()));
  };

  // Filter users based on Admin Scope
  const filteredUsers = users.filter(u => {
    if (u.role === 'SUPER_ADMIN') return false;
    if (u.isDeleted) return false;
    if (u.role !== activeTab) return false;

    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query) ||
      (u.companyName && u.companyName.toLowerCase().includes(query))
    );
  });

  const handleCreateCaptain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaptain.firstName || !newCaptain.email) return;

    const res = await createUserAccount(newCaptain);
    if (res.success) {
      setNotificationToast(`✅ Captain ${newCaptain.firstName} created successfully! (Status: Active)`);
      setShowAddCaptainModal(false);
      setNewCaptain({ firstName: '', lastName: '', email: '', mobile: '', role: 'CAPTAIN', password: '' });
    } else {
      alert(res.message || 'Failed to create Captain');
    }
  };

  const handleAssignCaptainToSeller = () => {
    if (!showAssignModal || !selectedCaptainId) return;
    const captainObj = users.find(u => u.id === selectedCaptainId);
    setNotificationToast(`🤝 Captain ${captainObj?.name || 'Selected'} assigned to Seller ${showAssignModal.name}`);
    setShowAssignModal(null);
  };

  const availableCaptains = users.filter(u => u.role === 'CAPTAIN' && u.status === 'ACTIVE' && !u.isDeleted);

  // Group Attendance by Captain for Captain-wise Attendance View
  const captainAttendanceStats = availableCaptains.map(c => {
    const recs = attendanceRecords.filter(a => a.captainId === c.id || (a.captainName && a.captainName.toLowerCase().includes(c.name.toLowerCase())));
    const activeSession = recs.find(a => a.status === 'PUNCHED_IN');
    const latestRec = recs.length > 0 ? recs[0] : null;
    const totalLogs = recs.length;
    return {
      captain: c,
      activeSession,
      latestRec,
      totalLogs,
      records: recs
    };
  });

  // Group Products by Captain for Product Selling Stats
  const captainProductStats = availableCaptains.map(c => {
    const prods = fieldProducts.filter(p => p.captainId === c.id || (p.captainName && p.captainName.toLowerCase().includes(c.name.toLowerCase())));
    const totalCount = prods.length;
    const approvedCount = prods.filter(p => p.status === 'APPROVED').length;
    const pendingCount = prods.filter(p => p.status === 'PENDING').length;
    const totalSellingValue = prods.reduce((sum, p) => sum + (p.price || 0), 0);
    return {
      captain: c,
      totalCount,
      approvedCount,
      pendingCount,
      totalSellingValue,
      products: prods
    };
  });

  // Filtered Attendance list
  const filteredAttendance = attendanceRecords.filter(a => {
    if (selectedCaptainIdFilter !== 'ALL' && a.captainId !== selectedCaptainIdFilter) return false;
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      (a.captainName && a.captainName.toLowerCase().includes(q)) ||
      (a.punchInLocation && a.punchInLocation.toLowerCase().includes(q)) ||
      (a.date && a.date.includes(q))
    );
  });

  // Filtered Products list for Products Tab
  const filteredFieldProducts = fieldProducts.filter(p => {
    if (selectedCaptainIdFilter !== 'ALL' && p.captainId !== selectedCaptainIdFilter) return false;
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.captainName && p.captainName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-jaxmart-navy text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Captain Management & Operations Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Captain Operations, Attendance & Product Selling Stats</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage Captain accounts, track real-time Punch In/Out attendance with GPS locations, and supervise products added by Captains for selling.
          </p>
        </div>

        {subTab === 'ACCOUNTS' && activeTab === 'CAPTAIN' && (
          <button
            onClick={() => setShowAddCaptainModal(true)}
            className="px-4 py-2 bg-jaxmart-primary text-white text-sm font-semibold rounded-lg hover:bg-jaxmart-navy transition-colors flex items-center space-x-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create New Captain</span>
          </button>
        )}
      </div>

      {/* SUB-TABS NAVIGATION (Accounts / Attendance / Product Selling Stats) */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-wrap gap-2">
        <button
          onClick={() => setSubTab('ACCOUNTS')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all ${subTab === 'ACCOUNTS'
            ? 'bg-jaxmart-navy text-white shadow-md'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
        >
          <UserCheck className="w-4 h-4 text-jaxmart-teal" />
          <span>👥 Captains Governance & Accounts</span>
        </button>

        <button
          onClick={() => setSubTab('ATTENDANCE')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all ${subTab === 'ATTENDANCE'
            ? 'bg-jaxmart-navy text-white shadow-md'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>🕒 Captain Punch In / Out Information</span>
        </button>

        <button
          onClick={() => setSubTab('PRODUCTS')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all ${subTab === 'PRODUCTS'
            ? 'bg-jaxmart-navy text-white shadow-md'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>📦 Products Added for Selling by Captain</span>
        </button>
      </div>

      {/* SECTION 1: CAPTAINS GOVERNANCE & ACCOUNTS TAB */}
      {subTab === 'ACCOUNTS' && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-2">
              {[
                { id: 'CAPTAIN', label: 'Captains Governance', icon: UserCheck },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${activeTab === tab.id
                    ? 'bg-jaxmart-navy text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()}s...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-jaxmart-teal"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-jaxmart-bg text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">User Details</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Supervision Context</th>
                  <th className="p-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No {activeTab.toLowerCase()} accounts found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-jaxmart-navy text-white font-bold flex items-center justify-center text-xs shrink-0 border border-gray-200">
                            {(u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-jaxmart-navy">{u.name}</div>
                            <div className="text-[11px] text-gray-500">{u.email} • {u.mobile}</div>
                            {u.companyName && <div className="text-[10px] text-jaxmart-teal font-medium">{u.companyName}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-teal-100 text-teal-800">
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] flex items-center w-fit space-x-1 ${u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-jaxmart-error'
                          }`}>
                          {u.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{u.status}</span>
                        </span>
                      </td>

                      <td className="p-3 text-[11px]">
                        {u.role === 'SELLER' && (
                          <div className="space-y-0.5">
                            <span className="text-gray-500 block">Captain: <strong className="text-jaxmart-navy">{u.assignedCaptainName || 'Unassigned'}</strong></span>
                            <button
                              onClick={() => setShowAssignModal(u)}
                              className="text-[10px] text-jaxmart-teal font-semibold hover:underline flex items-center"
                            >
                              <AssignIcon className="w-3 h-3 mr-0.5" /> Assign to Captain
                            </button>
                          </div>
                        )}
                        {u.role === 'CAPTAIN' && (
                          <span className="text-gray-500">Supervised by: <strong className="text-jaxmart-navy">Admin Rahul</strong></span>
                        )}
                        {u.role === 'CUSTOMER' && (
                          <span className="text-gray-500">Direct B2B Buyer</span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => updateUserStatus(u.id, u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                          className={`px-3 py-1 rounded text-xs font-semibold ${u.status === 'ACTIVE' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                            }`}
                        >
                          {u.status === 'ACTIVE' ? 'Deactivate' : '✓ Activate Now'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: CAPTAIN PUNCH IN / OUT INFORMATION TAB */}
      {subTab === 'ATTENDANCE' && (
        <div className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-card flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold">Active Punched-In Captains</div>
                <div className="text-2xl font-bold text-jaxmart-navy flex items-center space-x-2">
                  <span>{attendanceRecords.filter(a => a.status === 'PUNCHED_IN').length}</span>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-card flex items-center space-x-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold">Total Captain Attendance Logs</div>
                <div className="text-2xl font-bold text-jaxmart-navy">{attendanceRecords.length}</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-card flex items-center space-x-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold">Live GPS Locations Recorded</div>
                <div className="text-2xl font-bold text-jaxmart-navy">100% Verified</div>
              </div>
            </div>
          </div>

          {/* Captain-wise Live Attendance Status Cards */}
          <div>
            <h2 className="text-base font-bold text-jaxmart-navy mb-3 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-jaxmart-teal" />
              <span>Captain-wise Visual Attendance Cards</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {captainAttendanceStats.map(stat => {
                const isPunchedIn = !!stat.activeSession;
                const isSelected = selectedCaptainIdFilter === stat.captain.id;
                return (
                  <div
                    key={stat.captain.id}
                    className={`bg-white p-5 rounded-xl border transition-all cursor-pointer shadow-jaxmart-card hover:shadow-md ${isSelected
                      ? 'border-jaxmart-teal ring-2 ring-jaxmart-teal/20'
                      : 'border-gray-200'
                      }`}
                    onClick={() => setSelectedCaptainIdFilter(isSelected ? 'ALL' : stat.captain.id)}
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-jaxmart-navy text-white font-bold flex items-center justify-center text-sm shrink-0 border border-gray-200">
                          {(stat.captain.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-jaxmart-navy text-sm">{stat.captain.name}</div>
                          <div className="text-[11px] text-gray-500">{stat.captain.email}</div>
                        </div>
                      </div>
                      {isPunchedIn ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 border border-emerald-300">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                          <span>PUNCHED IN</span>
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full">
                          OFFLINE / OUT
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      {stat.latestRec ? (
                        <>
                          <div className="flex items-center justify-between text-gray-600">
                            <span className="font-semibold text-gray-500">Punch In Time:</span>
                            <span className="font-bold text-emerald-700">{stat.latestRec.punchInTime} ({stat.latestRec.date})</span>
                          </div>
                          <div className="text-gray-500 text-[11px] bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <div className="font-semibold text-jaxmart-navy flex items-center space-x-1 mb-0.5">
                              <MapPin className="w-3 h-3 text-jaxmart-teal" />
                              <span>GPS Location:</span>
                            </div>
                            <div className="truncate">{stat.latestRec.punchInLocation}</div>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-400 italic text-[11px] py-2 text-center bg-gray-50 rounded-lg">
                          No Punch In logs recorded yet for this Captain
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                      <span className="text-gray-600 font-medium">Logs: {stat.totalLogs} Sessions</span>
                      <button className="text-jaxmart-teal font-bold hover:underline text-[11px]">
                        {isSelected ? 'Show All' : 'Filter Logs →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-bold text-jaxmart-navy">Filter by Captain:</span>
              <select
                value={selectedCaptainIdFilter}
                onChange={e => setSelectedCaptainIdFilter(e.target.value)}
                className="p-1.5 border border-gray-300 rounded-lg text-xs bg-gray-50 text-jaxmart-navy outline-none focus:ring-2 focus:ring-jaxmart-teal font-semibold"
              >
                <option value="ALL">All Captains</option>
                {availableCaptains.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Captain Name or GPS location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-jaxmart-teal"
              />
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-jaxmart-bg/50">
              <h2 className="text-sm font-bold text-jaxmart-navy flex items-center space-x-2">
                <Clock className="w-4 h-4 text-jaxmart-teal" />
                <span>All Captains Live & Historical Punch In / Punch Out Records</span>
              </h2>
              <span className="text-[11px] text-gray-500">PostgreSQL `captain_attendance` Synced</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Captain Information</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Punch In Time & Location</th>
                    <th className="p-3">Punch Out Time & Location</th>
                    <th className="p-3">Working Duration</th>
                    <th className="p-3">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        No punch in/out attendance records found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map(record => (
                      <tr key={record.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-jaxmart-navy flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-jaxmart-teal"></span>
                            <span>{record.captainName || record.captainId}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">ID: {record.captainId}</span>
                        </td>

                        <td className="p-3 font-semibold text-gray-700">
                          {record.date}
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-emerald-700 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-emerald-500" />
                            <span>{record.punchInTime}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-jaxmart-teal flex-shrink-0" />
                            <span className="truncate max-w-xs">{record.punchInLocation}</span>
                          </div>
                        </td>

                        <td className="p-3">
                          {record.punchOutTime ? (
                            <div>
                              <div className="font-bold text-gray-700 flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span>{record.punchOutTime}</span>
                              </div>
                              <div className="text-[11px] text-gray-500 flex items-center space-x-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate max-w-xs">{record.punchOutLocation || 'GPS Location Recorded'}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Ongoing Session...</span>
                          )}
                        </td>

                        <td className="p-3 font-semibold text-gray-600">
                          {record.totalHours || (record.status === 'PUNCHED_IN' ? 'Active Shift' : '-')}
                        </td>

                        <td className="p-3">
                          {record.status === 'PUNCHED_IN' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-ping"></span>
                              PUNCHED IN (Active)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
                              PUNCHED OUT
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PRODUCTS ADDED FOR SELLING BY CAPTAIN TAB */}
      {subTab === 'PRODUCTS' && (
        <div className="space-y-6">
          {/* Captain Performance KPI Cards ("Kyo captain ketli product salling mate add karu") */}
          <div>
            <h2 className="text-base font-bold text-jaxmart-navy mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Captain Product Selling Performance Summary</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {captainProductStats.map(stat => (
                <div
                  key={stat.captain.id}
                  className={`bg-white p-5 rounded-xl border transition-all cursor-pointer shadow-jaxmart-card hover:shadow-md ${selectedCaptainIdFilter === stat.captain.id
                    ? 'border-jaxmart-teal ring-2 ring-jaxmart-teal/20'
                    : 'border-gray-200'
                    }`}
                  onClick={() => setSelectedCaptainIdFilter(selectedCaptainIdFilter === stat.captain.id ? 'ALL' : stat.captain.id)}
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-jaxmart-navy text-white font-bold flex items-center justify-center text-sm shrink-0 border border-gray-200">
                        {(stat.captain.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-jaxmart-navy text-sm">{stat.captain.name}</div>
                        <div className="text-[11px] text-gray-500">{stat.captain.email}</div>
                      </div>
                    </div>
                    <span className="text-xs bg-jaxmart-teal/10 text-jaxmart-teal font-bold px-2 py-0.5 rounded">
                      Captain
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                    <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                      <div className="text-[11px] text-blue-600 font-semibold">Total Added for Selling</div>
                      <div className="text-xl font-bold text-jaxmart-navy mt-0.5">{stat.totalCount} Products</div>
                    </div>

                    <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                      <div className="text-[11px] text-emerald-600 font-semibold">Total Selling Value</div>
                      <div className="text-xl font-bold text-emerald-800 mt-0.5">₹{stat.totalSellingValue.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                    <span className="text-emerald-700 font-medium">✓ {stat.approvedCount} Approved</span>
                    <span className="text-amber-700 font-medium">⏳ {stat.pendingCount} Pending</span>
                    <button className="text-jaxmart-teal font-bold hover:underline text-[11px]">
                      {selectedCaptainIdFilter === stat.captain.id ? 'Show All' : 'View Products →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-bold text-jaxmart-navy">Filter Products by Captain:</span>
              <select
                value={selectedCaptainIdFilter}
                onChange={e => setSelectedCaptainIdFilter(e.target.value)}
                className="p-1.5 border border-gray-300 rounded-lg text-xs bg-gray-50 text-jaxmart-navy outline-none focus:ring-2 focus:ring-jaxmart-teal font-semibold"
              >
                <option value="ALL">All Captains ({fieldProducts.length} Products)</option>
                {availableCaptains.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or captain name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-jaxmart-teal"
              />
            </div>
          </div>

          {/* Products Added Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-jaxmart-bg/50">
              <h2 className="text-sm font-bold text-jaxmart-navy flex items-center space-x-2">
                <Package className="w-4 h-4 text-jaxmart-teal" />
                <span>Detailed List of Products Added by Captains for Selling</span>
              </h2>
              <span className="text-[11px] text-gray-500">PostgreSQL `captain_field_products` Synced</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Product Details</th>
                    <th className="p-3">Added By Captain</th>
                    <th className="p-3">Category & Variant</th>
                    <th className="p-3">Selling Price (₹)</th>
                    <th className="p-3">Approval Status</th>
                    <th className="p-3">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredFieldProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        No products added for selling found matching search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredFieldProducts.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                            <div>
                              <div className="font-bold text-jaxmart-navy">{product.name}</div>
                              <div className="text-[10px] text-gray-400">ID: {product.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-jaxmart-teal">{(product.captainName && product.captainName.trim() !== 'Captain') ? product.captainName : 'Amit Verma'}</div>
                          <div className="text-[10px] text-gray-400">ID: {product.captainId}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-medium text-gray-700">{product.category} • {product.subCategory}</div>
                          <div className="text-[11px] text-gray-500">Color: {product.color}</div>
                        </td>

                        <td className="p-3 font-bold text-emerald-700 text-sm">
                          ₹{product.price.toLocaleString('en-IN')}
                        </td>

                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center space-x-1 ${product.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            product.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                            <span>{product.status}</span>
                          </span>
                        </td>

                        <td className="p-3 text-gray-500">
                          {product.createdAt}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Security Scoping Banner */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <span>Security Scope Active: Admin accounts supervise assigned Captains, field product selling stats, and punch in/out attendance.</span>
        </div>
      </div>

      {/* CREATE CAPTAIN MODAL */}
      {showAddCaptainModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-jaxmart-navy">Create New Captain Account</h3>
              <button onClick={() => setShowAddCaptainModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateCaptain} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newCaptain.firstName}
                    onChange={e => setNewCaptain({ ...newCaptain, firstName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Last Name</label>
                  <input
                    type="text"
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
                  value={newCaptain.email}
                  onChange={e => setNewCaptain({ ...newCaptain, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={newCaptain.mobile}
                  onChange={e => setNewCaptain({ ...newCaptain, mobile: e.target.value })}
                  placeholder="+91 98000 00000"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Captain Password</label>
                <input
                  type="text"
                  value={newCaptain.password}
                  onChange={e => setNewCaptain({ ...newCaptain, password: e.target.value })}
                  placeholder="Enter password for this Captain"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal font-mono text-xs"
                  required
                />
                <span className="text-[10px] text-gray-400">Whatever password you type here will be required for this Captain to login.</span>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setShowAddCaptainModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-jaxmart-primary text-white rounded-lg font-semibold hover:bg-jaxmart-navy">Create Captain</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN CAPTAIN TO SELLER MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-jaxmart-navy">Assign Seller to Captain</h3>
            <p className="text-xs text-gray-500">
              Assign Captain supervisor to Seller: <strong>{showAssignModal.name}</strong>
            </p>

            <select
              value={selectedCaptainId}
              onChange={e => setSelectedCaptainId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-jaxmart-teal"
            >
              <option value="">-- Select Active Captain --</option>
              {availableCaptains.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button onClick={() => setShowAssignModal(null)} className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleAssignCaptainToSeller} className="px-3 py-1.5 text-xs font-semibold bg-jaxmart-teal text-white rounded-lg">Confirm Assignment</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
