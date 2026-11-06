'use client';

import Link from 'next/link';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { formatAttributes } from '@/lib/attrUtils';
import EcommerceHeader from '@/components/ecommerce/EcommerceHeader';
import EcommerceFooter from '@/components/ecommerce/EcommerceFooter';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  return (
    <>
      <EcommerceHeader />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-sm text-gray-500 mt-1">{wishlist.length} items saved</p>
            </div>
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-sm flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-8 h-8 text-gray-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 mb-6">Save your favorite items here</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" /> Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-sm overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <Link href={`/product/${item.productId}`} className="block">
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/product/${item.productId}`}>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    {Object.keys(item.attributes).length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{formatAttributes(item.attributes)}</p>
                    )}
                    <p className="text-lg font-bold text-gray-900 mt-2">৳{item.price.toFixed(0)}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => addToCart({
                          variantId: item.variantId,
                          productId: item.productId,
                          name: item.name,
                          image: item.image,
                          price: item.price,
                          quantity: 1,
                          attributes: item.attributes,
                          sku: '',
                          stock: 999,
                        })}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 rounded-sm text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <FiShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.variantId)}
                        className="w-10 h-10 rounded-sm flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors border border-gray-200"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <EcommerceFooter />
    </>
  );
}