import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, ShoppingCart, TrendingUp, Layers, Users, ShieldAlert } from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      
      {/* Seller Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-amber-200">
            Seller Portal — {currentUser.companyName || 'ABC Traders Pvt Ltd'}
          </span>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Store Dashboard & Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Supervised by Captain <strong className="text-jaxmart-navy">{currentUser.assignedCaptainName || 'Amit Verma'}</strong> & Admin <strong className="text-jaxmart-navy">{currentUser.assignedAdminName || 'Rahul Sharma'}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-jaxmart-bg px-3 py-1.5 rounded-lg border border-gray-200 text-xs">
          <ShieldAlert className="w-4 h-4 text-jaxmart-teal" />
          <span className="text-gray-600 font-medium">Scoping: Isolated Seller View</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">My Active Products</p>
            <h3 className="text-2xl font-bold text-jaxmart-navy mt-1">124 SKUs</h3>
            <span className="text-xs text-emerald-600 font-medium">All Verified</span>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-jaxmart-primary rounded-lg flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">My Total Orders</p>
            <h3 className="text-2xl font-bold text-jaxmart-navy mt-1">1,420</h3>
            <span className="text-xs text-emerald-600 font-medium">18 Pending Shipment</span>
          </div>
          <div className="w-10 h-10 bg-teal-50 text-jaxmart-teal rounded-lg flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">My Gross Revenue</p>
            <h3 className="text-2xl font-bold text-jaxmart-navy mt-1">₹48,50,000</h3>
            <span className="text-xs text-emerald-600 font-medium">+14.5% vs last month</span>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Inventory Stock Status</p>
            <h3 className="text-2xl font-bold text-jaxmart-navy mt-1">8,450 Units</h3>
            <span className="text-xs text-emerald-600 font-medium">In Warehouse</span>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Seller Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-jaxmart-navy">My Recent Orders</h2>
            <p className="text-xs text-gray-500">Orders placed for {currentUser.companyName || 'ABC Traders'}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-jaxmart-bg text-jaxmart-mediumBlue font-semibold uppercase tracking-wider border-b border-gray-200">
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Buyer Name</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-jaxmart-bg/50">
                <td className="p-3.5 font-bold text-jaxmart-navy">ORD-99201</td>
                <td className="p-3.5 text-gray-700">Metro Infrastructure Ltd</td>
                <td className="p-3.5">4 Units Heavy Motors</td>
                <td className="p-3.5 font-bold text-jaxmart-primary">₹1,70,000</td>
                <td className="p-3.5 text-gray-500">11 Aug 2026</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    PROCESSING
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-jaxmart-bg/50">
                <td className="p-3.5 font-bold text-jaxmart-navy">ORD-99188</td>
                <td className="p-3.5 text-gray-700">Gujarat Engineering Co</td>
                <td className="p-3.5">25 Units Valves</td>
                <td className="p-3.5 font-bold text-jaxmart-primary">₹85,000</td>
                <td className="p-3.5 text-gray-500">10 Aug 2026</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    DELIVERED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
