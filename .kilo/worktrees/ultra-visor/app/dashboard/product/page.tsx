'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { Product } from '@/types';
import { FiPlus, FiSearch, FiGrid, FiList, FiEdit2, FiTrash2, FiChevronDown, FiTag, FiPackage, FiHeart, FiCheckSquare, FiSquare, FiX, FiFilter, FiChevronLeft, FiChevronRight, FiDollarSign, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PRODUCT_LIMIT = 20;

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
}

type ViewMode = 'grid' | 'list';

export default function ProductCatalogPage() {
  const { t } = useLanguage();
  const router = useRouter();

  // Product state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // View
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(24);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Category bulk action
  const [showBulkCategory, setShowBulkCategory] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchTerm) params.set('search', searchTerm);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedBrand) params.set('brand', selectedBrand);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (filterStatus) params.set('status', filterStatus);
      if (sortBy === 'price_asc') params.set('sort', 'price_asc');
      else if (sortBy === 'price_desc') params.set('sort', 'price_desc');
      else if (sortBy === 'name') params.set('sort', 'name');
      else if (sortBy === 'oldest') params.set('sort', 'oldest');

      const response = await api.get(`/product?${params.toString()}`);
      if (response.data.success) {
        const data = response.data.data;
        const productList = data.products || data || [];
        setProducts(Array.isArray(productList) ? productList : []);
        setTotal(data.total || 0);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        showToast.error('Access denied. Login as Business Admin to manage products.');
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, selectedCategory, selectedBrand, minPrice, maxPrice, sortBy, filterStatus]);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await api.get('/brands');
      if (res.data.success) setBrands(res.data.data || []);
    } catch {}
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) setAllCategories(res.data.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchCategories();
  }, [fetchProducts, fetchBrands, fetchCategories]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, selectedBrand, minPrice, maxPrice, sortBy, filterStatus]);

  // Bulk selection
  useEffect(() => {
    if (selectAll) {
      setSelectedIds(new Set(products.map(p => p.id)));
    } else if (selectedIds.size > 0 && selectedIds.size === products.length) {
      setSelectAll(true);
    }
  }, [selectAll, products]);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
      setSelectAll(true);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
    setSelectAll(newSet.size === products.length && products.length > 0);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm(t('product.deleteConfirm'))) return;
    setDeleting(productId);
    try {
      await api.delete(`/product/${productId}`);
      showToast.success(t('product.deleted'));
      await fetchProducts();
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} products? All variants will be deleted.`)) return;
    try {
      const res = await api.post('/product/bulk/delete', { ids: Array.from(selectedIds) });
      if (res.data.success) {
        showToast.success(`Deleted ${res.data.data.deletedCount} products`);
        setSelectedIds(new Set());
        setSelectAll(false);
        await fetchProducts();
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Bulk delete failed');
    }
  };

  const handleBulkCategory = async () => {
    if (selectedIds.size === 0 || !bulkCategoryId) return;
    try {
      await api.post('/product/bulk/update-categories', {
        ids: Array.from(selectedIds),
        categoryIds: [bulkCategoryId],
        action: 'add',
      });
      showToast.success('Categories updated');
      setShowBulkCategory(false);
      setBulkCategoryId('');
      await fetchProducts();
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Bulk category update failed');
    }
  };

  const totalPages = Math.ceil(total / limit);
  const totalFiltered = products.length;
  const limitReached = total >= PRODUCT_LIMIT;

  const formatCurrency = (amount: number) => {
    return `৳${amount.toFixed(2)}`;
  };

  const getMinPrice = (product: Product): number => {
    if (product.variants && product.variants.length > 0) {
      return Math.min(...product.variants.map(v => v.price));
    }
    return product.basePrice || 0;
  };

  const getMaxPrice = (product: Product): number => {
    if (product.variants && product.variants.length > 0) {
      return Math.max(...product.variants.map(v => v.price));
    }
    return product.basePrice || 0;
  };

  /** Render status badge */
  const renderStatusBadge = (product: Product, compact = false) => {
    const isActive = product.status !== 'Inactive';
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-sm ${
        compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
      } ${isActive ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
        {isActive ? <FiCheckCircle className="w-3 h-3" /> : <FiXCircle className="w-3 h-3" />}
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  // ======== RENDER ========
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Product Limit Progress */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${limitReached ? 'text-red-600' : 'text-gray-600'}`}>
              {Math.min(total, PRODUCT_LIMIT)}/{PRODUCT_LIMIT}
            </span>
            <div className="w-24 h-2 bg-gray-200 rounded-sm overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all duration-500 ${
                  limitReached ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min((total / PRODUCT_LIMIT) * 100, 100)}%` }}
              />
            </div>
          </div>
          <Link
            href="/dashboard/product/create"
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-sm transition-all ${
              limitReached
                ? 'bg-gray-300 text-gray-500 pointer-events-none cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={limitReached ? `Product limit of ${PRODUCT_LIMIT} reached` : 'New Product'}
          >
            <FiPlus className="w-4 h-4" /> New Product
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Search products by name or description..."
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-sm outline-none text-sm bg-white min-w-[140px]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-sm text-sm transition-all ${
              showFilters ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <FiFilter className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-sm outline-none text-sm bg-white"
              >
                <option value="">All Categories</option>
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-sm outline-none text-sm bg-white"
              >
                <option value="">All Brands</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-sm outline-none text-sm bg-white"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Min Price</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-sm outline-none text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Max Price</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-sm outline-none text-sm"
                placeholder="10000"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 mb-6 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">
            <FiCheckSquare className="w-4 h-4 inline mr-1.5" />
            {selectedIds.size} product(s) selected
          </span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowBulkCategory(!showBulkCategory)}
                className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-sm text-sm hover:bg-blue-100 transition-all"
              >
                <FiTag className="w-4 h-4 inline mr-1" /> Add Category
              </button>
              {showBulkCategory && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-sm shadow-lg p-3 z-10 min-w-[200px]">
                  <select
                    value={bulkCategoryId}
                    onChange={(e) => setBulkCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm mb-2"
                  >
                    <option value="">Select category</option>
                    {allCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={handleBulkCategory} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs">Apply</button>
                    <button onClick={() => { setShowBulkCategory(false); setBulkCategoryId(''); }} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs">Cancel</button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-sm text-sm hover:bg-red-700 transition-all"
            >
              <FiTrash2 className="w-4 h-4 inline mr-1" /> Delete
            </button>
            <button
              onClick={() => { setSelectedIds(new Set()); setSelectAll(false); }}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-sm text-sm hover:bg-gray-50 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-10 md:p-16 text-center">
          <FiPackage className="w-16 h-16 mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">No products yet</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Create your first product to start selling</p>
          <Link
            href="/dashboard/product/create"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all text-base font-semibold"
          >
            <FiPlus className="w-5 h-5" /> Create Product
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => {
              const minP = getMinPrice(product);
              const maxP = getMaxPrice(product);
              const priceStr = minP === maxP ? formatCurrency(minP) : `${formatCurrency(minP)} - ${formatCurrency(maxP)}`;
              const primaryImage = product.imagesRel?.[0]?.url || product.images?.[0] || null;

              return (
                <div key={product.id} className="group bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  {/* Select checkbox */}
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(product.id); }}
                      className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        selectedIds.has(product.id) ? 'bg-blue-600 text-white' : 'bg-white/90 border border-gray-300 text-gray-400'
                      }`}
                    >
                      {selectedIds.has(product.id) ? <FiCheckSquare className="w-4 h-4" /> : <FiSquare className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Image */}
                  <Link href={`/dashboard/product/${product.id}`} className="block relative">
                    <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                      {primaryImage ? (
                        <img src={primaryImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                          <FiPackage className="w-10 h-10 text-blue-300" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <Link href={`/dashboard/product/${product.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate flex-1">
                        {product.name}
                      </Link>
                    </div>
                    {product.brand && (
                      <p className="text-xs text-gray-400 mb-1">{product.brand.name}</p>
                    )}
                    <p className="text-sm font-bold text-gray-900">{priceStr}</p>
                    {/* Status badge */}
                    <div className="mt-1.5">
                      {renderStatusBadge(product, true)}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {product._count?.variants || product.variants?.length || 0} variant(s)
                      </span>
                      <div className="flex gap-1">
                        <Link
                          href={`/dashboard/product/${product.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* List View */
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                      {selectAll ? <FiCheckSquare className="w-4 h-4" /> : <FiSquare className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Brand</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categories</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price Range</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Variants</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const minP = getMinPrice(product);
                  const maxP = getMaxPrice(product);
                  const priceStr = minP === maxP ? formatCurrency(minP) : `${formatCurrency(minP)} - ${formatCurrency(maxP)}`;
                  const primaryImage = product.imagesRel?.[0]?.url || product.images?.[0] || null;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(product.id)} className="text-gray-400 hover:text-blue-600">
                          {selectedIds.has(product.id) ? <FiCheckSquare className="w-4 h-4 text-blue-600" /> : <FiSquare className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/product/${product.id}`} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {primaryImage ? (
                              <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiPackage className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.brand?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {product.categories?.slice(0, 2).map(pc => (
                            <span key={pc.category?.id} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">{pc.category?.name}</span>
                          ))}
                          {(product.categories?.length || 0) > 2 && (
                            <span className="text-xs text-gray-400">+{product.categories!.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{priceStr}</td>
                      <td className="px-4 py-3">
                        {renderStatusBadge(product)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{product._count?.variants || product.variants?.length || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/product/${product.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <FiEdit2 className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-sm border border-gray-100 p-4">
          <span className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    pageNum === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}