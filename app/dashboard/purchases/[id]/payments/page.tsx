'use client';

import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { useBranch } from '@/contexts/BranchContext';

type Payment = {
  id: string;
  supplierId: string;
  purchaseOrderId?: string | null;
  amount: number;
  method: string;
  reference?: string | null;
  notes?: string | null;
  paidAt: string;
  createdBy: string;
  supplier: { id: string; name: string };
  purchaseOrder?: { id: string; orderNumber: string } | null;
};

type PaymentListResponse = {
  success: boolean;
  data: { payments: Payment[]; total: number; page: number; limit: number };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(value);

const formatDate = (date: string) => new Date(date).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });

const errorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || fallback : fallback;

export default function PurchasePaymentsPage() {
  const router = useRouter();
  const params = useParams();
  const { selectedBranchId, loading: branchesLoading } = useBranch();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    supplierId: '',
    purchaseOrderId: '',
    amount: '',
    method: 'BANK_TRANSFER',
    reference: '',
    notes: '',
    paidAt: new Date().toISOString().slice(0, 16),
  });
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<{ id: string; orderNumber: string }[]>([]);

  const fetchPayments = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        purchaseOrderId: params.id as string,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const res = await api.get<PaymentListResponse>(`/purchases/payments?${searchParams.toString()}`);
      if (!res.data.success) throw new Error('Failed to load payments');
      setPayments(res.data.data.payments);
      setTotal(res.data.data.total);
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to load payments'));
    } finally {
      setLoading(false);
    }
  }, [page, limit, startDate, endDate, params.id]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await api.get('/suppliers?page=1&limit=100');
      if (res.data.success) setSuppliers(res.data.data.suppliers || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchPOs = useCallback(async () => {
    try {
      const res = await api.get('/purchases?page=1&limit=100&status=ORDERED&status=PARTIALLY_RECEIVED&status=RECEIVED');
      if (res.data.success) setPurchaseOrders(res.data.data.orders?.map((o: any) => ({ id: o.id, orderNumber: o.orderNumber })) || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchSuppliers();
    fetchPOs();
  }, [fetchPayments, fetchSuppliers, fetchPOs]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.supplierId || !form.amount || !form.method) {
      showToast.error('Complete required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        supplierId: form.supplierId,
        purchaseOrderId: form.purchaseOrderId || undefined,
        amount: Number(form.amount),
        method: form.method,
        reference: form.reference || undefined,
        notes: form.notes || undefined,
        paidAt: form.paidAt,
      };
      const res = await api.post('/purchases/payments', payload);
      if (!res.data.success) throw new Error('Failed to record payment');
      showToast.success('Payment recorded');
      setShowModal(false);
      setForm({ supplierId: '', purchaseOrderId: '', amount: '', method: 'BANK_TRANSFER', reference: '', notes: '', paidAt: new Date().toISOString().slice(0, 16) });
      fetchPayments();
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to record payment'));
    } finally {
      setSaving(false);
    }
  };

  if (branchesLoading) {
    return <div className="p-6 text-sm text-gray-500">Loading branches…</div>;
  }

  if (!selectedBranchId) {
    return (
      <main className="space-y-4 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Purchase Payments</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Select an active branch from the dashboard branch selector to view payments.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Purchase Payments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage supplier payments for purchase orders.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="min-h-12 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800">+ Record Payment</button>
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
        <button onClick={() => void fetchPayments()} disabled={loading} className="min-h-10 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          {loading ? 'Loading…' : 'Filter'}
        </button>
      </section>

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500">Loading payments…</div>
      ) : payments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No payments found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">PO #</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(payment.paidAt).toLocaleString()}</td>
                    <td className="px-4 py-3">{payment.supplier.name}</td>
                    <td className="px-4 py-3">{payment.purchaseOrder?.orderNumber || '—'}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3">{payment.method}</td>
                    <td className="px-4 py-3 text-gray-500">{payment.reference || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{payment.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">Showing {payments.length} of {total} payments</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="min-h-10 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Prev</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={payments.length < limit} className="min-h-10 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block space-y-1 text-sm font-medium text-gray-700">
                Supplier
                <select value={form.supplierId} onChange={(e) => setForm((prev) => ({ ...prev, supplierId: e.target.value }))} required className="min-h-12 w-full rounded-md border border-gray-300 px-3">
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label className="block space-y-1 text-sm font-medium text-gray-700">
                Purchase Order (optional)
                <select value={form.purchaseOrderId} onChange={(e) => setForm((prev) => ({ ...prev, purchaseOrderId: e.target.value }))} className="min-h-12 w-full rounded-md border border-gray-300 px-3">
                  <option value="">— Link to PO —</option>
                  {purchaseOrders.map((po) => <option key={po.id} value={po.id}>{po.orderNumber}</option>)}
                </select>
              </label>
              <label className="block space-y-1 text-sm font-medium text-gray-700">
                Amount
                <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} required className="min-h-12 w-full rounded-md border border-gray-300 px-3" />
              </label>
              <label className="block space-y-1 text-sm font-medium text-gray-700">
                Method
                <select value={form.method} onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))} required className="min-h-12 w-full rounded-md border border-gray-300 px-3">
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CARD">Card</option>
                  <option value="MOBILE_BANKING">Mobile Banking</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
              <label className="block space-y-1 text-sm font-medium text-gray-700">
                Reference
                <input type="text" value={form.reference} onChange={(e) => setForm((prev) => ({ ...prev, reference: e.target.value }))} className="min-h-12 w-full rounded-md border border-gray-300 px-3" placeholder="Transaction ID, cheque no., etc." />
              </label>
              <label className="block space-y-1 text-sm font-medium text-gray-700">
                Paid At
                <input type="datetime-local" value={form.paidAt} onChange={(e) => setForm((prev) => ({ ...prev, paidAt: e.target.value }))} required className="min-h-12 w-full rounded-md border border-gray-300 px-3" />
              </label>
              <label className="block space-y-1 text-sm font-medium text-gray-700">
                Notes
                <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={2} className="w-full rounded-md border border-gray-300 p-3" />
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="min-h-12 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="min-h-12 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}