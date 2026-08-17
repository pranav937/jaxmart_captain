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

import { ActivityDetailDrawer } from './components/audit/ActivityDetailDrawer';
import { AddCaptainWorkflow } from './components/workflows/AddCaptainWorkflow';
import { AddSellerWorkflow } from './components/workflows/AddSellerWorkflow';

import { SuperAdminUserManagement } from './components/admin/SuperAdminUserManagement';
import { SuperAdminCatalogManagement } from './components/admin/SuperAdminCatalogManagement';

import { AdminUserOperations } from './components/admin/AdminUserOperations';
import { AdminCatalogOperations } from './components/admin/AdminCatalogOperations';
import { AdminNotificationBroadcaster } from './components/admin/AdminNotificationBroadcaster';

import { CaptainSellerOperations } from './components/captain/CaptainSellerOperations';
import { CaptainTasksFollowups } from './components/captain/CaptainTasksFollowups';
import { CaptainRFQsOrdersPerformance } from './components/captain/CaptainRFQsOrdersPerformance';
import { CaptainNotifications } from './components/captain/CaptainNotifications';

type PageState = 'LANDING' | 'LOGIN' | 'ADMIN_PANEL';

const MainContent: React.FC = () => {
  const { currentRole, selectedAuditLog, setSelectedAuditLog, activeTabNav, setActiveTabNav } = useAuth();

  const getInitialPageState = (): PageState => {
    try {
      const hash = window.location.hash.replace('#', '');
      if (hash.includes('page=')) {
        const pageMatch = hash.split('page=')[1]?.split('&')[0];
        if (pageMatch === 'LOGIN' || pageMatch === 'ADMIN_PANEL' || pageMatch === 'LANDING') {
          return pageMatch as PageState;
        }
      }
      const savedPage = localStorage.getItem('jaxmart_current_page');
      if (savedPage === 'LOGIN' || savedPage === 'ADMIN_PANEL' || savedPage === 'LANDING') {
        return savedPage as PageState;
      }
    } catch (e) { }
    return 'ADMIN_PANEL'; // Default to ADMIN_PANEL so refreshing keeps user on workspace
  };

  const [currentPage, setCurrentPageState] = useState<PageState>(getInitialPageState);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const setCurrentPage = (page: PageState, pushHistory = true) => {
    setCurrentPageState(page);
    try {
      localStorage.setItem('jaxmart_current_page', page);
      const activeTab = localStorage.getItem('jaxmart_active_tab') || 'dashboard';
      const hashUrl = `#page=${page}&tab=${activeTab}`;
      if (pushHistory && window.location.hash !== hashUrl) {
        window.history.pushState({ page, tab: activeTab }, '', hashUrl);
      }
    } catch (e) { }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Browser Back / Forward Button Listener (popstate / hashchange)
  React.useEffect(() => {
    const handlePopState = (e: Event) => {
      try {
        const popState = e as PopStateEvent;
        const state = popState.state;
        if (state && state.page) {
          setCurrentPageState(state.page);
          if (state.tab) setActiveTabNav(state.tab, false);
          return;
        }
        const hash = window.location.hash.replace('#', '');
        if (hash) {
          const pageMatch = hash.includes('page=') ? hash.split('page=')[1]?.split('&')[0] : null;
          const tabMatch = hash.includes('tab=') ? hash.split('tab=')[1]?.split('&')[0] : null;
          if (pageMatch === 'LOGIN' || pageMatch === 'ADMIN_PANEL' || pageMatch === 'LANDING') {
            setCurrentPageState(pageMatch as PageState);
          }
          if (tabMatch) {
            setActiveTabNav(tabMatch, false);
          }
        }
      } catch (err) { }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [setActiveTabNav]);

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

      // Admin Scoped Routes
      case 'admin-users':
        return currentRole === 'ADMIN' ? <AdminUserOperations /> : <SuperAdminUserManagement />;
      case 'admin-catalog':
        return currentRole === 'ADMIN' ? <AdminCatalogOperations /> : <SuperAdminCatalogManagement />;
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

      case 'users':
      case 'admins':
        return <SuperAdminUserManagement />;
      case 'add-captain-workflow':
        return <AddCaptainWorkflow onComplete={() => setActiveTabNav(currentRole === 'ADMIN' ? 'admin-users' : 'users-mgmt')} />;
      case 'add-seller-workflow':
        return <AddSellerWorkflow onComplete={() => setActiveTabNav(currentRole === 'CAPTAIN' ? 'captain-sellers' : currentRole === 'ADMIN' ? 'admin-users' : 'users-mgmt')} />;
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
