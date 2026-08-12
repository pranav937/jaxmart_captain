import React from 'react';
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
  FolderTree,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  Trash2,
  UserPlus
} from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const SuperAdminDashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const { users, activityLogs, securityEvents, setSelectedAuditLog } = useAuth();

  const totalAdmins = users.filter(u => u.role === 'ADMIN' && !u.isDeleted).length;
  const totalCaptains = users.filter(u => u.role === 'CAPTAIN' && !u.isDeleted).length;
  const totalSellers = users.filter(u => u.role === 'SELLER' && !u.isDeleted).length;
  const totalCustomers = users.filter(u => u.role === 'CUSTOMER' && !u.isDeleted).length;
  const totalActive = users.filter(u => u.status === 'ACTIVE' && !u.isDeleted).length;
  const totalInactive = users.filter(u => u.status === 'INACTIVE' && !u.isDeleted).length;
  const totalDeleted = users.filter(u => u.isDeleted).length;

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
            Unrestricted governance over Admins, Captains, Sellers, Customers, Products, RFQs, Orders, Payments, Analytics, and Audit Logs.
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
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Assign to Sellers
            </p>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-jaxmart-teal rounded-xl flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Sellers */}
        <div
          onClick={() => onNavigateTab('users-mgmt')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between cursor-pointer hover:border-jaxmart-teal transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manage Sellers</p>
            <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">{totalSellers}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Active Enterprise
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-jaxmart-primary rounded-xl flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
        </div>

        {/* B2B Revenue */}
        <div
          onClick={() => onNavigateTab('rfq-orders')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between cursor-pointer hover:border-jaxmart-teal transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Revenue & Payments</p>
            <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">₹1.84 Cr</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 100% Verified
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 100% Permission Domains Grid */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-lg font-bold text-jaxmart-navy">Super Admin Permission Domains (100% Access)</h2>
          <span className="text-xs text-gray-500">Select any domain to manage</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { id: 'users-mgmt', label: 'User Governance', icon: Users, color: 'text-purple-600 bg-purple-50' },
            { id: 'catalog', label: 'Products & Categories', icon: Package, color: 'text-blue-600 bg-blue-50' },
            { id: 'rfq-orders', label: 'RFQs & Orders', icon: ShoppingCart, color: 'text-emerald-600 bg-emerald-50' },
            { id: 'rfq-orders', label: 'Payments & Settlement', icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
            { id: 'analytics-settings', label: 'Reports & Analytics', icon: BarChart3, color: 'text-indigo-600 bg-indigo-50' },
            { id: 'analytics-settings', label: 'System Settings', icon: Settings, color: 'text-gray-700 bg-gray-100' },
            { id: 'permissions', label: 'Roles & Permissions', icon: KeyRound, color: 'text-pink-600 bg-pink-50' },
            { id: 'security', label: 'Security & Auth Logs', icon: Lock, color: 'text-red-600 bg-red-50' },
            { id: 'audit-logs', label: 'Audit & Activity Logs', icon: FileText, color: 'text-teal-600 bg-teal-50' },
            { id: 'users-mgmt', label: 'Activate / Deactivate', icon: UserCheck, color: 'text-cyan-600 bg-cyan-50' },
            { id: 'users-mgmt', label: 'Soft Delete & Restore', icon: Trash2, color: 'text-rose-600 bg-rose-50' },
            { id: 'analytics-settings', label: 'Broadcast Notifications', icon: Bell, color: 'text-violet-600 bg-violet-50' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => onNavigateTab(item.id)}
              className="p-3 rounded-xl border border-gray-200 hover:border-jaxmart-teal bg-jaxmart-bg hover:bg-white text-left transition-all flex flex-col items-start space-y-2 group"
            >
              <div className={`p-2 rounded-lg ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-jaxmart-navy group-hover:text-jaxmart-primary line-clamp-1">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: System Breakdown & Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): System Metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-jaxmart-navy">PostgreSQL Account Status Summary</h2>
              <span className="text-xs text-gray-500 font-medium">Real-Time DB Sync</span>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-jaxmart-bg rounded-lg text-center border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Active</span>
                <span className="text-lg font-bold text-emerald-600 block mt-0.5">{totalActive}</span>
              </div>

              <div className="p-3 bg-jaxmart-bg rounded-lg text-center border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Inactive</span>
                <span className="text-lg font-bold text-amber-600 block mt-0.5">{totalInactive}</span>
              </div>

              <div className="p-3 bg-jaxmart-bg rounded-lg text-center border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Archived</span>
                <span className="text-lg font-bold text-red-600 block mt-0.5">{totalDeleted}</span>
              </div>

              <div className="p-3 bg-jaxmart-bg rounded-lg text-center border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Customers</span>
                <span className="text-lg font-bold text-jaxmart-primary block mt-0.5">{totalCustomers}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-2">
              <button
                onClick={() => onNavigateTab('users-mgmt')}
                className="px-3.5 py-2 bg-jaxmart-primary text-white rounded-lg text-xs font-semibold hover:bg-jaxmart-navy transition-colors"
              >
                + User Management Portal
              </button>

              <button
                onClick={() => onNavigateTab('catalog')}
                className="px-3.5 py-2 bg-jaxmart-teal text-white rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors"
              >
                + Manage Products & Categories
              </button>
            </div>
          </div>

          {/* Security Alert Preview */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-jaxmart-navy">Security Events & Auth Log Stream</h2>
              <button onClick={() => onNavigateTab('security')} className="text-xs text-jaxmart-teal font-semibold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {securityEvents.map(event => (
                <div key={event.id} className="p-3 rounded-lg border border-gray-200 bg-jaxmart-bg flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        event.status === 'ALERT' ? 'bg-red-100 text-jaxmart-error' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {event.eventType}
                      </span>
                      <span className="font-semibold text-jaxmart-navy">{event.userName}</span>
                      <span className="text-gray-400">({event.userRole})</span>
                    </div>
                    <p className="text-gray-500 mt-1">{event.details} — IP: {event.ipAddress}</p>
                  </div>
                  <span className="text-gray-400 text-[11px] whitespace-nowrap">{event.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Live Audit Activity */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-jaxmart-navy flex items-center space-x-2">
              <Activity className="w-5 h-5 text-jaxmart-teal" />
              <span>Activity & Audit Stream</span>
            </h2>
            <button onClick={() => onNavigateTab('audit-logs')} className="text-xs text-jaxmart-teal font-semibold hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[480px] pr-1">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedAuditLog(log)}
                className="p-3.5 rounded-lg border border-gray-200 hover:border-jaxmart-teal bg-jaxmart-bg cursor-pointer transition-all hover:shadow-jaxmart-sm group"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-jaxmart-navy">{log.userName}</span>
                    <span className="text-[10px] bg-white border border-gray-200 text-jaxmart-mediumBlue px-1.5 py-0.5 rounded font-mono">
                      {log.userRole}
                    </span>
                  </div>
                  <span className="text-gray-400 text-[11px]">{log.time}</span>
                </div>

                <p className="text-xs text-gray-700 font-medium leading-relaxed group-hover:text-jaxmart-primary">
                  {log.description}
                </p>

                <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="truncate max-w-[150px]">Module: {log.module}</span>
                  <span className="text-jaxmart-teal font-semibold group-hover:underline flex items-center">
                    Inspect Diff <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
