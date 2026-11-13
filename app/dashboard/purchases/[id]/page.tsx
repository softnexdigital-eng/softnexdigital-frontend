'use client';

import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { useBranch } from '@/contexts/BranchContext';
import { useAuth } from '@/contexts/AuthContext';

type Variant = {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  costPrice: number;
  product: { id: string; name: string };
};

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
  receivedAt?: string | null;
  supplier: { id: string; name: string; contactPerson?: string | null; phone: string; email?: string | null; address?: string | null };
  branch: { id: string; name: string; code: string };
  items: {
    id: string;
    purchaseOrderId: string;
    variantId: string;
    quantity: number;
    receivedQty: number;
    costPrice: number;
    notes?: string | null;
    variant: Variant;
  }[];
  receipts: {
    id: string;
    receivedAt: string;
    receivedBy: string;
    notes?: string | null;
    items: { id: string; purchaseOrderItemId: string; variantId: string; quantity: number; costPrice: number; notes?: string | null; variant: Variant }[];
  }[];
};

type PurchaseDetailResponse = {
  success: boolean;
  data: PurchaseOrder;
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ORDERED: 'bg-blue-100 text-blue-700',
  PARTIALLY_RECEIVED: 'bg-amber-100 text-amber-700',
  RECEIVED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const errorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || fallback : fallback;

export default function PurchaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { selectedBranchId, loading: branchesLoading } = useBranch();
  const { user } = useAuth();

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receivingItems, setReceivingItems] = useState<Record<string, number>>({});
  const [receiveNotes, setReceiveNotes] = useState('');
  const [receiving, setReceiving] = useState(false);

  const fetchOrder = useCallback(async () => {
    const { id } = await params;
    setLoading(true);
    try {
      const res = await api.get<PurchaseDetailResponse>(`/purchases/${id}`);
      if (!res.data.success) throw new Error('Purchase order not found');
      setOrder(res.data.data);
      if (searchParams.get('receive') === '1') {
        const initial: Record<string, number> = {};
        for (const item of res.data.data.items) {
          const remaining = item.quantity - item.receivedQty;
          if (remaining > 0) initial[item.id] = remaining;
        }
        setReceivingItems(initial);
        setShowReceiveModal(true);
      }
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to load purchase order'));
      router.push('/dashboard/purchases');
    } finally {
      setLoading(false);
    }
  }, [params, router, searchParams]);

  useEffect(() => {
    void Promise.resolve().then(fetchOrder);
  }, [fetchOrder]);

  const handleReceive = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!order) return;

    const items = order.items
      .filter((item) => (receivingItems[item.id] || 0) > 0)
      .map((item) => ({
        purchaseOrderItemId: item.id,
        quantity: receivingItems[item.id],
        costPrice: item.costPrice,
        notes: undefined,
      }));

    if (!items.length) {
      showToast.error('Enter at least one quantity to receive');
      return;
    }

    setReceiving(true);
    try {
      const res = await api.post(`/purchases/${order.id}/receive`, { items, notes: receiveNotes });
      if (!res.data.success) throw new Error('Failed to receive');
      showToast.success('Items received');
      setShowReceiveModal(false);
      setReceivingItems({});
      setReceiveNotes('');
      await fetchOrder();
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to receive items'));
    } finally {
      setReceiving(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !window.confirm('Cancel this purchase order?')) return;
    try {
      await api.post(`/purchases/${order.id}/cancel`);
      showToast.success('Purchase order cancelled');
      fetchOrder();
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to cancel'));
    }
  };

  const handleSubmit = async () => {
    if (!order || order.status !== 'DRAFT') return;
    try {
      await api.post(`/purchases/${order.id}/submit`);
      showToast.success('Purchase order submitted');
      fetchOrder();
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to submit'));
    }
  };

  const openReceiveModal = useCallback(() => {
    if (!order) return;
    const initial: Record<string, number> = {};
    for (const item of order.items) {
      const remaining = item.quantity - item.receivedQty;
      if (remaining > 0) initial[item.id] = remaining;
    }
    setReceivingItems(initial);
    setShowReceiveModal(true);
  }, [order]);

  if (branchesLoading) {
    return <div className="p-6 text-sm text-gray-500">Loading branches…</div>;
  }

  if (!selectedBranchId) {
    return (
      <main className="space-y-4 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Purchase Order</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Select an active branch from the dashboard branch selector to view this purchase order.
        </div>
      </main>
    );
  }

  if (loading || !order) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading purchase order…</div>;
  }

  const isAdmin = ['SUPER_ADMIN', 'TENANT_OWNER', 'BUSINESS_ADMIN', 'OWNER'].includes(user?.role || '');

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-gray-500">Supplier: {order.supplier.name} • Branch: {order.branch.name} ({order.branch.code})</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/purchases" className="min-h-12 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">Back</Link>
          {isAdmin && order.status === 'DRAFT' && (
            <Link href={`/dashboard/purchases/${order.id}/edit`} className="min-h-12 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800">Edit</Link>
          )}
          {isAdmin && order.status === 'DRAFT' && <button onClick={handleSubmit} className="min-h-12 rounded-md bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700">Submit</button>}
          {isAdmin && ['ORDERED', 'PARTIALLY_RECEIVED'].includes(order.status) && <button onClick={openReceiveModal} className="min-h-12 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700">Receive</button>}
          {isAdmin && ['DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(order.status) && <button onClick={handleCancel} className="min-h-12 rounded-md border border-red-300 px-4 text-sm font-medium text-red-700 hover:bg-red-50">Cancel</button>}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">{order.supplier.name}</span>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
                  {order.receivedAt && <p>Fully Received: {new Date(order.receivedAt).toLocaleString()}</p>}
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Supplier</p>
                  <p className="font-medium text-gray-900">{order.supplier.name}</p>
                  {order.supplier.contactPerson && <p className="text-sm text-gray-500">{order.supplier.contactPerson}</p>}
                  <p className="text-sm text-gray-500">{order.supplier.phone}</p>
                  {order.supplier.email && <p className="text-sm text-gray-500">{order.supplier.email}</p>}
                  {order.supplier.address && <p className="text-sm text-gray-500">{order.supplier.address}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Branch</p>
                  <p className="font-medium text-gray-900">{order.branch.name} ({order.branch.code})</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expected Date</p>
                  <p className="font-medium text-gray-900">{order.expectedAt ? new Date(order.expectedAt).toLocaleDateString() : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Received Date</p>
                  <p className="font-medium text-gray-900">{order.receivedAt ? new Date(order.receivedAt).toLocaleDateString() : '—'}</p>
                </div>
              </div>
              {order.notes && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Product / SKU</th>
                    <th className="px-4 py-3">Ordered</th>
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3">Remaining</th>
                    <th className="px-4 py-3">Cost Price</th>
                    <th className="px-4 py-3">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.variant.product.name}</p>
                        <p className="text-xs text-gray-500">{item.variant.sku}</p>
                      </td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{item.receivedQty}</td>
                      <td className="px-4 py-3">{item.quantity - item.receivedQty}</td>
                      <td className="px-4 py-3">{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(item.costPrice)}</td>
                      <td className="px-4 py-3 font-semibold">{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(item.costPrice * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {order.receipts.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900">Receipts</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {order.receipts.map((receipt) => (
                  <div key={receipt.id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="font-mono font-medium text-gray-900">{receipt.id.slice(0, 12)}…</p>
                        <p className="text-sm text-gray-500">Received {new Date(receipt.receivedAt).toLocaleString()} by {receipt.receivedBy}</p>
                      </div>
                      {receipt.notes && <span className="text-sm text-gray-500">{receipt.notes}</span>}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                          <tr><th className="px-4 py-3">Product / SKU</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Cost Price</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {receipt.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3"><p className="font-medium text-gray-900">{item.variant.product.name}</p><p className="text-xs text-gray-500">{item.variant.sku}</p></td>
                              <td className="px-4 py-3">{item.quantity}</td>
                              <td className="px-4 py-3">{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(item.costPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6 h-fit sticky top-24">
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Totals</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Tax</span><span className="font-semibold">{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(order.taxAmount)}</span></div>
              <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2"><span>Total</span><span>{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(order.totalAmount)}</span></div>
            </div>
          </section>

          {order.items.some((i) => i.quantity - i.receivedQty > 0) && (
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <button onClick={openReceiveModal} className="w-full min-h-12 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700">Receive Items</button>
            </section>
          )}
        </div>
      </div>

      {showReceiveModal && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Receive Items</h3>
              <button onClick={() => { setShowReceiveModal(false); setReceivingItems({}); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleReceive} className="space-y-4">
              <div className="max-h-64 overflow-y-auto">
                {order.items.filter((item) => item.quantity - item.receivedQty > 0).map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{item.variant.product?.name || 'Unknown Product'}</p>
                      <p className="text-xs text-gray-500">{item.variant.sku} • Ordered: {item.quantity} • Received: {item.receivedQty} • Remaining: {item.quantity - item.receivedQty}</p>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      Qty to Receive
                      <input type="number" min="0" max={item.quantity - item.receivedQty} step="0.001" value={receivingItems[item.id] || 0} onChange={(e) => setReceivingItems((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))} className="min-h-10 w-24 rounded-md border border-gray-300 px-3" />
                    </label>
                  </div>
                ))}
              </div>
              <label className="block space-y-1 text-sm font-medium text-gray-700">
                Notes
                <textarea value={receiveNotes} onChange={(e) => setReceiveNotes(e.target.value)} rows={2} className="w-full rounded-md border border-gray-300 p-3" />
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowReceiveModal(false); setReceivingItems({}); setReceiveNotes(''); }} className="min-h-12 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={receiving} className="min-h-12 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                  {receiving ? 'Receiving…' : 'Confirm Receive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}