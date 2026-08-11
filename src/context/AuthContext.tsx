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
  addCaptain: (data: Partial<User>) => void;
  addSeller: (data: Partial<User>) => void;
  updateUserStatus: (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => void;
  sendAdminOtp: (email: string) => { success: boolean; message: string; debugOtp?: string };
  verifyAdminOtp: (email: string, otpInput: string) => { success: boolean; message?: string };
  loginUser: (user: User) => { success: boolean; message?: string };
  selectedAuditLog: ActivityLog | null;
  setSelectedAuditLog: (log: ActivityLog | null) => void;
  activeTabNav: string;
  setActiveTabNav: (tab: string) => void;
  notificationToast: string | null;
  setNotificationToast: (msg: string | null) => void;
  activeOtpData: OtpData | null;
}

const mockUsers: User[] = [
  {
    id: 'USR-SA-001',
    name: 'Vikramaditya Shah',
    firstName: 'Vikramaditya',
    lastName: 'Shah',
    email: 'jaxmart@gmail.com',
    mobile: '+91 98765 43210',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdDate: '2025-01-10',
    lastLogin: '2026-08-11 11:45 AM',
  },
  {
    id: 'USR-ADM-101',
    name: 'Rahul Sharma',
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'jaxmart@gmail.com',
    mobile: '+91 98220 11223',
    role: 'ADMIN',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdDate: '2025-03-15',
    lastLogin: '2026-08-11 10:20 AM',
    sellersCount: 45,
  },
  {
    id: 'USR-CAP-201',
    name: 'Amit Verma',
    firstName: 'Amit',
    lastName: 'Verma',
    email: 'amit.captain@jaxmart.com',
    mobile: '+91 97112 33445',
    role: 'CAPTAIN',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    assignedAdminId: 'USR-ADM-101',
    assignedAdminName: 'Rahul Sharma',
    sellersCount: 18,
    createdDate: '2025-05-12',
    lastLogin: '2026-08-11 11:10 AM',
  },
  {
    id: 'USR-CAP-202',
    name: 'Sneha Gupta (Inactive Captain)',
    firstName: 'Sneha',
    lastName: 'Gupta',
    email: 'sneha.captain@jaxmart.com',
    mobile: '+91 97881 66778',
    role: 'CAPTAIN',
    status: 'INACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    assignedAdminId: 'USR-ADM-101',
    assignedAdminName: 'Rahul Sharma',
    sellersCount: 0,
    createdDate: '2026-08-10',
    lastLogin: 'Never (Pending Activation)',
  },
  {
    id: 'USR-SEL-301',
    name: 'Rajesh Mehta',
    firstName: 'Rajesh',
    lastName: 'Mehta',
    email: 'contact@abctraders.in',
    mobile: '+91 91234 56789',
    companyName: 'ABC Traders Pvt Ltd',
    role: 'SELLER',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    assignedAdminId: 'USR-ADM-101',
    assignedAdminName: 'Rahul Sharma',
    assignedCaptainId: 'USR-CAP-201',
    assignedCaptainName: 'Amit Verma',
    productsCount: 124,
    ordersCount: 1420,
    revenue: 4850000,
    createdDate: '2025-07-05',
    lastLogin: '2026-08-11 11:50 AM',
  },
  {
    id: 'USR-SEL-302',
    name: 'Anil Kumar (Inactive Seller)',
    firstName: 'Anil',
    lastName: 'Kumar',
    email: 'sales@apexsupplies.com',
    mobile: '+91 94433 22110',
    companyName: 'Apex Industrial Supplies',
    role: 'SELLER',
    status: 'INACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    assignedAdminId: 'USR-ADM-101',
    assignedAdminName: 'Rahul Sharma',
    assignedCaptainId: 'USR-CAP-201',
    assignedCaptainName: 'Amit Verma',
    productsCount: 68,
    ordersCount: 512,
    revenue: 1920000,
    createdDate: '2025-08-18',
    lastLogin: 'Never (Pending Activation)',
  }
];

const mockAuditLogs: ActivityLog[] = [
  {
    id: 'LOG-88901',
    userId: 'USR-ADM-101',
    userName: 'Rahul Sharma',
    userRole: 'ADMIN',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    action: 'CREATE',
    module: 'Captain Management',
    entity: 'Captain',
    targetId: 'USR-CAP-201',
    targetName: 'Amit Verma',
    description: 'Admin Rahul created Captain Amit Verma',
    date: '11 Aug 2026',
    time: '10:45 AM',
    ipAddress: '192.168.1.104',
    deviceInfo: 'Chrome 128 (Windows 11)',
    status: 'SUCCESS',
    diffs: [
      { field: 'Role', oldValue: 'None', newValue: 'CAPTAIN' },
      { field: 'Assigned Admin', oldValue: 'None', newValue: 'Rahul Sharma' },
      { field: 'Account Status', oldValue: 'None', newValue: 'ACTIVE' }
    ],
    hierarchyContext: {
      adminName: 'Rahul Sharma',
      captainName: 'Amit Verma'
    }
  }
];

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'SEC-101',
    userId: 'USR-ADM-101',
    userName: 'Rahul Sharma',
    userRole: 'ADMIN',
    eventType: 'SUCCESSFUL_LOGIN',
    ipAddress: '192.168.1.104',
    device: 'Chrome 128 / Windows 11',
    location: 'Mumbai, India',
    timestamp: '11 Aug 2026, 10:20 AM',
    status: 'SUCCESS',
    details: 'Authenticated via Admin OTP (jaxmart@gmail.com)'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role>('SUPER_ADMIN');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockAuditLogs);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
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

  // API Backend OTP Sender Simulation
  const sendAdminOtp = (emailInput: string): { success: boolean; message: string; debugOtp?: string } => {
    const formattedEmail = emailInput.trim().toLowerCase();

    // Verify user exists
    const matchingUser = users.find(u => u.email.toLowerCase() === formattedEmail);
    if (!matchingUser) {
      return {
        success: false,
        message: `No account registered with email ${emailInput}. Default Admin Email is jaxmart@gmail.com`
      };
    }

    if (matchingUser.status !== 'ACTIVE') {
      return {
        success: false,
        message: `Account ${matchingUser.name} is currently INACTIVE. Admin must activate this account before OTP login.`
      };
    }

    // Generate 6-digit OTP (Default 123456 requested by user)
    const generatedOtp = '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    setActiveOtpData({
      email: formattedEmail,
      generatedOtp,
      expiresAt,
    });

    // Record Audit Log for OTP Request
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(89000 + Math.random() * 1000)}`,
      userId: matchingUser.id,
      userName: matchingUser.name,
      userRole: matchingUser.role,
      userAvatar: matchingUser.avatarUrl,
      action: 'LOGIN',
      module: 'Authentication',
      entity: 'OTP Verification',
      targetId: matchingUser.id,
      targetName: matchingUser.name,
      description: `6-Digit OTP requested for ${matchingUser.role} ${matchingUser.name} (${formattedEmail}). Expires in 10 mins.`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ipAddress: '192.168.1.104',
      deviceInfo: 'Chrome 128 (Windows 11)',
      status: 'SUCCESS',
      diffs: [
        { field: 'OTP Validity', oldValue: 'None', newValue: '10 Minutes (Expires at ' + expiresAt.toLocaleTimeString() + ')' }
      ]
    };
    setActivityLogs(prev => [newLog, ...prev]);

    return {
      success: true,
      message: `OTP sent successfully to ${formattedEmail}!`,
      debugOtp: generatedOtp
    };
  };

  // API Backend OTP Verification Simulation
  const verifyAdminOtp = (emailInput: string, otpInput: string): { success: boolean; message?: string } => {
    const formattedEmail = emailInput.trim().toLowerCase();

    if (!activeOtpData || activeOtpData.email !== formattedEmail) {
      return {
        success: false,
        message: 'No active OTP request found for this email. Please click "Send OTP".'
      };
    }

    // Check Expiration (10 minutes)
    if (new Date() > activeOtpData.expiresAt) {
      setActiveOtpData(null);
      return {
        success: false,
        message: 'OTP has expired (10-minute limit passed). Please request a new OTP.'
      };
    }

    // Check OTP Match (123456)
    if (otpInput.trim() !== activeOtpData.generatedOtp) {
      return {
        success: false,
        message: 'Invalid OTP entered. Default demo OTP is 123456.'
      };
    }

    // Success: Find user & set session
    const targetUser = users.find(u => u.email.toLowerCase() === formattedEmail) || users[0];

    setCurrentRole(targetUser.role);
    setCurrentUser(targetUser);
    setActiveOtpData(null);

    // Record Security Event
    const secEvent: SecurityEvent = {
      id: `SEC-${Math.floor(200 + Math.random() * 800)}`,
      userId: targetUser.id,
      userName: targetUser.name,
      userRole: targetUser.role,
      eventType: 'SUCCESSFUL_LOGIN',
      ipAddress: '192.168.1.104',
      device: 'Chrome 128 / Windows 11',
      location: 'Ahmedabad, India',
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Verified 6-digit OTP for ${targetUser.role} (${targetUser.email}). Session cookie admin_session_token initialized.`
    };
    setSecurityEvents(prev => [secEvent, ...prev]);

    return { success: true };
  };

  const loginUser = (selectedUser: User): { success: boolean; message?: string } => {
    if (selectedUser.status !== 'ACTIVE') {
      const parentSupervisor = selectedUser.role === 'CAPTAIN'
        ? `Admin ${selectedUser.assignedAdminName || 'Rahul Sharma'}`
        : selectedUser.role === 'SELLER'
        ? `Captain ${selectedUser.assignedCaptainName || 'Amit Verma'}`
        : 'Super Admin';

      return {
        success: false,
        message: `LOGIN BLOCKED: ${selectedUser.name} is currently INACTIVE / PENDING. ${parentSupervisor} must log in first and click 'Activate' before this account can sign in!`
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

    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(89000 + Math.random() * 1000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userAvatar: currentUser.avatarUrl,
      action: 'CREATE',
      module: 'Captain Management',
      entity: 'Captain',
      targetId: newId,
      targetName: newCaptain.name,
      description: `${currentUser.role} ${currentUser.name} created Captain ${newCaptain.name} (Status: INACTIVE)`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ipAddress: '192.168.1.104',
      deviceInfo: 'Chrome 128 (Windows 11)',
      status: 'SUCCESS',
      diffs: [
        { field: 'Role', oldValue: 'None', newValue: 'CAPTAIN' },
        { field: 'Account Status', oldValue: 'None', newValue: 'INACTIVE' }
      ]
    };

    setActivityLogs(prev => [newLog, ...prev]);
    setNotificationToast(`Captain ${newCaptain.name} created in INACTIVE state. Click 'Activate' to allow login!`);
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
      assignedAdminName: currentUser.assignedAdminName || 'Rahul Sharma',
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

    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(89000 + Math.random() * 1000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userAvatar: currentUser.avatarUrl,
      action: 'CREATE',
      module: 'Seller Management',
      entity: 'Seller',
      targetId: newId,
      targetName: newSeller.companyName || newSeller.name,
      description: `Captain ${currentUser.name} created Seller ${newSeller.companyName} (Status: INACTIVE)`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ipAddress: '192.168.1.189',
      deviceInfo: 'Chrome 128 (Windows 11)',
      status: 'SUCCESS',
      diffs: [
        { field: 'Seller Name', oldValue: 'None', newValue: newSeller.name },
        { field: 'Status', oldValue: 'None', newValue: 'INACTIVE' }
      ]
    };

    setActivityLogs(prev => [newLog, ...prev]);
    setNotificationToast(`Seller ${newSeller.companyName} created in INACTIVE state. Click 'Activate' to allow login!`);
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
      addCaptain,
      addSeller,
      updateUserStatus,
      sendAdminOtp,
      verifyAdminOtp,
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
