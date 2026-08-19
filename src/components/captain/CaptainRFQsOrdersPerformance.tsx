import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RFQ, Order, Product } from '../../types';
import { Package, FileText, ShoppingCart, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const mockProducts: Product[] = [];
const mockAssignedRfqs: RFQ[] = [];
const mockOrders: Order[] = [];

export const CaptainRFQsOrdersPerformance: React.FC = () => {
  const { setNotificationToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'RFQS' | 'ORDERS' | 'PERFORMANCE'>('PRODUCTS');

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <div>
          <h1 className="text-2xl font-bold text-jaxmart-navy">Products Catalog, Assigned RFQs & Orders Tracking</h1>
          <p className="text-xs text-gray-500 mt-1">
            View products, follow assigned RFQs & quotes, track order fulfillment status, and inspect performance metrics.
          </p>
        </div>

        <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full border border-teal-200">
          Field Operations Scope
        </span>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${activeTab === 'PRODUCTS' ? 'bg-jaxmart-navy text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Package className="w-4 h-4" />
            <span>Seller Products ({mockProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('RFQS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${activeTab === 'RFQS' ? 'bg-jaxmart-navy text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>Assigned RFQs ({mockAssignedRfqs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${activeTab === 'ORDERS' ? 'bg-jaxmart-navy text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Track Orders ({mockOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PERFORMANCE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${activeTab === 'PERFORMANCE' ? 'bg-jaxmart-navy text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>My Performance</span>
          </button>
        </div>

        {/* PRODUCTS VIEW */}
        {activeTab === 'PRODUCTS' && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-jaxmart-bg text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Product Name & SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Seller Name</th>
                  <th className="p-3">Price & Stock</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {mockProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/80">
                    <td className="p-3">
                      <div className="font-bold text-jaxmart-navy">{p.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{p.sku}</div>
                    </td>
                    <td className="p-3 font-semibold text-jaxmart-primary">{p.category}</td>
                    <td className="p-3 font-medium text-gray-700">{p.sellerName}</td>
                    <td className="p-3 font-extrabold text-jaxmart-navy">₹{p.price.toLocaleString('en-IN')} (Stock: {p.stock})</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* RFQS VIEW */}
        {activeTab === 'RFQS' && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-jaxmart-bg text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">RFQ Ref</th>
                  <th className="p-3">Buyer & Seller</th>
                  <th className="p-3">Product & Quantity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {mockAssignedRfqs.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/80">
                    <td className="p-3 font-bold text-jaxmart-navy">{r.rfqNumber}</td>
                    <td className="p-3 font-semibold text-jaxmart-navy">{r.customerName} → {r.sellerName}</td>
                    <td className="p-3">{r.productName} ({r.quantity} units)</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setNotificationToast(`📋 Following up RFQ ${r.rfqNumber}`)}
                        className="px-2.5 py-1 bg-jaxmart-teal text-white font-semibold rounded text-xs hover:bg-teal-600"
                      >
                        Follow RFQ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS VIEW */}
        {activeTab === 'ORDERS' && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-jaxmart-bg text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Order No</th>
                  <th className="p-3">Buyer</th>
                  <th className="p-3">Seller</th>
                  <th className="p-3">Total Value</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {mockOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/80">
                    <td className="p-3 font-bold text-jaxmart-navy">{o.orderNumber}</td>
                    <td className="p-3 font-semibold text-jaxmart-navy">{o.buyerName}</td>
                    <td className="p-3 text-gray-700">{o.sellerName}</td>
                    <td className="p-3 font-extrabold text-jaxmart-navy">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-emerald-600 flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PERFORMANCE VIEW */}
        {activeTab === 'PERFORMANCE' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-jaxmart-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Assigned Sellers Volume</p>
              <h3 className="text-xl font-extrabold text-jaxmart-navy mt-1">₹48.5 Lakhs</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Quarterly Managed Volume</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-jaxmart-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Field Task Completion</p>
              <h3 className="text-xl font-extrabold text-jaxmart-navy mt-1">96.2%</h3>
              <p className="text-[11px] text-jaxmart-teal font-medium mt-1">On-Time Completion</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-jaxmart-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Sellers Onboarded</p>
              <h3 className="text-xl font-extrabold text-jaxmart-navy mt-1">12 Sellers</h3>
              <p className="text-[11px] text-blue-600 font-medium mt-1">100% Verified Profiles</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
