'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { FiEdit2, FiTrash2, FiPlus, FiCopy, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  usedCount: number;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  createdAt: string;
}

type FormData = {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  perUserLimit: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('bn-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await api.get('/coupons');
      if (res.data.success) setCoupons(res.data.data);
    } catch {
      showToast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      await fetchCoupons();
    };
    load();
    return () => { mounted = false; };
  }, [fetchCoupons]);

  const openCreate = () => {
    setEditing(null);
    reset({
      code: '', description: '', discountType: 'PERCENTAGE', discountValue: 0,
      minOrderAmount: '', maxDiscount: '', usageLimit: '', perUserLimit: '',
      startDate: new Date().toISOString().split('T')[0], endDate: '', isActive: true
    });
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    reset({
      code: c.code, description: c.description || '',
      discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount?.toString() || '',
      maxDiscount: c.maxDiscount?.toString() || '',
      usageLimit: c.usageLimit?.toString() || '',
      perUserLimit: c.perUserLimit?.toString() || '',
      startDate: new Date(c.startDate).toISOString().split('T')[0],
      endDate: c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : '',
      isActive: c.isActive
    });
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : null,
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
        perUserLimit: data.perUserLimit ? Number(data.perUserLimit) : null,
        startDate: data.startDate,
        endDate: data.endDate || null,
        isActive: data.isActive,
      };

      if (editing) {
        const res = await api.put(`/coupons/${editing.id}`, payload);
        if (res.data.success) showToast.success('Coupon updated');
      } else {
        const res = await api.post('/coupons', payload);
        if (res.data.success) showToast.success('Coupon created');
      }
      setShowForm(false);
      setEditing(null);
      fetchCoupons();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save coupon';
      showToast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      const res = await api.delete(`/coupons/${coupon.id}`);
      if (res.data.success) {
        showToast.success('Coupon deleted');
        fetchCoupons();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      showToast.error(message);
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const res = await api.patch(`/coupons/${coupon.id}`);
      if (res.data.success) {
        showToast.success(res.data.message || `Coupon ${coupon.isActive ? 'deactivated' : 'activated'}`);
        fetchCoupons();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to toggle status';
      showToast.error(message);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast.success('Code copied!');
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = coupon.endDate ? new Date(coupon.endDate) : null;

    if (!coupon.isActive) return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-sm">Disabled</span>;
    if (end && now > end) return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-sm">Expired</span>;
    if (now < start) return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-sm">Scheduled</span>;
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-sm">Exhausted</span>;
    return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-sm">Active</span>;
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discount coupons</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-sm hover:bg-blue-700 transition-all">
          <FiPlus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                <input {...register('code', { required: 'Code is required' })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm uppercase" />
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <select {...register('discountType')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (৳)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value *</label>
                <input {...register('discountValue', { required: true, min: 0 })} type="number" step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Amount</label>
                <input {...register('minOrderAmount')} type="number" step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount</label>
                <input {...register('maxDiscount')} type="number" step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                <input {...register('usageLimit')} type="number"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Per User Limit</label>
                <input {...register('perUserLimit')} type="number"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input {...register('startDate', { required: true })} type="date"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input {...register('endDate')} type="date"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input {...register('isActive')} type="checkbox" id="isActive"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea {...register('description')} rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-sm text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-sm text-sm font-semibold hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-sm  border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16">
            <FiPlus className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No coupons yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create discount coupons for your customers</p>
            <button onClick={openCreate} className="px-6 py-2.5 bg-blue-600 text-white rounded-sm text-sm font-semibold hover:bg-blue-700">Create Coupon</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex-1">Code</div>
              <div className="w-28 text-center">Discount</div>
              <div className="w-24 text-center">Used</div>
              <div className="w-28 text-center">Status</div>
              <div className="w-20 text-right">Actions</div>
            </div>
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-sm bg-gray-100 px-3 py-1 rounded-lg">{coupon.code}</span>
                  <button onClick={() => copyCode(coupon.code)} className="p-1 text-gray-400 hover:text-blue-600">
                    <FiCopy className="w-3.5 h-3.5" />
                  </button>
                  {coupon.description && <span className="text-xs text-gray-400 truncate hidden md:inline">{coupon.description}</span>}
                </div>
                <div className="w-28 text-center text-sm font-medium">
                  {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : formatBDT(coupon.discountValue)}
                </div>
                <div className="w-24 text-center text-sm text-gray-500">
                  {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                </div>
                <div className="w-28 text-center">{getStatusBadge(coupon)}</div>
                <div className="w-20 flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(coupon)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleStatus(coupon)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
                    {coupon.isActive ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(coupon)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}