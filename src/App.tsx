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

import { SuperAdminUserManagement } from './components/admin/SuperAdminUserManagement';
import { SuperAdminCatalogManagement } from './components/admin/SuperAdminCatalogManagement';
import { SuperAdminRFQOrdersManagement } from './components/admin/SuperAdminRFQOrdersManagement';
import { SuperAdminAnalyticsSettings } from './components/admin/SuperAdminAnalyticsSettings';

import { AdminUserOperations } from './components/admin/AdminUserOperations';
import { AdminCatalogOperations } from './components/admin/AdminCatalogOperations';
import { AdminRFQOrdersOperations } from './components/admin/AdminRFQOrdersOperations';
import { AdminNotificationBroadcaster } from './components/admin/AdminNotificationBroadcaster';

import { CaptainSellerOperations } from './components/captain/CaptainSellerOperations';
import { CaptainTasksFollowups } from './components/captain/CaptainTasksFollowups';
import { CaptainRFQsOrdersPerformance } from './components/captain/CaptainRFQsOrdersPerformance';
import { CaptainNotifications } from './components/captain/CaptainNotifications';

type PageState = 'LANDING' | 'LOGIN' | 'ADMIN_PANEL';

const MainContent: React.FC = () => {
  const { currentRole, selectedAuditLog, setSelectedAuditLog, activeTabNav, setActiveTabNav } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageState>('LANDING');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. PUBLIC LANDING PAGE
  if (currentPage === 'LANDING') {
    return (
      <LandingPage
        onNavigateLogin={() => setCurrentPage('LOGIN')}
        onNavigateRegister={() => setCurrentPage('LOGIN')}
        onExploreDemo={() => setCurrentPage('ADMIN_PANEL')}
      />
    );
  }

  // 2. LOGIN PAGE
  if (currentPage === 'LOGIN') {
    return (
      <LoginScreen
        onSuccessLogin={() => setCurrentPage('ADMIN_PANEL')}
        onForgotPasswordClick={() => alert('Password reset instructions sent to registered email.')}
      />
    );
  }

  // 3. AUTHENTICATED ADMIN MANAGEMENT PANEL
  const renderDashboardByRole = () => {
    switch (currentRole) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard onNavigateTab={setActiveTabNav} />;
      case 'ADMIN':
        return <AdminDashboard onNavigateTab={setActiveTabNav} />;
      case 'CAPTAIN':
        return <CaptainDashboard onNavigateTab={setActiveTabNav} />;
      default:
        return <SuperAdminDashboard onNavigateTab={setActiveTabNav} />;
    }
  };

  const renderTabContent = () => {
    switch (activeTabNav) {
      case 'dashboard':
        return renderDashboardByRole();
      case 'users-mgmt':
        return <SuperAdminUserManagement />;
      case 'catalog':
        return <SuperAdminCatalogManagement />;
      case 'rfq-orders':
        return <SuperAdminRFQOrdersManagement />;
      case 'analytics-settings':
        return <SuperAdminAnalyticsSettings />;

      // Admin Scoped Routes (70-80% Access)
      case 'admin-users':
        return currentRole === 'ADMIN' ? <AdminUserOperations /> : <SuperAdminUserManagement />;
      case 'admin-catalog':
        return currentRole === 'ADMIN' ? <AdminCatalogOperations /> : <SuperAdminCatalogManagement />;
      case 'admin-rfq-orders':
        return currentRole === 'ADMIN' ? <AdminRFQOrdersOperations /> : <SuperAdminRFQOrdersManagement />;
      case 'admin-notif':
        return <AdminNotificationBroadcaster />;

      // Captain Scoped Routes (30-40% Access)
      case 'captain-sellers':
        return <CaptainSellerOperations />;
      case 'captain-tasks':
        return <CaptainTasksFollowups />;
      case 'captain-rfqs':
        return <CaptainRFQsOrdersPerformance />;
      case 'captain-notif':
        return <CaptainNotifications />;

      // Generic Role Nav Handles
      case 'captains':
        return currentRole === 'ADMIN' ? <AdminUserOperations /> : <SuperAdminUserManagement />;
      case 'sellers':
        return currentRole === 'CAPTAIN' ? <CaptainSellerOperations /> : currentRole === 'ADMIN' ? <AdminUserOperations /> : <SuperAdminUserManagement />;
      case 'products':
        return currentRole === 'CAPTAIN' ? <CaptainRFQsOrdersPerformance /> : currentRole === 'ADMIN' ? <AdminCatalogOperations /> : <SuperAdminCatalogManagement />;
      case 'orders':
        return currentRole === 'CAPTAIN' ? <CaptainRFQsOrdersPerformance /> : currentRole === 'ADMIN' ? <AdminRFQOrdersOperations /> : <SuperAdminRFQOrdersManagement />;

      case 'audit-logs':
        return <ActivityLogTable />;
      case 'users':
      case 'admins':
        return <SuperAdminUserManagement />;
      case 'add-captain-workflow':
        return <AddCaptainWorkflow onComplete={() => setActiveTabNav(currentRole === 'ADMIN' ? 'admin-users' : 'users-mgmt')} />;
      case 'add-seller-workflow':
        return <AddSellerWorkflow onComplete={() => setActiveTabNav(currentRole === 'CAPTAIN' ? 'captain-sellers' : currentRole === 'ADMIN' ? 'admin-users' : 'users-mgmt')} />;
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
