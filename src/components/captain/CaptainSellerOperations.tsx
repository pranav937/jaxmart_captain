import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Role } from '../../types';
import { Store, Users, CheckCircle, XCircle, Search, Plus, X, Lock } from 'lucide-react';

export const CaptainSellerOperations: React.FC = () => {
  const { users, currentUser, updateUserStatus, setNotificationToast, createUserAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<'SELLERS' | 'CUSTOMERS'>('SELLERS');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer Form
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: 'CUSTOMER' as Role,
    companyName: ''
  });

  // Strict Scoping Rule for Captain: Only view assigned Sellers and Customers.
  const mySellers = users.filter(u => u.role === 'SELLER' && !u.isDeleted);
  const myCustomers = users.filter(u => u.role === 'CUSTOMER' && !u.isDeleted);

  const currentList = activeTab === 'SELLERS' ? mySellers : myCustomers;

  const filteredUsers = currentList.filter(u => {
    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query) ||
      (u.companyName && u.companyName.toLowerCase().includes(query))
    );
  });

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.firstName || !newCustomer.email) return;

    const res = await createUserAccount(newCustomer);
    if (res.success) {
      setNotificationToast(`✅ Customer ${newCustomer.firstName} added successfully!`);
      setShowAddCustomerModal(false);
      setNewCustomer({ firstName: '', lastName: '', email: '', mobile: '', role: 'CUSTOMER', companyName: '' });
    } else {
      alert(res.message || 'Failed to add customer');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-teal-200">
              Captain Field Operations (30-40% Access)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Assigned Sellers & Customers Directory</h1>
          <p className="text-xs text-gray-500 mt-1">
            Supervise assigned Sellers, verify onboarding details, toggle Seller activation, and manage B2B Customers.
          </p>
        </div>

        {activeTab === 'CUSTOMERS' && (
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="px-4 py-2 bg-jaxmart-teal text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Customer</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('SELLERS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${activeTab === 'SELLERS' ? 'bg-jaxmart-navy text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Store className="w-4 h-4" />
              <span>Assigned Sellers ({mySellers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('CUSTOMERS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${activeTab === 'CUSTOMERS' ? 'bg-jaxmart-navy text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>Assigned Customers ({myCustomers.length})</span>
            </button>
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-jaxmart-teal"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-jaxmart-bg text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-3">{activeTab === 'SELLERS' ? 'Company & Merchant Name' : 'Customer Name'}</th>
                <th className="p-3">Contact Email & Mobile</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                {activeTab === 'SELLERS' && <th className="p-3 text-right">Captain Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No assigned {activeTab.toLowerCase()} records found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/80">
                    <td className="p-3 font-bold text-jaxmart-navy">
                      <div>{u.companyName || u.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {u.id}</div>
                    </td>

                    <td className="p-3 text-gray-700">
                      <div>{u.email}</div>
                      <div className="text-[11px] text-gray-400">{u.mobile}</div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-teal-100 text-teal-800">
                        {u.role}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center w-fit space-x-1 ${u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-jaxmart-error'
                        }`}>
                        {u.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{u.status}</span>
                      </span>
                    </td>

                    {activeTab === 'SELLERS' && (
                      <td className="p-3 text-right">
                        <button
                          onClick={() => updateUserStatus(u.id, u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${u.status === 'ACTIVE'
                            ? 'bg-red-50 text-jaxmart-error border border-red-200 hover:bg-red-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm animate-pulse'
                            }`}
                        >
                          {u.status === 'ACTIVE' ? 'Deactivate' : '✓ Activate Seller Now'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Scope Notice */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <span>Captain Security Scope: Access restricted strictly to assigned merchants. Unassigned Sellers, Admins & System Settings are locked.</span>
        </div>
      </div>

      {/* ADD CUSTOMER MODAL */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-jaxmart-navy">Add B2B Customer</h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.firstName}
                    onChange={e => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newCustomer.lastName}
                    onChange={e => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newCustomer.email}
                  onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={newCustomer.mobile}
                  onChange={e => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                  placeholder="+91 98000 00000"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={newCustomer.companyName}
                  onChange={e => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                  placeholder="e.g. Reliance Industrial Infra"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setShowAddCustomerModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-jaxmart-teal text-white rounded-lg font-semibold hover:bg-teal-600">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
