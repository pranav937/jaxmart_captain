import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { ShieldCheck, UserCheck, ShieldAlert, Store, ChevronRight } from 'lucide-react';

export const RoleSwitcherBanner: React.FC = () => {
  const { currentRole, setRole, currentUser } = useAuth();

  const roles: { role: Role; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', icon: ShieldCheck, desc: 'Full System Control & Audit Logs' },
    { role: 'ADMIN', label: 'Admin', icon: UserCheck, desc: 'Captain & Regional Management' },
    { role: 'CAPTAIN', label: 'Captain', icon: ShieldAlert, desc: 'Seller Onboarding & Support' },
    { role: 'SELLER', label: 'Seller', icon: Store, desc: 'Products, Orders & Inventory' },
  ];

  return (
    <div className="bg-jaxmart-navy text-white px-4 py-2 text-sm border-b border-jaxmart-primary sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="bg-jaxmart-teal text-white text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
            RBAC Demo Switcher
          </span>
          <span className="text-gray-300 hidden sm:inline text-xs">
            Switch role to test dynamic navigation, dashboards, and permissions:
          </span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto py-1">
          {roles.map(({ role, label, icon: Icon }) => {
            const isActive = currentRole === role;
            return (
              <button
                key={role}
                onClick={() => setRole(role)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${isActive
                    ? 'bg-jaxmart-teal text-white shadow-sm ring-2 ring-white/20'
                    : 'bg-white/10 text-gray-200 hover:bg-white/20'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-300 border-l border-white/20 pl-3">
          <span className="text-jaxmart-teal font-medium">{currentUser.name}</span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-mono">{currentUser.email}</span>
        </div>
      </div>
    </div>
  );
};
