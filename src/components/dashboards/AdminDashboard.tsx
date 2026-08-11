import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Store, Package, ShoppingCart, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const { users, currentUser, updateUserStatus, notificationToast, setNotificationToast } = useAuth();

  const myCaptains = users.filter(u => u.role === 'CAPTAIN');
  const mySellers = users.filter(u => u.role === 'SELLER');
  const pendingCaptains = myCaptains.filter(c => c.status === 'INACTIVE');

  return (
    <div className="space-y-6">

      {/* Toast Banner if status changed */}
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

      {/* Admin Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-200">
              Regional Admin Command Center
            </span>
            {pendingCaptains.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                {pendingCaptains.length} Captain Pending Activation
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Welcome back, {currentUser.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Supervise assigned Captains, activate new Captain accounts, and oversee regional Seller operations.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('add-captain-workflow')}
          className="px-4 py-2 bg-jaxmart-primary text-white rounded-lg text-sm font-semibold hover:bg-jaxmart-navy transition-colors shadow-sm"
        >
          + Add New Captain
        </button>
      </div>

      {/* Activation Rule Notice Box */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block text-sm mb-0.5">Hierarchical Activation Rule Active:</strong>
          Captains created or registered will remain <span className="font-bold underline">INACTIVE</span> until you as Admin click <strong>"Activate Captain"</strong>. A Captain cannot sign in to their portal until you activate them!
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Assigned Captains</p>
            <h3 className="text-2xl font-bold text-jaxmart-navy mt-1">{myCaptains.length}</h3>
            <span className="text-xs text-emerald-600 font-medium">
              {myCaptains.filter(c => c.status === 'ACTIVE').length} Active Accounts
            </span>
          </div>
          <div className="w-10 h-10 bg-teal-50 text-jaxmart-teal rounded-lg flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Managed Sellers</p>
            <h3 className="text-2xl font-bold text-jaxmart-navy mt-1">{mySellers.length}</h3>
            <span className="text-xs text-emerald-600 font-medium">Under Captains</span>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-jaxmart-primary rounded-lg flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Catalog SKUs</p>
            <h3 className="text-2xl font-bold text-jaxmart-navy mt-1">492 SKUs</h3>
            <span className="text-xs text-emerald-600 font-medium">Regional Catalog</span>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Regional Orders</p>
            <h3 className="text-2xl font-bold text-jaxmart-navy mt-1">1,930</h3>
            <span className="text-xs text-emerald-600 font-medium">₹67.4 Lakhs Value</span>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Captains Managed Table with Activate Button */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-jaxmart-navy">Captains Management & Activation</h2>
            <p className="text-xs text-gray-500">Admin Rahul Sharma must activate Captains to enable their login</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-jaxmart-bg text-jaxmart-mediumBlue font-semibold uppercase tracking-wider border-b border-gray-200">
                <th className="p-3.5">Captain Name</th>
                <th className="p-3.5">Email & Phone</th>
                <th className="p-3.5">Sellers Count</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5 text-right">Admin Activation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myCaptains.map(cap => {
                const isActive = cap.status === 'ACTIVE';

                return (
                  <tr key={cap.id} className="hover:bg-jaxmart-bg/50 transition-colors">
                    <td className="p-3.5 font-bold text-jaxmart-navy flex items-center space-x-2">
                      <img src={cap.avatarUrl} alt="" className="w-8 h-8 rounded-full border" />
                      <div>
                        <div>{cap.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">ID: {cap.id}</div>
                      </div>
                    </td>

                    <td className="p-3.5 text-gray-600">
                      <div>{cap.email}</div>
                      <div className="text-[11px] text-gray-400">{cap.mobile}</div>
                    </td>

                    <td className="p-3.5 font-bold text-jaxmart-primary">{cap.sellersCount || 0} Sellers</td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-jaxmart-error'
                        }`}>
                        {isActive ? 'ACTIVE (Can Sign In)' : 'INACTIVE (Login Blocked)'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      {isActive ? (
                        <button
                          onClick={() => updateUserStatus(cap.id, 'INACTIVE')}
                          className="px-3 py-1.5 bg-red-50 text-jaxmart-error border border-red-200 hover:bg-red-100 rounded text-xs font-bold transition-all"
                        >
                          Deactivate Captain
                        </button>
                      ) : (
                        <button
                          onClick={() => updateUserStatus(cap.id, 'ACTIVE')}
                          className="px-4 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-bold shadow-sm transition-all animate-bounce"
                        >
                          ✓ Activate Captain Now
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
