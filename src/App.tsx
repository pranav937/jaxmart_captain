import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleSwitcherBanner } from './components/layout/RoleSwitcherBanner';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { LandingPage } from './components/public/LandingPage';

import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { CaptainDashboard } from './components/dashboards/CaptainDashboard';
import { SellerDashboard } from './components/dashboards/SellerDashboard';

import { ActivityLogTable } from './components/audit/ActivityLogTable';
import { ActivityDetailDrawer } from './components/audit/ActivityDetailDrawer';
import { AddCaptainWorkflow } from './components/workflows/AddCaptainWorkflow';
import { AddSellerWorkflow } from './components/workflows/AddSellerWorkflow';
import { PermissionMatrix } from './components/permissions/PermissionMatrix';
import { UserManagementTable } from './components/users/UserManagementTable';
import { SecurityLogTable } from './components/security/SecurityLogTable';

type PageState = 'LANDING' | 'LOGIN' | 'REGISTER' | 'ADMIN_PANEL';

const MainContent: React.FC = () => {
  const { currentRole, selectedAuditLog, setSelectedAuditLog, activeTabNav, setActiveTabNav } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageState>('LANDING');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. PUBLIC LANDING PAGE
  if (currentPage === 'LANDING') {
    return (
      <LandingPage
        onNavigateLogin={() => setCurrentPage('LOGIN')}
        onNavigateRegister={() => setCurrentPage('REGISTER')}
        onExploreDemo={() => setCurrentPage('ADMIN_PANEL')}
      />
    );
  }

  // 2. REGISTRATION PAGE
  if (currentPage === 'REGISTER') {
    return (
      <RegisterScreen
        onSuccessRegister={() => setCurrentPage('ADMIN_PANEL')}
        onNavigateLogin={() => setCurrentPage('LOGIN')}
        onNavigateLanding={() => setCurrentPage('LANDING')}
      />
    );
  }

  // 3. LOGIN PAGE
  if (currentPage === 'LOGIN') {
    return (
      <LoginScreen
        onSuccessLogin={() => setCurrentPage('ADMIN_PANEL')}
        onForgotPasswordClick={() => alert('Password reset instructions sent to registered email.')}
      />
    );
  }

  // 4. AUTHENTICATED ADMIN MANAGEMENT PANEL
  const renderDashboardByRole = () => {
    switch (currentRole) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard onNavigateTab={setActiveTabNav} />;
      case 'ADMIN':
        return <AdminDashboard onNavigateTab={setActiveTabNav} />;
      case 'CAPTAIN':
        return <CaptainDashboard onNavigateTab={setActiveTabNav} />;
      case 'SELLER':
        return <SellerDashboard />;
      default:
        return <SuperAdminDashboard onNavigateTab={setActiveTabNav} />;
    }
  };

  const renderTabContent = () => {
    switch (activeTabNav) {
      case 'dashboard':
        return renderDashboardByRole();
      case 'audit-logs':
        return <ActivityLogTable />;
      case 'users':
      case 'admins':
      case 'captains':
      case 'sellers':
        return <UserManagementTable />;
      case 'add-captain-workflow':
        return <AddCaptainWorkflow onComplete={() => setActiveTabNav('captains')} />;
      case 'add-seller-workflow':
        return <AddSellerWorkflow onComplete={() => setActiveTabNav('sellers')} />;
      case 'permissions':
        return <PermissionMatrix />;
      case 'security':
        return <SecurityLogTable />;
      default:
        return renderDashboardByRole();
    }
  };

  return (
    <div className="min-h-screen bg-jaxmart-bg flex flex-col font-sans">
      
      {/* Sticky Demo Role Switcher */}
      <RoleSwitcherBanner />

      {/* Top Navigation Bar */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen(true)}
        onLogoutClick={() => setCurrentPage('LANDING')}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTabNav}
        setActiveTab={setActiveTabNav}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* Desktop Sidebar Navigation */}
        <Sidebar activeTab={activeTabNav} setActiveTab={setActiveTabNav} />

        {/* Dynamic Content Page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {renderTabContent()}
        </main>

      </div>

      {/* Activity Detail Slide-Over Drawer */}
      <ActivityDetailDrawer
        log={selectedAuditLog}
        onClose={() => setSelectedAuditLog(null)}
      />

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
