'use client';

import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { useBranch } from '@/contexts/BranchContext';

type PurchaseOrder = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string | null;
  expectedAt?: string | null;
  createdAt: string;
  supplier: { id: string; name: string };
  branch: { id: string; name: string; code: string };
  items: { id: string; variantId: string; quantity: number; costPrice: number }[];
};

type PurchaseListResponse = {
  success: boolean;
  data: { orders: PurchaseOrder[]; total: number; page: number; limit: number };
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ORDERED: 'bg-blue-100 text-blue-700',
  PARTIALLY_RECEIVED: 'bg-amber-100 text-amber-700',
  RECEIVED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(value);

const formatDate = (date: string) => new Date(date).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });

const errorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || fallback : fallback;

export default function PurchasesPage() {
  const { selectedBranchId, selectedBranch, loading: branchesLoading } = useBranch();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);

  const refresh = useCallback(async () => {
    if (!selectedBranchId) {
      setOrders([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(statusFilter && { status: statusFilter }),
        ...(supplierFilter && { supplierId: supplierFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const res = await api.get<PurchaseListResponse>(`/purchases?${params.toString()}`);
      if (!res.data.success) throw new Error('Failed to load purchase orders');
      setOrders(res.data.data.orders);
      setTotal(res.data.data.total);
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to load purchase orders'));
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, supplierFilter, startDate, endDate, selectedBranchId]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/suppliers?page=1&limit=100');
        if (res.data.success) {
          const data = res.data.data;
          setSuppliers(data.suppliers || (Array.isArray(data) ? data : []));
        }
      } catch (error: unknown) {
        showToast.error(errorMessage(error, 'Failed to load suppliers'));
      }
    })();
  }, []);

  if (branchesLoading) {
    return <div className="p-6 text-sm text-gray-500">Loading branches…</div>;
  }

  if (!selectedBranchId) {
    return (
      <main className="space-y-4 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Purchase Orders</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Select an active branch from the dashboard branch selector to view and manage its purchase orders.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Purchase Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Manage supplier orders and receiving for {selectedBranch?.name}.</p>
        </div>
        <Link href="/dashboard/purchases/new" className="min-h-12 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800">
          + New Purchase Order
        </Link>
      </header>

      <section className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-h-10 rounded-md border border-gray-300 px-3 text-sm">
            <option value="">All statuses</option>
            {['DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Supplier</label>
          <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="min-h-10 rounded-md border border-gray-300 px-3 text-sm">
            <option value="">All suppliers</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="min-h-10 rounded-md border border-gray-300 px-3 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="min-h-10 rounded-md border border-gray-300 px-3 text-sm" />
        </div>
        <button onClick={() => void refresh()} disabled={loading} className="min-h-10 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          {loading ? 'Loading…' : 'Filter'}
        </button>
      </section>

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500">Loading purchase orders…</div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No purchase orders found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Expected</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-mono font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 py-3">{order.supplier.name}</td>
                    <td className="px-4 py-3">{order.branch.name} ({order.branch.code})</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{order.items.length}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-500">{order.expectedAt ? formatDate(order.expectedAt) : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/purchases/${order.id}`} className="min-h-10 rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50">View</Link>
                        {order.status === 'DRAFT' && <Link href={`/dashboard/purchases/${order.id}/edit`} className="min-h-10 rounded-md bg-blue-700 px-3 text-xs font-semibold text-white hover:bg-blue-800">Edit</Link>}
                        {['ORDERED', 'PARTIALLY_RECEIVED'].includes(order.status) && <Link href={`/dashboard/purchases/${order.id}?receive=1`} className="min-h-10 rounded-md bg-amber-600 px-3 text-xs font-semibold text-white hover:bg-amber-700">Receive</Link>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">Showing {orders.length} of {total} orders</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="min-h-10 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Prev</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={orders.length < limit} className="min-h-10 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}