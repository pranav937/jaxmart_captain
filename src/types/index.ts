export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'CAPTAIN' | 'SELLER';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  mobile: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatarUrl?: string;
  companyName?: string;
  assignedAdminId?: string;
  assignedAdminName?: string;
  assignedCaptainId?: string;
  assignedCaptainName?: string;
  sellersCount?: number;
  productsCount?: number;
  ordersCount?: number;
  revenue?: number;
  createdDate: string;
  lastLogin: string;
}

export interface ActivityDiff {
  field: string;
  oldValue: string | number | boolean;
  newValue: string | number | boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  userAvatar?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE' | 'LOGIN' | 'LOGOUT' | 'STATUS_CHANGE';
  module: 'Admin Management' | 'Captain Management' | 'Seller Management' | 'Product Catalog' | 'Order Management' | 'Security & RBAC' | 'Authentication';
  entity: string;
  targetId: string;
  targetName: string;
  description: string;
  date: string;
  time: string;
  ipAddress: string;
  deviceInfo: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  diffs?: ActivityDiff[];
  hierarchyContext?: {
    adminName?: string;
    captainName?: string;
    sellerName?: string;
  };
}

export interface SecurityEvent {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  eventType: 'SUCCESSFUL_LOGIN' | 'FAILED_LOGIN' | 'PASSWORD_RESET' | 'ACCOUNT_LOCKED' | 'PERMISSION_CHANGE' | 'SESSION_EXPIRED';
  ipAddress: string;
  device: string;
  location: string;
  timestamp: string;
  status: 'SUCCESS' | 'ALERT' | 'BLOCKED';
  details: string;
}

export interface Permission {
  id: string;
  module: string;
  feature: string;
  superAdmin: boolean;
  admin: boolean;
  captain: boolean;
  seller: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  sellerId: string;
  sellerName: string;
  captainName: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  captainName: string;
  totalAmount: number;
  status: 'DELIVERED' | 'PROCESSING' | 'PENDING' | 'CANCELLED';
  date: string;
  itemsCount: number;
}
