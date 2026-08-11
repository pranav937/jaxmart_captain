import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  UserCheck,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const SuperAdminDashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const { users, activityLogs, securityEvents, setSelectedAuditLog } = useAuth();

  const totalAdmins = users.filter(u => u.role === 'ADMIN').length;
  const totalCaptains = users.filter(u => u.role === 'CAPTAIN').length;
  const totalSellers = users.filter(u => u.role === 'SELLER').length;
  const totalActive = users.filter(u => u.status === 'ACTIVE').length;
  const totalInactive = users.filter(u => u.status === 'INACTIVE').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-jaxmart-navy via-jaxmart-primary to-jaxmart-mediumBlue text-white p-6 rounded-xl shadow-jaxmart-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-jaxmart-teal/20 text-jaxmart-teal border border-jaxmart-teal/40 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Super Admin Control Center
            </span>
            <span className="text-xs text-gray-300">| System Status: Operational 100%</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">Platform-Wide Overview & Governance</h1>
          <p className="text-sm text-gray-200 mt-1 max-w-2xl">
            Complete visibility over all Admins, Captains, Sellers, revenue metrics, and real-time audit logs across the Jaxmart ecosystem.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('audit-logs')}
            className="px-4 py-2 bg-jaxmart-teal text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors shadow-sm flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>View Full Audit Logs</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Admins */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Admins</p>
            <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">{totalAdmins}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +2 this month
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Captains */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Captains</p>
            <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">{totalCaptains}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +5 active captains
            </p>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-jaxmart-teal rounded-xl flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Sellers */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sellers</p>
            <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">{totalSellers}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14.2% growth
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-jaxmart-primary rounded-xl flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross B2B Revenue</p>
            <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">₹1.84 Cr</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +18.5% YoY
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: User Status Breakdown & Recent Activity Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): System Overview & Active/Inactive breakdown */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* User Status Summary & Quick Actions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-jaxmart-navy">User Status & Hierarchy Metrics</h2>
              <span className="text-xs text-gray-500 font-medium">Real-Time Database Sync</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-jaxmart-bg rounded-lg text-center border border-gray-200">
                <span className="text-xs text-gray-500 font-semibold block uppercase">Active Accounts</span>
                <span className="text-xl font-bold text-emerald-600 mt-1 block">{totalActive}</span>
              </div>

              <div className="p-4 bg-jaxmart-bg rounded-lg text-center border border-gray-200">
                <span className="text-xs text-gray-500 font-semibold block uppercase">Inactive Accounts</span>
                <span className="text-xl font-bold text-jaxmart-error mt-1 block">{totalInactive}</span>
              </div>

              <div className="p-4 bg-jaxmart-bg rounded-lg text-center border border-gray-200">
                <span className="text-xs text-gray-500 font-semibold block uppercase">Products Catalog</span>
                <span className="text-xl font-bold text-jaxmart-primary mt-1 block">1,480</span>
              </div>
            </div>

            {/* Quick Management Shortcuts */}
            <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-2">
              <button
                onClick={() => onNavigateTab('add-captain-workflow')}
                className="px-3.5 py-2 bg-jaxmart-primary text-white rounded-lg text-xs font-semibold hover:bg-jaxmart-navy transition-colors"
              >
                + Add New Captain
              </button>

              <button
                onClick={() => onNavigateTab('add-seller-workflow')}
                className="px-3.5 py-2 bg-jaxmart-teal text-white rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors"
              >
                + Add New Seller
              </button>

              <button
                onClick={() => onNavigateTab('permissions')}
                className="px-3.5 py-2 bg-jaxmart-bg border border-gray-300 text-jaxmart-navy rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
              >
                Configure Permission Matrix
              </button>
            </div>
          </div>

          {/* Security Alert Log Preview */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-jaxmart-navy flex items-center space-x-2">
                <span>Security Events & Auth Alerts</span>
              </h2>
              <button onClick={() => onNavigateTab('security')} className="text-xs text-jaxmart-teal font-semibold hover:underline">
                View All Security Logs
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

        {/* Right Column (1 col): Prominent "Recent Activity" Stream */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-jaxmart-navy flex items-center space-x-2">
              <Activity className="w-5 h-5 text-jaxmart-teal" />
              <span>Recent Activity Feed</span>
            </h2>
            <button onClick={() => onNavigateTab('audit-logs')} className="text-xs text-jaxmart-teal font-semibold hover:underline">
              View All
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Live stream of Admin & Captain activities across the platform.
          </p>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-1">
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
