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
  UserPlus
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole } = useAuth();

  const getMenuItems = () => {
    switch (currentRole) {
      case 'SUPER_ADMIN':
        return [
          { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
          { id: 'audit-logs', label: 'Activity & Audit Logs', icon: FileText, badge: 'Core' },
          { id: 'users', label: 'User Hierarchy', icon: Users },
          { id: 'admins', label: 'Admin Management', icon: ShieldCheck },
          { id: 'captains', label: 'Captain Management', icon: UserCheck },
          { id: 'sellers', label: 'Seller Management', icon: Store },
          { id: 'add-captain-workflow', label: 'Add Captain Wizard', icon: UserPlus, highlight: true },
          { id: 'add-seller-workflow', label: 'Add Seller Wizard', icon: UserPlus, highlight: true },
          { id: 'permissions', label: 'Permission Matrix', icon: KeyRound },
          { id: 'security', label: 'Security & Login History', icon: Lock },
          { id: 'products', label: 'Product Catalog', icon: Package },
          { id: 'orders', label: 'All Orders', icon: ShoppingCart },
          { id: 'settings', label: 'Platform Settings', icon: Settings },
        ];
      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
          { id: 'captains', label: 'Captain Management', icon: UserCheck },
          { id: 'sellers', label: 'Sellers Overview', icon: Store },
          { id: 'add-captain-workflow', label: 'Add Captain Wizard', icon: UserPlus, highlight: true },
          { id: 'products', label: 'Managed Products', icon: Package },
          { id: 'orders', label: 'Regional Orders', icon: ShoppingCart },
          { id: 'audit-logs', label: 'Relevant Activity Logs', icon: FileText },
          { id: 'settings', label: 'Scope Settings', icon: Settings },
        ];
      case 'CAPTAIN':
        return [
          { id: 'dashboard', label: 'Captain Dashboard', icon: LayoutDashboard },
          { id: 'sellers', label: 'My Sellers', icon: Store },
          { id: 'add-seller-workflow', label: 'Add Seller Wizard', icon: UserPlus, highlight: true },
          { id: 'products', label: 'Seller Catalog', icon: Package },
          { id: 'orders', label: 'Seller Orders', icon: ShoppingCart },
          { id: 'audit-logs', label: 'My Activity Log', icon: FileText },
        ];
      case 'SELLER':
        return [
          { id: 'dashboard', label: 'Seller Dashboard', icon: LayoutDashboard },
          { id: 'products', label: 'My Products', icon: Package },
          { id: 'orders', label: 'My Orders', icon: ShoppingCart },
          { id: 'settings', label: 'Company Profile', icon: Settings },
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
