'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  _count?: { products: number };
}

type FormData = {
  name: string;
  slug: string;
  logo: string;
  isActive: boolean;
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: '', slug: '', logo: '', isActive: true }
  });

  const fetchBrands = useCallback(async () => {
    try {
      const res = await api.get('/brands');
      if (res.data.success) setBrands(res.data.data);
    } catch {
      showToast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) {
      const currentSlug = watch('slug');
      if (!currentSlug) {
        setValue('slug', generateSlug(e.target.value));
      }
    }
  };

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', slug: '', logo: '', isActive: true });
    setShowForm(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    reset({ name: brand.name, slug: brand.slug, logo: brand.logo || '', isActive: brand.isActive });
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      // Auto-generate slug if empty
      if (!data.slug && data.name) {
        data.slug = generateSlug(data.name);
      }
      if (editing) {
        const res = await api.put(`/brands/${editing.id}`, data);
        if (res.data.success) showToast.success('Brand updated');
      } else {
        const res = await api.post('/brands', data);
        if (res.data.success) showToast.success('Brand created');
      }
      setShowForm(false);
      setEditing(null);
      fetchBrands();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save brand';
      showToast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Delete brand "${brand.name}"? This may affect products using this brand.`)) return;
    try {
      const res = await api.delete(`/brands/${brand.id}`);
      if (res.data.success) {
        showToast.success('Brand deleted');
        fetchBrands();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      showToast.error(message);
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product brands</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-sm hover:bg-blue-700 transition-all">
          <FiPlus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editing ? 'Edit Brand' : 'Create Brand'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input {...register('name', { required: 'Name is required' })}
                  onChange={onNameChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input {...register('slug')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input {...register('logo')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input {...register('isActive')} type="checkbox" id="isActive"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-sm text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-sm text-sm font-semibold hover:bg-gray-200 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-16">
            <FiPlus className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No brands yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first brand</p>
            <button onClick={openCreate} className="px-6 py-2.5 bg-blue-600 text-white rounded-sm text-sm font-semibold hover:bg-blue-700">
              Create Brand
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex-1">Brand</div>
              <div className="w-16 text-right">Products</div>
              <div className="w-16 text-right">Status</div>
              <div className="w-16 text-right">Actions</div>
            </div>
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="w-10 h-10 rounded-sm object-contain border border-gray-100 bg-white" />
                  ) : (
                    <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{brand.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">{brand.name}</p>
                    <p className="text-xs text-gray-500">/{brand.slug}</p>
                  </div>
                </div>
                <div className="w-16 text-right text-sm text-gray-500">{brand._count?.products || 0}</div>
                <div className="w-16 text-right">
                  <span className={`text-xs px-2 py-1 rounded-sm ${brand.isActive ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                    {brand.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="w-16 flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(brand)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(brand)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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