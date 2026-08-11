import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { Search, Filter, Download, Activity, Eye, ChevronRight } from 'lucide-react';

export const ActivityLogTable: React.FC = () => {
  const { activityLogs, setSelectedAuditLog } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'ALL' || log.userRole === selectedRole;
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;

    return matchesSearch && matchesRole && matchesAction && matchesModule;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-jaxmart-teal text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Super Admin Audit Monitor
            </span>
            <span className="text-xs text-gray-500">| Complete Activity Oversight</span>
          </div>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Activity & Audit Logs System</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Monitor every creation, status change, pricing update, and security event executed by Admins and Captains across the platform.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting audit logs as CSV...')}
          className="px-4 py-2 bg-jaxmart-primary text-white rounded-lg text-sm font-semibold hover:bg-jaxmart-navy transition-colors shadow-sm flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, action description, ID..."
              className="w-full pl-9 pr-4 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs text-jaxmart-navy focus:outline-none focus:ring-2 focus:ring-jaxmart-primary/20"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            
            {/* Filter by Role */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs font-semibold text-jaxmart-navy"
            >
              <option value="ALL">All User Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="CAPTAIN">Captain</option>
              <option value="SELLER">Seller</option>
            </select>

            {/* Filter by Action */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs font-semibold text-jaxmart-navy"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            </select>

            {/* Filter by Module */}
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs font-semibold text-jaxmart-navy"
            >
              <option value="ALL">All Modules</option>
              <option value="Captain Management">Captain Management</option>
              <option value="Seller Management">Seller Management</option>
              <option value="Product Catalog">Product Catalog</option>
            </select>

          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-jaxmart-bg text-jaxmart-mediumBlue font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">User & Role</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Module / Entity</th>
                <th className="p-3.5">Activity Description</th>
                <th className="p-3.5">IP & Device</th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-jaxmart-bg/60 transition-colors">
                    <td className="p-3.5 font-medium text-gray-600 whitespace-nowrap">
                      <div>{log.date}</div>
                      <div className="text-[11px] text-gray-400">{log.time}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-jaxmart-navy flex items-center space-x-2">
                        <span>{log.userName}</span>
                        <span className="text-[10px] bg-jaxmart-bg border border-gray-200 text-jaxmart-primary px-1.5 py-0.5 rounded font-mono">
                          {log.userRole}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        log.action === 'CREATE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'STATUS_CHANGE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="p-3.5 font-medium text-jaxmart-navy">
                      <div>{log.module}</div>
                      <div className="text-[11px] text-jaxmart-teal font-semibold">Entity: {log.entity}</div>
                    </td>

                    <td className="p-3.5 text-gray-800 font-medium max-w-xs truncate">
                      {log.description}
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-gray-500">
                      <div>{log.ipAddress}</div>
                      <div className="text-[10px] truncate max-w-[120px] text-gray-400">{log.deviceInfo}</div>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedAuditLog(log)}
                        className="px-3 py-1.5 bg-jaxmart-bg border border-gray-300 text-jaxmart-primary hover:bg-jaxmart-primary hover:text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Diff Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No activity logs matched your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
