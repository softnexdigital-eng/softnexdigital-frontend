'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { FiUsers, FiEye, FiTrash2 } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

interface Customer {
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
}

function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CustomersPage() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [repeatCustomers, setRepeatCustomers] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.data.customers || []);
        setTotal(res.data.data.total || 0);
        setRepeatCustomers(res.data.data.repeatCustomers || 0);
      }
    } catch {
      showToast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`${t('common.confirm')}?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      showToast.success(t('common.delete') + ' ✓');
      fetchCustomers();
    } catch {
      showToast.error(t('common.error'));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent"></div></div>;
  }

  return (
    <div className="max-w-8xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('customers.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('customers.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">{t('customers.title')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">{t('customers.orders')} ({t('common.repeat')})</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{repeatCustomers}</p>
        </div>
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">{t('common.repeat')} {t('common.rate')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total > 0 ? Math.round((repeatCustomers / total) * 100) : 0}%</p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-12 text-center">
          <FiUsers className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{t('customers.noCustomers')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('customers.name')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('customers.phone')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('customers.orders')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('customers.totalSpent')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('common.repeat')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('customers.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customer.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customer.totalOrders}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatBDT(customer.totalSpent)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {customer.totalOrders > 1 ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-sm bg-red-100 text-red-800">{t('common.yes')} ({customer.totalOrders}x)</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-sm bg-gray-100 text-gray-600">{t('common.no')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/customers/${customer.id}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                          <FiEye className="w-3 h-3" /> {t('common.view')}
                        </Link>
                        <button onClick={() => handleDelete(customer.id, customer.name)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                          <FiTrash2 className="w-3 h-3" /> {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}