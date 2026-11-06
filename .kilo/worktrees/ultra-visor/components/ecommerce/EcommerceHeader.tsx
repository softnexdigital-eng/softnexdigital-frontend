'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FiHeart, FiShoppingCart, FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiPackage } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import CartDrawer from './CartDrawer';

export default function EcommerceHeader() {
  const { cartCount, wishlist } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const isStorePage = pathname?.startsWith('/products') || pathname?.startsWith('/product/') ||
    pathname?.startsWith('/cart') || pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/account') || pathname?.startsWith('/wishlist') ||
    pathname?.startsWith('/search') || pathname?.startsWith('/page/');

  if (!isStorePage) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/products" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">Shop</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/products"
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith('/products') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Products
              </Link>
              <Link
                href="/account"
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith('/account') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Account
              </Link>
              <Link
                href="/wishlist"
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith('/wishlist') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Wishlist ({wishlist.length})
              </Link>
            </nav>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Search */}
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-48 lg:w-64 px-4 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-9 h-9 rounded-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              )}

              {/* Wishlist Icon (mobile) */}
              <Link
                href="/wishlist"
                className="relative w-9 h-9 rounded-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors md:hidden"
              >
                <FiHeart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-sm flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-9 h-9 rounded-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-sm flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* Account */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/account"
                    className="w-9 h-9 rounded-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <FiUser className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => { logout(); router.push('/'); }}
                    className="w-9 h-9 rounded-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    title="Logout"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden md:inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-sm text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-9 h-9 rounded-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Products
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                My Account
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Wishlist ({wishlist.length})
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-sm text-sm font-semibold hover:bg-blue-700"
                >
                  Login
                </Link>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => { logout(); router.push('/'); setMobileMenuOpen(false); }}
                  className="block w-full text-center bg-gray-100 text-gray-700 py-2.5 rounded-sm text-sm font-semibold hover:bg-gray-200"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}