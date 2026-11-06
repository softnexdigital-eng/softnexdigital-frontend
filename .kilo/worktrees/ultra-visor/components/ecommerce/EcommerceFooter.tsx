'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiSearch, FiShoppingCart, FiHeart, FiUser } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';

export default function EcommerceFooter() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const isStorePage = pathname?.startsWith('/products') || pathname?.startsWith('/product/') ||
    pathname?.startsWith('/cart') || pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/account') || pathname?.startsWith('/wishlist') ||
    pathname?.startsWith('/search') || pathname?.startsWith('/page/');

  if (!isStorePage) return null;

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const navItems = [
    { href: '/products', icon: FiHome, label: 'Home' },
    { href: '/search', icon: FiSearch, label: 'Search' },
    { href: '/cart', icon: FiShoppingCart, label: 'Cart', badge: cartCount },
    { href: '/wishlist', icon: FiHeart, label: 'Wishlist' },
    { href: '/account', icon: FiUser, label: 'Account' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <nav className="bg-white border-t border-gray-100 shadow-lg rounded-t-2xl">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-sm transition-colors ${
                  active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-sm flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}