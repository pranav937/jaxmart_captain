import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Shield } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const { currentRole, currentUser } = useAuth();

  if (!isOpen) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'audit-logs', label: 'Activity & Audit Logs' },
    { id: 'users', label: 'User Hierarchy' },
    { id: 'admins', label: 'Admins' },
    { id: 'captains', label: 'Captains' },
    { id: 'sellers', label: 'Sellers' },
    { id: 'add-captain-workflow', label: '+ Add Captain Wizard' },
    { id: 'add-seller-workflow', label: '+ Add Seller Wizard' },
    { id: 'permissions', label: 'Permission Matrix' },
    { id: 'security', label: 'Security Logs' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-jaxmart-navy/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative flex-1 max-w-xs w-full bg-white flex flex-col z-10 shadow-jaxmart-drawer">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-jaxmart-navy text-white">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-jaxmart-teal" />
            <span className="font-bold tracking-tight">Jaxmart Admin</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-jaxmart-bg border-b border-gray-200">
          <div className="text-xs text-gray-500 font-medium">Logged in as</div>
          <div className="text-sm font-bold text-jaxmart-navy">{currentUser.name}</div>
          <div className="text-xs text-jaxmart-teal font-semibold mt-0.5">{currentRole}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onClose();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                  ? 'bg-jaxmart-primary text-white font-semibold'
                  : 'text-jaxmart-navy hover:bg-jaxmart-bg'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
