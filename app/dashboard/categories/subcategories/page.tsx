'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import {
  FiEdit2, FiTrash2, FiPlus, FiLayers, FiSearch, FiImage,
  FiType, FiHash, FiCheck, FiX, FiChevronUp, FiChevronDown,
  FiEye, FiEyeOff, FiFolder, FiArrowLeft, FiGrid, FiAlertCircle,
  FiMenu
} from 'react-icons/fi';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: string;
  isActive: boolean;
  order: number;
  parent?: { id: string; name: string; slug: string } | null;
  children?: Category[];
  _count?: { products: number };
}

type FormData = {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  image: string;
  isActive: boolean;
  order: number;
};

export default function SubCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterParent, setFilterParent] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: '', slug: '', description: '', parentId: '', image: '', isActive: true, order: 0 }
  });

  const watchedName = watch('name');
  const watchedImage = watch('image');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        const data = res.data.data || [];
        setCategories(data);

        // Extract all sub-categories (those with a parentId)
        const subs: Category[] = [];
        const extractSubs = (cats: Category[]) => {
          for (const c of cats) {
            if (c.parentId) subs.push(c);
            if (c.children) extractSubs(c.children);
          }
        };
        extractSubs(data);
        setSubCategories(subs);
      }
    } catch {
      showToast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && !editing) {
      const slug = watchedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [watchedName, editing, setValue]);

  // Get root categories only (no parentId)
  const rootCategories = categories.filter(c => !c.parentId);

  const getFlatCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    const flatten = (list: Category[]) => {
      for (const c of list) {
        result.push(c);
        if (c.children) flatten(c.children);
      }
    };
    flatten(cats);
    return result.filter(c => c.id !== editing?.id);
  };

  // Count products in subcategories
  const totalProducts = subCategories.reduce((sum, s) => sum + (s._count?.products || 0), 0);

  // Filter subcategories
  const filteredSubs = subCategories.filter(sub => {
    const matchesSearch = !searchQuery ||
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesParent = filterParent === 'all' || sub.parentId === filterParent;
    return matchesSearch && matchesParent;
  });

  const openCreate = (parentId?: string) => {
    setEditing(null);
    setShowAdvanced(false);
    reset({
      name: '',
      slug: '',
      description: '',
      parentId: parentId || '',
      image: '',
      isActive: true,
      order: 0
    });
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setShowAdvanced(!!cat.description || !!cat.image || cat.order > 0);
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      parentId: cat.parentId || '',
      image: cat.image || '',
      isActive: cat.isActive,
      order: cat.order
    });
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    if (!data.parentId) {
      showToast.error('Please select a parent category');
      return;
    }
    setSaving(true);
    try {
      if (!data.slug && data.name) {
        data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      const payload = { ...data };
      if (editing) {
        const res = await api.put(`/categories/${editing.id}`, payload);
        if (res.data.success) showToast.success('Sub-category updated!');
      } else {
        const res = await api.post('/categories', payload);
        if (res.data.success) showToast.success('Sub-category created!');
      }
      setShowForm(false);
      setEditing(null);
      fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save sub-category';
      showToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    try {
      const res = await api.delete(`/categories/${cat.id}`);
      if (res.data.success) {
        showToast.success(`"${cat.name}" deleted`);
        setDeleteConfirm(null);
        fetchCategories();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      showToast.error(msg);
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Link
            href="/dashboard/categories"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-2"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to Categories
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sub-Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage sub-categories under parent categories
          </p>
        </div>
        <button
          onClick={() => openCreate()}
          disabled={rootCategories.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-sm hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus className="w-4 h-4" /> New Sub-Category
        </button>
      </div>

      {/* Warning if no parent categories */}
      {rootCategories.length === 0 && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-sm bg-red-100 flex items-center justify-center flex-shrink-0">
              <FiFolder className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">No parent categories found</h3>
              <p className="text-sm text-red-700 mt-1">
                You need to create at least one parent category before adding sub-categories.
              </p>
              <Link
                href="/dashboard/categories"
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all"
              >
                Create Category <FiArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-purple-50 flex items-center justify-center">
              <FiLayers className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{subCategories.length}</p>
              <p className="text-xs text-gray-500">Sub-Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-red-50 flex items-center justify-center">
              <FiGrid className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-xs text-gray-500">Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-blue-50 flex items-center justify-center">
              <FiFolder className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rootCategories.length}</p>
              <p className="text-xs text-gray-500">Parent Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="mb-6">
          <div className="bg-white rounded-sm shadow-lg border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-purple-100 flex items-center justify-center">
                  {editing ? <FiEdit2 className="w-5 h-5 text-purple-600" /> : <FiLayers className="w-5 h-5 text-purple-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editing ? 'Edit Sub-Category' : 'Create New Sub-Category'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {editing ? `Editing "${editing.name}"` : 'Sub-categories appear under a parent category'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-sm transition-all"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-5">
                {/* Parent Category - Prominent, first field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiFolder className="w-4 h-4 text-gray-400" />
                    Parent Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('parentId', { required: 'Parent category is required' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
                  >
                    <option value="">Select a parent category...</option>
                    {rootCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.parentId && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> {errors.parentId.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">Choose which category this sub-category belongs to</p>
                </div>

                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiType className="w-4 h-4 text-gray-400" />
                    Sub-Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium"
                    placeholder="e.g. Smartphones, T-Shirts, Sofas"
                    autoFocus
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiHash className="w-4 h-4 text-gray-400" />
                    URL Slug
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-mono">/</span>
                    <input
                      {...register('slug')}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-purple-500 outline-none text-sm font-mono bg-gray-50"
                      placeholder="auto-generated-from-name"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Auto-generated from name. You can edit if needed.</p>
                </div>

                {/* Active Status - Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-sm">
                  <div className="flex items-center gap-3">
                    {watch('isActive') ? (
                      <FiEye className="w-5 h-5 text-red-500" />
                    ) : (
                      <FiEyeOff className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700">Visibility</p>
                      <p className="text-xs text-gray-500">
                        {watch('isActive') ? 'Visible to customers' : 'Hidden from customers'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      {...register('isActive')}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-sm peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-sm after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  {showAdvanced ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                  Advanced Options
                  {!showAdvanced && <span className="text-xs text-gray-400">(Image, Description, Order)</span>}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-sm border border-gray-100">
                    {/* Image */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FiImage className="w-4 h-4 text-gray-400" />
                        Image URL
                      </label>
                      <input
                        {...register('image')}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
                        placeholder="https://example.com/image.jpg"
                      />
                      {watchedImage && (
                        <div className="mt-2 w-20 h-20 rounded-sm overflow-hidden border border-gray-200 bg-white">
                          <img
                            src={watchedImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FiType className="w-4 h-4 text-gray-400" />
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none bg-white"
                        placeholder="Brief description (optional)"
                      />
                    </div>

                    {/* Display Order */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FiMenu className="w-4 h-4 text-gray-400" />
                        Display Order
                      </label>
                      <input
                        {...register('order')}
                        type="number"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
                        placeholder="0"
                      />
                      <p className="mt-1 text-xs text-gray-400">Lower numbers appear first. Default is 0.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-sm text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-sm h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : editing ? (
                    <>Save Changes</>
                  ) : (
                    <>Create Sub-Category</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditing(null); }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-sm text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      {subCategories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sub-categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={filterParent}
            onChange={(e) => setFilterParent(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
          >
            <option value="all">All Parents</option>
            {rootCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sub-Categories List */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-sm h-10 w-10 border-2 border-purple-600 border-t-transparent mb-4" />
            <p className="text-sm text-gray-500">Loading sub-categories...</p>
          </div>
        ) : subCategories.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-20 h-20 rounded-sm bg-purple-50 flex items-center justify-center mx-auto mb-5">
              <FiLayers className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sub-categories yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Sub-categories help further organize products within a category. Create your first sub-category to get started.
            </p>
            {rootCategories.length > 0 && (
              <button
                onClick={() => openCreate()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-sm text-sm font-semibold hover:bg-purple-700 transition-all shadow-sm"
              >
                <FiLayers className="w-4 h-4" />
                Create Sub-Category
              </button>
            )}
          </div>
        ) : filteredSubs.length === 0 ? (
          <div className="text-center py-16">
            <FiSearch className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No matching sub-categories</h3>
            <p className="text-sm text-gray-500">Try a different search or filter</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredSubs.map((sub) => (
              <div
                key={sub.id}
                className={`
                  group flex items-center gap-4 px-5 py-4 transition-all
                  hover:bg-gray-50
                  ${deleteConfirm === sub.id ? 'bg-red-50' : ''}
                `}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-sm bg-purple-50 flex items-center justify-center flex-shrink-0">
                  {sub.image ? (
                    <img src={sub.image} alt={sub.name} className="w-10 h-10 rounded-sm object-cover" />
                  ) : (
                    <FiLayers className="w-5 h-5 text-purple-500" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{sub.name}</h3>
                    {!sub.isActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-sm">
                        <FiEyeOff className="w-2.5 h-2.5" /> Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-sm">
                      {sub.parent?.name || 'Unknown parent'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">/{sub.slug}</span>
                  </div>
                </div>

                {/* Product count */}
                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                  <FiGrid className="w-3 h-3" />
                  <span>{sub._count?.products || 0}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(sub)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all opacity-0 group-hover:opacity-100"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  {deleteConfirm === sub.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(sub)}
                        className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-sm transition-all"
                        title="Confirm delete"
                      >
                        <FiCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-sm transition-all"
                        title="Cancel"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(sub.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}