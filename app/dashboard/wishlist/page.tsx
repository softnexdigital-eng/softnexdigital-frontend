'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { FiTrash2, FiShoppingBag, FiHeart } from 'react-icons/fi';

interface WishlistItem {
  id: string;
  variantId: string;
  createdAt: string;
  variant: {
    id: string;
    sku: string;
    price: number;
    image?: string;
    attributes: Record<string, string>;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
    };
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await api.get('/wishlist');
      if (res.data.success) setItems(res.data.data);
    } catch {
      showToast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this item from wishlist?')) return;
    try {
      const res = await api.delete(`/wishlist/${id}`);
      if (res.data.success) {
        showToast.success('Removed from wishlist');
        fetchWishlist();
      }
    } catch {
      showToast.error('Failed to remove item');
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Wishlist</h1>
          <p className="text-sm text-gray-500 mt-1">Items saved by customers</p>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <FiHeart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No wishlist items</h3>
            <p className="text-sm text-gray-500">Customers haven't added any items to their wishlist yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex-1">Product</div>
              <div className="w-32">Variant</div>
              <div className="w-24 text-right">Price</div>
              <div className="w-32 text-right">Added</div>
              <div className="w-16 text-right">Actions</div>
            </div>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <img
                    src={item.variant.image || item.variant.product.images[0] || '/placeholder.png'}
                    alt={item.variant.product.name}
                    className="w-12 h-12 rounded-sm object-cover border border-gray-100"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.variant.product.name}</p>
                    <p className="text-xs text-gray-500">SKU: {item.variant.sku}</p>
                  </div>
                </div>
                <div className="w-32">
                  <div className="text-xs text-gray-500">
                    {Object.entries(item.variant.attributes).slice(0, 2).map(([key, value]) => (
                      <span key={key} className="mr-2">{key}: {value}</span>
                    ))}
                  </div>
                </div>
                <div className="w-24 text-right text-sm font-medium text-gray-900">৳{item.variant.price}</div>
                <div className="w-32 text-right text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
                <div className="w-16 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
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
