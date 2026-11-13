import {
  FiShoppingCart,
  FiUsers,
  FiFileText,
  FiPackage,
  FiMessageCircle,
  FiAlertTriangle,
  FiShield,
  FiLock,
  FiBox,
  FiTrendingUp,
  FiMonitor,
  FiZap,
  FiSettings,
  FiCpu,
  FiRefreshCcw,
  FiBarChart2,
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebookMessenger, FaFacebook } from 'react-icons/fa';

export const WHATSAPP_NUMBER = '8801918647966';
export const PHONE_DISPLAY = '+880 1918647966';

export const NAV_LINKS = ['হোম', 'প্রোজেক্ট', 'সার্ভিসসমূহ', 'প্যাকেজ', 'পোর্টফোলিও', 'রিভিউ', 'FAQ', 'যোগাযোগ'];

/* ── Live Business Stats (Section 2) ── */
export const LIVE_STATS = [
  { value: 25000, suffix: '+', label: 'Orders Processed' },
  { value: 1200, suffix: '+', label: 'Active Merchants' },
  { value: 5, suffix: ' কোটি+', prefix: '৳', label: 'Sales Generated' },
  { value: 99.9, suffix: '%', label: 'Uptime', decimals: 1 },
];

/* ── Why People Fail / Our Solution (Section 3) ── */
export const PROBLEMS = [
  { icon: FiShoppingCart, label: 'কার্টে Order Complete করে না' },
  { icon: FiAlertTriangle, label: 'Fake Order আসে' },
  { icon: FiUsers, label: 'একই Fraud Customer বারবার Order করে' },
  { icon: FiFileText, label: 'Excel Sheet দিয়ে Order Manage করতে হয়' },
  { icon: FiPackage, label: 'Stock হিসাব গোলমাল হয়ে যায়' },
  { icon: FiMessageCircle, label: 'Facebook Inbox থেকে Order Track করা কঠিন' },
];

export const SOLUTIONS = [
  { icon: FiMonitor, label: 'Smart Dashboard — সব ডেটা এক জায়গায়' },
  { icon: FiZap, label: 'Auto Order Processing' },
  { icon: FiShield, label: 'Customer Verification & Fraud Score' },
  { icon: FiBarChart2, label: 'Real-time Sales Analytics' },
  { icon: FiBox, label: 'Automatic Inventory Tracking' },
  { icon: FiLock, label: 'One Click Customer Block' },
];

/* ── Core Features grid (Section 4) ── */
export const CORE_FEATURES = [
  {
    icon: FiShield,
    title: 'Fraud Shield',
    desc: 'Fake customer ধরুন, spam order ব্লক করুন, প্রতিটি অর্ডারে অটো রিস্ক স্কোর।',
    points: ['Detect Fake Customers', 'Block Spam Orders', 'Auto Risk Scoring'],
  },
  {
    icon: FaWhatsapp,
    title: 'WhatsApp Commerce',
    desc: 'এক ক্লিকে হোয়াটসঅ্যাপ অর্ডার, অটো ফলো-আপ আর ব্রডকাস্ট মার্কেটিং।',
    points: ['1 Click WhatsApp Order', 'Auto Customer Followup', 'Broadcast Marketing'],
  },
  {
    icon: FiTrendingUp,
    title: 'Smart Analytics',
    desc: 'হিটম্যাপ, ভিজিটর ট্র্যাকিং আর কনভার্সন রেট — সব এক ভিউতে।',
    points: ['Heatmaps', 'Visitor Tracking', 'Conversion Rate'],
  },
  {
    icon: FiRefreshCcw,
    title: 'Abandoned Cart Recovery',
    desc: 'হারিয়ে যাওয়া বিক্রি ফিরিয়ে আনুন রিমাইন্ডার আর মেসেঞ্জার রিকভারির মাধ্যমে।',
    points: ['Recover Lost Sales', 'Reminder System', 'Messenger Recovery'],
  },
  {
    icon: FiCpu,
    title: 'AI Sales Assistant',
    desc: 'কোন প্রোডাক্ট বিক্রি হবে, কাস্টমার কী চায় — সব আগেই জানিয়ে দেবে AI।',
    points: ['Suggest Winning Products', 'Customer Insights', 'Sales Forecasting'],
  },
  {
    icon: FiPackage,
    title: 'Inventory Manager',
    desc: 'স্টক শেষ হওয়ার আগেই অ্যালার্ট, পারচেজ ট্র্যাকিং আর স্টক ফরকাস্ট।',
    points: ['Low Stock Alert', 'Purchase Tracking', 'Stock Forecast'],
  },
];

/* ── Dashboard data (shared mockup) ── */
export const SIDEBAR_ITEMS = ['Dashboard', 'Orders', 'Products', 'Customers', 'Analytics', 'Coupons', 'Wishlist', 'Fraud Checker', 'Reports', 'Settings', 'Logout'];

export const STAT_CARDS = [
  { label: 'Total Orders', value: '1,245', delta: '+12.5%' },
  { label: 'Total Revenue', value: '৳245,430', delta: '+18.3%' },
  { label: 'Total Customers', value: '3,456', delta: '+8.7%' },
  { label: 'Visitors', value: '13,441', delta: '+15.6%' },
];

export const TOP_PRODUCTS = [
  { icon: '👕', name: 'Premium T-Shirt', value: '852', delta: '+5.2%' },
  { icon: '🎧', name: 'Wireless Earbuds', value: '654', delta: '+3.8%' },
  { icon: '⌚', name: 'Smart Watch', value: '421', delta: '+2.1%' },
  { icon: '👟', name: 'Running Shoes', value: '365', delta: '+4.5%' },
];

export const RECENT_ORDERS = [
  { id: '#SNX12345', name: 'Rahan Rahman', amount: '৳1,250', status: 'Pending' },
  { id: '#SNX12344', name: 'Nusrat Jahan', amount: '৳2,900', status: 'Completed' },
  { id: '#SNX12343', name: 'Alamin Hossain', amount: '৳1,800', status: 'Completed' },
  { id: '#SNX12342', name: 'Mehedi Hasan', amount: '৳1,450', status: 'Cancelled' },
];

export const STATUS_STYLE: Record<string, string> = {
  Pending: 'bg-red-50 text-red-600',
  Completed: 'bg-emerald-50 text-emerald-600',
  Cancelled: 'bg-red-50 text-red-500',
};

/* ── Dashboard Showcase tabs (Section 5) ── */
export const DASHBOARD_TABS = ['Orders', 'Products', 'Customers', 'Analytics', 'Marketing'] as const;

export const DASHBOARD_TAB_HIGHLIGHTS: Record<string, { title: string; desc: string; metric: string; metricLabel: string }> = {
  Orders: { title: 'Live Orders', desc: 'রিয়েল-টাইমে নতুন অর্ডার আসা মাত্র নোটিফিকেশন, এক ক্লিকে কনফার্ম বা কুরিয়ারে অ্যাসাইন।', metric: '1,245', metricLabel: 'Orders this month' },
  Products: { title: 'Product Catalog', desc: 'ভ্যারিয়েন্ট, প্রাইসিং আর স্টক — প্রতিটি প্রোডাক্ট একসাথে ম্যানেজ করুন।', metric: '142', metricLabel: 'Active products' },
  Customers: { title: 'Customer Growth', desc: 'নতুন বনাম রিপিট কাস্টমার, লাইফটাইম ভ্যালু আর ফ্রড স্কোর — সবকিছু এক প্রোফাইলে।', metric: '3,456', metricLabel: 'Total customers' },
  Analytics: { title: 'Revenue Chart', desc: 'দিন, সপ্তাহ বা মাস ভিত্তিতে রেভিনিউ আর কনভার্সন রেট ট্র্যাক করুন।', metric: '৳245,430', metricLabel: 'This month revenue' },
  Marketing: { title: 'Campaign Performance', desc: 'কুপন, পিক্সেল আর ব্রডকাস্ট ক্যাম্পেইনের রিটার্ন এক ড্যাশবোর্ডে।', metric: '18.3%', metricLabel: 'Conversion uplift' },
};

/* ── Complete Ecommerce Flow (Section 6) ── */
export const ECOMMERCE_FLOW = [
  { step: '০১', title: 'Create Product', desc: 'প্রোডাক্ট যোগ করুন, ছবি ও দাম সেট করুন' },
  { step: '০২', title: 'Create Landing Page', desc: 'রেডি টেমপ্লেট থেকে পেজ তৈরি করুন' },
  { step: '০৩', title: 'Use Your Product Facebook Image', desc: 'বারবার ইমেজ আপলোডের ঝামেলা নেই, Facebook পেজের প্রোডাক্ট ইমেজের URL দিয়েই ওয়েবসাইট চালান' },
  { step: '০৪', title: 'Receive Orders', desc: 'অর্ডার ড্যাশবোর্ডে আসবে, আর অর্ডার হওয়ার সাথে সাথে অটো ইমেইলে Invoice চলে যাবে' },
  { step: '০৫', title: 'Confirm Customer', desc: 'ফ্রড চেক করে কাস্টমার কনফার্ম করুন' },
  { step: '০৬', title: 'Deliver Product', desc: 'কুরিয়ার অ্যাসাইন করে ডেলিভারি দিন' },
  { step: '০৭', title: 'Get Paid', desc: 'পেমেন্ট কালেক্ট ও রিপোর্ট দেখুন' },
];

/* ── Business Types (Section 7) ── */
export const BUSINESS_TYPES = [
  { emoji: '👗', label: 'Fashion Store' },
  { emoji: '💄', label: 'Cosmetics' },
  { emoji: '🎧', label: 'Electronics' },
  { emoji: '📱', label: 'Gadgets' },
  { emoji: '🍔', label: 'Food' },
  { emoji: '📚', label: 'Books' },
  { emoji: '🎓', label: 'Course Selling' },
  { emoji: '💾', label: 'Digital Product' },
  { emoji: '🛍️', label: 'Single Product Store' },
];

/* ── Testimonials (Section 8) ── */
export const TESTIMONIALS = [
  {
    name: 'রাসেল আহমেদ', role: 'Founder, Gadget World',
    quote: 'Fraud Order বন্ধ হওয়ার পর থেকে রিয়েল অর্ডার আলাদা করা অনেক সহজ হয়ে গেছে। দারুণ একটা সিস্টেম।',
    before: '৫টা অর্ডার/দিন', after: '২৫-৩০টা অর্ডার/দিন',
    initial: 'R', color: 'bg-red-500',
  },
  {
    name: 'নুসরাত জাহান', role: 'Owner, Fashion Hub',
    quote: 'Excel Sheet বাদ দিয়ে এখন পুরো বিজনেস এক ড্যাশবোর্ড থেকে ম্যানেজ করি। সময় অনেক বেঁচে যায়।',
    before: 'ম্যানুয়াল এক্সেল', after: 'অটো ড্যাশবোর্ড',
    initial: 'N', color: 'bg-red-500',
  },
  {
    name: 'মেহেদী হাসান', role: 'Founder, Organic Food BD',
    quote: 'Customer Blocking System ব্যবহার করার পর থেকে রিপিট Fake Order প্রায় শূন্যের কোঠায়।',
    before: 'নিয়মিত ফেক অর্ডার', after: '~০ ফেক অর্ডার',
    initial: 'M', color: 'bg-red-600',
  },
];

/* ── How it works ── */
export const HOW_IT_WORKS = [
  { step: '০১', title: 'সাইন আপ করুন', desc: 'একটিমাত্র ফর্ম পূরণ করুন' },
  { step: '০২', title: 'সেটআপ করুন', desc: 'মাত্র ৩০ মিনিটে রেডি' },
  { step: '০৩', title: 'ব্যবসা শুরু করুন', desc: 'অর্ডার নিন, টাকা আয় করুন' },
];

/* ── Pricing (Section 9) ── */
/* constants.ts-এর পুরনো PRICING_PLANS এর জায়গায় এটা বসান */
export const PRICING_PLANS = [
  {
    name: 'স্টোর প্যাকেজ',
    tagline: 'আমাদের ডোমেইনের অধীনে আপনার নিজের Store',
    price: '250',
    period: 'মাসিক',
    popular: true,
    features: [
      'আমাদের ডোমেইনের অধীনে Store',
      'Landing Page',
      'Single ও Multi Product',
      'Order Management',
      'Auto Invoice Email',
      'Inventory Management',
      'Fraud Customer Detection',
      'One Click Customer Block',
      'Coupon, Wishlist ও Sales Analytics',
      'Admin Dashboard',
      'Third-party Delivery API Integration',
      '২৪ ঘণ্টা সাপোর্ট',
    ],
  },
  {
    name: 'কাস্টম ওয়েবসাইট প্যাকেজ',
    tagline: 'নিজের ডোমেইনে Custom Website',
    price: '5,000',
    period: 'এককালীন',
    popular: false,
    features: [
      'Store প্যাকেজের সব ফিচার',
      'নিজের ডোমেইনে Custom Website',
      'Domain',
      'Hosting',
      'Service Charge সহ সবকিছু',
      '২৪ ঘণ্টা সাপোর্ট',
    ],
  },
];
export const OTHER_SERVICES = [
  { icon: FiMonitor, label: 'Custom Website Development', bg: 'bg-red-50', color: 'text-red-600' },
  { icon: FiMonitor, label: 'Custom Web Software', bg: 'bg-red-50', color: 'text-red-600' },
  { icon: FaFacebook, label: 'Facebook Ads Boosting', bg: 'bg-blue-50', color: 'text-blue-600' },
  { icon: FiZap, label: 'Server Side Tracking (CAPI)', bg: 'bg-red-50', color: 'text-red-600' },
  { icon: FiShoppingCart, label: 'Complete E-commerce Setup Package', bg: 'bg-red-50', color: 'text-red-600' },
  { icon: FaFacebook, label: 'Facebook Page Setup & Branding', bg: 'bg-blue-50', color: 'text-blue-600' },
  { icon: FiZap, label: 'Marketing Automation & Integration', bg: 'bg-violet-50', color: 'text-pink-600' },
];

export const HERO_BADGES = [
  { icon: FiShield, bg: 'bg-red-100', clr: 'text-red-600', title: 'মাসিক ফি নেই', sub: 'এককালীন পেমেন্ট' },
  { icon: FiZap, bg: 'bg-red-100', clr: 'text-red-600', title: 'কোডিং দরকার নেই', sub: 'রেডি সিস্টেম' },
  { icon: FiSettings, bg: 'bg-zinc-100', clr: 'text-zinc-600', title: '৩০ মিনিটে লাইভ', sub: 'কুইক সেটআপ' },
];

export { FaWhatsapp, FaFacebookMessenger, FaFacebook };