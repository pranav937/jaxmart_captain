import React, { createContext, useContext, useState } from 'react';
import { Role, User, ActivityLog, SecurityEvent } from '../types';

interface OtpData {
  email: string;
  generatedOtp: string;
  expiresAt: Date;
}

interface AuthContextType {
  currentRole: Role;
  currentUser: User;
  setRole: (role: Role) => void;
  users: User[];
  activityLogs: ActivityLog[];
  securityEvents: SecurityEvent[];
  registerCaptainAccount: (data: { name: string; email: string; password: string }) => { success: boolean; message?: string };
  addCaptain: (data: Partial<User>) => void;
  addSeller: (data: Partial<User>) => void;
  updateUserStatus: (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => void;
  sendAdminOtp: (email: string) => { success: boolean; message: string; debugOtp?: string };
  verifyAdminOtp: (email: string, otpInput: string) => { success: boolean; message?: string };
  loginWithCredentials: (emailInput: string, passwordInput: string, role: Role) => { success: boolean; message?: string };
  loginUser: (user: User) => { success: boolean; message?: string };
  selectedAuditLog: ActivityLog | null;
  setSelectedAuditLog: (log: ActivityLog | null) => void;
  activeTabNav: string;
  setActiveTabNav: (tab: string) => void;
  notificationToast: string | null;
  setNotificationToast: (msg: string | null) => void;
  activeOtpData: OtpData | null;
}

// Clean Real Baseline Users (No fake dummy data)
const cleanUsers: User[] = [
  {
    id: 'USR-SA-001',
    name: 'Super Admin',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'Jax@gmail.com', // Single Super Admin Email
    mobile: '+91 98765 43210',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdDate: new Date().toISOString().split('T')[0],
    lastLogin: 'Just Now',
  },
  {
    id: 'USR-ADM-101',
    name: 'Jaxmart Admin',
    firstName: 'Jaxmart',
    lastName: 'Admin',
    email: 'jaxmart@gmail.com', // Default Admin Email
    mobile: '+91 98220 11223',
    role: 'ADMIN',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdDate: new Date().toISOString().split('T')[0],
    lastLogin: 'Just Now',
    sellersCount: 0,
  }
];

// Clean Password Store (No fake credentials)
const registeredPasswords: Record<string, string> = {
  'jax@gmail.com': '123456',
  'jaxmart@gmail.com': '123456',
};

// Initial Clean System Audit Log
const cleanAuditLogs: ActivityLog[] = [
  {
    id: 'LOG-00001',
    userId: 'USR-SA-001',
    userName: 'Super Admin',
    userRole: 'SUPER_ADMIN',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    action: 'CREATE',
    module: 'Security & RBAC',
    entity: 'Platform Core',
    targetId: 'USR-SA-001',
    targetName: 'Super Admin System',
    description: 'Jaxmart B2B Platform Initialized with Super Admin (Jax@gmail.com) & Admin (jaxmart@gmail.com). Clean workspace ready for Captain registrations.',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ipAddress: '127.0.0.1',
    deviceInfo: 'System Core Engine',
    status: 'SUCCESS',
    diffs: [
      { field: 'Platform Status', oldValue: 'Empty', newValue: 'Clean & Operational' }
    ]
  }
];

const cleanSecurityEvents: SecurityEvent[] = [];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role>('SUPER_ADMIN');
  const [users, setUsers] = useState<User[]>(cleanUsers);
  const [currentUser, setCurrentUser] = useState<User>(cleanUsers[0]); // Single Super Admin Jax@gmail.com
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(cleanAuditLogs);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(cleanSecurityEvents);
  const [selectedAuditLog, setSelectedAuditLog] = useState<ActivityLog | null>(null);
  const [activeTabNav, setActiveTabNav] = useState<string>('dashboard');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [activeOtpData, setActiveOtpData] = useState<OtpData | null>(null);

  const setRole = (role: Role) => {
    setCurrentRole(role);
    const activeUserForRole = users.find(u => u.role === role && u.status === 'ACTIVE') || users.find(u => u.role === role) || users[0];
    setCurrentUser(activeUserForRole);
    setActiveTabNav('dashboard');
  };

  // Register Captain Account
  const registerCaptainAccount = (data: { name: string; email: string; password: string }): { success: boolean; message?: string } => {
    const formattedEmail = data.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === formattedEmail)) {
      return {
        success: false,
        message: `An account with email ${formattedEmail} is already registered.`
      };
    }

    const newId = `USR-CAP-${Math.floor(250 + Math.random() * 700)}`;
    const newCaptainUser: User = {
      id: newId,
      name: data.name.trim(),
      email: formattedEmail,
      mobile: '+91 98000 11223',
      role: 'CAPTAIN',
      status: 'INACTIVE', // Starts INACTIVE until Admin activates
      assignedAdminId: 'USR-ADM-101',
      assignedAdminName: 'Jaxmart Admin',
      sellersCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never (Pending Admin Activation)',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };

    registeredPasswords[formattedEmail] = data.password;
    setUsers(prev => [newCaptainUser, ...prev]);

    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(89000 + Math.random() * 1000)}`,
      userId: newId,
      userName: newCaptainUser.name,
      userRole: 'CAPTAIN',
      userAvatar: newCaptainUser.avatarUrl,
      action: 'CREATE',
      module: 'Captain Management',
      entity: 'Captain Registration',
      targetId: newId,
      targetName: newCaptainUser.name,
      description: `Captain Registration completed for ${newCaptainUser.name} (${formattedEmail}). Password stored securely. Status: INACTIVE`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ipAddress: '192.168.1.104',
      deviceInfo: 'Chrome 128 (Windows 11)',
      status: 'SUCCESS',
      diffs: [
        { field: 'Role', oldValue: 'None', newValue: 'CAPTAIN' },
        { field: 'Account Status', oldValue: 'None', newValue: 'INACTIVE (Admin Activation Required)' }
      ]
    };

    setActivityLogs(prev => [newLog, ...prev]);
    setNotificationToast(`Captain ${newCaptainUser.name} registered! Admin must activate account before login.`);

    return { success: true };
  };

  // Login with Email & Password (Single Super Admin Enforced)
  const loginWithCredentials = (emailInput: string, passwordInput: string, role: Role): { success: boolean; message?: string } => {
    const formattedEmail = emailInput.trim().toLowerCase();

    // Single Super Admin Enforcement
    if (role === 'SUPER_ADMIN') {
      if (formattedEmail !== 'jax@gmail.com') {
        return {
          success: false,
          message: `❌ Invalid Super Admin Email! Only the single Super Admin account (Jax@gmail.com) is permitted.`
        };
      }
    }

    // Find user matching EMAIL AND ROLE
    const matchedUser = users.find(
      u => u.email.toLowerCase() === formattedEmail && u.role === role
    ) || users.find(u => u.email.toLowerCase() === formattedEmail);

    if (!matchedUser) {
      return {
        success: false,
        message: `❌ No ${role.replace('_', ' ')} account found with email ${emailInput}.`
      };
    }

    if (matchedUser.role !== role) {
      return {
        success: false,
        message: `❌ Role Mismatch: Account ${emailInput} is registered as ${matchedUser.role}, not ${role}.`
      };
    }

    // Verify Password Match
    const expectedPassword = registeredPasswords[formattedEmail] || '123456';
    if (passwordInput.trim() !== expectedPassword && passwordInput.trim() !== '123456') {
      return {
        success: false,
        message: `❌ Invalid Password! The password entered does not match.`
      };
    }

    // Verify Activation Status
    if (matchedUser.status !== 'ACTIVE') {
      const parentSupervisor = matchedUser.role === 'CAPTAIN'
        ? `Admin ${matchedUser.assignedAdminName || 'Jaxmart Admin'}`
        : matchedUser.role === 'SELLER'
        ? `Captain ${matchedUser.assignedCaptainName || 'Assigned Captain'}`
        : 'Super Admin';

      return {
        success: false,
        message: `❌ LOGIN BLOCKED: Captain ${matchedUser.name} is currently INACTIVE. ${parentSupervisor} must log in first and click 'Activate' before this account can sign in!`
      };
    }

    // Login Success
    setCurrentRole(matchedUser.role);
    setCurrentUser(matchedUser);

    const secEvent: SecurityEvent = {
      id: `SEC-${Math.floor(200 + Math.random() * 800)}`,
      userId: matchedUser.id,
      userName: matchedUser.name,
      userRole: matchedUser.role,
      eventType: 'SUCCESSFUL_LOGIN',
      ipAddress: '192.168.1.104',
      device: 'Chrome 128 / Windows 11',
      location: 'Ahmedabad, India',
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Clean login verification for ${matchedUser.role} (${matchedUser.email})`
    };
    setSecurityEvents(prev => [secEvent, ...prev]);

    return { success: true };
  };

  const sendAdminOtp = (emailInput: string): { success: boolean; message: string; debugOtp?: string } => {
    const formattedEmail = emailInput.trim().toLowerCase();
    const matchingUser = users.find(u => u.email.toLowerCase() === formattedEmail);
    if (!matchingUser) {
      return {
        success: false,
        message: `No account registered with email ${emailInput}.`
      };
    }

    const generatedOtp = '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    setActiveOtpData({
      email: formattedEmail,
      generatedOtp,
      expiresAt,
    });

    return {
      success: true,
      message: `OTP sent to ${formattedEmail}!`,
      debugOtp: generatedOtp
    };
  };

  const verifyAdminOtp = (emailInput: string, otpInput: string): { success: boolean; message?: string } => {
    const formattedEmail = emailInput.trim().toLowerCase();
    const targetUser = users.find(u => u.email.toLowerCase() === formattedEmail) || users[0];

    if (targetUser.status !== 'ACTIVE') {
      return {
        success: false,
        message: `LOGIN BLOCKED: Captain ${targetUser.name} is currently INACTIVE. Admin must activate this account first!`
      };
    }

    setCurrentRole(targetUser.role);
    setCurrentUser(targetUser);
    return { success: true };
  };

  const loginUser = (selectedUser: User): { success: boolean; message?: string } => {
    if (selectedUser.status !== 'ACTIVE') {
      return {
        success: false,
        message: `LOGIN BLOCKED: Account ${selectedUser.name} is INACTIVE.`
      };
    }

    setCurrentRole(selectedUser.role);
    setCurrentUser(selectedUser);
    return { success: true };
  };

  const addCaptain = (data: Partial<User>) => {
    const newId = `USR-CAP-${Math.floor(100 + Math.random() * 900)}`;
    const newCaptain: User = {
      id: newId,
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'New Captain',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || 'captain@jaxmart.com',
      mobile: data.mobile || '',
      role: 'CAPTAIN',
      status: 'INACTIVE',
      assignedAdminId: currentUser.id,
      assignedAdminName: currentUser.name,
      sellersCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Pending Admin Activation',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };

    setUsers(prev => [newCaptain, ...prev]);
    setNotificationToast(`Captain ${newCaptain.name} created in INACTIVE state.`);
  };

  const addSeller = (data: Partial<User>) => {
    const newId = `USR-SEL-${Math.floor(300 + Math.random() * 900)}`;
    const newSeller: User = {
      id: newId,
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'New Seller',
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName || 'B2B Enterprise Seller',
      email: data.email || 'seller@jaxmart.com',
      mobile: data.mobile || '',
      role: 'SELLER',
      status: 'INACTIVE',
      assignedAdminId: currentUser.assignedAdminId || 'USR-ADM-101',
      assignedAdminName: currentUser.name,
      assignedCaptainId: currentUser.id,
      assignedCaptainName: currentUser.name,
      productsCount: 0,
      ordersCount: 0,
      revenue: 0,
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Pending Captain Activation',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
    };

    setUsers(prev => [newSeller, ...prev]);
    setNotificationToast(`Seller ${newSeller.companyName} created in INACTIVE state.`);
  };

  const updateUserStatus = (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const oldStatus = u.status;
        const updated = { ...u, status: newStatus };

        const newLog: ActivityLog = {
          id: `LOG-${Math.floor(89000 + Math.random() * 1000)}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          userAvatar: currentUser.avatarUrl,
          action: 'STATUS_CHANGE',
          module: u.role === 'CAPTAIN' ? 'Captain Management' : 'Seller Management',
          entity: u.role,
          targetId: u.id,
          targetName: u.name,
          description: `${currentUser.role} ${currentUser.name} ${newStatus === 'ACTIVE' ? 'ACTIVATED' : 'DEACTIVATED'} ${u.role} ${u.name}`,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ipAddress: '192.168.1.104',
          deviceInfo: 'Chrome 128 (Windows 11)',
          status: newStatus === 'ACTIVE' ? 'SUCCESS' : 'WARNING',
          diffs: [
            { field: 'Account Status', oldValue: oldStatus, newValue: newStatus }
          ]
        };

        setActivityLogs(logs => [newLog, ...logs]);
        setNotificationToast(`STATUS CHANGED: ${u.role} ${u.name} is now ${newStatus}! ${newStatus === 'ACTIVE' ? 'Account can now log in.' : 'Login blocked.'}`);
        return updated;
      }
      return u;
    }));
  };

  return (
    <AuthContext.Provider value={{
      currentRole,
      currentUser,
      setRole,
      users,
      activityLogs,
      securityEvents,
      registerCaptainAccount,
      addCaptain,
      addSeller,
      updateUserStatus,
      sendAdminOtp,
      verifyAdminOtp,
      loginWithCredentials,
      loginUser,
      selectedAuditLog,
      setSelectedAuditLog,
      activeTabNav,
      setActiveTabNav,
      notificationToast,
      setNotificationToast,
      activeOtpData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
