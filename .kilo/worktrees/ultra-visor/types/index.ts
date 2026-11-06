// User and Auth Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  tenantId: string;
  isActive?: boolean;
  tenant?: { name: string };
  createdAt?: string;
  tenantStatus?: string;
  paymentStatus?: string;
  isPaymentSubmitted?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  data?: {
    email: string;
    userId: string;
    tenantId: string;
  };
}

// Product Types
export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  basePrice?: number;
  images: string[];
  slug?: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt: string;
  updatedAt: string;
  variants?: Variant[];
  categories?: Array<{ category: { id: string; name: string; slug: string } }>;
  brand?: { id: string; name: string; slug: string; logo?: string } | null;
  brandId?: string | null;
  imagesRel?: Array<{ id: string; url: string; altText?: string; isPrimary: boolean; sortOrder: number }>;
  _count?: { variants: number };
}

// Variant Types
export interface Variant {
  id: string;
  productId: string;
  sku: string;
  attributes: {[key: string]: string | string[]};
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
  variantImages?: VariantImage[];
}

export interface VariantImage {
  id: string;
  variantId: string;
  url: string;
  altText?: string;
  color?: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

// Order Types
export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerEmail?: string;
  status: string;
  paymentMethod?: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  deliveryCharge?: number;
  total: number;
  notes?: string;
  internalComments?: string;
  deliveryPartner?: string;
  deliveryTrackingId?: string;
  // Courier tracking fields (Steadfast)
  courierConsignmentId?: string;
  courierStatus?: string;
  shippedAt?: string;
  deliveredAt?: string;
  deliveryStatus?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  tenant?: Tenant; // Added for invoice context
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  priceAtTime: number;
  total: number;
  variant?: Variant;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: string;
  note?: string;
  changedBy?: string;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  recentOrders?: RecentOrder[];
  monthlyRevenue?: MonthlyRevenue[];
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

// Landing Page Types
export interface LandingPage {
  id: string;
  tenantId: string;
  templateId: string;
  title: string;
  slug: string;
  sections: any[];
  styles: {[key: string]: any};
  seo: {[key: string]: any};
  videoUrl?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  logoUrl?: string;
  phoneNumber?: string;
  phoneNumber2?: string;
  emailAddress?: string;
  address?: string;
  socialLinks?: {[key: string]: string};
  termsContent?: string;
  footerHtml?: string;
}

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phone2?: string;
  package: string;
  status: string;
  logo?: string;
  address?: string;
  timezone?: string;
  preferences: {[key: string]: any};
  onboardingCompleted: boolean;
  companyName?: string;
  tenantEmail?: string;
  socialLinks?: {[key: string]: string};
  termsAndConditions?: string;
  currency?: string;
  currencySymbol?: string;
  taxPercentage?: number;
  deliveryCharge?: number;
  productFeatures?: {[key: string]: any};
  createdAt: string;
  updatedAt: string;
}

// Return Request Types
export interface ReturnRequest {
  id: string;
  orderId: string;
  orderItemId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  reason: string;
  description?: string;
  requestedAmount?: number;
  status: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  refund?: Refund;
}

export interface Refund {
  id: string;
  returnRequestId: string;
  amount: number;
  method?: string;
  status: string;
  transactionId?: string;
  notes?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Supplier Types
export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Expense Types
export interface Expense {
  id: string;
  tenantId: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  categories: { category: string; amount: number }[];
  total: number;
}

// Extended Dashboard Stats
export interface EnhancedDashboardStats extends DashboardStats {
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  cogs: number;
  stockValue: number;
  totalStockQty: number;
  orderStatusBreakdown: { status: string; count: number }[];
  topProducts: { sku: string; attributes: any; total_quantity: number; total_revenue: number }[];
  lowStockVariants: { id: string; sku: string; stock: number; price: number }[];
  profitMargin: string | number;
  incompleteCheckoutCount: number;
  todayOrderCount: number;
}

// Blocking Types
export interface BlockedPhone {
  id: string;
  tenantId: string;
  phone: string;
  reason?: string;
  blockedAt: string;
  blockedBy?: string;
}

export interface BlockedIp {
  id: string;
  tenantId: string;
  ip: string;
  reason?: string;
  blockedAt: string;
  blockedBy?: string;
}

export interface BlockSettings {
  repeatOrderBlockMinutes: number;
  maxOrdersPerDay: number;
  enableRepeatBlock: boolean;
  enableIpBlock: boolean;
  enablePhoneBlock: boolean;
}

// Review Types
export interface Review {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  text: string;
  stars: number;
  phone?: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Store Info type for printing
export interface StoreInfo {
  companyName?: string;
  name?: string;
  currencySymbol?: string;
  phone?: string;
  logo?: string;
  address?: string;
}

// Banner Types
export interface Banner {
  id: string;
  tenantId: string;
  imageUrl: string;
  title?: string;
  description?: string;
  categoryId?: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

// Courier Types
export interface Courier {
  id: string;
  tenantId: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  webhookUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Webhook Log Types
export interface WebhookLog {
  id: string;
  tenantId: string;
  courierId?: string;
  payload: any;
  headers: any;
  createdAt: string;
}
