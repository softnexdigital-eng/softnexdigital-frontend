'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FiCheck, FiX, FiRefreshCw, FiSearch } from 'react-icons/fi';

interface PendingTenant {
  id: string;
  name: string;
  email: string;
  transactionId: string | null;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentAmount: number | null;
  paymentSubmittedAt: string | null;
  status: string;
  users: { id: string; email: string }[];
}

export default function AdminPaymentsPage() {
  const [tenants, setTenants] = useState<PendingTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('PENDING');
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      if (filter === 'ALL') {
        const allTenants = await api.get('/payment/admin/pending');
        if (allTenants.data.success) {
          setTenants(allTenants.data.data);
        }
      } else {
        const response = await api.get('/payment/admin/pending');
        if (response.data.success) {
          setTenants(response.data.data);
        } else {
          showToast.error(response.data.message || 'Failed to load payments');
        }
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!authLoading && user && user.role !== 'SUPER_ADMIN') {
      showToast.error('Access denied. Super Admin only.');
      router.push('/dashboard');
      return;
    }
    if (!authLoading && user && user.role === 'SUPER_ADMIN') {
      fetchPayments();
    }
  }, [authLoading, isAuthenticated, user, router, fetchPayments]);

  const handleApprove = async (tenantId: string) => {
    if (!confirm('Are you sure you want to approve this payment? This will activate the store.')) return;
    
    setActionLoading(tenantId);
    try {
      const response = await api.patch(`/payment/admin/approve/${tenantId}`);
      if (response.data.success) {
        showToast.success(response.data.message);
        fetchPayments();
      } else {
        showToast.error(response.data.message || 'Failed to approve');
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to approve payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (tenantId: string) => {
    if (!confirm('Are you sure you want to reject this payment? The user will need to resubmit.')) return;
    
    setActionLoading(tenantId);
    try {
      const response = await api.patch(`/payment/admin/reject/${tenantId}`);
      if (response.data.success) {
        showToast.success(response.data.message);
        fetchPayments();
      } else {
        showToast.error(response.data.message || 'Failed to reject');
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to reject payment');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Auth check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Approvals</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and manage pending payment submissions
          </p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 font-medium">Pending Approvals</p>
          <p className="text-2xl font-bold text-red-900">
            {tenants.filter(t => t.paymentStatus === 'PENDING').length}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 font-medium">Approved (Today)</p>
          <p className="text-2xl font-bold text-red-900">—</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Total Revenue Expected</p>
          <p className="text-2xl font-bold text-purple-900">
            {tenants.filter(t => t.paymentStatus === 'PENDING').length * 999} BDT
          </p>
        </div>
      </div>

      {/* Pending Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">
            Pending Payments ({tenants.filter(t => t.paymentStatus === 'PENDING').length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-sm h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading payments...</p>
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No pending payments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="px-4 py-3">User Email</th>
                  <th className="px-4 py-3">Store Name</th>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Submitted At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {tenant.users[0]?.email || tenant.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {tenant.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {tenant.transactionId || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {tenant.paymentAmount ? `${tenant.paymentAmount} BDT` : '999 BDT'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(tenant.paymentSubmittedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-sm ${
                        tenant.paymentStatus === 'PENDING'
                          ? 'bg-red-100 text-red-800'
                          : tenant.paymentStatus === 'PAID'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tenant.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(tenant.id)}
                          disabled={actionLoading === tenant.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(tenant.id)}
                          disabled={actionLoading === tenant.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <FiX className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">📌 Instructions</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Verify the transaction ID in your bKash app before approving</li>
          <li>Once approved, the store will be active immediately</li>
          <li>The user will be able to login and access all features</li>
          <li>If rejected, the user can resubmit with a new transaction ID</li>
        </ul>
      </div>
    </div>
  );
}