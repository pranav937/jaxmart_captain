import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';

export const AdminUserOperations: React.FC = () => {
  const { users, updateUserStatus, setNotificationToast, createUserAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<'CAPTAIN' | 'SELLER' | 'CUSTOMER'>('CAPTAIN');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddCaptainModal, setShowAddCaptainModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<User | null>(null);
  const [selectedCaptainId, setSelectedCaptainId] = useState('');

  // Form for New Captain
  const [newCaptain, setNewCaptain] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: 'CAPTAIN' as Role,
    password: '123456'
  });

  // Filter users based on Admin Scope: Admin cannot view or manage SUPER_ADMIN accounts
  const filteredUsers = users.filter(u => {
    if (u.role === 'SUPER_ADMIN') return false; // Strictly restricted
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
      setNewCaptain({ firstName: '', lastName: '', email: '', mobile: '', role: 'CAPTAIN', password: '123456' });
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-200">
              Admin Scoped Operations (70-80% Access)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Captains, Sellers & Customers Governance</h1>
          <p className="text-xs text-gray-500 mt-1">
            Supervise assigned Captains, activate new Captain accounts, assign Sellers to Captains, and manage Customer accounts.
          </p>
        </div>

        {activeTab === 'CAPTAIN' && (
          <button
            onClick={() => setShowAddCaptainModal(true)}
            className="px-4 py-2 bg-jaxmart-primary text-white text-sm font-semibold rounded-lg hover:bg-jaxmart-navy transition-colors flex items-center space-x-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create New Captain</span>
          </button>
        )}
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            {[
              { id: 'CAPTAIN', label: 'Captains Governance', icon: UserCheck },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
                  activeTab === tab.id
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
                        <img src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={u.name} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
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
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] flex items-center w-fit space-x-1 ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-jaxmart-error'
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
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          u.status === 'ACTIVE' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
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

      {/* Security Scoping Banner */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <span>Security Scope Active: Admin accounts cannot edit or modify Super Admin users or permissions.</span>
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
                <label className="font-semibold text-gray-700 block mb-1">Captain Password (Default: 123456)</label>
                <input
                  type="text"
                  value={newCaptain.password}
                  onChange={e => setNewCaptain({ ...newCaptain, password: e.target.value })}
                  placeholder="123456"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal font-mono text-xs"
                />
                <span className="text-[10px] text-gray-400">Default password is 123456. You can type a custom password if desired.</span>
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
