import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Menu, Shield, HelpCircle, LogOut } from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onLogoutClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, onLogoutClick }) => {
  const { currentUser, currentRole } = useAuth();

  const getRoleBadgeStyle = (role: string) => {
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
    <header className="bg-white border-b border-gray-200 sticky top-[41px] z-40 shadow-jaxmart-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Left Side: Brand Logo & Mobile Toggle */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-jaxmart-navy hover:bg-gray-100 focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-lg bg-jaxmart-primary flex items-center justify-center text-white font-bold text-xl shadow-sm">
              J
            </div>
            <div>
              <span className="text-xl font-bold text-jaxmart-navy tracking-tight">
                Jaxmart<span className="text-jaxmart-teal">.</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold uppercase text-jaxmart-mediumBlue tracking-widest bg-jaxmart-bg px-2 py-0.5 rounded border border-gray-200">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jaxmart-border" />
            <input
              type="text"
              placeholder="Search Captains, Sellers, Orders, Logs (Ctrl + K)..."
              className="w-full pl-9 pr-4 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm text-jaxmart-navy focus:outline-none focus:ring-2 focus:ring-jaxmart-primary/20 focus:border-jaxmart-primary transition-all"
            />
          </div>
        </div>

        {/* Right Side: Notifications, Role & User Avatar */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Role Badge */}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getRoleBadgeStyle(currentRole)} hidden sm:inline-flex items-center space-x-1`}>
            <Shield className="w-3 h-3" />
            <span>{currentRole.replace('_', ' ')}</span>
          </span>

          {/* Help Button */}
          <button className="hidden sm:p-2 text-gray-500 hover:text-jaxmart-navy hover:bg-jaxmart-bg rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Notification Bell */}
          <button className="relative p-2 text-gray-500 hover:text-jaxmart-navy hover:bg-jaxmart-bg rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-jaxmart-error rounded-full ring-2 ring-white"></span>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm ring-2 ring-jaxmart-teal/30 shrink-0">
              {(currentUser.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-jaxmart-navy leading-tight">{currentUser.name}</div>
              <div className="text-xs text-gray-500 truncate max-w-[140px]">{currentUser.email}</div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogoutClick}
              title="Logout"
              className="p-2 text-gray-400 hover:text-jaxmart-error hover:bg-red-50 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
