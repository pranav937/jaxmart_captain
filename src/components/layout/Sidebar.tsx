import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ShieldCheck,
  Store,
  Package,
  ShoppingCart,
  FileText,
  ShieldAlert,
  KeyRound,
  Lock,
  Settings,
  ChevronRight,
  UserPlus,
  Bell,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole } = useAuth();

  const getMenuItems = (): MenuItem[] => {
    switch (currentRole) {
      case 'SUPER_ADMIN':
        return [
          { id: 'dashboard', label: 'Overview Control Center', icon: LayoutDashboard },
          { id: 'users-mgmt', label: 'Admins & Captains Governance', icon: Users, badge: '100%' },
          { id: 'catalog', label: 'Products & Categories', icon: Package },
          { id: 'rfq-orders', label: 'RFQs, Orders & Payments', icon: ShoppingCart },
          { id: 'analytics-settings', label: 'Reports & Settings', icon: Settings },
          { id: 'permissions', label: 'Permission Matrix', icon: KeyRound },
          { id: 'security', label: 'Security & Auth Logs', icon: Lock },
          { id: 'audit-logs', label: 'Activity & Audit Logs', icon: FileText, badge: 'Core' },
          { id: 'add-captain-workflow', label: 'Add Captain Wizard', icon: UserPlus, highlight: true },
        ];
      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Admin Operations', icon: LayoutDashboard },
          { id: 'admin-users', label: 'Captain Management', icon: UserCheck, badge: '70-80%' },
          { id: 'admin-catalog', label: 'Products & Categories', icon: Package },
          { id: 'admin-rfq-orders', label: 'RFQs, Orders & Payments', icon: ShoppingCart },
          { id: 'admin-notif', label: 'Send Announcements', icon: Bell },
          { id: 'audit-logs', label: 'Activity Logs', icon: FileText },
        ];
      case 'CAPTAIN':
        return [
          { id: 'dashboard', label: 'GPS Attendance & Punch In/Out', icon: LayoutDashboard, badge: 'Active' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col min-h-[calc(100vh-105px)] sticky top-[105px] shadow-jaxmart-sm">
      <div className="p-4 border-b border-gray-100 bg-jaxmart-bg/50">
        <div className="text-xs font-bold uppercase tracking-wider text-jaxmart-border px-2">
          {currentRole.replace('_', ' ')} Navigation
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map(({ id, label, icon: Icon, badge, highlight }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                  ? 'bg-jaxmart-primary text-white shadow-jaxmart-sm'
                  : highlight
                    ? 'bg-jaxmart-teal/10 text-jaxmart-teal hover:bg-jaxmart-teal/20 font-semibold'
                    : 'text-jaxmart-navy hover:bg-jaxmart-bg hover:text-jaxmart-primary'
                }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : highlight ? 'text-jaxmart-teal' : 'text-jaxmart-mediumBlue'}`} />
                <span className="truncate">{label}</span>
              </div>

              <div className="flex items-center space-x-1">
                {badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-white text-jaxmart-primary' : 'bg-jaxmart-teal text-white'}`}>
                    {badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Role Context Footer */}
      <div className="p-4 border-t border-gray-200 bg-jaxmart-bg/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-jaxmart-primary/10 text-jaxmart-primary">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-jaxmart-navy">RBAC Active</div>
            <div className="text-[11px] text-gray-500">Strict Scoping Enforced</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
