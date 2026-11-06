'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiSearch, FiSliders } from 'react-icons/fi';
import api from '@/lib/api';
import ProductCard from '@/components/ecommerce/ProductCard';
import EcommerceHeader from '@/components/ecommerce/EcommerceHeader';
import EcommerceFooter from '@/components/ecommerce/EcommerceFooter';

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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/public/products?search=${encodeURIComponent(searchQuery)}&limit=50`);
      if (res.data.success) {
        setResults(res.data.data.products || []);
        setTotal(res.data.data.total || 0);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query);
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Search Products</h1>
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full px-5 py-4 pl-12 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-5 py-2 rounded-sm text-sm font-semibold hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : searched ? (
        <>
          <p className="text-sm text-gray-500 mb-6">{total} results for "{searchParams.get('q')}"</p>
          {results.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-sm flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No results found</h3>
              <p className="text-sm text-gray-500">Try different keywords</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <FiSearch className="w-12 h-12 mx-auto mb-4" />
          <p>Enter a search term to find products</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <EcommerceHeader />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Suspense fallback={
          <div className="max-w-8xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-12 bg-gray-200 rounded-sm" />
            </div>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </div>
      <EcommerceFooter />
    </>
  );
}