import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RFQ, Order, Payment } from '../../types';
import { FileText, ShoppingCart, CreditCard, BarChart3, CheckCircle2 } from 'lucide-react';

const mockRfqs: RFQ[] = [];
const mockOrders: Order[] = [];
const mockPayments: Payment[] = [];

export const AdminRFQOrdersOperations: React.FC = () => {
  const { setNotificationToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'RFQS' | 'ORDERS' | 'PAYMENTS' | 'REPORTS'>('RFQS');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <div>
          <h1 className="text-2xl font-bold text-jaxmart-navy">RFQs, Quotations, Orders & View Payments</h1>
          <p className="text-xs text-gray-500 mt-1">
            Supervise regional B2B RFQs, Quotations, Order fulfillment, View Payments, and inspect Regional Reports.
          </p>
        </div>

        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
          Regional Operations Scope
        </span>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('RFQS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'RFQS' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Manage RFQs & Quotations</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'ORDERS' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Manage Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'PAYMENTS' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>View Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'REPORTS' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Regional Reports</span>
          </button>
        </div>

        {/* RFQS VIEW */}
        {activeTab === 'RFQS' && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-jaxmart-bg text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">RFQ Details</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Product & Qty</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {mockRfqs.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/80">
                    <td className="p-3">
                      <div className="font-bold text-jaxmart-navy">{r.rfqNumber}</div>
                      <div className="text-[10px] text-gray-400">{r.createdAt}</div>
                    </td>
                    <td className="p-3 font-semibold text-jaxmart-navy">{r.customerName}</td>
                    <td className="p-3">
                      <div className="font-medium text-jaxmart-navy">{r.productName}</div>
                      <div className="text-[10px] text-gray-500">Qty: {r.quantity} units</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        r.status === 'QUOTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setNotificationToast(`📋 Inspecting RFQ ${r.rfqNumber}`)}
                        className="px-2.5 py-1 bg-jaxmart-teal text-white font-semibold rounded text-xs hover:bg-teal-600"
                      >
                        Inspect RFQ
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
                  <th className="p-3">Order No & Date</th>
                  <th className="p-3">Buyer & Seller</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {mockOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/80">
                    <td className="p-3">
                      <div className="font-bold text-jaxmart-navy">{o.orderNumber}</div>
                      <div className="text-[10px] text-gray-400">{o.date}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-jaxmart-navy">{o.buyerName}</div>
                      <div className="text-[10px] text-gray-500">Seller: {o.sellerName}</div>
                    </td>
                    <td className="p-3 font-extrabold text-jaxmart-navy">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-emerald-600">{o.paymentStatus}</td>
                    <td className="p-3 font-bold text-blue-600">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAYMENTS VIEW */}
        {activeTab === 'PAYMENTS' && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-jaxmart-bg text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Payment Ref</th>
                  <th className="p-3">Order Ref</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {mockPayments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/80">
                    <td className="p-3">
                      <div className="font-bold text-jaxmart-navy">{p.paymentNumber}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{p.transactionRef}</div>
                    </td>
                    <td className="p-3 font-semibold text-jaxmart-primary">{p.orderId}</td>
                    <td className="p-3 font-extrabold text-jaxmart-navy">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-medium text-gray-700">{p.paymentMethod}</td>
                    <td className="p-3 font-bold text-emerald-600 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORTS VIEW */}
        {activeTab === 'REPORTS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-jaxmart-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Regional Order Growth</p>
              <h3 className="text-xl font-extrabold text-jaxmart-navy mt-1">₹67.4 Lakhs</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ 14.2% Month-on-Month</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-jaxmart-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Active Captain Fulfillment</p>
              <h3 className="text-xl font-extrabold text-jaxmart-navy mt-1">98.8%</h3>
              <p className="text-[11px] text-jaxmart-teal font-medium mt-1">On-Time SLA Delivery</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-jaxmart-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">RFQs Conversion Rate</p>
              <h3 className="text-xl font-extrabold text-jaxmart-navy mt-1">84.5%</h3>
              <p className="text-[11px] text-blue-600 font-medium mt-1">From RFQ to Accepted Quote</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
