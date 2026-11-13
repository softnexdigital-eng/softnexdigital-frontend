'use client';

import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { useBranch } from '@/contexts/BranchContext';
import { useAuth } from '@/contexts/AuthContext';

type Variant = {
  id: string;
  sku: string;
  costPrice: number;
  product: { id: string; name: string };
};

type PurchaseItem = {
  id?: string;
  variantId: string;
  quantity: number;
  costPrice: number;
  notes?: string | null;
  receivedQty?: number;
  variant?: Variant;
};

type PurchaseOrder = {
  id: string;
  status: string;
  supplierId: string;
  branchId: string;
  notes?: string | null;
  expectedAt?: string | null;
  supplier: { id: string; name: string };
  branch: { id: string; name: string };
  items: PurchaseItem[];
};

type Supplier = { id: string; name: string };

const errorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || fallback : fallback;

export default function EditPurchasePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { selectedBranchId, loading: branchesLoading } = useBranch();
  const { user } = useAuth();

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [notes, setNotes] = useState('');
  const [expectedAt, setExpectedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!selectedBranchId || !id) return;
    setLoading(true);
    try {
      const [orderResponse, supplierResponse] = await Promise.all([
        api.get<{ success: boolean; data: PurchaseOrder }>(`/purchases/${id}`),
        api.get('/suppliers?page=1&limit=100'),
      ]);
      if (!orderResponse.data.success) throw new Error('Purchase order not found');
      const data = orderResponse.data.data;
      if (data.status !== 'DRAFT') {
        showToast.error('Only draft purchase orders can be edited');
        router.replace(`/dashboard/purchases/${id}`);
        return;
      }
      if (data.branchId !== selectedBranchId) {
        showToast.error('Select the purchase order branch to edit it');
        router.replace('/dashboard/purchases');
        return;
      }
      const supplierData = supplierResponse.data.data;
      setSuppliers(supplierData.suppliers || (Array.isArray(supplierData) ? supplierData : []));
      setOrder(data);
      setSupplierId(data.supplierId || data.supplier.id);
      setItems(data.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        costPrice: item.costPrice,
        notes: item.notes || '',
        receivedQty: item.receivedQty || 0,
      })));
      setNotes(data.notes || '');
      setExpectedAt(data.expectedAt ? data.expectedAt.slice(0, 10) : '');
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to load purchase order'));
      router.replace('/dashboard/purchases');
    } finally {
      setLoading(false);
    }
  }, [id, router, selectedBranchId]);

  const fetchVariants = useCallback(async () => {
    if (!supplierId) {
      setVariants([]);
      return;
    }
    try {
      const response = await api.get(`/variants?supplierId=${encodeURIComponent(supplierId)}`);
      if (!response.data.success) throw new Error(response.data.message || 'Failed to load variants');
      setVariants(response.data.data || []);
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to load supplier variants'));
    }
  }, [supplierId]);

  useEffect(() => {
    if (selectedBranchId) void Promise.resolve().then(fetchOrder);
  }, [fetchOrder, selectedBranchId]);

  useEffect(() => {
    void Promise.resolve().then(fetchVariants);
  }, [fetchVariants]);

  const updateItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
    setItems((current) => current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    ));
  };

  const changeSupplier = (nextSupplierId: string) => {
    if (nextSupplierId !== supplierId && items.length > 0 &&
      !window.confirm('Changing the supplier will clear the current draft items. Continue?')) {
      return;
    }
    if (nextSupplierId !== supplierId) setItems([]);
    setSupplierId(nextSupplierId);
  };

  const addItem = () => {
    const firstVariant = variants[0];
    if (!firstVariant) {
      showToast.error('No variants are available for this supplier');
      return;
    }
    setItems((current) => [...current, {
      variantId: firstVariant.id,
      quantity: 1,
      costPrice: firstVariant.costPrice,
      notes: '',
    }]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!order || !supplierId || items.length === 0) {
      showToast.error('Select a supplier and add at least one item');
      return;
    }
    if (items.some((item) =>
      !item.variantId ||
      !Number.isFinite(Number(item.quantity)) ||
      Number(item.quantity) <= 0 ||
      !Number.isFinite(Number(item.costPrice)) ||
      Number(item.costPrice) < 0
    )) {
      showToast.error('Enter valid quantities and cost prices for every item');
      return;
    }

    setSaving(true);
    try {
      const response = await api.patch(`/purchases/${order.id}`, {
        supplierId,
        branchId: selectedBranchId,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: Number(item.quantity),
          costPrice: Number(item.costPrice),
          notes: item.notes || undefined,
        })),
        notes: notes.trim() || undefined,
        expectedAt: expectedAt || null,
      });
      if (!response.data.success) throw new Error('Failed to update purchase order');
      showToast.success('Purchase order updated');
      router.push(`/dashboard/purchases/${order.id}`);
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to update purchase order'));
    } finally {
      setSaving(false);
    }
  };

  if (branchesLoading) {
    return <div className="p-6 text-sm text-gray-500">Loading purchase order…</div>;
  }

  if (!selectedBranchId) {
    return (
      <main className="p-4 sm:p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Purchase Order</h1>
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Select an active branch to edit this purchase order.
        </p>
      </main>
    );
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading purchase order…</div>;
  }

  if (!order || !['SUPER_ADMIN', 'TENANT_OWNER', 'BUSINESS_ADMIN', 'OWNER'].includes(user?.role || '')) {
    return <div className="p-6 text-sm text-red-700">You do not have permission to edit this purchase order.</div>;
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.costPrice) * Number(item.quantity), 0);

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Purchase Order</h1>
        <p className="mt-1 text-sm text-gray-500">{order.id} · {order.branch.name}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 text-sm font-medium text-gray-700">
              Supplier
              <select value={supplierId} onChange={(event) => changeSupplier(event.target.value)} required className="min-h-12 w-full rounded-md border border-gray-300 px-3">
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </select>
            </label>
            <label className="block space-y-1 text-sm font-medium text-gray-700">
              Expected Date
              <input type="date" value={expectedAt} onChange={(event) => setExpectedAt(event.target.value)} className="min-h-12 w-full rounded-md border border-gray-300 px-3" />
            </label>
          </div>
          <label className="block space-y-1 text-sm font-medium text-gray-700">
            Notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="w-full rounded-md border border-gray-300 p-3" />
          </label>
        </section>

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <button type="button" onClick={addItem} disabled={!variants.length} className="min-h-10 rounded-md bg-blue-700 px-3 text-sm font-semibold text-white disabled:opacity-50">+ Add Item</button>
          </div>
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">This draft has no items.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr><th className="px-4 py-3">Product / SKU</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Cost Price</th><th className="px-4 py-3">Line Total</th><th className="px-4 py-3">Notes</th><th className="px-4 py-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => (
                    <tr key={`${item.variantId}-${index}`}>
                      <td className="px-4 py-3">
                        <select value={item.variantId} onChange={(event) => updateItem(index, 'variantId', event.target.value)} required className="min-h-12 w-full rounded-md border border-gray-300 px-3">
                          {variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.product?.name || 'Product'} — {variant.sku}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3"><input type="number" min="0.001" step="0.001" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} required className="min-h-12 w-24 rounded-md border border-gray-300 px-3" /></td>
                      <td className="px-4 py-3"><input type="number" min="0" step="0.01" value={item.costPrice} onChange={(event) => updateItem(index, 'costPrice', event.target.value)} required className="min-h-12 w-28 rounded-md border border-gray-300 px-3" /></td>
                      <td className="px-4 py-3 font-semibold">{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(Number(item.quantity) * Number(item.costPrice))}</td>
                      <td className="px-4 py-3"><input type="text" value={item.notes || ''} onChange={(event) => updateItem(index, 'notes', event.target.value)} className="min-h-12 w-full rounded-md border border-gray-300 px-3" /></td>
                      <td className="px-4 py-3"><button type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="min-h-10 rounded-md border border-red-200 px-3 text-xs font-medium text-red-700">Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="border-t border-gray-200 pt-4 text-right">
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="text-xl font-semibold text-gray-900">{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(subtotal)}</p>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="min-h-12 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700">Cancel</button>
          <button type="submit" disabled={saving || !items.length} className="min-h-12 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </main>
  );
}
