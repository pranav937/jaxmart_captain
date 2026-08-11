import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, Package, ShoppingCart, UserCheck, TrendingUp, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const CaptainDashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const { users, currentUser, updateUserStatus, notificationToast, setNotificationToast } = useAuth();

  const mySellers = users.filter(u => u.role === 'SELLER');
  const activeSellers = mySellers.filter(s => s.status === 'ACTIVE');
  const pendingSellers = mySellers.filter(s => s.status === 'INACTIVE');

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
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

      {/* Captain Banner */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-teal-200">
              Captain Command Workspace
            </span>
            {pendingSellers.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingSellers.length} Seller Pending Activation
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Captain Workspace — {currentUser.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Supervised by Admin <strong className="text-jaxmart-navy">{currentUser.assignedAdminName || 'Rahul Sharma'}</strong>. Manage assigned seller onboardings and activation approvals.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('add-seller-workflow')}
          className="px-4 py-2 bg-jaxmart-teal text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors shadow-sm flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Seller</span>
        </button>
      </div>

      {/* Activation Notice */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block text-sm mb-0.5">Hierarchical Seller Activation Rule:</strong>
          Sellers created by you or registered online remain <span className="font-bold underline">INACTIVE</span> until you as Captain click <strong>"Activate Seller"</strong>. A Seller cannot sign in to their store portal until you activate them!
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">My Managed Sellers</p>
            <h3 className="text-2xl font-bold text-jaxmart-navy mt-1">{mySellers.length}</h3>
            <span className="text-xs text-emerald-600 font-medium">{activeSellers.length} Active Accounts</span>
          </div>
          <div className="w-10 h-10 bg-teal-50 text-jaxmart-teal rounded-lg flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Active Catalog</p>
            <h3 className="text-2xl font-bold text-jaxmart-navy mt-1">192 Products</h3>
            <span className="text-xs text-emerald-600 font-medium">Verified Stock</span>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-jaxmart-primary rounded-lg flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Orders Velocity</p>
            <h3 className="text-2xl font-bold text-jaxmart-navy mt-1">1,420 Orders</h3>
            <span className="text-xs text-emerald-600 font-medium">+12% this month</span>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Seller Volume</p>
            <h3 className="text-2xl font-bold text-jaxmart-navy mt-1">₹48.5 Lakhs</h3>
            <span className="text-xs text-emerald-600 font-medium">Quarterly Total</span>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Seller Activation Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-jaxmart-navy">My Managed Sellers & Activation Status</h2>
            <p className="text-xs text-gray-500">Captain {currentUser.name} must activate Sellers before they can sign in</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-jaxmart-bg text-jaxmart-mediumBlue font-semibold uppercase tracking-wider border-b border-gray-200">
                <th className="p-3.5">Company Name</th>
                <th className="p-3.5">Contact Person</th>
                <th className="p-3.5">Email & Mobile</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Captain Activation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mySellers.map(s => {
                const isActive = s.status === 'ACTIVE';

                return (
                  <tr key={s.id} className="hover:bg-jaxmart-bg/50 transition-colors">
                    <td className="p-3.5 font-bold text-jaxmart-navy">{s.companyName || s.name}</td>
                    <td className="p-3.5 text-gray-700">{s.name}</td>
                    <td className="p-3.5 text-gray-600">{s.email} | {s.mobile}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-jaxmart-error'
                      }`}>
                        {isActive ? 'ACTIVE (Can Sign In)' : 'INACTIVE (Login Blocked)'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {isActive ? (
                        <button
                          onClick={() => updateUserStatus(s.id, 'INACTIVE')}
                          className="px-3 py-1.5 bg-red-50 text-jaxmart-error border border-red-200 hover:bg-red-100 rounded text-xs font-bold transition-all"
                        >
                          Deactivate Seller
                        </button>
                      ) : (
                        <button
                          onClick={() => updateUserStatus(s.id, 'ACTIVE')}
                          className="px-4 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-bold shadow-sm transition-all animate-bounce"
                        >
                          ✓ Activate Seller Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
