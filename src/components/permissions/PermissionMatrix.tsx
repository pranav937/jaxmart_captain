import React, { useState } from 'react';
import { Permission } from '../../types';
import { KeyRound, Check, X, ShieldAlert, Save } from 'lucide-react';

const initialPermissions: Permission[] = [
  { id: 'P-1', module: 'Overview Dashboard', feature: 'View System Analytics & Revenue', superAdmin: true, admin: true, captain: true, seller: true },
  { id: 'P-2', module: 'Admin Management', feature: 'Create, Edit, Delete Admins', superAdmin: true, admin: false, captain: false, seller: false },
  { id: 'P-3', module: 'Captain Management', feature: 'Create & Manage Captains', superAdmin: true, admin: true, captain: false, seller: false },
  { id: 'P-4', module: 'Seller Management', feature: 'Onboard & Manage Sellers', superAdmin: true, admin: true, captain: true, seller: false },
  { id: 'P-5', module: 'Product Catalog', feature: 'View & Manage Products', superAdmin: true, admin: true, captain: true, seller: true },
  { id: 'P-6', module: 'Orders & Sales', feature: 'View & Process Orders', superAdmin: true, admin: true, captain: true, seller: true },
  { id: 'P-7', module: 'Audit System', feature: 'View Platform Activity & Audit Logs', superAdmin: true, admin: false, captain: false, seller: false },
  { id: 'P-8', module: 'Platform Security', feature: 'View Login History & Security Events', superAdmin: true, admin: false, captain: false, seller: false },
  { id: 'P-9', module: 'System Settings', feature: 'Configure Security & API Credentials', superAdmin: true, admin: false, captain: false, seller: false },
];

export const PermissionMatrix: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [savedMessage, setSavedMessage] = useState(false);

  const togglePermission = (id: string, role: 'admin' | 'captain' | 'seller') => {
    setPermissions(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [role]: !p[role] };
      }
      return p;
    }));
  };

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-purple-200">
            Governance & RBAC Configuration
          </span>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Role & Permission Matrix</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure feature accessibility across Super Admin, Admin, Captain, and Seller roles.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-jaxmart-teal text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors shadow-sm flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Permission Changes</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Permissions saved successfully! Audit log entry recorded.</span>
        </div>
      )}

      {/* Permission Matrix Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-jaxmart-bg text-jaxmart-navy font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-4">Module & Feature Scope</th>
                <th className="p-4 text-center bg-purple-50/70 text-purple-900 border-l">Super Admin</th>
                <th className="p-4 text-center bg-blue-50/70 text-blue-900 border-l">Admin</th>
                <th className="p-4 text-center bg-teal-50/70 text-teal-900 border-l">Captain</th>
                <th className="p-4 text-center bg-amber-50/70 text-amber-900 border-l">Seller</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {permissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-jaxmart-bg/50 transition-colors">
                  
                  {/* Module & Feature Name */}
                  <td className="p-4">
                    <div className="font-bold text-jaxmart-navy">{perm.feature}</div>
                    <div className="text-[11px] text-gray-500">Module: {perm.module}</div>
                  </td>

                  {/* Super Admin (Locked ON) */}
                  <td className="p-4 text-center border-l bg-purple-50/20">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  </td>

                  {/* Admin Toggle */}
                  <td className="p-4 text-center border-l bg-blue-50/10">
                    <button
                      onClick={() => togglePermission(perm.id, 'admin')}
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                        perm.admin
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {perm.admin ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>

                  {/* Captain Toggle */}
                  <td className="p-4 text-center border-l bg-teal-50/10">
                    <button
                      onClick={() => togglePermission(perm.id, 'captain')}
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                        perm.captain
                          ? 'bg-jaxmart-teal text-white shadow-sm'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {perm.captain ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>

                  {/* Seller Toggle */}
                  <td className="p-4 text-center border-l bg-amber-50/10">
                    <button
                      onClick={() => togglePermission(perm.id, 'seller')}
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                        perm.seller
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {perm.seller ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
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
