'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { FiEdit2, FiTrash2, FiPlus, FiTruck } from 'react-icons/fi';

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  countries?: string | null;
  zones?: string | null;
  createdAt: string;
}

type FormData = {
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  countries: string;
  zones: string;
};

function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ShippingMethodsPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ShippingMethod | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const fetchMethods = useCallback(async () => {
    try {
      const res = await api.get('/shipping-methods');
      if (res.data.success) setMethods(res.data.data);
    } catch {
      showToast.error('Failed to load shipping methods');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '', price: 0, isActive: true, countries: '', zones: '' });
    setShowForm(true);
  };

  const openEdit = (m: ShippingMethod) => {
    setEditing(m);
    reset({
      name: m.name, description: m.description || '', price: m.price,
      isActive: m.isActive, countries: m.countries || '', zones: m.zones || ''
    });
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name, description: data.description,
        price: Number(data.price), isActive: data.isActive,
        countries: data.countries || null, zones: data.zones || null
      };
      if (editing) {
        const res = await api.put(`/shipping-methods/${editing.id}`, payload);
        if (res.data.success) showToast.success('Shipping method updated');
      } else {
        const res = await api.post('/shipping-methods', payload);
        if (res.data.success) showToast.success('Shipping method created');
      }
      setShowForm(false);
      setEditing(null);
      fetchMethods();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      showToast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (method: ShippingMethod) => {
    if (!confirm(`Delete "${method.name}"?`)) return;
    try {
      const res = await api.delete(`/shipping-methods/${method.id}`);
      if (res.data.success) { showToast.success('Deleted'); fetchMethods(); }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      showToast.error(message);
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shipping Methods</h1>
          <p className="text-sm text-gray-500 mt-1">Manage shipping & delivery options</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-sm hover:bg-blue-700 transition-all">
          <FiPlus className="w-4 h-4" /> Add Method
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{editing ? 'Edit Shipping Method' : 'Create Shipping Method'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input {...register('name', { required: true })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (৳) *</label>
                <input {...register('price', { required: true, min: 0 })} type="number" step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Countries (comma separated)</label>
                <input {...register('countries')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zones</label>
                <input {...register('zones')}
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

      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : methods.length === 0 ? (
          <div className="text-center py-16">
            <FiTruck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No shipping methods yet</h3>
            <p className="text-sm text-gray-500 mb-4">Add shipping options for your customers</p>
            <button onClick={openCreate} className="px-6 py-2.5 bg-blue-600 text-white rounded-sm text-sm font-semibold hover:bg-blue-700">Add Method</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex-1">Method</div>
              <div className="w-24 text-right">Price</div>
              <div className="w-24 text-center">Status</div>
              <div className="w-20 text-right">Actions</div>
            </div>
            {methods.map((method) => (
              <div key={method.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{method.name}</p>
                  {method.description && <p className="text-xs text-gray-500 truncate">{method.description}</p>}
                </div>
                <div className="w-24 text-right text-sm font-semibold text-gray-900">{formatBDT(method.price)}</div>
                <div className="w-24 text-center">
                  <span className={`text-xs px-2 py-1 rounded-sm ${method.isActive ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                    {method.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="w-20 flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(method)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(method)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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