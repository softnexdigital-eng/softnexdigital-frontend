'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiPackage, FiMapPin, FiLogOut, FiChevronRight, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import EcommerceHeader from '@/components/ecommerce/EcommerceHeader';
import EcommerceFooter from '@/components/ecommerce/EcommerceFooter';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  total: number;
  createdAt: string;
  items?: { quantity: number; priceAtTime: number; variant?: { product?: { name: string } } }[];
}

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('orders');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch {}
    finally { setOrdersLoading(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchOrders(); }, [isAuthenticated, fetchOrders]);

  if (authLoading) {
    return (
      <>
        <EcommerceHeader />
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 flex items-center justify-center">
          <div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent" />
        </div>
        <EcommerceFooter />
      </>
    );
  }

  if (!isAuthenticated) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-red-100 text-red-700';
      case 'PROCESSING': return 'bg-blue-100 text-blue-700';
      case 'SHIPPED': return 'bg-purple-100 text-purple-700';
      case 'DELIVEred': return 'bg-red-100 text-red-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const tabs = [
    { id: 'orders', label: 'Orders', icon: FiPackage },
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'addresses', label: 'Addresses', icon: FiMapPin },
  ] as const;

  return (
    <>
      <EcommerceHeader />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white border border-gray-100 rounded-sm p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-sm flex items-center justify-center text-white text-xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{user?.email || 'User'}</h1>
                <p className="text-sm text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-sm transition-colors"
              >
                <FiLogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-gray-100 rounded-sm p-1 mb-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Orders */}
          {activeTab === 'orders' && (
            <div>
              {ordersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-sm p-6 animate-pulse">
                      <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-sm border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-sm flex items-center justify-center mx-auto mb-4">
                    <FiShoppingBag className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders yet</h3>
                  <p className="text-sm text-gray-500 mb-6">Start shopping to see your orders here</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-sm font-semibold hover:bg-blue-700"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-100 rounded-sm p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                        <span className={`px-3 py-1 rounded-sm text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="font-bold text-gray-900">৳{order.total.toFixed(0)}</span>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400">{order.items.length} item(s)</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-100 rounded-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-medium">Email</label>
                  <p className="text-sm font-semibold text-gray-900">{user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium">Role</label>
                  <p className="text-sm font-semibold text-gray-900">{user?.role || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium">Account ID</label>
                  <p className="text-sm font-semibold text-gray-900">{user?.id || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Addresses */}
          {activeTab === 'addresses' && (
            <div className="bg-white border border-gray-100 rounded-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Saved Addresses</h2>
              <p className="text-sm text-gray-500">
                Manage your addresses during checkout. You can add new addresses when placing an order.
              </p>
              <button
                onClick={() => router.push('/checkout')}
                className="mt-4 text-blue-600 font-medium text-sm hover:underline"
              >
                Go to Checkout to add an address
              </button>
            </div>
          )}
        </div>
      </div>
      <EcommerceFooter />
    </>
  );
}