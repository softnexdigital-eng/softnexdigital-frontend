'use client';

import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
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

type Supplier = {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
};

type CreatePurchaseInput = {
  supplierId: string;
  branchId?: string;
  items: { variantId: string; quantity: number; costPrice: number; notes?: string }[];
  notes?: string;
  expectedAt?: string;
};

const errorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || fallback : fallback;

export default function NewPurchasePage() {
  const router = useRouter();
  const { branches, selectedBranchId, loading: branchesLoading } = useBranch();
  const { user } = useAuth();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [items, setItems] = useState<CreatePurchaseInput['items']>([]);
  const [notes, setNotes] = useState('');
  const [expectedAt, setExpectedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await api.get('/suppliers?page=1&limit=100');
      if (res.data.success) {
        // Handle both paginated {suppliers: [...]} and direct array formats
        const data = res.data.data;
        setSuppliers(data.suppliers || (Array.isArray(data) ? data : []));
      } else {
        console.error('Suppliers API failed:', res.data.message);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch suppliers:', error);
      showToast.error('Failed to load suppliers');
    }
  }, []);

  const fetchVariants = useCallback(async () => {
    if (!selectedSupplierId) return;
    try {
      const res = await api.get(`/variants?supplierId=${selectedSupplierId}`);
      if (res.data.success) {
        const vars: Variant[] = [];
        for (const v of res.data.data || []) {
          if (v.product) {
            vars.push({ ...v, product: { id: v.product.id, name: v.product.name } });
          } else {
            vars.push(v);
          }
        }
        setVariants(vars);
      } else {
        console.error('Failed to fetch variants:', res.data.message);
        showToast.error(res.data.message || 'Failed to fetch variants');
      }
    } catch (error) {
      console.error('Failed to fetch variants:', error);
      showToast.error('Failed to fetch variants');
    }
  }, [selectedSupplierId]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const addItem = () => {
    if (!selectedSupplierId) {
      showToast.error('Select a supplier first');
      return;
    }
    if (!variants.length) {
      showToast.error('No variants found for this supplier');
      return;
    }
    setItems((prev) => [...prev, { variantId: variants[0].id, quantity: 1, costPrice: variants[0].costPrice }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof CreatePurchaseInput['items'][0], value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      showToast.error('Select a supplier');
      return;
    }
    if (!items.length) {
      showToast.error('Add at least one item');
      return;
    }
    for (const item of items) {
      const quantity = Number(item.quantity);
      const costPrice = Number(item.costPrice);
      if (
        !item.variantId ||
        String(item.quantity).trim() === '' ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        String(item.costPrice).trim() === '' ||
        !Number.isFinite(costPrice) ||
        costPrice < 0
      ) {
        showToast.error('Complete all item fields');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: CreatePurchaseInput = {
        supplierId: selectedSupplierId,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: Number(item.quantity),
          costPrice: Number(item.costPrice),
          notes: item.notes,
        })),
        notes: notes.trim() || undefined,
        expectedAt: expectedAt || undefined,
      };
      const res = await api.post('/purchases', payload);
      if (!res.data.success) throw new Error('Failed to create purchase order');
      showToast.success('Purchase order created');
      router.push(`/dashboard/purchases/${res.data.data.id}`);
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to create purchase order'));
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
        <h1 className="text-2xl font-semibold text-gray-900">New Purchase Order</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Select an active branch from the dashboard branch selector to create a purchase order.
        </div>
      </main>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.costPrice) * Number(item.quantity), 0);

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">New Purchase Order</h1>
          <p className="mt-1 text-sm text-gray-500">Create a purchase order for the selected branch.</p>
        </div>
        <button onClick={() => router.back()} className="min-h-12 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Back
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 text-sm font-medium text-gray-700">
              Supplier
              <select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} required className="min-h-12 w-full rounded-md border border-gray-300 px-3">
                <option value="">Select a supplier</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label className="block space-y-1 text-sm font-medium text-gray-700">
              Expected Date
              <input type="date" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} className="min-h-12 w-full rounded-md border border-gray-300 px-3" />
            </label>
          </div>
          <label className="block space-y-1 text-sm font-medium text-gray-700">
            Notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-md border border-gray-300 p-3" />
          </label>
        </section>

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <button type="button" onClick={addItem} className="min-h-10 rounded-md bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800">
              + Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">No items added yet. Select a supplier and click "Add Item".</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Product / SKU</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Cost Price</th>
                    <th className="px-4 py-3">Line Total</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => {
                    const variant = variants.find((v) => v.id === item.variantId);
                    const lineTotal = Number(item.costPrice) * Number(item.quantity);
                    return (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <select value={item.variantId} onChange={(e) => updateItem(index, 'variantId', e.target.value)} required className="min-h-12 w-full rounded-md border border-gray-300 px-3">
                            {variants.map((v) => <option key={v.id} value={v.id}>{v.product.name} — {v.sku}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" min="0.001" step="0.001" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} required className="min-h-12 w-24 rounded-md border border-gray-300 px-3" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" min="0" step="0.01" value={item.costPrice} onChange={(e) => updateItem(index, 'costPrice', e.target.value)} required className="min-h-12 w-28 rounded-md border border-gray-300 px-3" />
                        </td>
                        <td className="px-4 py-3 font-semibold">{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(lineTotal)}</td>
                        <td className="px-4 py-3">
                          <input type="text" value={item.notes || ''} onChange={(e) => updateItem(index, 'notes', e.target.value)} className="min-h-12 w-full rounded-md border border-gray-300 px-3" placeholder="Optional" />
                        </td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => removeItem(index)} className="min-h-10 rounded-md border border-red-200 px-3 text-xs font-medium text-red-700 hover:bg-red-50">Remove</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <div className="text-right">
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="text-xl font-semibold text-gray-900">{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(subtotal)}</p>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="min-h-12 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving || !selectedSupplierId || items.length === 0} className="min-h-12 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Purchase Order'}
          </button>
        </div>
      </form>
    </main>
  );
}