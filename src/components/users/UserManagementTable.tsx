import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Role } from '../../types';
import { Search, UserCheck, ShieldCheck, Store, Shield, ArrowRight, MoreVertical } from 'lucide-react';

export const UserManagementTable: React.FC = () => {
  const { users, updateUserStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') return user.status === 'ACTIVE';
    if (activeTab === 'INACTIVE') return user.status === 'INACTIVE';
    return user.role === activeTab;
  });

  const getRoleBadgeStyle = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CAPTAIN':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'SELLER':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-200">
            Platform Directory
          </span>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Centralized User Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Super Admin global directory of all Super Admins, Admins, Captains, and Sellers with strict hierarchy tracking.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'SUPER_ADMIN', 'ADMIN', 'CAPTAIN', 'SELLER', 'ACTIVE', 'INACTIVE'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === tab
                    ? 'bg-jaxmart-primary text-white shadow-sm'
                    : 'bg-jaxmart-bg text-jaxmart-navy hover:bg-gray-200'
                  }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user or email..."
              className="w-full pl-9 pr-4 py-1.5 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs text-jaxmart-navy focus:outline-none focus:ring-2 focus:ring-jaxmart-primary/20"
            />
          </div>

        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-jaxmart-bg text-jaxmart-mediumBlue font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-3.5">User Identity</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Hierarchy Scope</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Last Active</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-jaxmart-bg/50 transition-colors">

                  {/* User Identity */}
                  <td className="p-3.5">
                    <div className="flex items-center space-x-3">
                      <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                      <div>
                        <div className="font-bold text-jaxmart-navy">{user.name}</div>
                        {user.companyName && (
                          <div className="text-[11px] text-gray-500 font-semibold">{user.companyName}</div>
                        )}
                        <div className="text-[10px] text-gray-400 font-mono">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Hierarchy Scope */}
                  <td className="p-3.5 text-gray-600">
                    {user.role === 'SUPER_ADMIN' && <span className="text-purple-700 font-bold">Global System</span>}
                    {user.role === 'ADMIN' && <span className="text-blue-700 font-bold">Regional Leader</span>}
                    {user.role === 'CAPTAIN' && (
                      <div>
                        <span className="text-gray-500 text-[11px]">Admin:</span> <strong className="text-jaxmart-navy">{user.assignedAdminName || 'Rahul Sharma'}</strong>
                      </div>
                    )}
                    {user.role === 'SELLER' && (
                      <div className="text-[11px] space-y-0.5">
                        <div>Captain: <strong className="text-jaxmart-teal">{user.assignedCaptainName || 'Amit Verma'}</strong></div>
                        <div>Admin: <strong className="text-jaxmart-primary">{user.assignedAdminName || 'Rahul Sharma'}</strong></div>
                      </div>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="p-3.5 text-gray-700">
                    <div>{user.email}</div>
                    <div className="text-gray-500 text-[11px]">{user.mobile}</div>
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${user.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-jaxmart-error'
                      }`}>
                      {user.status}
                    </span>
                  </td>

                  {/* Last Active */}
                  <td className="p-3.5 text-gray-500 font-medium whitespace-nowrap">
                    {user.lastLogin}
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right whitespace-nowrap">
                    {user.status === 'ACTIVE' ? (
                      <button
                        onClick={() => updateUserStatus(user.id, 'INACTIVE')}
                        className="px-2.5 py-1 bg-red-50 text-jaxmart-error hover:bg-red-100 rounded text-xs font-semibold border border-red-200 transition-colors"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-xs font-semibold border border-emerald-200 transition-colors"
                      >
                        Activate
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
