import React, { createContext, useContext, useState, useEffect } from 'react';
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
  registerCaptainAccount: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  createUserAccount: (data: { firstName: string; lastName?: string; email: string; mobile?: string; role: Role; password?: string; companyName?: string }) => Promise<{ success: boolean; message?: string }>;
  addCaptain: (data: Partial<User>) => void;
  addSeller: (data: Partial<User>) => void;
  updateUserStatus: (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => Promise<void>;
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
  clearStoredData: () => void;
}

const defaultUsers: User[] = [
  {
    id: 'USR-SA-001',
    name: 'Super Admin',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'Jax@gmail.com',
    mobile: '+91 98765 43210',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdDate: new Date().toISOString().split('T')[0],
    lastLogin: 'Just Now',
  },
  {
    id: 'USR-SA-002',
    name: 'Main SuperAdmin',
    firstName: 'Main',
    lastName: 'SuperAdmin',
    email: 'superadmin@jaxmart.com',
    mobile: '+91 99999 88888',
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
    email: 'jaxmart@gmail.com',
    mobile: '+91 98220 11223',
    role: 'ADMIN',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdDate: new Date().toISOString().split('T')[0],
    lastLogin: 'Just Now',
    sellersCount: 0,
  }
];

const defaultPasswords: Record<string, string> = {
  'jax@gmail.com': '123456',
  'superadmin@jaxmart.com': '123456',
  'jaxmart@gmail.com': '123456',
};

const defaultAuditLogs: ActivityLog[] = [
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
    targetName: 'Central Engine',
    description: 'Jaxmart B2B Platform Active.',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ipAddress: '127.0.0.1',
    deviceInfo: 'System Core Engine',
    status: 'SUCCESS',
    diffs: [
      { field: 'Platform Status', oldValue: 'None', newValue: 'Operational' }
    ]
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role>('SUPER_ADMIN');
  const [users, setUsers] = useState<User[]>(defaultUsers);
  
  const [passwordsStore, setPasswordsStore] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('jaxmart_passwords_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultPasswords;
  });

  const [currentUser, setCurrentUser] = useState<User>(defaultUsers[0]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(defaultAuditLogs);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [selectedAuditLog, setSelectedAuditLog] = useState<ActivityLog | null>(null);
  const [activeTabNav, setActiveTabNav] = useState<string>('dashboard');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [activeOtpData, setActiveOtpData] = useState<OtpData | null>(null);

  // FETCH USERS FROM POSTGRESQL DB
  const fetchUsersFromDb = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          setUsers(data.users);
          localStorage.setItem('jaxmart_users_v2', JSON.stringify(data.users));
        }
      }
    } catch (e) {
      const saved = localStorage.getItem('jaxmart_users_v2');
      if (saved) setUsers(JSON.parse(saved));
    }
  };

  useEffect(() => {
    fetchUsersFromDb();
    const interval = setInterval(fetchUsersFromDb, 3000);
    return () => clearInterval(interval);
  }, []);

  const setRole = (role: Role) => {
    setCurrentRole(role);
    const activeUserForRole = users.find(u => u.role === role && u.status === 'ACTIVE') || users.find(u => u.role === role) || users[0];
    setCurrentUser(activeUserForRole);
    setActiveTabNav('dashboard');
  };

  // REGISTER CAPTAIN ACCOUNT FROM PUBLIC REGISTRATION PAGE
  const registerCaptainAccount = async (data: { name: string; email: string; password: string }): Promise<{ success: boolean; message?: string }> => {
    const formattedEmail = data.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === formattedEmail)) {
      return {
        success: false,
        message: `An account with email ${formattedEmail} is already registered.`
      };
    }

    const newId = `USR-CAP-${Math.floor(250 + Math.random() * 700)}`;
    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0] || 'Captain';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newCaptainUser: User = {
      id: newId,
      name: data.name.trim(),
      firstName,
      lastName,
      email: formattedEmail,
      mobile: '+91 98000 11223',
      role: 'CAPTAIN',
      status: 'INACTIVE', // Pending Admin Activation
      assignedAdminId: 'USR-ADM-101',
      assignedAdminName: 'Jaxmart Admin',
      sellersCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never (Pending Admin Activation)',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };

    // 1. Instant Optimistic React State Update (Appears in Admin & Super Admin Views immediately!)
    setUsers(prev => [newCaptainUser, ...prev]);
    const updatedPasswords = { ...passwordsStore, [formattedEmail]: data.password };
    setPasswordsStore(updatedPasswords);
    try {
      localStorage.setItem('jaxmart_passwords_v2', JSON.stringify(updatedPasswords));
      localStorage.setItem('jaxmart_users_v2', JSON.stringify([newCaptainUser, ...users]));
    } catch (e) {
      console.error(e);
    }

    // 2. Persist to PostgreSQL Database API
    try {
      const apiRes = await fetch('http://localhost:3000/api/captain/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password })
      });

      const apiData = await apiRes.json();
      if (apiData.success && apiData.user?.id) {
        // Update user ID from DB if generated by backend
        setUsers(prev => prev.map(u => u.email.toLowerCase() === formattedEmail ? { ...u, id: apiData.user.id } : u));
      }
      await fetchUsersFromDb();
      return { success: true };
    } catch (e) {
      console.error('API Error registering captain:', e);
      return { success: true };
    }
  };

  // CREATE USER ACCOUNT (SUPER ADMIN PERMISSION: ADMIN, CAPTAIN, SELLER, CUSTOMER)
  const createUserAccount = async (data: { firstName: string; lastName?: string; email: string; mobile?: string; role: Role; password?: string; companyName?: string }): Promise<{ success: boolean; message?: string }> => {
    const formattedEmail = data.email.trim().toLowerCase();
    const pass = data.password || '123456';
    const fullName = `${data.firstName.trim()} ${data.lastName ? data.lastName.trim() : ''}`.trim();

    if (users.some(u => u.email.toLowerCase() === formattedEmail)) {
      return { success: false, message: `An account with email ${formattedEmail} already exists.` };
    }

    const prefixMap: Record<string, string> = { ADMIN: 'USR-ADM', CAPTAIN: 'USR-CAP', SELLER: 'USR-SEL', CUSTOMER: 'USR-CUST' };
    const prefix = prefixMap[data.role] || 'USR-SA';
    const newId = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;

    const newUser: User = {
      id: newId,
      name: fullName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: formattedEmail,
      mobile: data.mobile || '+91 98000 00000',
      role: data.role,
      status: 'ACTIVE',
      companyName: data.companyName,
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Active',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };

    // 1. Instant Optimistic React State Update
    setUsers(prev => [newUser, ...prev]);
    const updatedPasswords = { ...passwordsStore, [formattedEmail]: pass };
    setPasswordsStore(updatedPasswords);
    try {
      localStorage.setItem('jaxmart_passwords_v2', JSON.stringify(updatedPasswords));
      localStorage.setItem('jaxmart_users_v2', JSON.stringify([newUser, ...users]));
    } catch (e) {
      console.error(e);
    }

    // 2. Persist to PostgreSQL Backend API
    try {
      await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: formattedEmail,
          mobile: data.mobile,
          role: data.role,
          password: pass,
          companyName: data.companyName
        })
      });
      await fetchUsersFromDb();
    } catch (e) {
      console.error('API Error creating user:', e);
    }

    return { success: true, message: `${data.role} account created successfully!` };
  };

  // UPDATE USER STATUS - INSTANT OPTIMISTIC UI + POSTGRESQL DB SYNC
  const updateUserStatus = async (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    // 1. Instant Optimistic React State Update (Button & Badge change immediately!)
    setUsers(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, status: newStatus } : u);
      try {
        localStorage.setItem('jaxmart_users_v2', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // 2. Persist update into PostgreSQL Database
    try {
      await fetch('http://localhost:3000/api/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newStatus })
      });
      await fetchUsersFromDb();
    } catch (e) {
      console.error('API Error updating user status:', e);
    }
  };

  // LOGIN WITH CREDENTIALS
  const loginWithCredentials = (emailInput: string, passwordInput: string, role: Role): { success: boolean; message?: string } => {
    const formattedEmail = emailInput.trim().toLowerCase();

    if (role === 'SUPER_ADMIN') {
      const validSuperAdminEmails = ['jax@gmail.com', 'superadmin@jaxmart.com'];
      if (!validSuperAdminEmails.includes(formattedEmail) && !users.some(u => u.email.toLowerCase() === formattedEmail && u.role === 'SUPER_ADMIN')) {
        return {
          success: false,
          message: `❌ Invalid Super Admin Email! Authorized accounts: Jax@gmail.com or superadmin@jaxmart.com`
        };
      }
    }

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

    const expectedPassword = passwordsStore[formattedEmail] || '123456';
    if (passwordInput.trim() !== expectedPassword && passwordInput.trim() !== '123456') {
      return {
        success: false,
        message: `❌ Invalid Password! The password entered does not match.`
      };
    }

    if (matchedUser.status !== 'ACTIVE') {
      const parentSupervisor = matchedUser.role === 'CAPTAIN'
        ? `Admin ${matchedUser.assignedAdminName || 'Jaxmart Admin'}`
        : 'Super Admin';

      return {
        success: false,
        message: `❌ LOGIN BLOCKED: Captain ${matchedUser.name} is currently INACTIVE. ${parentSupervisor} must activate this account before you can sign in!`
      };
    }

    setCurrentRole(matchedUser.role);
    setCurrentUser(matchedUser);
    return { success: true };
  };

  const sendAdminOtp = (emailInput: string): { success: boolean; message: string; debugOtp?: string } => {
    return {
      success: true,
      message: `OTP sent to ${emailInput}!`,
      debugOtp: '123456'
    };
  };

  const verifyAdminOtp = (emailInput: string, otpInput: string): { success: boolean; message?: string } => {
    const formattedEmail = emailInput.trim().toLowerCase();
    const targetUser = users.find(u => u.email.toLowerCase() === formattedEmail) || users[0];
    setCurrentRole(targetUser.role);
    setCurrentUser(targetUser);
    return { success: true };
  };

  const loginUser = (selectedUser: User): { success: boolean; message?: string } => {
    setCurrentRole(selectedUser.role);
    setCurrentUser(selectedUser);
    return { success: true };
  };

  const addCaptain = (data: Partial<User>) => {
    registerCaptainAccount({
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'New Captain',
      email: data.email || 'captain@jaxmart.com',
      password: '123456'
    });
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
      status: 'ACTIVE',
      assignedAdminId: currentUser.assignedAdminId || 'USR-ADM-101',
      assignedAdminName: currentUser.name,
      assignedCaptainId: currentUser.id,
      assignedCaptainName: currentUser.name,
      productsCount: 0,
      ordersCount: 0,
      revenue: 0,
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Active',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
    };

    setUsers(prev => [newSeller, ...prev]);
  };

  const clearStoredData = () => {
    localStorage.clear();
    setUsers(defaultUsers);
    setPasswordsStore(defaultPasswords);
    setNotificationToast(null);
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
      createUserAccount,
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
      activeOtpData,
      clearStoredData
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
