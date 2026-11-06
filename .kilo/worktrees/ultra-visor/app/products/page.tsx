'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiGrid, FiList, FiSliders, FiX, FiTag, FiCopy } from 'react-icons/fi';
import api from '@/lib/api';
import ProductCard from '@/components/ecommerce/ProductCard';
import EcommerceHeader from '@/components/ecommerce/EcommerceHeader';
import EcommerceFooter from '@/components/ecommerce/EcommerceFooter';
import { showToast } from '@/lib/toast';

interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  basePrice?: number;
  variants: {
    id: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    image?: string;
    attributes: Record<string, string>;
  }[];
  brand?: { name: string; slug: string } | null;
  categories?: { category: { name: string; slug: string } }[];
}

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);

  const limit = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      params.set('sort', sortBy);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedBrand) params.set('brand', selectedBrand);
      if (searchQuery) params.set('search', searchQuery);

      const res = await api.get(`/public/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.data.products);
        setTotal(res.data.data.total);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, selectedCategory, selectedBrand, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const landingPageSlug = localStorage.getItem('landingPageSlug');
      const url = landingPageSlug ? `/public/categories?tenantSlug=${landingPageSlug}` : '/public/categories';
      const res = await api.get(url);
      if (res.data.success) setCategories(res.data.data || []);
    } catch {}
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const landingPageSlug = localStorage.getItem('landingPageSlug');
      const url = landingPageSlug ? `/public/brands?tenantSlug=${landingPageSlug}` : '/public/brands';
      const res = await api.get(url);
      if (res.data.success) setBrands(res.data.data || []);
    } catch {}
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await api.get('/coupons');
      if (res.data.success) {
        const activeCoupons = res.data.data.filter((c: Coupon) => c.isActive);
        setAvailableCoupons(activeCoupons);
      }
    } catch {
      // Coupons are optional
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); fetchBrands(); }, [fetchCategories, fetchBrands]);
  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast.success('Coupon code copied!');
  };

  const totalPages = Math.ceil(total / limit);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSortBy('created_at');
    setSearchQuery('');
  };

  const hasFilters = selectedCategory || selectedBrand || sortBy !== 'created_at' || searchQuery;

  return (
    <>
      <EcommerceHeader />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-sm text-gray-500 mt-1">{total} products found</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center border border-gray-200 rounded-sm overflow-hidden">
                <button onClick={() => setView('grid')} className={`p-2.5 ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  <FiGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setView('list')} className={`p-2.5 ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  <FiList className="w-4 h-4" />
                </button>
              </div>

              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="px-4 py-2.5 border border-gray-200 rounded-sm text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <button onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                <FiSliders className="w-4 h-4" /> Filters
                {hasFilters && <span className="w-2 h-2 bg-blue-600 rounded-sm" />}
              </button>
            </div>
          </div>

          <div className="flex gap-8">
            <aside className="hidden sm:block w-64 flex-shrink-0">
              <div className="bg-white border border-gray-100 rounded-sm p-5 space-y-6 sticky top-24">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Categories</h3>
                  <div className="space-y-2">
                    <button onClick={() => { setSelectedCategory(''); setPage(1); }}
                      className={`block w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${!selectedCategory ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                        className={`block w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${selectedCategory === cat.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Brands</h3>
                  <div className="space-y-2">
                    <button onClick={() => { setSelectedBrand(''); setPage(1); }}
                      className={`block w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${!selectedBrand ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                      All Brands
                    </button>
                    {brands.map((brand) => (
                      <button key={brand.id} onClick={() => { setSelectedBrand(brand.id); setPage(1); }}
                        className={`block w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${selectedBrand === brand.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>

                {hasFilters && (
                  <button onClick={clearFilters} className="w-full text-center text-sm text-red-500 hover:text-red-600 font-medium py-2">
                    Clear all filters
                  </button>
                )}
              </div>
            </aside>

            {showFilters && (
              <div className="fixed inset-0 z-50 sm:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                    <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-sm"><FiX className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setSelectedCategory('')} className={`px-4 py-2 rounded-sm text-sm ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
                        {categories.map((cat) => (
                          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-sm text-sm ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{cat.name}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Brands</h3>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setSelectedBrand('')} className={`px-4 py-2 rounded-sm text-sm ${!selectedBrand ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
                        {brands.map((brand) => (
                          <button key={brand.id} onClick={() => setSelectedBrand(brand.id)} className={`px-4 py-2 rounded-sm text-sm ${selectedBrand === brand.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{brand.name}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { clearFilters(); setShowFilters(false); }} className="mt-6 w-full text-center text-sm text-red-500 font-medium py-3 border border-red-200 rounded-sm">Clear all filters</button>
                </div>
              </div>
            )}

            <div className="flex-1">
              {availableCoupons.length > 0 && (
                <div className="mb-6">
                  <button onClick={() => setShowCoupons(!showCoupons)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-sm text-sm font-medium hover:bg-blue-100">
                    <FiTag className="w-4 h-4" />
                    {showCoupons ? 'Hide' : 'Show'} Available Coupons ({availableCoupons.length})
                  </button>
                  {showCoupons && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableCoupons.map((coupon) => (
                        <div key={coupon.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-sm shadow-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm font-bold text-gray-900">{coupon.code}</p>
                            <p className="text-xs text-gray-500">
                              {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% off` : `৳${coupon.discountValue} off`}
                            </p>
                          </div>
                          <button onClick={() => copyCouponCode(coupon.code)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm" title="Copy">
                            <FiCopy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-sm overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-100" />
                      <div className="p-4 space-y-3">
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-8 bg-gray-100 rounded-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-100 rounded-sm flex items-center justify-center mx-auto mb-4"><FiSliders className="w-8 h-8 text-gray-300" /></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
                  <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search</p>
                  <button onClick={clearFilters} className="text-blue-600 font-medium text-sm hover:underline">Clear all filters</button>
                </div>
              ) : (
                <>
                  <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} view={view} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                        className="px-4 py-2 border border-gray-200 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                        const p = i + 1;
                        return (
                          <button key={p} onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-sm text-sm font-medium transition-colors ${page === p ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>{p}</button>
                        );
                      })}
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                        className="px-4 py-2 border border-gray-200 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <EcommerceFooter />
    </>
  );
}