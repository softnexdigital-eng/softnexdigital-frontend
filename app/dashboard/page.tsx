'use client';

import { useEffect, useState, useCallback, useRef, useId, useMemo } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { EnhancedDashboardStats } from '@/types';
import {
  FiPackage, FiShoppingCart, FiUsers, FiDollarSign, FiBox,
  FiBarChart2, FiAlertTriangle, FiTrendingUp, FiTrendingDown,
  FiActivity, FiUser, FiArrowRight, FiSearch, FiX,
  FiCalendar, FiClock, FiPercent, FiTarget, FiPieChart, FiBell, FiChevronDown,
  FiMoon, FiSun, FiPlus, FiInbox, FiCheckCircle, FiGlobe
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from 'next-themes';

// ============================================================
// Helpers
// ============================================================
function formatBDT(amount: number | string | undefined | null): string {
  const num = Number(amount) || 0;
  return `৳${num.toLocaleString('bn-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

function getBanglaStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'পেন্ডিং', CONFIRMED: 'নিশ্চিত', PROCESSING: 'প্রক্রিয়াধীন',
    PACKED: 'প্যাককৃত', SHIPPED: 'পাঠানো হয়েছে', OUT_FOR_DELIVERY: 'ডেলিভারি প্রক্রিয়ায়',
    DELIVEred: 'ডেলিভারি সম্পন্ন', CANCELLED: 'বাতিল', RETURNED: 'ফেরত',
  };
  return map[status] || status;
}

function getStatusColor(status: string, darkMode: boolean = false) {
  const light: Record<string, string> = {
    PENDING: 'bg-red-50 text-red-700 border-red-200',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
    PROCESSING: 'bg-violet-50 text-violet-700 border-violet-200',
    PACKED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    SHIPPED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    OUT_FOR_DELIVERY: 'bg-teal-50 text-teal-700 border-teal-200',
    DELIVEred: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    RETURNED: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  const dark: Record<string, string> = {
    PENDING: 'bg-red-900/30 text-red-500 border-red-800',
    CONFIRMED: 'bg-blue-900/30 text-blue-300 border-blue-800',
    PROCESSING: 'bg-violet-900/30 text-violet-300 border-violet-800',
    PACKED: 'bg-indigo-900/30 text-indigo-300 border-indigo-800',
    SHIPPED: 'bg-cyan-900/30 text-cyan-300 border-cyan-800',
    OUT_FOR_DELIVERY: 'bg-teal-900/30 text-teal-300 border-teal-800',
    DELIVEred: 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
    CANCELLED: 'bg-rose-900/30 text-rose-300 border-rose-800',
    RETURNED: 'bg-gray-800 text-gray-300 border-gray-700',
  };
  return darkMode ? dark[status] || dark.RETURNED : light[status] || light.RETURNED;
}

const STATUS_PIE_COLORS = ['#6366f1', '#10b981', '#f50b0b', '#ef4444', '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316', '#6b7280'];

// ------------------------------------------------------------
// Static color theme map — every class is a literal string so Tailwind's
// build-time scanner can always find it (template-string classes like
// `bg-${color}-50` get silently dropped from production CSS).
// ------------------------------------------------------------
type ColorKey = 'indigo' | 'emerald' | 'blue' | 'red' | 'purple' | 'rose';

const COLOR_THEME: Record<ColorKey, {
  cardBg: string;
  cardBorder: string;
  chip: string;
  chipShadow: string;
  glowHover: string;
  accentBar: string;
}> = {
  indigo: {
    cardBg: 'bg-indigo-50/40 dark:bg-indigo-950/20',
    cardBorder: 'border-indigo-100/70 dark:border-indigo-900/40',
    chip: 'bg-gradient-to-br from-indigo-500 to-violet-500',
    chipShadow: 'shadow-lg shadow-indigo-500/30',
    glowHover: 'hover:shadow-xl hover:shadow-indigo-500/10',
    accentBar: 'from-indigo-500 to-violet-400',
  },
  emerald: {
    cardBg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
    cardBorder: 'border-emerald-100/70 dark:border-emerald-900/40',
    chip: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    chipShadow: 'shadow-lg shadow-emerald-500/30',
    glowHover: 'hover:shadow-xl hover:shadow-emerald-500/10',
    accentBar: 'from-emerald-500 to-teal-400',
  },
  blue: {
    cardBg: 'bg-blue-50/40 dark:bg-blue-950/20',
    cardBorder: 'border-blue-100/70 dark:border-blue-900/40',
    chip: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    chipShadow: 'shadow-lg shadow-blue-500/30',
    glowHover: 'hover:shadow-xl hover:shadow-blue-500/10',
    accentBar: 'from-blue-500 to-cyan-400',
  },
  red: {
    cardBg: 'bg-red-50/40 dark:bg-red-950/20',
    cardBorder: 'border-red-100/70 dark:border-red-900/40',
    chip: 'bg-gradient-to-br from-red-500 to-red-500',
    chipShadow: 'shadow-lg shadow-red-500/30',
    glowHover: 'hover:shadow-xl hover:shadow-red-500/10',
    accentBar: 'from-red-500 to-red-400',
  },
  purple: {
    cardBg: 'bg-purple-50/40 dark:bg-purple-950/20',
    cardBorder: 'border-purple-100/70 dark:border-purple-900/40',
    chip: 'bg-gradient-to-br from-purple-500 to-fuchsia-500',
    chipShadow: 'shadow-lg shadow-purple-500/30',
    glowHover: 'hover:shadow-xl hover:shadow-purple-500/10',
    accentBar: 'from-purple-500 to-fuchsia-400',
  },
  rose: {
    cardBg: 'bg-rose-50/40 dark:bg-rose-950/20',
    cardBorder: 'border-rose-100/70 dark:border-rose-900/40',
    chip: 'bg-gradient-to-br from-rose-500 to-pink-500',
    chipShadow: 'shadow-lg shadow-rose-500/30',
    glowHover: 'hover:shadow-xl hover:shadow-rose-500/10',
    accentBar: 'from-rose-500 to-pink-400',
  },
};

const SPARK_HEX: Record<ColorKey, string> = {
  indigo: '#6366f1', emerald: '#10b981', blue: '#3b82f6', red: '#f50b0b', purple: '#a855f7', rose: '#f43f5e',
};

// A single highlight treatment used everywhere the search jumps the admin
// to something — independent of each section's own color, so it always
// reads clearly as "this is what you searched for", on any background.
const HIGHLIGHT_RING = 'shadow-[0_0_0_4px_rgba(139,92,246,0.45)] dark:shadow-[0_0_0_4px_rgba(167,139,250,0.4)]';
const HIGHLIGHT_ROW = 'bg-violet-100/70 dark:bg-violet-900/30';

function LivePulse() {
  return (
    <span className="absolute top-3 right-3 z-10 flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-sm bg-emerald-500" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-sm bg-emerald-500" />
    </span>
  );
}

// Small category-group label — this is what makes the page read as
// "subject-wise organized": every cluster of cards is introduced by one
// of these, and the chip color/weight signals how important that cluster is.
function SectionEyebrow({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: ColorKey | 'neutral' }) {
  const chipClass = color === 'neutral' ? 'bg-gray-400 dark:bg-gray-600' : COLOR_THEME[color].chip;
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <div className={`rounded-md p-1 ${chipClass}`}>
        <Icon className="h-3 w-3 text-white" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{label}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-gray-300/60 to-transparent dark:from-gray-700/60" />
    </div>
  );
}

// ============================================================
// Language translations
// ============================================================
type Language = 'en' | 'bn';
const translations = {
  en: {
    greeting: 'Good Morning, Fahim',
    subGreeting: "Here's your store performance today.",
    revenue: 'Revenue', orders: 'Orders', customers: 'Customers', conversionRate: 'Conversion Rate',
    vsLastMonth: 'vs last month',
    grossProfit: 'Gross Profit', netProfit: 'Net Profit', profitMargin: 'Profit Margin', inventoryValue: 'Inventory Value',
    revenueExpenses: 'Revenue & Expenses', monthlyPerformance: 'Monthly performance',
    orderStatus: 'Order Status', currentDistribution: 'Current distribution',
    topProducts: 'Top Performing Products', highestRevenue: 'Highest revenue contributors',
    lowStockAlerts: 'Low Stock Alerts', itemsNeedingAttention: 'Items needing attention', restock: 'Restock',
    recentOrders: 'Recent Orders', latestTransactions: 'Latest transactions', viewAll: 'View all',
    orderId: 'Order ID', customer: 'Customer', amount: 'Amount', status: 'Status', date: 'Date',
    recentActivity: 'Recent Activity', quickActions: 'Quick Actions',
    addProduct: 'Add Product', inventory: 'Inventory', processOrders: 'Process Orders', expenses: 'Expenses',
    customersLabel: 'Customers', reports: 'Reports',
    noResults: 'No results found', allHealthy: 'All stock levels are healthy', products: 'products',
    urgent: 'Urgent', testLights: 'Test Lights',
    coreMetrics: 'Core Metrics', financialDetail: 'Financial Detail', analytics: 'Analytics',
    operations: 'Operations', activityAndTools: 'Activity & Shortcuts',
    searchPlaceholder: 'Search anything on this dashboard — revenue, an order #, a SKU…',
    searchNoResults: 'No matches found',
    catSection: 'Section', catProduct: 'Product', catOrder: 'Order', catLowStock: 'Low Stock', catAction: 'Action',
  },
  bn: {
    greeting: 'শুভ সকাল, ফাহিম',
    subGreeting: 'আপনার স্টোরের আজকের পারফরম্যান্স।',
    revenue: 'আয়', orders: 'অর্ডার', customers: 'গ্রাহক', conversionRate: 'রূপান্তর হার',
    vsLastMonth: 'গত মাসের তুলনায়',
    grossProfit: 'মোট মুনাফা', netProfit: 'নেট মুনাফা', profitMargin: 'মুনাফার হার', inventoryValue: 'ইনভেন্টরির মূল্য',
    revenueExpenses: 'আয় ও ব্যয়', monthlyPerformance: 'মাসিক পারফরম্যান্স',
    orderStatus: 'অর্ডারের অবস্থা', currentDistribution: 'বর্তমান বণ্টন',
    topProducts: 'শীর্ষ পণ্য', highestRevenue: 'সর্বোচ্চ আয়কারী পণ্য',
    lowStockAlerts: 'কম স্টক সতর্কতা', itemsNeedingAttention: 'মনোযোগ প্রয়োজন এমন পণ্য', restock: 'স্টক পূরণ',
    recentOrders: 'সাম্প্রতিক অর্ডার', latestTransactions: 'সর্বশেষ লেনদেন', viewAll: 'সব দেখুন',
    orderId: 'অর্ডার আইডি', customer: 'গ্রাহক', amount: 'পরিমাণ', status: 'অবস্থা', date: 'তারিখ',
    recentActivity: 'সাম্প্রতিক কার্যকলাপ', quickActions: 'দ্রুত পদক্ষেপ',
    addProduct: 'পণ্য যোগ করুন', inventory: 'ইনভেন্টরি', processOrders: 'অর্ডার প্রক্রিয়া', expenses: 'ব্যয়',
    customersLabel: 'গ্রাহক', reports: 'রিপোর্ট',
    noResults: 'কোন ফলাফল পাওয়া যায়নি', allHealthy: 'সব স্টক স্বাভাবিক আছে', products: 'পণ্য',
    urgent: 'জরুরি', testLights: 'টেস্ট লাইট',
    coreMetrics: 'মূল পরিমাপ', financialDetail: 'আর্থিক বিস্তারিত', analytics: 'বিশ্লেষণ',
    operations: 'কার্যক্রম', activityAndTools: 'কার্যকলাপ ও শর্টকাট',
    searchPlaceholder: 'যা খুঁজছেন লিখুন — আয়, অর্ডার নাম্বার, SKU…',
    searchNoResults: 'কোনো মিল পাওয়া যায়নি',
    catSection: 'বিভাগ', catProduct: 'পণ্য', catOrder: 'অর্ডার', catLowStock: 'কম স্টক', catAction: 'অ্যাকশন',
  }
};

// ============================================================
// useCountUp hook
// ============================================================
function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
}

// ============================================================
// Sparkline
// ============================================================
function Sparkline({ data = [], color }: { data?: number[]; color: string }) {
  const rawId = useId();
  const gradId = `spark-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const width = 88;
  const height = 36;

  const safeData = data.length > 1 ? data : data.length === 1 ? [data[0], data[0]] : [0, 0];
  const maxVal = Math.max(...safeData);
  const minVal = Math.min(...safeData);
  const range = maxVal - minVal || 1;

  const points = safeData.map((value, index) => ({
    x: (index / (safeData.length - 1)) * width,
    y: height - ((value - minVal) / range) * (height - 6) - 3,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;
  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} stroke={color} strokeWidth={1.75} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={5} fill={color} opacity={0.22} />
      <circle cx={last.x} cy={last.y} r={2.25} fill={color} />
    </svg>
  );
}

// ============================================================
// KPI Card
// ============================================================
interface KPICardProps {
  title: string; value: number; formattedValue?: string; trend: number;
  icon: React.ElementType; color: ColorKey; sparklineData: number[]; hasUpdate?: boolean; vsLabel: string;
}

function KPICard({ title, value, formattedValue, trend, icon: Icon, color, sparklineData, hasUpdate, vsLabel }: KPICardProps) {
  const animatedValue = useCountUp(value, 800);
  const displayValue = formattedValue || formatCompactNumber(animatedValue);
  const isPositive = trend >= 0;
  const theme = COLOR_THEME[color];

  return (
    <div className={`group relative overflow-hidden rounded-sm border ${theme.cardBorder} ${theme.cardBg} backdrop-blur-sm shadow-sm ${theme.glowHover} transition-all duration-300 hover:-translate-y-1`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.accentBar}`} />
      {hasUpdate && <LivePulse />}
      <div className="p-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white tabular-nums">{displayValue}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                {isPositive ? <FiTrendingUp className="h-3 w-3" /> : <FiTrendingDown className="h-3 w-3" />}
                {Math.abs(trend)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{vsLabel}</span>
            </div>
          </div>
          <div className={`shrink-0 rounded-sm p-3 ${theme.chip} ${theme.chipShadow} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Sparkline data={sparklineData} color={SPARK_HEX[color]} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Search types
// ============================================================
type SearchCategory = 'section' | 'product' | 'order' | 'lowstock' | 'action';
interface SearchEntry {
  id: string; label: string; sublabel?: string; category: SearchCategory;
  keywords: string; sectionId: string; rowId?: string; icon: React.ElementType; color: ColorKey;
}

// ============================================================
// Main Dashboard Component
// ============================================================
export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<EnhancedDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [bdDateTime, setBdDateTime] = useState({ time: '', date: '' });
  const [updatedCards, setUpdatedCards] = useState<Set<string>>(new Set());
  const prevStatsRef = useRef<EnhancedDashboardStats | null>(null);

  // Dashboard-wide instant search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Live Bangladesh clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatterTime = new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Dhaka',
      });
      const formatterDate = new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Dhaka',
      });
      setBdDateTime({ time: formatterTime.format(now), date: formatterDate.format(now) });
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [language]);

  // Fetch stats and compare for updates
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data.success) {
        const newStats = response.data.data;
        if (prevStatsRef.current) {
          const updated = new Set<string>();
          if (prevStatsRef.current.totalRevenue !== newStats.totalRevenue) updated.add('revenue');
          if (prevStatsRef.current.totalOrders !== newStats.totalOrders) updated.add('orders');
          if (prevStatsRef.current.totalCustomers !== newStats.totalCustomers) updated.add('customers');
          if (prevStatsRef.current.grossProfit !== newStats.grossProfit) updated.add('grossProfit');
          if (prevStatsRef.current.netProfit !== newStats.netProfit) updated.add('netProfit');
          if (prevStatsRef.current.profitMargin !== newStats.profitMargin) updated.add('profitMargin');
          if (prevStatsRef.current.stockValue !== newStats.stockValue) updated.add('inventoryValue');
          if (JSON.stringify(prevStatsRef.current.topProducts) !== JSON.stringify(newStats.topProducts)) updated.add('topProducts');
          if (JSON.stringify(prevStatsRef.current.lowStockVariants) !== JSON.stringify(newStats.lowStockVariants)) updated.add('lowStock');
          if (updated.size > 0) {
            setUpdatedCards(updated);
            showToast.success(`${updated.size} section(s) updated!`);
            setTimeout(() => setUpdatedCards(new Set()), 2000);
          }
        }
        prevStatsRef.current = newStats;
        setStats(newStats);
      }
    } catch {
      showToast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const t = translations[language];

  const revenueSpark = stats?.monthlyRevenue?.map(m => m.revenue / 1000) || [45, 52, 48, 60, 75, 82, 95];
  const ordersSpark = [22, 28, 25, 35, 42, 38, 45];
  const customersSpark = [12, 15, 18, 22, 28, 31, 35];
  const conversionSpark = [2.1, 2.3, 2.2, 2.5, 2.4, 2.3, 2.4];

  const revenueData = stats?.monthlyRevenue?.map(m => ({ month: m.month, revenue: m.revenue })) || [];
  const totalRevenuePeriod = revenueData.reduce((sum, m) => sum + (m.revenue || 0), 0);
  const orderStatusData = stats?.orderStatusBreakdown || [];
  const totalOrders = stats?.totalOrders || 0;
  const topProductsMaxRevenue = Math.max(...(stats?.topProducts?.slice(0, 5).map(p => Number(p.total_revenue) || 0) || [1]), 1);
  const hasOutOfStock = (stats?.lowStockVariants || []).some(v => v.stock <= 0);

  const activities = [
    { id: 1, type: 'order', messageEn: 'Order #ORD-1234 completed', messageBn: 'অর্ডার #ORD-1234 সম্পন্ন হয়েছে', timeEn: '2 min ago', timeBn: '২ মিনিট আগে', icon: FiCheckCircle, color: 'emerald' as ColorKey },
    { id: 2, type: 'product', messageEn: 'Product "iPhone 15" updated', messageBn: 'পণ্য "iPhone 15" আপডেট করা হয়েছে', timeEn: '15 min ago', timeBn: '১৫ মিনিট আগে', icon: FiPackage, color: 'blue' as ColorKey },
    { id: 3, type: 'customer', messageEn: 'New customer registered: john@example.com', messageBn: 'নতুন গ্রাহক নিবন্ধিত: john@example.com', timeEn: '1 hour ago', timeBn: '১ ঘন্টা আগে', icon: FiUser, color: 'purple' as ColorKey },
    { id: 4, type: 'inventory', messageEn: 'Stock alert: Wireless Mouse (only 3 left)', messageBn: 'স্টক সতর্কতা: ওয়্যারলেস মাউস (মাত্র ৩টি বাকি)', timeEn: '3 hours ago', timeBn: '৩ ঘন্টা আগে', icon: FiAlertTriangle, color: 'red' as ColorKey },
  ];

  // ---- Search index: static topics + live data, rebuilt when stats/language change ----
  const searchEntries = useMemo<SearchEntry[]>(() => {
    const entries: SearchEntry[] = [
      { id: 'topic-revenue', label: t.revenue, category: 'section', keywords: 'revenue income sales আয় ইনকাম বিক্রয়', sectionId: 'section-kpis', icon: FiDollarSign, color: 'indigo' },
      { id: 'topic-orders', label: t.orders, category: 'section', keywords: 'orders order অর্ডার', sectionId: 'section-kpis', icon: FiShoppingCart, color: 'emerald' },
      { id: 'topic-customers', label: t.customers, category: 'section', keywords: 'customers customer গ্রাহক ক্রেতা', sectionId: 'section-kpis', icon: FiUsers, color: 'blue' },
      { id: 'topic-conversion', label: t.conversionRate, category: 'section', keywords: 'conversion rate রূপান্তর হার', sectionId: 'section-kpis', icon: FiTarget, color: 'red' },
      { id: 'topic-gross', label: t.grossProfit, category: 'section', keywords: 'gross profit মোট মুনাফা', sectionId: 'section-financial', icon: FiTrendingUp, color: 'emerald' },
      { id: 'topic-net', label: t.netProfit, category: 'section', keywords: 'net profit নেট মুনাফা', sectionId: 'section-financial', icon: FiTarget, color: 'blue' },
      { id: 'topic-margin', label: t.profitMargin, category: 'section', keywords: 'profit margin percent মুনাফার হার', sectionId: 'section-financial', icon: FiPercent, color: 'red' },
      { id: 'topic-inventory', label: t.inventoryValue, category: 'section', keywords: 'inventory value stock মূল্য ইনভেন্টরি', sectionId: 'section-financial', icon: FiBox, color: 'indigo' },
      { id: 'topic-revchart', label: t.revenueExpenses, category: 'section', keywords: 'revenue expenses chart আয় ব্যয় চার্ট', sectionId: 'section-analytics', icon: FiBarChart2, color: 'indigo' },
      { id: 'topic-orderstatus', label: t.orderStatus, category: 'section', keywords: 'order status pie অবস্থা', sectionId: 'section-analytics', icon: FiPieChart, color: 'indigo' },
      { id: 'topic-topproducts', label: t.topProducts, category: 'section', keywords: 'top products best selling শীর্ষ পণ্য', sectionId: 'section-top-products', icon: FiBox, color: 'blue' },
      { id: 'topic-lowstock', label: t.lowStockAlerts, category: 'section', keywords: 'low stock alert কম স্টক সতর্কতা', sectionId: 'section-low-stock', icon: FiAlertTriangle, color: 'red' },
      { id: 'topic-recentorders', label: t.recentOrders, category: 'section', keywords: 'recent orders transactions সাম্প্রতিক অর্ডার', sectionId: 'section-orders', icon: FiShoppingCart, color: 'indigo' },
      { id: 'topic-activity', label: t.recentActivity, category: 'section', keywords: 'activity log কার্যকলাপ', sectionId: 'section-activity', icon: FiActivity, color: 'purple' },
      { id: 'topic-addproduct', label: t.addProduct, category: 'action', keywords: 'add product new পণ্য যোগ', sectionId: 'section-quick-actions', icon: FiPlus, color: 'indigo' },
      { id: 'topic-inventorylink', label: t.inventory, category: 'action', keywords: 'inventory variants ইনভেন্টরি', sectionId: 'section-quick-actions', icon: FiPackage, color: 'emerald' },
      { id: 'topic-processorders', label: t.processOrders, category: 'action', keywords: 'process orders অর্ডার প্রক্রিয়া', sectionId: 'section-quick-actions', icon: FiShoppingCart, color: 'purple' },
      { id: 'topic-expenses', label: t.expenses, category: 'action', keywords: 'expenses ব্যয়', sectionId: 'section-quick-actions', icon: FiDollarSign, color: 'red' },
      { id: 'topic-customerslink', label: t.customersLabel, category: 'action', keywords: 'customers গ্রাহক', sectionId: 'section-quick-actions', icon: FiUsers, color: 'blue' },
      { id: 'topic-reports', label: t.reports, category: 'action', keywords: 'reports রিপোর্ট', sectionId: 'section-quick-actions', icon: FiBarChart2, color: 'rose' },
    ];

    stats?.topProducts?.slice(0, 5).forEach((p, idx) => {
      entries.push({
        id: `product-${idx}`, label: p.sku, sublabel: formatBDT(p.total_revenue), category: 'product',
        keywords: `${p.sku}`, sectionId: 'section-top-products', rowId: `top-product-${idx}`, icon: FiBox, color: 'blue',
      });
    });

    stats?.lowStockVariants?.slice(0, 10).forEach((v) => {
      entries.push({
        id: `lowstock-${v.id}`, label: v.sku, sublabel: `${v.stock} ${t.products}`, category: 'lowstock',
        keywords: `${v.sku}`, sectionId: 'section-low-stock', rowId: `low-stock-${v.id}`, icon: FiAlertTriangle, color: 'red',
      });
    });

    stats?.recentOrders?.slice(0, 10).forEach((o) => {
      entries.push({
        id: `order-${o.id}`, label: o.orderNumber, sublabel: o.customerName, category: 'order',
        keywords: `${o.orderNumber} ${o.customerName} ${o.status}`, sectionId: 'section-orders', rowId: `order-row-${o.id}`, icon: FiShoppingCart, color: 'indigo',
      });
    });

    return entries;
  }, [stats, t]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchEntries.filter(e => `${e.label} ${e.sublabel || ''} ${e.keywords}`.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery, searchEntries]);

  function categoryLabel(cat: SearchCategory) {
    const map: Record<SearchCategory, string> = {
      section: t.catSection, product: t.catProduct, order: t.catOrder, lowstock: t.catLowStock, action: t.catAction,
    };
    return map[cat];
  }

  function goToResult(entry: SearchEntry) {
    setSearchQuery('');
    setSearchOpen(false);
    const targetId = entry.rowId || entry.sectionId;
    document.getElementById(entry.sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHighlightId(targetId);
    setTimeout(() => setHighlightId(null), 2200);
  }

  const isHL = (id: string) => highlightId === id;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-sm border-4 border-gray-200 border-t-indigo-600 dark:border-gray-700" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-red-50/70 via-red-50/60 to-white/70 dark:from-gray-900/80 dark:via-gray-900/70 dark:to-gray-900/60">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-sm bg-gradient-to-br from-indigo-300/25 to-transparent blur-3xl dark:from-indigo-600/10" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-sm bg-gradient-to-br from-red-300/25 to-transparent blur-3xl dark:from-red-600/10" />

      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-white dark:to-gray-300">
              {t.greeting} 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.subGreeting}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-sm border border-gray-200/60 bg-white/50 px-3 py-2 shadow-sm backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/50">
              <FiClock className="h-4 w-4 text-indigo-500" />
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">{bdDateTime.time}</p>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-sm bg-emerald-500" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-sm bg-emerald-500" />
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{bdDateTime.date}</p>
              </div>
            </div>
            <button
              onClick={() => setLanguage(lang => lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-2 rounded-sm border border-gray-200/60 bg-white/50 px-3 py-2 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:bg-gray-800/80"
            >
              <FiGlobe className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{language === 'en' ? 'EN' : 'বাংলা'}</span>
            </button>
            <button
              onClick={() => {
                const fakeUpdate = new Set(['revenue', 'orders', 'customers', 'grossProfit', 'netProfit', 'profitMargin', 'inventoryValue', 'topProducts', 'lowStock']);
                setUpdatedCards(fakeUpdate);
                setTimeout(() => setUpdatedCards(new Set()), 2000);
                showToast.success('🔔 Test lights triggered!');
              }}
              className="rounded-sm border border-dashed border-gray-300/70 px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:border-gray-700/70 dark:text-gray-500 dark:hover:text-gray-300"
              title="Dev utility — simulate a live data update"
            >
              🔔 {t.testLights}
            </button>
            <button className="relative rounded-sm border border-gray-200/60 bg-white/50 p-2.5 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:bg-gray-800/80">
              <FiBell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-sm bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">3</span>
            </button>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="rounded-sm border border-gray-200/60 bg-white/50 p-2.5 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:bg-gray-800/80"
            >
              {isDark ? <FiSun className="h-5 w-5 text-red-400" /> : <FiMoon className="h-5 w-5 text-gray-600" />}
            </button>
            <button className="flex items-center gap-2 rounded-sm border border-gray-200/60 bg-white/50 py-1.5 pl-2 pr-3 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:bg-gray-800/80">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm">
                <FiUser className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Admin</span>
              <FiChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* ===== Dashboard-wide instant search ===== */}
        <div className="relative z-30 mb-8">
          <div className="flex items-center gap-3 rounded-sm border border-gray-200/60 bg-white/70 px-4 py-3 shadow-md backdrop-blur-md transition-shadow focus-within:shadow-lg dark:border-gray-700/50 dark:bg-gray-800/70">
            <FiSearch className="h-4.5 w-4.5 shrink-0 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults[0]) goToResult(searchResults[0]);
                if (e.key === 'Escape') { setSearchQuery(''); setSearchOpen(false); }
              }}
              placeholder={t.searchPlaceholder}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none dark:text-gray-100"
            />
            {searchQuery && (
              <button onMouseDown={() => setSearchQuery('')} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchOpen && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-sm border border-gray-200/60 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-gray-700/60 dark:bg-gray-800/95">
              {searchResults.length > 0 ? (
                searchResults.map(entry => {
                  const ct = COLOR_THEME[entry.color];
                  return (
                    <button
                      key={entry.id}
                      onMouseDown={() => goToResult(entry)}
                      className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60"
                    >
                      <div className={`rounded-lg p-1.5 ${ct.chip} shadow-sm`}>
                        <entry.icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">{entry.label}</p>
                        {entry.sublabel && <p className="truncate text-xs text-gray-500 dark:text-gray-400">{entry.sublabel}</p>}
                      </div>
                      <span className="shrink-0 rounded-sm bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        {categoryLabel(entry.category)}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                  <FiInbox className="h-4 w-4" /> {t.searchNoResults}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== Tier 1 — Core Metrics ===== */}
        <SectionEyebrow icon={FiTrendingUp} label={t.coreMetrics} color="indigo" />
        <div
          id="section-kpis"
          className={`mb-8 grid grid-cols-1 gap-5 rounded-sm sm:grid-cols-2 lg:grid-cols-4 transition-shadow duration-700 ${isHL('section-kpis') ? HIGHLIGHT_RING : ''}`}
        >
          <KPICard title={t.revenue} value={stats?.totalRevenue || 0} formattedValue={formatBDT(stats?.totalRevenue)} trend={12.5} icon={FiDollarSign} color="indigo" sparklineData={revenueSpark} hasUpdate={updatedCards.has('revenue')} vsLabel={t.vsLastMonth} />
          <KPICard title={t.orders} value={stats?.totalOrders || 0} trend={8.2} icon={FiShoppingCart} color="emerald" sparklineData={ordersSpark} hasUpdate={updatedCards.has('orders')} vsLabel={t.vsLastMonth} />
          <KPICard title={t.customers} value={stats?.totalCustomers || 0} trend={5.1} icon={FiUsers} color="blue" sparklineData={customersSpark} hasUpdate={updatedCards.has('customers')} vsLabel={t.vsLastMonth} />
          <KPICard title={t.conversionRate} value={2.4} formattedValue="2.4%" trend={-0.3} icon={FiTarget} color="red" sparklineData={conversionSpark} hasUpdate={false} vsLabel={t.vsLastMonth} />
        </div>

        {/* ===== Tier 2 — Financial Detail ===== */}
        <SectionEyebrow icon={FiPercent} label={t.financialDetail} color="blue" />
        <div
          id="section-financial"
          className={`mb-8 grid grid-cols-1 gap-5 rounded-sm sm:grid-cols-2 lg:grid-cols-4 transition-shadow duration-700 ${isHL('section-financial') ? HIGHLIGHT_RING : ''}`}
        >
          {([
            { label: t.grossProfit, value: formatBDT(stats?.grossProfit), icon: FiTrendingUp, color: 'emerald' as ColorKey, key: 'grossProfit' },
            { label: t.netProfit, value: formatBDT(stats?.netProfit), icon: FiTarget, color: 'blue' as ColorKey, key: 'netProfit' },
            { label: t.profitMargin, value: `${stats?.profitMargin ?? 0}%`, icon: FiPercent, color: 'red' as ColorKey, key: 'profitMargin' },
            { label: t.inventoryValue, value: formatBDT(stats?.stockValue), icon: FiBox, color: 'indigo' as ColorKey, key: 'inventoryValue' },
          ]).map((item) => {
            const ct = COLOR_THEME[item.color];
            return (
              <div key={item.key} className={`group relative overflow-hidden rounded-sm border ${ct.cardBorder} ${ct.cardBg} p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${ct.glowHover}`}>
                {updatedCards.has(item.key) && <LivePulse />}
                <div className="flex items-center gap-3.5">
                  <div className={`rounded-sm p-2.5 ${ct.chip} ${ct.chipShadow} transition-transform duration-300 group-hover:scale-110`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">{item.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== Tier 2 — Analytics (Enhanced) ===== */}
        <SectionEyebrow icon={FiBarChart2} label={t.analytics} color="indigo" />
        <div id="section-analytics" className={`mb-8 grid gap-6 rounded-sm lg:grid-cols-2 transition-shadow duration-700 ${isHL('section-analytics') ? HIGHLIGHT_RING : ''}`}>
          {/* Revenue Area Chart Card — enhanced */}
          <div className="group relative overflow-hidden rounded-sm border border-indigo-100/70 bg-gradient-to-br from-indigo-50/60 via-white/40 to-indigo-50/30 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-gray-900/20 dark:to-indigo-950/20">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-sm bg-indigo-200/20 blur-2xl dark:bg-indigo-600/10" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-sm bg-violet-200/20 blur-2xl dark:bg-violet-600/10" />
            
            <div className="relative z-10">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {t.revenueExpenses}
                    <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-100/80 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      <FiTrendingUp className="h-3 w-3" /> +12.5%
                    </span>
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{t.monthlyPerformance}</p>
                </div>
                <div className="rounded-sm bg-gradient-to-br from-indigo-500 to-violet-500 p-2.5 shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-105">
                  <FiBarChart2 className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {totalRevenuePeriod > 0 && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-sm bg-white/70 px-3 py-1.5 text-sm font-semibold text-indigo-700 shadow-sm backdrop-blur-sm dark:bg-gray-900/50 dark:text-indigo-300">
                  <span className="text-gray-500 dark:text-gray-400">Total:</span>
                  {formatBDT(totalRevenuePeriod)}
                </div>
              )}
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 500 }} 
                      axisLine={false} 
                      tickLine={false} 
                      tickMargin={10}
                    />
                    <YAxis 
                      tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }} 
                      tickFormatter={(v) => `৳${v / 1000}k`} 
                      axisLine={false} 
                      tickLine={false}
                      tickMargin={8}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: isDark ? 'rgba(31,41,55,0.95)' : 'rgba(255,255,255,0.97)', 
                        border: 'none', 
                        borderRadius: 12, 
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', 
                        padding: '10px 14px',
                        backdropFilter: 'blur(4px)'
                      }}
                      labelStyle={{ color: isDark ? '#e5e7eb' : '#374151', fontWeight: 600, marginBottom: 4 }}
                      formatter={(v: any) => [formatBDT(v), 'Revenue']}
                      cursor={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#6366f1" 
                      strokeWidth={3} 
                      fill="url(#revenueGrad)" 
                      activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Order Status Donut Card — enhanced */}
          <div className="group relative overflow-hidden rounded-sm border border-indigo-100/70 bg-gradient-to-br from-indigo-50/60 via-white/40 to-indigo-50/30 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-gray-900/20 dark:to-indigo-950/20">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-sm bg-purple-200/20 blur-2xl dark:bg-purple-600/10" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-sm bg-pink-200/20 blur-2xl dark:bg-pink-600/10" />
            
            <div className="relative z-10">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {t.orderStatus}
                    <span className="inline-flex items-center gap-1 rounded-sm bg-indigo-100/80 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
                      <FiPieChart className="h-3 w-3" /> {totalOrders} total
                    </span>
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{t.currentDistribution}</p>
                </div>
                <div className="rounded-sm bg-gradient-to-br from-indigo-500 to-violet-500 p-2.5 shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-105">
                  <FiPieChart className="h-5 w-5 text-white" />
                </div>
              </div>

              {totalOrders > 0 && orderStatusData.length > 0 ? (
                <div className="flex flex-col items-center gap-6 md:flex-row">
                  <div className="h-64 w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={orderStatusData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={60} 
                          outerRadius={85} 
                          paddingAngle={3} 
                          dataKey="count" 
                          nameKey="status"
                          label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {orderStatusData.map((_, idx) => (
                            <Cell 
                              key={idx} 
                              fill={STATUS_PIE_COLORS[idx % STATUS_PIE_COLORS.length]} 
                              stroke={isDark ? '#1f2937' : '#ffffff'} 
                              strokeWidth={2.5}
                              className="transition-all duration-300 hover:opacity-80 hover:scale-105"
                            />
                          ))}
                        </Pie>
                        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-900 text-2xl font-bold dark:fill-white">
                          {totalOrders}
                        </text>
                        <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-500 text-xs font-medium dark:fill-gray-400">
                          {t.orders}
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2.5 w-full">
                    {orderStatusData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-white/40 px-3 py-2 transition-colors hover:bg-white/70 dark:bg-gray-800/30 dark:hover:bg-gray-700/40">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="h-3.5 w-3.5 rounded-sm shadow-sm" 
                            style={{ backgroundColor: STATUS_PIE_COLORS[idx % STATUS_PIE_COLORS.length] }} 
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {language === 'bn' ? getBanglaStatus(item.status) : item.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                            {item.count}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            ({totalOrders > 0 ? ((item.count / totalOrders) * 100).toFixed(0) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400 dark:text-gray-500">
                  <FiInbox className="h-6 w-6" />
                  <span className="text-sm">{t.noResults}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== Tier 1/2 — Operations (urgent items live here, so this gets real visual weight) ===== */}
        <SectionEyebrow icon={FiPackage} label={t.operations} color="blue" />
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Top Products */}
          <div id="section-top-products" className={`relative rounded-sm border border-blue-100/70 bg-blue-50/40 p-5 shadow-sm backdrop-blur-sm transition-shadow duration-700 dark:border-blue-900/40 dark:bg-blue-950/20 ${isHL('section-top-products') ? HIGHLIGHT_RING : ''}`}>
            {updatedCards.has('topProducts') && <LivePulse />}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.topProducts}</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t.highestRevenue}</p>
              </div>
              <div className="rounded-sm bg-gradient-to-br from-blue-500 to-cyan-500 p-2 shadow-lg shadow-blue-500/30">
                <FiBox className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              {stats?.topProducts?.slice(0, 5).map((p, idx) => {
                const pct = Math.max(6, (Number(p.total_revenue) / topProductsMaxRevenue) * 100);
                return (
                  <div key={idx} id={`top-product-${idx}`} className={`group rounded-sm p-3 transition-colors duration-700 ${isHL(`top-product-${idx}`) ? HIGHLIGHT_ROW : 'bg-white/40 hover:bg-white/70 dark:bg-gray-900/20 dark:hover:bg-gray-800/40'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white shadow-sm">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">{p.sku}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {p.total_quantity}</p>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-gray-900 dark:text-white tabular-nums">{formatBDT(p.total_revenue)}</p>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-gray-200/60 dark:bg-gray-700/60">
                      <div className="h-full rounded-sm bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {!stats?.topProducts?.length && (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400 dark:text-gray-500">
                  <FiInbox className="h-6 w-6" />
                  <span className="text-sm">{t.noResults}</span>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts — escalates to a critical/urgent look automatically when anything is fully out of stock */}
          <div
            id="section-low-stock"
            className={`relative rounded-sm p-5 shadow-sm backdrop-blur-sm transition-all duration-700 ${
              hasOutOfStock
                ? 'border-2 border-rose-300/70 bg-rose-50/50 shadow-md shadow-rose-500/10 dark:border-rose-800/60 dark:bg-rose-950/20'
                : 'border border-red-100/70 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20'
            } ${isHL('section-low-stock') ? HIGHLIGHT_RING : ''}`}
          >
            {updatedCards.has('lowStock') && <LivePulse />}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.lowStockAlerts}</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t.itemsNeedingAttention}</p>
              </div>
              <div className="flex items-center gap-2">
                {hasOutOfStock && (
                  <span className="rounded-sm bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">🔴 {t.urgent}</span>
                )}
                <span className="rounded-sm bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/50 dark:text-red-400">
                  ⚠️ {stats?.lowStockVariants?.length || 0} {t.products}
                </span>
              </div>
            </div>
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {stats?.lowStockVariants?.slice(0, 5).map(v => (
                <div
                  key={v.id}
                  id={`low-stock-${v.id}`}
                  className={`flex items-center justify-between gap-3 rounded-sm border p-3 transition-colors duration-700 ${
                    isHL(`low-stock-${v.id}`)
                      ? `${HIGHLIGHT_ROW} border-violet-300/60`
                      : v.stock <= 0
                        ? 'border-rose-300/60 bg-rose-100/40 dark:border-rose-800/50 dark:bg-rose-900/20'
                        : 'border-red-200/50 bg-red-100/30 dark:border-red-800/50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">{v.sku}</p>
                    <p className="text-xs text-red-700 dark:text-red-400">{formatBDT(v.price)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <div className="h-1.5 w-16 overflow-hidden rounded-sm bg-gray-200/70 dark:bg-gray-700/70">
                      <div className={`h-full rounded-sm bg-gradient-to-r ${v.stock <= 0 ? 'from-rose-600 to-rose-400' : 'from-red-500 to-red-400'}`} style={{ width: `${Math.min(100, (v.stock / 10) * 100)}%` }} />
                    </div>
                    <span className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${v.stock <= 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                      {v.stock}
                    </span>
                    <button className="rounded-lg bg-white/70 px-2.5 py-1 text-xs font-semibold text-indigo-600 shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:bg-gray-900/40 dark:text-indigo-400 dark:hover:bg-gray-900/70">
                      {t.restock}
                    </button>
                  </div>
                </div>
              ))}
              {!stats?.lowStockVariants?.length && (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-emerald-600 dark:text-emerald-400">
                  <FiCheckCircle className="h-6 w-6" />
                  <span className="text-sm">{t.allHealthy}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders Table — pending rows get an red edge so they pop out at a glance */}
        {stats?.recentOrders && stats.recentOrders.length > 0 && (
          <div id="section-orders" className={`relative mb-8 rounded-sm border border-gray-200/60 bg-white/40 p-5 shadow-sm backdrop-blur-sm transition-shadow duration-700 dark:border-gray-700/50 dark:bg-gray-800/30 ${isHL('section-orders') ? HIGHLIGHT_RING : ''}`}>
            {updatedCards.has('orders') && <LivePulse />}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.recentOrders}</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t.latestTransactions}</p>
              </div>
              <Link href="/dashboard/orders" className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:text-indigo-400">
                {t.viewAll} <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200/60 dark:border-gray-700/60">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.orderId}</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.customer}</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.amount}</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.status}</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.date}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.slice(0, 6).map((order, idx) => {
                    const rowId = `order-row-${order.id}`;
                    const isPending = order.status === 'PENDING';
                    return (
                      <tr
                        key={order.id}
                        id={rowId}
                        className={`border-b border-gray-100/60 transition-colors duration-700 hover:bg-white/50 dark:border-gray-800/60 dark:hover:bg-gray-800/40 ${
                          isHL(rowId) ? HIGHLIGHT_ROW : isPending ? 'border-l-2 border-l-red-400 bg-red-50/40 dark:bg-red-950/10' : idx % 2 === 1 ? 'bg-gray-50/30 dark:bg-gray-900/20' : ''
                        }`}
                      >
                        <td className="whitespace-nowrap px-3 py-3 text-sm font-semibold text-gray-900 dark:text-white">{order.orderNumber}</td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
                              {order.customerName?.charAt(0) || 'U'}
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{order.customerName}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm font-bold text-gray-900 dark:text-white tabular-nums">{formatBDT(order.total)}</td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <span className={`rounded-sm border px-2 py-1 text-xs font-medium ${getStatusColor(order.status, isDark)}`}>
                            {language === 'bn' ? getBanglaStatus(order.status) : order.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <FiCalendar className="h-3.5 w-3.5" />
                            {new Date(order.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== Tier 3 — Activity & Shortcuts (reference info: deliberately the quietest, most neutral cards on the page) ===== */}
        <SectionEyebrow icon={FiActivity} label={t.activityAndTools} color="neutral" />
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Activity Feed */}
          <div id="section-activity" className={`rounded-sm border border-gray-200/50 bg-white/30 p-5 shadow-sm backdrop-blur-sm transition-shadow duration-700 dark:border-gray-700/40 dark:bg-gray-900/20 ${isHL('section-activity') ? HIGHLIGHT_RING : ''}`}>
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 p-1.5 shadow-md shadow-purple-500/30">
                <FiActivity className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.recentActivity}</h2>
            </div>
            <div className="space-y-4">
              {activities.map((act, idx) => {
                const ct = COLOR_THEME[act.color];
                return (
                  <div key={act.id} className="relative flex items-start gap-3 pb-1">
                    {idx < activities.length - 1 && (
                      <span className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-gradient-to-b from-gray-300/70 to-transparent dark:from-gray-700/70" />
                    )}
                    <div className={`shrink-0 rounded-lg p-1.5 ${ct.chip} shadow-sm`}>
                      <act.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{language === 'bn' ? act.messageBn : act.messageEn}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{language === 'bn' ? act.timeBn : act.timeEn}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div id="section-quick-actions" className={`rounded-sm border border-gray-200/50 bg-white/30 p-5 shadow-sm backdrop-blur-sm transition-shadow duration-700 dark:border-gray-700/40 dark:bg-gray-900/20 ${isHL('section-quick-actions') ? HIGHLIGHT_RING : ''}`}>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t.quickActions}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {([
                { href: '/dashboard/product', label: t.addProduct, icon: FiPlus, color: 'indigo' as ColorKey },
                { href: '/dashboard/variants', label: t.inventory, icon: FiPackage, color: 'emerald' as ColorKey },
                { href: '/dashboard/orders', label: t.processOrders, icon: FiShoppingCart, color: 'purple' as ColorKey },
                { href: '/dashboard/expenses', label: t.expenses, icon: FiDollarSign, color: 'red' as ColorKey },
                { href: '/dashboard/customers', label: t.customersLabel, icon: FiUsers, color: 'blue' as ColorKey },
                { href: '/dashboard/reports', label: t.reports, icon: FiBarChart2, color: 'rose' as ColorKey },
              ]).map(action => {
                const ct = COLOR_THEME[action.color];
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`group relative flex flex-col items-center gap-2 overflow-hidden rounded-sm bg-white/30 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 dark:bg-gray-900/30 dark:hover:bg-gray-800/60 ${ct.glowHover}`}
                  >
                    <FiArrowRight className="absolute right-2 top-2 h-3.5 w-3.5 -translate-x-1 text-gray-400 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    <div className={`rounded-lg p-2.5 ${ct.chip} ${ct.chipShadow} transition-transform duration-300 group-hover:scale-110`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}