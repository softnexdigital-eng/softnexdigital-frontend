'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { useBranch } from '@/contexts/BranchContext';
import { useAuth } from '@/contexts/AuthContext';

type InventoryVariant = {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  costPrice?: number;
  product: { id: string; name: string };
};

type InventoryBalance = {
  id: string;
  variantId: string;
  quantity: number;
  minStock: number;
  reorderLevel: number;
  variant: InventoryVariant;
  lowStock?: boolean;
  stockValue?: number;
};

type InventoryMovement = {
  id: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  note?: string | null;
  createdAt: string;
  variant: InventoryVariant;
};

type InventoryAdjustment = {
  id: string;
  status: string;
  reason: string;
  previousStock: number;
  countedStock: number;
  delta: number;
  note?: string | null;
  createdAt: string;
  variant: InventoryVariant;
};

type MovementListResponse = {
  success: boolean;
  data: { movements: InventoryMovement[]; total: number; page: number; limit: number };
};

type AdjustmentListResponse = {
  success: boolean;
  data: { adjustments: InventoryAdjustment[]; total: number; page: number; limit: number };
};

type ReportResponse = {
  success: boolean;
  data: {
    branch: { id: string; name: string; code: string };
    rows: InventoryBalance[];
    totals: { variants: number; quantity: number; stockValue: number; lowStockCount: number };
  };
};

type BusinessSettingsResponse = {
  success: boolean;
  data: { allowNegativeStock: boolean };
};

type AdjustmentType = 'ADJUSTMENT' | 'STOCK_COUNT' | 'DAMAGE' | 'EXPIRED' | 'LOST';

const errorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || fallback : fallback;

const formatQuantity = (value: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(value);

export default function InventoryPage() {
  const { branches, selectedBranchId, selectedBranch, loading: branchesLoading } = useBranch();
  const { user } = useAuth();
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [totals, setTotals] = useState<ReportResponse['data']['totals'] | null>(null);
  const [activeTab, setActiveTab] = useState<'balances' | 'movements' | 'adjustments'>('balances');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [movementType, setMovementType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [thresholdDrafts, setThresholdDrafts] = useState<Record<string, { minStock: string; reorderLevel: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [variantId, setVariantId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('ADJUSTMENT');
  const [quantity, setQuantity] = useState('');
  const [countedStock, setCountedStock] = useState('');
  const [note, setNote] = useState('');

  const selectedBranchIsAvailable = useMemo(
    () => branches.some((branch) => branch.id === selectedBranchId && branch.isActive),
    [branches, selectedBranchId],
  );

  const refresh = useCallback(async () => {
    if (!selectedBranchId || !selectedBranchIsAvailable) {
      setBalances([]);
      setMovements([]);
      setTotals(null);
      return;
    }
    setLoading(true);
    try {
      const filters = new URLSearchParams({ page: '1', limit: '100' });
      if (movementType) filters.set('type', movementType);
      if (startDate) filters.set('startDate', startDate);
      if (endDate) filters.set('endDate', endDate);
      const [reportResponse, movementsResponse, settingsResponse] = await Promise.all([
        api.get<ReportResponse>(`/reports/inventory?${filters.toString()}`),
        api.get<MovementListResponse>(`/inventory/movements?${filters.toString()}`),
        api.get<BusinessSettingsResponse>('/business-settings'),
      ]);
      const adjustmentsResponse = await api.get<AdjustmentListResponse>('/inventory/adjustments?page=1&limit=100');
      if (!reportResponse.data.success || !movementsResponse.data.success || !adjustmentsResponse.data.success || !settingsResponse.data.success) {
        throw new Error('The inventory service returned an unsuccessful response');
      }
      setBalances(reportResponse.data.data.rows);
      setTotals(reportResponse.data.data.totals);
      setMovements(movementsResponse.data.data.movements);
      setAdjustments(adjustmentsResponse.data.data.adjustments);
      setAllowNegativeStock(settingsResponse.data.data.allowNegativeStock);
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to load branch inventory'));
    } finally {
      setLoading(false);
    }
  }, [endDate, movementType, selectedBranchId, selectedBranchIsAvailable, startDate]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  const submitAdjustment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!variantId) {
      showToast.error('Select a variant first');
      return;
    }
    setSaving(true);
    try {
      await api.post('/inventory/adjustments', {
        variantId,
        type: adjustmentType,
        ...(adjustmentType === 'STOCK_COUNT'
          ? { countedStock: Number(countedStock) }
          : { quantity: Number(quantity) }),
        note: note.trim() || undefined,
      }, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      });
      showToast.success('Inventory updated');
      setQuantity('');
      setCountedStock('');
      setNote('');
      await refresh();
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to update inventory'));
    } finally {
      setSaving(false);
    }
  };

  const saveThresholds = async (balance: InventoryBalance) => {
    const draft = thresholdDrafts[balance.variantId] || {
      minStock: String(balance.minStock),
      reorderLevel: String(balance.reorderLevel),
    };
    const minStock = Number(draft.minStock);
    const reorderLevel = Number(draft.reorderLevel);
    if (!Number.isFinite(minStock) || minStock < 0 || !Number.isFinite(reorderLevel) || reorderLevel < 0) {
      showToast.error('Minimum and reorder quantities must be non-negative numbers');
      return;
    }
    try {
      await api.patch(`/inventory/balances/${balance.variantId}/thresholds`, { minStock, reorderLevel });
      showToast.success('Stock thresholds saved');
      setThresholdDrafts((current) => {
        const next = { ...current };
        delete next[balance.variantId];
        return next;
      });
      await refresh();
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to save stock thresholds'));
    }
  };

  const reverseAdjustment = async (adjustment: InventoryAdjustment) => {
    if (!window.confirm(`Reverse ${adjustment.reason.toLowerCase()} for ${adjustment.variant.sku}? This creates a new ledger entry.`)) return;
    try {
      await api.post(`/inventory/adjustments/${adjustment.id}/reverse`, {}, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      });
      showToast.success('Adjustment reversed with a ledger entry');
      await refresh();
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to reverse adjustment'));
    }
  };

  const toggleNegativeStock = async (enabled: boolean) => {
    try {
      await api.put('/business-settings', { allowNegativeStock: enabled });
      setAllowNegativeStock(enabled);
      showToast.success(enabled ? 'Negative stock enabled for this tenant' : 'Negative stock disabled');
    } catch (error: unknown) {
      showToast.error(errorMessage(error, 'Failed to update stock policy'));
    }
  };

  if (branchesLoading) {
    return <div className="p-6 text-sm text-gray-500">Loading branches…</div>;
  }

  if (!selectedBranchId || !selectedBranchIsAvailable) {
    return (
      <main className="space-y-4 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Select an active branch from the dashboard branch selector to view and manage its stock.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">Branch stock and auditable inventory movements for {selectedBranch?.name}.</p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="min-h-12 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {['SUPER_ADMIN', 'TENANT_OWNER', 'BUSINESS_ADMIN', 'OWNER'].includes(user?.role || '') && (
        <label className="flex min-h-12 items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
          <input type="checkbox" checked={allowNegativeStock} onChange={(event) => void toggleNegativeStock(event.target.checked)} className="h-4 w-4 rounded border-gray-300" />
          Allow stock to go below zero for this tenant
        </label>
      )}

      {totals && (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Inventory summary">
          {[
            ['Tracked variants', totals.variants],
            ['Total units', formatQuantity(totals.quantity)],
            ['Inventory value', new Intl.NumberFormat(undefined, { style: 'currency', currency: 'BDT' }).format(totals.stockValue)],
            ['Low stock', totals.lowStockCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="min-w-0 rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
            <div className="flex gap-2" role="tablist" aria-label="Inventory data">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'balances'}
                onClick={() => setActiveTab('balances')}
                className={`min-h-12 rounded-md px-4 text-sm font-medium ${activeTab === 'balances' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Branch balances
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'movements'}
                onClick={() => setActiveTab('movements')}
                className={`min-h-12 rounded-md px-4 text-sm font-medium ${activeTab === 'movements' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Movement ledger
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'adjustments'}
                onClick={() => setActiveTab('adjustments')}
                className={`min-h-12 rounded-md px-4 text-sm font-medium ${activeTab === 'adjustments' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Adjustments
              </button>
            </div>
            {activeTab === 'balances' ? (
              <label className="flex min-h-12 items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(event) => setLowStockOnly(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Low stock only
              </label>
            ) : activeTab === 'movements' ? (
              <div className="flex flex-wrap items-center gap-2">
                <select aria-label="Filter movements by type" value={movementType} onChange={(event) => setMovementType(event.target.value)} className="min-h-12 rounded-md border border-gray-300 px-3 text-sm">
                  <option value="">All movement types</option>
                  {['OPENING_STOCK', 'SALE', 'RETURN', 'PURCHASE', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'DAMAGE', 'EXPIRED', 'LOST', 'STOCK_COUNT', 'WASTE', 'REVERSAL'].map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
                </select>
                <input aria-label="Movement start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="min-h-12 rounded-md border border-gray-300 px-3 text-sm" />
                <input aria-label="Movement end date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="min-h-12 rounded-md border border-gray-300 px-3 text-sm" />
              </div>
            ) : null}
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading inventory…</div>
          ) : activeTab === 'balances' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr><th className="px-4 py-3">Product / SKU</th><th className="px-4 py-3">On hand</th><th className="px-4 py-3">Minimum</th><th className="px-4 py-3">Reorder at</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Thresholds</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {balances.filter((balance) => !lowStockOnly || balance.lowStock).map((balance) => (
                    <tr key={balance.id}>
                      <td className="px-4 py-3"><p className="font-medium text-gray-900">{balance.variant.product.name}</p><p className="text-xs text-gray-500">{balance.variant.sku}</p></td>
                      <td className="px-4 py-3 font-semibold">{formatQuantity(balance.quantity)}</td>
                      <td className="px-4 py-3"><input aria-label={`Minimum stock for ${balance.variant.sku}`} type="number" min="0" step="0.001" value={thresholdDrafts[balance.variantId]?.minStock ?? String(balance.minStock)} onChange={(event) => setThresholdDrafts((current) => ({ ...current, [balance.variantId]: { minStock: event.target.value, reorderLevel: current[balance.variantId]?.reorderLevel ?? String(balance.reorderLevel) } }))} className="min-h-10 w-24 rounded border border-gray-300 px-2" /></td>
                      <td className="px-4 py-3"><input aria-label={`Reorder level for ${balance.variant.sku}`} type="number" min="0" step="0.001" value={thresholdDrafts[balance.variantId]?.reorderLevel ?? String(balance.reorderLevel)} onChange={(event) => setThresholdDrafts((current) => ({ ...current, [balance.variantId]: { minStock: current[balance.variantId]?.minStock ?? String(balance.minStock), reorderLevel: event.target.value } }))} className="min-h-10 w-24 rounded border border-gray-300 px-2" /></td>
                      <td className="px-4 py-3">{balance.lowStock ? <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">Low stock</span> : <span className="text-xs text-emerald-700">In stock</span>}</td>
                      <td className="px-4 py-3"><button type="button" onClick={() => void saveThresholds(balance)} className="min-h-10 rounded border border-gray-300 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50">Save</button></td>
                    </tr>
                  ))}
                  {balances.filter((balance) => !lowStockOnly || balance.lowStock).length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">No inventory balances found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'movements' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Product / SKU</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Change</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3">Note</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="whitespace-nowrap px-4 py-3">{new Date(movement.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3"><p className="font-medium text-gray-900">{movement.variant.product.name}</p><p className="text-xs text-gray-500">{movement.variant.sku}</p></td>
                      <td className="px-4 py-3">{movement.type}</td>
                      <td className={`px-4 py-3 font-medium ${movement.quantity < 0 ? 'text-red-700' : 'text-emerald-700'}`}>{movement.quantity > 0 ? '+' : ''}{formatQuantity(movement.quantity)}</td>
                      <td className="px-4 py-3">{formatQuantity(movement.newStock)}</td>
                      <td className="max-w-48 truncate px-4 py-3">{movement.note || '—'}</td>
                    </tr>
                  ))}
                  {movements.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">No inventory movements recorded yet.</td></tr>}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Product / SKU</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Change</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adjustments.map((adjustment) => (
                    <tr key={adjustment.id}>
                      <td className="whitespace-nowrap px-4 py-3">{new Date(adjustment.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3"><p className="font-medium text-gray-900">{adjustment.variant.product.name}</p><p className="text-xs text-gray-500">{adjustment.variant.sku}</p></td>
                      <td className="px-4 py-3">{adjustment.reason.replaceAll('_', ' ')}</td>
                      <td className={`px-4 py-3 font-medium ${adjustment.delta < 0 ? 'text-red-700' : 'text-emerald-700'}`}>{adjustment.delta > 0 ? '+' : ''}{formatQuantity(adjustment.delta)}</td>
                      <td className="px-4 py-3">{adjustment.status}</td>
                      <td className="px-4 py-3">{adjustment.status === 'COMPLETED' && adjustment.reason !== 'REVERSAL' ? <button type="button" onClick={() => void reverseAdjustment(adjustment)} className="min-h-10 rounded border border-red-200 px-3 text-xs font-medium text-red-700 hover:bg-red-50">Reverse</button> : '—'}</td>
                    </tr>
                  ))}
                  {adjustments.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">No adjustments recorded yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form onSubmit={submitAdjustment} className="h-fit space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Stock operation</h2>
            <p className="mt-1 text-sm text-gray-500">Changes are recorded in the permanent inventory ledger.</p>
          </div>
          <label className="block space-y-1 text-sm font-medium text-gray-700">
            Variant
            <select value={variantId} onChange={(event) => setVariantId(event.target.value)} required className="min-h-12 w-full rounded-md border border-gray-300 px-3">
              <option value="">Select a variant</option>
              {balances.map((balance) => <option key={balance.variantId} value={balance.variantId}>{balance.variant.product.name} — {balance.variant.sku}</option>)}
            </select>
          </label>
          <label className="block space-y-1 text-sm font-medium text-gray-700">
            Operation
            <select value={adjustmentType} onChange={(event) => setAdjustmentType(event.target.value as AdjustmentType)} className="min-h-12 w-full rounded-md border border-gray-300 px-3">
              <option value="ADJUSTMENT">Add stock</option>
              <option value="STOCK_COUNT">Set counted stock</option>
              <option value="DAMAGE">Damaged stock</option>
              <option value="EXPIRED">Expired stock</option>
              <option value="LOST">Lost stock</option>
            </select>
          </label>
          {adjustmentType === 'STOCK_COUNT' ? (
            <label className="block space-y-1 text-sm font-medium text-gray-700">Counted quantity<input type="number" min="0" step="0.001" value={countedStock} onChange={(event) => setCountedStock(event.target.value)} required className="min-h-12 w-full rounded-md border border-gray-300 px-3" /></label>
          ) : (
            <label className="block space-y-1 text-sm font-medium text-gray-700">Quantity<input type="number" min="0.001" step="0.001" value={quantity} onChange={(event) => setQuantity(event.target.value)} required className="min-h-12 w-full rounded-md border border-gray-300 px-3" /></label>
          )}
          <label className="block space-y-1 text-sm font-medium text-gray-700">Note (optional)<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} rows={3} className="w-full rounded-md border border-gray-300 p-3" /></label>
          <button type="submit" disabled={saving || loading || balances.length === 0} className="min-h-12 w-full rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
            {saving ? 'Saving…' : 'Record stock operation'}
          </button>
        </form>
      </section>
    </main>
  );
}
