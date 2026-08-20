export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'CAPTAIN' | 'SELLER' | 'CUSTOMER';

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
  isDeleted?: boolean;
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
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE' | 'LOGIN' | 'LOGOUT' | 'STATUS_CHANGE' | 'RESTORE';
  module: 'Admin Management' | 'Captain Management' | 'Seller Management' | 'Customer Management' | 'Product Catalog' | 'Order Management' | 'Security & RBAC' | 'Authentication' | 'System Settings';
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
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
  isDeleted?: boolean;
  updatedAt: string;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  customerName: string;
  sellerId: string;
  sellerName: string;
  productName: string;
  quantity: number;
  status: 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'REJECTED';
  notes?: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  rfqId: string;
  sellerId: string;
  sellerName: string;
  totalAmount: number;
  validUntil: string;
  status: 'SENT' | 'ACCEPTED' | 'EXPIRED';
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  captainName: string;
  totalAmount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  status: 'DELIVERED' | 'PROCESSING' | 'SHIPPED' | 'CANCELLED';
  date: string;
  itemsCount: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  orderId: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'UPI' | 'NET_BANKING';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  transactionRef: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  targetRole: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemSetting {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  autoApproveSellers: boolean;
  allowGuestCheckout: boolean;
}

export interface CompanyAddress {
  id?: string;
  companyId?: string;
  addressType: 'Registered' | 'Factory' | 'Warehouse' | 'Billing' | 'Shipping';
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isPrimary?: boolean;
}

export interface CompanyContact {
  id?: string;
  companyId?: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  isPrimary?: boolean;
}

export interface CompanyDocument {
  id?: string;
  companyId?: string;
  docType: 'GST Certificate' | 'PAN Card' | 'MSME Registration' | 'Cancelled Cheque' | 'Incorporation Certificate' | 'Other';
  docNumber: string;
  fileUrl?: string;
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface CompanyBankAccount {
  id?: string;
  companyId?: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  accountType: 'Savings' | 'Current' | 'Overdraft';
  isPrimary?: boolean;
}

export interface CompanyCertification {
  id?: string;
  companyId?: string;
  certName: string;
  certNumber: string;
  issuingAuthority: string;
  validTill: string;
}

export interface OnboardedCompany {
  id: string;
  captainId: string;
  captainName?: string;
  companyName: string;
  legalName?: string;
  companyType?: string;
  brandName?: string;
  registrationNo?: string;
  gstin?: string;
  pan?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  website?: string;
  contactPerson?: string;
  ownerName?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  paymentTerms?: string;
  creditLimit?: string;
  rating?: string;
  sellingCategories?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  addresses?: CompanyAddress[];
  contacts?: CompanyContact[];
  documents?: CompanyDocument[];
  bankAccounts?: CompanyBankAccount[];
  certifications?: CompanyCertification[];
}

export interface ProductMaster {
  id: string;
  companyId: string;
  companyName?: string;
  captainId?: string;
  captainName?: string;
  productName: string;
  category: string;
  subCategory: string;
  productType: string;
  description: string;
  baseUom: 'KG' | 'PCS' | 'MTR' | 'TON' | 'LTR' | 'BOX' | 'SQFT' | string;
  industry: string;
  imageUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  skusCount?: number;
}



