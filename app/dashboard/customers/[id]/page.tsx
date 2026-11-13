'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';

interface CustomerDetail {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
  createdAt: string;
  orders: any[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = useCallback(async () => {
    try {
      const res = await api.get(`/customers/${params.id}`);
      if (res.data.success) {
        setCustomer(res.data.data);
      }
    } catch {
      showToast.error('Failed to load customer');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchCustomer(); }, [fetchCustomer]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-red-100 text-red-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      DELIVEred: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!customer) {
    return <div className="text-center py-12 text-gray-600">Customer not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/customers" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
          <FiArrowLeft className="mr-2" /> Back to Customers
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">{customer.customerId}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">৳{customer.totalSpent.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Total Spent</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Info</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{customer.phone}</p>
            </div>
            {customer.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{customer.email}</p>
              </div>
            )}
            {customer.address && (
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{customer.address}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">{customer.totalOrders}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-red-600">{customer.totalOrders > 1 ? 'Yes' : 'No'}</p>
              <p className="text-sm text-gray-600">Repeat Customer</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm font-bold text-purple-600">{new Date(customer.firstOrderAt).toLocaleDateString()}</p>
              <p className="text-xs text-gray-600">First Order</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-sm font-bold text-red-600">{new Date(customer.lastOrderAt).toLocaleDateString()}</p>
              <p className="text-xs text-gray-600">Last Order</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiShoppingCart className="mr-2" /> Order History ({customer.orders.length})
        </h2>
        {customer.orders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customer.orders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.items?.length || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">৳{order.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-sm ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:underline text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}