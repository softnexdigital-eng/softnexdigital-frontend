'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { Order } from '@/types';
import { FiEye, FiTrash2, FiSearch, FiFilter, FiShoppingCart } from 'react-icons/fi';

function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PENDING: 'bg-red-100 text-red-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    PACKED: 'bg-indigo-100 text-indigo-800',
    SHIPPED: 'bg-cyan-100 text-cyan-800',
    OUT_FOR_DELIVERY: 'bg-teal-100 text-teal-800',
    DELIVEred: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-red-100 text-red-800',
    RETURNED: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getBanglaStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'বিচারাধীন',
    CONFIRMED: 'নিশ্চিত',
    PROCESSING: 'প্রক্রিয়াধীন',
    PACKED: 'প্যাকেটকৃত',
    SHIPPED: 'পাঠানো হয়েছে',
    OUT_FOR_DELIVERY: 'ডেলিভারির পথে',
    DELIVEred: 'ডেলিভারি সম্পন্ন',
    CANCELLED: 'বাতিল',
    RETURNED: 'ফেরত',
  };
  return map[status] || status;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await api.get('/orders', { params });
      if (response.data.success) {
        const orderList = response.data.data?.orders || response.data.data || [];
        setOrders(Array.isArray(orderList) ? orderList : []);
      }
    } catch (error) {
      showToast.error('অর্ডার লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`আপনি কি "${orderNumber}" অর্ডারটি ডিলিট করতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।`)) {
      return;
    }
    try {
      const res = await api.delete(`/orders/${orderId}`);
      if (res.data.success) {
        showToast.success('অর্ডার সফলভাবে ডিলিট করা হয়েছে');
        fetchOrders();
      }
    } catch {
      showToast.error('অর্ডার ডিলিট করতে সমস্যা হয়েছে');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-sm h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">অর্ডার সমূহ</h1>
          <p className="text-gray-500 mt-1 text-sm">সকল অর্ডার দেখুন এবং ব্যবস্থাপনা করুন</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-52 pl-9 pr-4 py-2.5 border border-gray-200 rounded-sm bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
          >
            <option value="">সকল অর্ডার</option>
            <option value="PENDING">বিচারাধীন</option>
            <option value="CONFIRMED">নিশ্চিত</option>
            <option value="PROCESSING">প্রক্রিয়াধীন</option>
            <option value="SHIPPED">পাঠানো হয়েছে</option>
            <option value="DELIVEred">ডেলিভারি সম্পন্ন</option>
            <option value="CANCELLED">বাতিল</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-12 text-center">
          <FiShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">কোনো অর্ডার পাওয়া যায়নি</p>
          <p className="text-gray-400 text-sm mt-1">নতুন অর্ডার আসলে এখানে দেখা যাবে</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">অর্ডার #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ক্রেতা</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">মোট</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">তারিখ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-emerald-600">{formatBDT(order.total)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-sm ${getStatusColor(order.status)}`}>
                        {getBanglaStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('bn-BD', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                          বিস্তারিত
                        </Link>
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                          ডিলিট
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              মোট অর্ডার: <span className="font-semibold text-gray-900">{orders.length}টি</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}