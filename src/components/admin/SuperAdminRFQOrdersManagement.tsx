import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RFQ, Order, Payment } from '../../types';
import { FileText, ShoppingCart, CreditCard, DollarSign, CheckCircle2, Clock, Eye } from 'lucide-react';

const mockRfqs: RFQ[] = [];
const mockOrders: Order[] = [];
const mockPayments: Payment[] = [];

export const SuperAdminRFQOrdersManagement: React.FC = () => {
  const { setNotificationToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'RFQS' | 'ORDERS' | 'PAYMENTS'>('RFQS');
  const [rfqs, setRfqs] = useState<RFQ[]>(mockRfqs);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <div>
          <h1 className="text-2xl font-bold text-jaxmart-navy">RFQs, Orders & Payments Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            End-to-end B2B transaction supervision, quotation workflows, order fulfillment & payment verification.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            Payment Gateway: Connected 100%
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab('RFQS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'RFQS' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>RFQs & Quotations ({rfqs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'ORDERS' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'PAYMENTS' ? 'bg-jaxmart-navy text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments & Receipts ({payments.length})</span>
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
                {rfqs.map(r => (
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
                        onClick={() => setNotificationToast(`📋 Viewing details for ${r.rfqNumber}`)}
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
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/80">
                    <td className="p-3">
                      <div className="font-bold text-jaxmart-navy">{o.orderNumber}</div>
                      <div className="text-[10px] text-gray-400">{o.date}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-jaxmart-navy">{o.buyerName}</div>
                      <div className="text-[10px] text-gray-500">Seller: {o.sellerName}</div>
                    </td>
                    <td className="p-3 font-extrabold text-jaxmart-navy">
                      ₹{o.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded">
                        {o.status}
                      </span>
                    </td>
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
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/80">
                    <td className="p-3">
                      <div className="font-bold text-jaxmart-navy">{p.paymentNumber}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{p.transactionRef}</div>
                    </td>
                    <td className="p-3 font-semibold text-jaxmart-primary">{p.orderId}</td>
                    <td className="p-3 font-extrabold text-jaxmart-navy">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-medium text-gray-700">{p.paymentMethod}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded flex items-center w-fit space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{p.status}</span>
                      </span>
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
