import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Role } from '../../types';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Store,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  RotateCcw,
  UserCheck as AssignIcon,
  X
} from 'lucide-react';

export const SuperAdminUserManagement: React.FC = () => {
  const { users, updateUserStatus, deleteUserAccount, restoreUserAccount, setNotificationToast, createUserAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<'ALL' | 'ADMIN' | 'CAPTAIN' | 'SELLER' | 'CUSTOMER' | 'DELETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<User | null>(null);
  const [selectedCaptainId, setSelectedCaptainId] = useState('');

  // Add User Form State
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: 'ADMIN' as Role,
    password: '123456',
    companyName: ''
  });

  const filteredUsers = users.filter(u => {
    if (activeTab === 'DELETED') return u.isDeleted;
    if (u.isDeleted) return false;
    if (activeTab !== 'ALL' && u.role !== activeTab) return false;

    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query) ||
      (u.companyName && u.companyName.toLowerCase().includes(query))
    );
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.firstName || !newUser.email) return;

    const result = await createUserAccount(newUser);
    if (result.success) {
      setNotificationToast(`✅ ${newUser.role} user created successfully!`);
      setShowAddModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', mobile: '', role: 'ADMIN', password: '123456', companyName: '' });
    } else {
      alert(result.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? (Record will be archived)`)) return;
    await deleteUserAccount(id);
    setNotificationToast(`🗑️ User ${name} moved to Archived / Deleted.`);
  };

  const handleRestoreUser = async (id: string, name: string) => {
    await restoreUserAccount(id);
    setNotificationToast(`🔄 User ${name} restored to active status.`);
  };

  const handleAssignCaptain = async () => {
    if (!showAssignModal || !selectedCaptainId) return;
    const captainObj = users.find(u => u.id === selectedCaptainId);
    setNotificationToast(`🤝 Captain ${captainObj?.name || 'Selected'} assigned to Seller ${showAssignModal.name}`);
    setShowAssignModal(null);
  };

  const captainsList = users.filter(u => u.role === 'CAPTAIN' && u.status === 'ACTIVE' && !u.isDeleted);

  return (
    <div className="space-y-6">

      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <div>
          <h1 className="text-2xl font-bold text-jaxmart-navy">Super Admin User Governance</h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete management over Admins, Captains, Sellers, and Customers across the platform.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-jaxmart-primary text-white text-sm font-semibold rounded-lg hover:bg-jaxmart-navy transition-colors flex items-center space-x-2 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Create New User</span>
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: 'All Platform Users', icon: Users },
              { id: 'ADMIN', label: 'Admins', icon: ShieldCheck },
              { id: 'CAPTAIN', label: 'Captains', icon: UserCheck },
              { id: 'DELETED', label: 'Archived / Deleted', icon: Trash2, badge: 'Soft Deleted' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${activeTab === tab.id
                    ? 'bg-jaxmart-navy text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && <span className="ml-1 text-[10px] bg-red-100 text-jaxmart-error px-1.5 py-0.2 rounded font-bold">{tab.badge}</span>}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search user, email, ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-jaxmart-teal outline-none"
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
                <th className="p-3">Hierarchy Supervision</th>
                <th className="p-3 text-right">Super Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-jaxmart-navy text-white font-bold flex items-center justify-center text-xs shrink-0 border border-gray-200">
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-jaxmart-navy">{u.name}</div>
                          <div className="text-[11px] text-gray-500">{u.email} • {u.mobile}</div>
                          {u.companyName && <div className="text-[10px] text-jaxmart-teal font-medium">{u.companyName}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                            u.role === 'CAPTAIN' ? 'bg-teal-100 text-teal-800' :
                              u.role === 'SELLER' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] flex items-center w-fit space-x-1 ${u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-jaxmart-error'
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
                            <AssignIcon className="w-3 h-3 mr-0.5" /> Reassign Captain
                          </button>
                        </div>
                      )}
                      {u.role === 'CAPTAIN' && (
                        <span className="text-gray-500">Supervised by: <strong className="text-jaxmart-navy">{u.assignedAdminName || 'Jaxmart Admin'}</strong></span>
                      )}
                      {u.role === 'ADMIN' && <span className="text-gray-400">Direct Super Admin Scope</span>}
                      {u.role === 'SUPER_ADMIN' && <span className="text-purple-600 font-bold">Unrestricted Access</span>}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {activeTab === 'DELETED' || u.isDeleted ? (
                          <button
                            onClick={() => handleRestoreUser(u.id, u.name)}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-xs font-semibold flex items-center space-x-1"
                          >
                            <RotateCcw className="w-3 h-3" /> <span>Restore</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => updateUserStatus(u.id, u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                              className={`px-2.5 py-1 rounded text-xs font-semibold ${u.status === 'ACTIVE' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                            >
                              {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1 text-gray-400 hover:text-jaxmart-error rounded hover:bg-red-50"
                              title="Delete/Archive Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-jaxmart-navy">Create System Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Target Account Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value as Role })}
                  className="w-full p-2 border border-gray-300 rounded-lg font-semibold text-jaxmart-navy outline-none focus:ring-2 focus:ring-jaxmart-teal"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="CAPTAIN">Captain</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={newUser.mobile}
                  onChange={e => setNewUser({ ...newUser, mobile: e.target.value })}
                  placeholder="+91 98000 00000"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Account Password (Default: 123456)</label>
                <input
                  type="text"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="123456"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal font-mono text-xs"
                />
                <span className="text-[10px] text-gray-400">You can keep 123456 or type a custom password for this account.</span>
              </div>

              {newUser.role === 'SELLER' && (
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Company / Business Name</label>
                  <input
                    type="text"
                    value={newUser.companyName}
                    onChange={e => setNewUser({ ...newUser, companyName: e.target.value })}
                    placeholder="ABC Enterprise Pvt Ltd"
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-jaxmart-primary text-white rounded-lg font-semibold hover:bg-jaxmart-navy shadow-sm"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN CAPTAIN MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-jaxmart-navy">Assign Captain to Seller</h3>
            <p className="text-xs text-gray-500">
              Assign a Captain supervisor to Seller: <strong>{showAssignModal.name}</strong>
            </p>

            <select
              value={selectedCaptainId}
              onChange={e => setSelectedCaptainId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-jaxmart-teal"
            >
              <option value="">-- Select Active Captain --</option>
              {captainsList.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button onClick={() => setShowAssignModal(null)} className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleAssignCaptain} className="px-3 py-1.5 text-xs font-semibold bg-jaxmart-teal text-white rounded-lg">Confirm Assignment</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
