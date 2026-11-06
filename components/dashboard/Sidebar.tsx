'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  FiHome,
  FiPackage,
  FiLayers,
  FiShoppingCart,
  FiLayout,
  FiSettings,
  FiLogOut,
  FiRefreshCw,
  FiTag,
  FiUsers,
  FiBell,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiGlobe,
  FiTruck,
  FiBarChart2,
  FiShield,
  FiStar,
  FiGrid,
  FiHeart,
  FiFolder,
  FiCheck,
  FiUser,
  FiAward,
  FiBox,
  FiCreditCard,
  FiPercent,
  FiImage,
  FiAlertTriangle,
} from 'react-icons/fi';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Type Definitions ───────────────────────────────────────────────────────
interface MenuItem {
  key: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface CatalogGroup {
  key: string;
  icon: React.ElementType;
  labelKey: string;
  children: MenuItem[];
}

// ─── Menus organized by section (BD serial maintained) ─────────────────────
const mainMenuItems: MenuItem[] = [
  { key: 'dashboard', href: '/dashboard', icon: FiHome },
  { key: 'orders', href: '/dashboard/orders', icon: FiShoppingCart },
  { key: 'customers', href: '/dashboard/customers', icon: FiUsers },
];

const catalogGroup: CatalogGroup = {
  key: 'catalog',
  icon: FiGrid,
  labelKey: 'sidebar.catalog',
  children: [
    { key: 'product', href: '/dashboard/product', icon: FiPackage },
    { key: 'variants', href: '/dashboard/variants', icon: FiLayers },
    { key: 'attributes', href: '/dashboard/attributes', icon: FiTag },
    { key: 'categories', href: '/dashboard/categories', icon: FiFolder },
    { key: 'subcategories', href: '/dashboard/categories/subcategories', icon: FiLayers },
    { key: 'brands', href: '/dashboard/brands', icon: FiTag },
    { key: 'banners', href: '/dashboard/banners', icon: FiImage },
  ],
};

const businessMenuItems: MenuItem[] = [
  { key: 'suppliers', href: '/dashboard/suppliers', icon: FiTruck },
  { key: 'couriers', href: '/dashboard/couriers', icon: FiTruck },
  { key: 'shipping', href: '/dashboard/shipping-methods', icon: FiBox },
  { key: 'blocking', href: '/dashboard/blocking', icon: FiShield },
];

const financeMenuItems: MenuItem[] = [
  { key: 'payments', href: '/dashboard/payments', icon: FiCreditCard },
  { key: 'expenses', href: '/dashboard/expenses', icon: FiBarChart2 },
  { key: 'coupons', href: '/dashboard/coupons', icon: FiPercent },
];

const otherMenuItems: MenuItem[] = [
  { key: 'returns', href: '/dashboard/returns', icon: FiRefreshCw },
  { key: 'reviews', href: '/dashboard/reviews', icon: FiStar },
  { key: 'wishlist', href: '/dashboard/wishlist', icon: FiHeart },
  { key: 'incomplete_checkouts', href: '/dashboard/incomplete-checkouts', icon: FiAlertTriangle },
];

const configMenuItems: MenuItem[] = [
  { key: 'landing', href: '/dashboard/landing-page', icon: FiLayout },
  { key: 'users', href: '/dashboard/users', icon: FiUsers },
  { key: 'notifications', href: '/dashboard/notifications', icon: FiBell },
  { key: 'settings', href: '/dashboard/settings', icon: FiSettings },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const isMenuItemActive = (pathname: string, href: string): boolean => {
  if (href === '/dashboard') return pathname === href;
  return pathname === href || pathname?.startsWith(href + '/');
};

const isChildActive = (pathname: string, children: { href: string }[]): boolean => {
  return children.some(child => isMenuItemActive(pathname, child.href));
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ─── Section Config ─────────────────────────────────────────────────────────
interface SectionDef {
  title: string;
  items: MenuItem[];
}

const sections: SectionDef[] = [
  { title: 'MAIN', items: mainMenuItems },
  { title: 'CATALOG', items: catalogGroup.children },
  { title: 'BUSINESS', items: businessMenuItems },
  { title: 'FINANCE', items: financeMenuItems },
  { title: 'OTHER', items: otherMenuItems },
  { title: 'CONFIGURATION', items: configMenuItems },
];

// ─── Component ──────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const { t, toggleLang } = useLanguage();

  // UI states
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['catalog']));
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // Close on escape and outside clicks
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setShowWorkspaceMenu(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) {
        setShowWorkspaceMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    const timer = setTimeout(() => setMobileOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Reset collapsed state on mobile to avoid narrow sidebar when opened
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const toggleExpand = (menuKey: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuKey)) newSet.delete(menuKey);
      else newSet.add(menuKey);
      return newSet;
    });
  };

  const isExpanded = (menuKey: string) => expandedMenus.has(menuKey);
  const isCatalogActive = isChildActive(pathname, catalogGroup.children);
  const catalogExpanded = isExpanded('catalog');

  const userName = user?.email?.split('@')[0] || 'User';
  const userInitials = getInitials(userName);
  const userRole = user?.role || 'Admin';

  // ── Render a single menu link ───────────────────────────────────────────────
  const renderMenuItem = (item: MenuItem, isNested = false) => {
    const Icon = item.icon;
    const active = isMenuItemActive(pathname, item.href);
    const itemId = `menu-${item.key}`;

    return (
      <Link
        key={item.href}
        href={item.href}
        onMouseEnter={() => setHoveredItem(itemId)}
        onMouseLeave={() => setHoveredItem(null)}
        className={`
          group relative flex items-center gap-3 px-3 py-3 md:py-2.5 text-sm md:text-base font-medium
          transition-all duration-150
          active:scale-[0.98]
          border border-transparent
          min-h-[44px] md:min-h-[40px]
          ${collapsed && !isNested ? 'justify-center px-2 py-3' : ''}
          ${isNested ? 'pl-10' : ''}
          ${active
            ? 'text-red-400 bg-white/5 border-red-500/20'
            : 'text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/10'
          }
        `}
        title={collapsed && !isNested ? t(`sidebar.${item.key}`) : undefined}
        onClick={() => setMobileOpen(false)} // close on navigation (mobile)
      >
        {/* Active left accent bar */}
        {active && !collapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-5 bg-red-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]" />
        )}

        {/* Icon with scale effect */}
        <div className={`transition-transform duration-150 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
          <Icon className="w-[18px] md:w-[20px] h-[18px] md:h-[20px] flex-shrink-0" strokeWidth={active ? 2.2 : 1.8} />
        </div>

        {/* Label */}
        {(!collapsed || isNested) && (
          <span className="truncate flex-1 text-[14px] md:text-[15px]">{t(`sidebar.${item.key}`)}</span>
        )}

        {/* Badge */}
        {item.badge && !collapsed && (
          <span className="ml-auto text-[11px] font-semibold bg-red-500/20 text-red-400 px-2 py-0.5 min-w-[22px] text-center">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  // ── Render a full section (dark sidebar style) ─────────────────────────────
  const renderSection = (section: SectionDef, index: number) => {
    if (section.items.length === 0) return null;

    return (
      <div className={index > 0 ? 'border-t border-white/5' : ''}>
        {/* Section header */}
        {!collapsed && (
          <div className="px-3 pt-2.5 pb-1">
            <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">
              {t(`sidebar.${section.title.toLowerCase()}`)}
            </span>
            <div className="h-px bg-gradient-to-r from-gray-700/50 to-transparent mt-1.5" />
          </div>
        )}
        <div className="space-y-0.5 px-1.5">
          {section.items.map(item => renderMenuItem(item, false))}
        </div>
      </div>
    );
  };

  // ── Workspace dropdown item (larger text, border, animation) ───────────────
  const renderWorkspaceItem = (label: string, desc: string, active: boolean) => (
    <button
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150
        active:scale-[0.98]
        min-h-[44px]
        ${active
          ? 'bg-white/50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-white/5 dark:hover:bg-white/5'
        }
        border border-white/10 dark:border-white/5
        hover:border-white/20 dark:hover:border-white/10
      `}
    >
      <div className={`
        w-2 h-2 flex-shrink-0
        ${active ? 'bg-red-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]' : 'bg-gray-300 dark:bg-gray-600'}
      `} />
      <div className="flex-1 min-w-0">
        <p className="text-sm md:text-base font-medium truncate">{label}</p>
        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 truncate">{desc}</p>
      </div>
      {active && <FiCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 flex-shrink-0" />}
    </button>
  );

  // ─── Main render ─────────────────────────────────────────────────────────
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - dark theme matching reference image */}
      <aside
        ref={sidebarRef}
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen
          flex flex-col
          transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          bg-black border-r border-white/10
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'w-20' : 'w-[280px] md:w-64 max-w-[85vw]'}
        `}
        aria-label="Main navigation"
      >
        {/* ── Header: Logo + Workspace + Collapse ── */}
        <div className={`
          flex items-center h-14 px-3 border-b border-white/10
          ${collapsed ? 'justify-center' : 'justify-between'}
          flex-shrink-0
        `}>
          {!collapsed ? (
            <div ref={workspaceRef} className="flex-1 min-w-0">
              <button
                onClick={() => setShowWorkspaceMenu(prev => !prev)}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 transition-all duration-150 group active:scale-[0.98] hover:bg-white/5 min-h-[44px]"
              >
                {/* Logo with red gradient */}
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <FiPackage className="w-[16px] h-[16px] text-white" />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-[13px] font-bold text-white tracking-tight truncate">
                      {t('sidebar.brand')}
                    </h1>
                    <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 leading-none">
                      Pro
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {user?.email || 'Workspace'}
                  </p>
                </div>

                <FiChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-300 transition-all flex-shrink-0" />
              </button>

              {/* Workspace dropdown - no rounded corners */}
              {showWorkspaceMenu && (
                <div className="absolute top-[4.2rem] left-3 right-3 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-2 space-y-0.5">
                  <p className="text-[10px] md:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 pt-1 pb-1.5">
                    Workspaces
                  </p>
                  {renderWorkspaceItem('MultiTenant Pro', 'FahimNuman • Pro Plan', true)}
                  {renderWorkspaceItem('Sandbox Dev', 'Test Environment', false)}
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-1.5 pt-1.5">
                    <button className="w-full text-left px-3 py-2 text-sm md:text-base text-gray-600 dark:text-gray-300 hover:bg-white/5 dark:hover:bg-white/5 transition-all active:scale-[0.98] border border-white/10 dark:border-white/5 hover:border-white/20 dark:hover:border-white/10 min-h-[44px]">
                      + Create Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Collapsed: just logo */
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
              <FiPackage className="w-[18px] h-[18px] text-white" />
            </div>
          )}

          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500 transition-all active:scale-[0.98] border border-white/10 dark:border-white/5 hover:border-white/20 dark:hover:border-white/10 hover:bg-white/5 dark:hover:bg-white/5 min-h-[44px] min-w-[44px]"
              aria-label="Close menu"
            >
              <FiX className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCollapsed(prev => !prev)}
              className="hidden md:flex w-8 h-8 items-center justify-center text-gray-500 transition-all group active:scale-[0.98] border border-white/10 dark:border-white/5 hover:border-white/20 dark:hover:border-white/10 hover:bg-white/5 dark:hover:bg-white/5 min-h-[44px] min-w-[44px]"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <div className="transition-transform duration-200 group-hover:scale-110">
                {collapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
              </div>
            </button>
          </div>
        </div>

        {/* ── Navigation (larger text, borders, animations) ── */}
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent space-y-0">
          {sections.map((section, index) => (
            <div key={`section-${section.title}`}>
              {renderSection(section, index)}
            </div>
          ))}
        </nav>

        {/* ── Footer: User + Language + Logout (larger text, borders, animation) ── */}
        <div className="border-t border-white/10 bg-black/50 flex-shrink-0">
          {/* User area */}
          {!collapsed ? (
            <div ref={userMenuRef} className="relative px-2 pt-2.5 pb-1.5">
              <button
                onClick={() => setShowUserMenu(prev => !prev)}
                className="w-full flex items-center gap-2.5 px-2 py-2 transition-all duration-150 group active:scale-[0.98] hover:bg-white/5 min-h-[44px]"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center text-[11px] md:text-xs font-bold text-white shadow-md flex-shrink-0">
                  {userInitials || <FiUser className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-medium text-white truncate leading-tight">{userName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <FiAward className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] font-medium text-gray-400 truncate leading-tight capitalize">
                      {userRole}
                    </span>
                  </div>
                </div>

                <FiChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-300 transition-all flex-shrink-0" />
              </button>

              {/* User dropdown - no rounded corners */}
              {showUserMenu && (
                <div className="absolute bottom-full left-2.5 right-2.5 mb-1 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-2">
                  <Link
                    href="/dashboard/settings"
                    className="block w-full px-3 py-2 text-sm md:text-base text-gray-700 dark:text-gray-300 hover:bg-white/5 dark:hover:bg-white/5 transition-all active:scale-[0.98] border border-white/10 dark:border-white/5 hover:border-white/20 dark:hover:border-white/10 min-h-[44px]"
                    onClick={() => { setShowUserMenu(false); setMobileOpen(false); }}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block w-full px-3 py-2 text-sm md:text-base text-gray-700 dark:text-gray-300 hover:bg-white/5 dark:hover:bg-white/5 transition-all active:scale-[0.98] border border-white/10 dark:border-white/5 hover:border-white/20 dark:hover:border-white/10 min-h-[44px]"
                    onClick={() => { setShowUserMenu(false); setMobileOpen(false); }}
                  >
                    Account Preferences
                  </Link>
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-1 pt-1">
                    <button
                      onClick={() => { setShowUserMenu(false); handleLogout(); }}
                      className="w-full text-left px-3 py-2 text-sm md:text-base text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all active:scale-[0.98] border border-white/10 dark:border-white/5 hover:border-white/20 dark:hover:border-white/10 min-h-[44px]"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-1.5 pt-2 pb-2 flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center text-[11px] md:text-xs font-bold text-white shadow-md">
                {userInitials || <FiUser className="w-4 h-4" />}
              </div>
            </div>
          )}

          {/* Bottom actions row */}
          <div className="px-2.5 pb-2.5 space-y-0.5">
            <button
              onClick={toggleLang}
              className={`
                w-full flex items-center gap-3 px-3 py-3 md:py-2.5 text-sm md:text-base font-medium
                transition-all duration-200
                active:scale-[0.98]
                min-h-[44px]
                ${collapsed ? 'justify-center px-2 py-3' : ''}
                text-gray-600 dark:text-gray-300 hover:bg-white/5 dark:hover:bg-white/5
                border border-white/10 dark:border-white/5
                hover:border-white/20 dark:hover:border-white/10
              `}
              title={collapsed ? t('lang.toggle') : undefined}
            >
              <FiGlobe className="w-[18px] md:w-[20px] h-[18px] md:h-[20px] flex-shrink-0" />
              {!collapsed && <span>{t('lang.toggle')}</span>}
            </button>

            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-3 py-3 md:py-2.5 text-sm md:text-base font-medium
                transition-all duration-200
                active:scale-[0.98]
                min-h-[44px]
                ${collapsed ? 'justify-center px-2 py-3' : ''}
                text-gray-600 dark:text-gray-300 hover:bg-red-50/50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400
                border border-white/10 dark:border-white/5
                hover:border-white/20 dark:hover:border-white/10
              `}
              title={collapsed ? t('sidebar.logout') : undefined}
            >
              <FiLogOut className="w-[18px] md:w-[20px] h-[18px] md:h-[20px] flex-shrink-0" />
              {!collapsed && <span>{t('sidebar.logout')}</span>}
            </button>
          </div>

          {/* Version badge */}
          {!collapsed && (
            <div className="pb-2 text-center">
              <span className="text-[9px] md:text-[10px] text-gray-300 dark:text-gray-600 font-mono tracking-widest">
                v2.1.0
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile hamburger button - hidden when sidebar is open */}
      <button
        onClick={() => setMobileOpen(true)}
        className={`fixed top-3 left-3 z-30 md:hidden w-10 h-10 bg-black flex items-center justify-center active:scale-[0.95] transition-all duration-200 ${mobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Open menu"
      >
        <FiMenu className="w-5 h-5 text-red-500" />
      </button>
    </>
  );
}