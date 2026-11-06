'use client';

import Link from 'next/link';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { showToast } from '@/lib/toast';

interface ProductCardVariant {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
  attributes: Record<string, string>;
}

interface ProductCardProduct {
  id: string;
  name: string;
  slug?: string;
  images: string[];
  basePrice?: number;
  variants?: ProductCardVariant[];
  brand?: { name: string; slug: string } | null;
  categories?: { category: { name: string; slug: string } }[];
}

interface ProductCardProps {
  product: ProductCardProduct;
  view?: 'grid' | 'list';
}

export default function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const { addToCart, addToWishlist, isInWishlist, isInCart } = useCart();

  const image = product.images?.[0] || '/placeholder.png';
  const hasVariants = product.variants && product.variants.length > 0;
  const minPrice = hasVariants
    ? Math.min(...(product.variants?.map(v => v.price) || [0]))
    : product.basePrice || 0;
  const maxPrice = hasVariants
    ? Math.max(...(product.variants?.map(v => v.price) || [0]))
    : product.basePrice || 0;
  const firstVariant = product.variants?.[0];
  const totalStock = product.variants?.reduce((s, v) => s + v.stock, 0) || 0;
  const isOutOfStock = totalStock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      showToast.error('Out of stock');
      return;
    }
    const variant = firstVariant;
    if (!variant) return;
    addToCart({
      variantId: variant.id,
      productId: product.id,
      name: product.name,
      image: variant.image || image,
      price: variant.price,
      quantity: 1,
      attributes: variant.attributes,
      sku: variant.sku,
      stock: variant.stock,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = firstVariant;
    if (!variant) return;
    if (isInWishlist(firstVariant?.id || '')) return;
    addToWishlist({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      image: variant.image || image,
      price: variant.price,
      attributes: variant.attributes,
    });
  };

  const slug = product.slug || product.id;

  if (view === 'list') {
    return (
      <Link href={`/product/${slug}`} className="group block">
        <div className="flex gap-4 bg-white border border-gray-100 rounded-sm p-4 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
          <div className="w-32 h-32 flex-shrink-0 rounded-sm overflow-hidden bg-gray-50">
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              {product.brand && (
                <p className="text-xs text-gray-400 font-medium mb-0.5">{product.brand.name}</p>
              )}
              <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              {product.categories && product.categories.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">{product.categories[0].category.name}</p>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-gray-900">৳{minPrice.toFixed(0)}</span>
                {maxPrice > minPrice && (
                  <span className="text-sm text-gray-400">– ৳{maxPrice.toFixed(0)}</span>
                )}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={handleToggleWishlist}
                  className={`w-9 h-9 rounded-sm flex items-center justify-center transition-all ${
                    isInWishlist(firstVariant?.id || '')
                      ? 'bg-red-50 text-red-500'
                      : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-400'
                  }`}
                >
                  <FiHeart className={`w-4 h-4 ${isInWishlist(firstVariant?.id || '') ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-9 h-9 rounded-sm bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${slug}`} className="group block">
      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-1.5 rounded-sm text-sm font-semibold">Out of Stock</span>
            </div>
          )}
          {/* Quick actions overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleToggleWishlist}
              className={`w-9 h-9 rounded-sm flex items-center justify-center shadow-lg backdrop-blur-sm transition-all ${
                isInWishlist(firstVariant?.id || '')
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <FiHeart className={`w-4 h-4 ${isInWishlist(firstVariant?.id || '') ? 'fill-current' : ''}`} />
            </button>
            <Link
              href={`/product/${slug}`}
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 rounded-sm bg-white/90 text-gray-600 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all"
            >
              <FiEye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col">
          {product.brand && (
            <p className="text-xs text-gray-400 font-medium mb-1">{product.brand.name}</p>
          )}
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors flex-1">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-lg font-bold text-gray-900">৳{minPrice.toFixed(0)}</span>
            {maxPrice > minPrice && (
              <>
                <span className="text-sm text-gray-400 line-through">৳{maxPrice.toFixed(0)}</span>
                <span className="text-xs font-semibold text-red-600">
                  -{Math.round((1 - minPrice / maxPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-sm text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <FiShoppingCart className="w-4 h-4" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}