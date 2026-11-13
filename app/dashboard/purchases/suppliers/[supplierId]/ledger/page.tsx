'use client';

import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { useBranch } from '@/contexts/BranchContext';

type PurchaseOrder = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  receivedAt?: string | null;
};

type Payment = {
  id: string;
  amount: number;
  method: string;
  reference?: string | null;
  paidAt: string;
  purchaseOrderId?: string | null;
  purchaseOrder?: { id: string; orderNumber: string } | null;
};

type Supplier = {
  id: string;
  name: string;
};

type LedgerResponse = {
  success: boolean;
  data: {
    supplier: Supplier;
    purchaseOrders: PurchaseOrder[];
    payments: Payment[];
    summary: {
      totalPurchases: number;
      totalPaid: number;
      totalDue: number;
    };
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(value);

const formatDate = (date: string) => new Date(date).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });

const errorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || fallback : fallback;

export default function SupplierLedgerPage() {
  const router = useRouter();
  const params = useParams();
  const { selectedBranchId, loading: branchesLoading } = useBranch();

  const [ledger, setLedger] = useState<LedgerResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLedger = useCallback(async () => {
    if (!params.supplierId) return;
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const res = await api.get<LedgerResponse>(`/purchases/suppliers/${params.supplierId}/ledger?${searchParams.toString()}`);
      if (!res.data.success) throw new Error('Failed to load supplier ledger');
      setLedger(res.data.data);
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to load supplier ledger'));
    } finally {
      setLoading(false);
    }
  }, [params.supplierId, startDate, endDate]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  if (branchesLoading) {
    return <div className="p-6 text-sm text-gray-500">Loading branches…</div>;
  }

  if (!selectedBranchId) {
    return (
      <main className="space-y-4 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Supplier Ledger</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Select an active branch from the dashboard branch selector to view the supplier ledger.
        </div>
      </main>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading supplier ledger…</div>;
  }

  if (!ledger) {
    return (
      <main className="space-y-4 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Supplier Ledger</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Unable to load supplier ledger.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Supplier Ledger</h1>
          <p className="mt-1 text-sm text-gray-500">Transaction history and balance for {ledger.supplier.name}.</p>
        </div>
        <button onClick={() => router.back()} className="min-h-12 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
      </header>

      <section className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          From
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="min-h-10 rounded-md border border-gray-300 px-3 text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          To
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="min-h-10 rounded-md border border-gray-300 px-3 text-sm" />
        </label>
        <button onClick={() => void fetchLedger()} disabled={loading} className="min-h-10 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          {loading ? 'Loading…' : 'Filter'}
        </button>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          ['Total Purchases', formatCurrency(ledger.summary.totalPurchases)],
          ['Total Paid', formatCurrency(ledger.summary.totalPaid)],
          ['Total Due', formatCurrency(ledger.summary.totalDue)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Purchase Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">PO #</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received Date</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ledger.purchaseOrders.map((po) => {
                const paid = ledger.payments
                  .filter((p) => p.purchaseOrderId === po.id)
                  .reduce((sum, p) => sum + p.amount, 0);
                const due = po.status !== 'CANCELLED' ? po.totalAmount - paid : 0;
                return (
                  <tr key={po.id}>
                    <td className="px-4 py-3 font-mono font-medium text-gray-900">{po.orderNumber}</td>
                    <td className="px-4 py-3">{formatCurrency(po.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{po.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{po.receivedAt ? new Date(po.receivedAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">{formatCurrency(paid)}</td>
                    <td className="px-4 py-3 font-semibold text-red-700">{formatCurrency(due)}</td>
                  </tr>
                );
              })}
              {ledger.purchaseOrders.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No purchase orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">PO #</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ledger.payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(payment.paidAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{payment.purchaseOrder?.orderNumber || '—'}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3">{payment.method}</td>
                  <td className="px-4 py-3 text-gray-500">{payment.reference || '—'}</td>
                </tr>
              ))}
              {ledger.payments.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No payments recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}