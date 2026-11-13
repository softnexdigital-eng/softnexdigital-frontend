'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import {
  FiEdit2, FiTrash2, FiPlus, FiChevronRight, FiChevronDown,
  FiSearch, FiGrid, FiLayers, FiImage, FiType, FiHash,
  FiCheck, FiX, FiChevronUp, FiEye, FiEyeOff, FiFolder,
  FiFolderPlus, FiAlertCircle, FiMenu
} from 'react-icons/fi';

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [quickAddParent, setQuickAddParent] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: '', slug: '', description: '', parentId: '', image: '', isActive: true, order: 0 }
  });

  const watchedName = watch('name');
  const watchedImage = watch('image');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) setCategories(res.data.data);
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

  // Count total subcategories
  const countSubcategories = (cats: Category[]): number => {
    let count = 0;
    for (const c of cats) {
      if (c.children) {
        count += c.children.length;
        count += countSubcategories(c.children);
      }
    }
    return count;
  };

  // Count total products
  const countProducts = (cats: Category[]): number => {
    let count = 0;
    for (const c of cats) {
      count += c._count?.products || 0;
      if (c.children) count += countProducts(c.children);
    }
    return count;
  };

  const totalSubs = countSubcategories(categories);
  const totalProducts = countProducts(categories);

  const toggleExpand = (id: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collect = (cats: Category[]) => {
      for (const c of cats) {
        if (c.children && c.children.length > 0) {
          allIds.add(c.id);
          collect(c.children);
        }
      }
    };
    collect(categories);
    setExpandedParents(allIds);
  };

  const collapseAll = () => setExpandedParents(new Set());

  const openCreate = (parentId?: string) => {
    setEditing(null);
    setShowAdvanced(false);
    setQuickAddParent(parentId || null);
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
    setQuickAddParent(null);
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
    setSaving(true);
    try {
      if (!data.slug && data.name) {
        data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      const payload = { ...data, parentId: data.parentId || null };
      if (editing) {
        const res = await api.put(`/categories/${editing.id}`, payload);
        if (res.data.success) showToast.success('Category updated successfully!');
      } else {
        const res = await api.post('/categories', payload);
        if (res.data.success) {
          showToast.success(data.parentId ? 'Sub-category created!' : 'Category created!');
        }
      }
      setShowForm(false);
      setEditing(null);
      setQuickAddParent(null);
      reset({ name: '', slug: '', description: '', parentId: '', image: '', isActive: true, order: 0 });
      fetchCategories();
    } catch (err: unknown) {
      let msg = 'Failed to save category';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = (err as any).response;
        if (response?.data?.message) msg = response.data.message;
        else if (response?.data?.error) msg = response.data.error;
        else if (response?.data?.msg) msg = response.data.msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
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

  // Filter categories based on search
  const filterCategories = (cats: Category[], query: string): Category[] => {
    if (!query) return cats;
    return cats.filter(c => {
      const matchesName = c.name.toLowerCase().includes(query.toLowerCase());
      const matchesSlug = c.slug.toLowerCase().includes(query.toLowerCase());
      const childMatches = c.children ? filterCategories(c.children, query).length > 0 : false;
      return matchesName || matchesSlug || childMatches;
    }).map(c => ({
      ...c,
      children: c.children ? filterCategories(c.children, query) : []
    }));
  };

  const filteredCategories = filterCategories(categories, searchQuery);

  const renderCategoryCard = (cat: Category, depth = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedParents.has(cat.id);
    const isSubcategory = !!cat.parentId;
    const productCount = cat._count?.products || 0;

    return (
      <div key={cat.id} className={`
        ${depth > 0 ? 'ml-6 md:ml-10' : ''}
      `}>
        <div className={`
          group relative bg-white rounded-sm border transition-all duration-200 mb-3
          ${depth === 0 ? 'border-gray-200 hover:border-blue-300 hover:shadow-md' : 'border-gray-100 hover:border-blue-200 hover:shadow-sm'}
          ${deleteConfirm === cat.id ? 'border-red-300 bg-red-50' : ''}
        `}>
          <div className="flex items-center gap-3 p-4">
            {/* Expand/Collapse button */}
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(cat.id)}
                className={`
                  w-8 h-8 flex items-center justify-center rounded-lg transition-all
                  ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'}
                `}
              >
                {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${isSubcategory ? 'bg-purple-50' : 'bg-blue-50'}`}>
                {isSubcategory
                  ? <FiLayers className="w-4 h-4 text-purple-500" />
                  : <FiFolder className="w-4 h-4 text-blue-500" />
                }
              </div>
            )}

            {/* Image thumbnail */}
            {cat.image && (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Category info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{cat.name}</h3>
                {!cat.isActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-sm">
                    <FiEyeOff className="w-2.5 h-2.5" /> Hidden
                  </span>
                )}
                {hasChildren && (
                  <span className="text-[10px] font-medium bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-sm">
                    {cat.children!.length} sub
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">/{cat.slug}</p>
            </div>

            {/* Product count */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <FiGrid className="w-3 h-3" />
              <span>{productCount}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Quick add subcategory (only for root categories) */}
              {!isSubcategory && (
                <button
                  onClick={() => openCreate(cat.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all opacity-0 group-hover:opacity-100"
                  title="Add sub-category"
                >
                  <FiFolderPlus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => openEdit(cat)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all opacity-0 group-hover:opacity-100"
                title="Edit"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              {deleteConfirm === cat.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-sm transition-all text-xs font-medium"
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
                  onClick={() => setDeleteConfirm(cat.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gray-200" />
            {cat.children!.map(child => renderCategoryCard(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize your products into categories and sub-categories
          </p>
        </div>
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-sm hover:bg-blue-700 transition-all shadow-sm"
        >
          <FiPlus className="w-4 h-4" /> New Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-blue-50 flex items-center justify-center">
              <FiFolder className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              <p className="text-xs text-gray-500">Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-purple-50 flex items-center justify-center">
              <FiLayers className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalSubs}</p>
              <p className="text-xs text-gray-500">Sub-categories</p>
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
            <div className="w-10 h-10 rounded-sm bg-red-50 flex items-center justify-center">
              <FiEye className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(c => c.isActive).length}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Controls */}
      {categories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
            >
              Collapse All
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Form - Slide-in Panel */}
      {showForm && (
        <div className="mb-6">
          <div className="bg-white rounded-sm shadow-lg border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-blue-100 flex items-center justify-center">
                  {editing ? <FiEdit2 className="w-5 h-5 text-blue-600" /> : <FiFolderPlus className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editing ? 'Edit Category' : quickAddParent ? 'Add Sub-Category' : 'Create New Category'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {editing ? `Editing "${editing.name}"` : quickAddParent ? 'This will be a sub-category of the selected parent' : 'Fill in the details below to create a new category'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowForm(false); setEditing(null); setQuickAddParent(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-sm transition-all"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {/* Essential Fields */}
              <div className="space-y-5">
                {/* Name - Full width, prominent */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiType className="w-4 h-4 text-gray-400" />
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name', { required: 'Category name is required' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                    placeholder="e.g. Electronics, Fashion, Home & Kitchen"
                    autoFocus
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Slug - Auto-generated, with preview */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiHash className="w-4 h-4 text-gray-400" />
                    URL Slug
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-mono">/</span>
                    <input
                      {...register('slug')}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono bg-gray-50"
                      placeholder="auto-generated-from-name"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Auto-generated from name. You can edit if needed.</p>
                </div>

                {/* Parent Category - Clear choice */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiFolder className="w-4 h-4 text-gray-400" />
                    Parent Category
                  </label>
                  <select
                    {...register('parentId')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  >
                    <option value="">None — This is a root category</option>
                    {getFlatCategories(categories).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-400">
                    {watch('parentId')
                      ? '📦 This will appear as a sub-category under the selected parent'
                      : '📁 This will appear as a top-level category'}
                  </p>
                </div>

                {/* Active Status - Toggle switch */}
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
                        {watch('isActive') ? 'Category is visible to customers' : 'Category is hidden from customers'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      {...register('isActive')}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-sm peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-sm after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
              </div>

              {/* Advanced Options - Collapsible */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {showAdvanced ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                  Advanced Options
                  {!showAdvanced && <span className="text-xs text-gray-400">(Image, Description, Order)</span>}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-sm border border-gray-100">
                    {/* Image URL with preview */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FiImage className="w-4 h-4 text-gray-400" />
                        Image URL
                      </label>
                      <input
                        {...register('image')}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
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
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none bg-white"
                        placeholder="Brief description for this category (optional)"
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
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
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
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-sm text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-sm h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : editing ? (
                    <>Save Changes</>
                  ) : (
                    <>{watch('parentId') ? 'Create Sub-Category' : 'Create Category'}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditing(null); setQuickAddParent(null); }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-sm text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent mb-4" />
            <p className="text-sm text-gray-500">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-20 h-20 rounded-sm bg-blue-50 flex items-center justify-center mx-auto mb-5">
              <FiFolderPlus className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Categories help organize your products. Create your first category to get started — you can always add sub-categories later.
            </p>
            <button
              onClick={() => openCreate()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-sm text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
            >
              <FiFolderPlus className="w-4 h-4" />
              Create Your First Category
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <FiSearch className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No matching categories</h3>
            <p className="text-sm text-gray-500">Try a different search term</p>
          </div>
        ) : (
          <div className="p-4">
            {filteredCategories.map(cat => renderCategoryCard(cat))}
          </div>
        )}
      </div>
    </div>
  );
}