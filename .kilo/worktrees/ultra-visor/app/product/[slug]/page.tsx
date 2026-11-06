'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiTruck, FiShield, FiRotateCcw } from 'react-icons/fi';
import api from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { showToast } from '@/lib/toast';
import EcommerceHeader from '@/components/ecommerce/EcommerceHeader';
import EcommerceFooter from '@/components/ecommerce/EcommerceFooter';

interface Variant {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
  attributes: Record<string, string>;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  basePrice?: number;
  metaTitle?: string;
  metaDescription?: string;
  variants: Variant[];
  brand?: { name: string; slug: string; logo?: string } | null;
  categories?: { category: { name: string; slug: string } }[];
  imagesRel?: { url: string; isPrimary: boolean; sortOrder: number }[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('description');

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/public/products/slug/${params.slug}`);
      if (res.data.success) {
        const p = res.data.data;
        setProduct(p);
        if (p.variants && p.variants.length > 0) {
          setSelectedVariant(p.variants[0]);
        }
      } else {
        showToast.error('Product not found');
        router.push('/products');
      }
    } catch {
      showToast.error('Failed to load product');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  }, [params.slug, router]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const allImages = product ? [
    ...(product.images || []),
    ...(product.variants?.map(v => v.image).filter(Boolean) as string[] || []),
    ...(product.imagesRel?.map(ir => ir.url) || []),
  ].filter(Boolean) : [];

  const displayImages = [...new Set(allImages)];
  const currentImage = selectedVariant?.image || displayImages[selectedImage] || '/placeholder.png';

  const handleAddToCart = () => {
    if (!selectedVariant) {
      showToast.error('Please select a variant');
      return;
    }
    if (selectedVariant.stock <= 0) {
      showToast.error('Out of stock');
      return;
    }
    addToCart({
      variantId: selectedVariant.id,
      productId: product!.id,
      name: product!.name,
      image: selectedVariant.image || displayImages[0] || '/placeholder.png',
      price: selectedVariant.price,
      quantity,
      attributes: selectedVariant.attributes,
      sku: selectedVariant.sku,
      stock: selectedVariant.stock,
    });
  };

  const handleAddToWishlist = () => {
    if (!selectedVariant) return;
    addToWishlist({
      productId: product!.id,
      variantId: selectedVariant.id,
      name: product!.name,
      image: selectedVariant.image || displayImages[0] || '/placeholder.png',
      price: selectedVariant.price,
      attributes: selectedVariant.attributes,
    });
  };

  if (loading) {
    return (
      <>
        <EcommerceHeader />
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-sm" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
        <EcommerceFooter />
      </>
    );
  }

  if (!product) return null;

  const discount = selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price
    ? Math.round((1 - selectedVariant.price / selectedVariant.compareAtPrice) * 100)
    : 0;

  return (
    <>
      <EcommerceHeader />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <button onClick={() => router.push('/products')} className="hover:text-gray-900">Products</button>
            {product.categories?.[0] && (
              <>
                <span>/</span>
                <span className="text-gray-900">{product.categories[0].category.name}</span>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square rounded-sm overflow-hidden bg-white border border-gray-100 mb-4">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
              </div>
              {displayImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {displayImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedImage(i); setSelectedVariant(null); }}
                      className={`flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden border-2 transition-colors ${
                        (selectedImage === i && !selectedVariant) || selectedVariant?.image === img
                          ? 'border-blue-600'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {product.brand && (
                <p className="text-sm text-gray-400 font-medium mb-1">{product.brand.name}</p>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ৳{(selectedVariant?.price || product.basePrice || 0).toFixed(0)}
                </span>
                {selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ৳{selectedVariant.compareAtPrice.toFixed(0)}
                    </span>
                    <span className="px-3 py-1 bg-red-50 text-red-500 text-sm font-semibold rounded-sm">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock status */}
              {selectedVariant && (
                <div className="mb-6">
                  {selectedVariant.stock > 0 ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-red-500 rounded-sm" />
                      <span className="text-red-600 font-medium">
                        In Stock ({selectedVariant.stock} available)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-red-500 rounded-sm" />
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>
              )}

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    {Object.keys(product.variants[0].attributes).length > 0
                      ? Object.keys(product.variants[0].attributes).join(' / ')
                      : 'Options'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => {
                      const attrLabel = Object.values(variant.attributes).join(' - ');
                      const isSelected = selectedVariant?.id === variant.id;
                      const isOutOfStock = variant.stock <= 0;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => { setSelectedVariant(variant); setQuantity(1); }}
                          disabled={isOutOfStock}
                          className={`px-5 py-3 rounded-sm text-sm font-medium border-2 transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : isOutOfStock
                                ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                                : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <span>{attrLabel || variant.sku}</span>
                          <span className="block text-xs mt-0.5">
                            {isOutOfStock ? 'Out of Stock' : `৳${variant.price.toFixed(0)}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(val, 999)));
                    }}
                    className="w-16 h-12 text-center border-x border-gray-200 font-semibold text-gray-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={1}
                    max={999}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(999, quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock <= 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {(selectedVariant?.stock ?? 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleAddToWishlist}
                  className={`w-12 h-12 rounded-sm flex items-center justify-center border-2 transition-all ${
                    isInWishlist(selectedVariant?.id || '')
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'
                  }`}
                >
                  <FiHeart className={`w-5 h-5 ${isInWishlist(selectedVariant?.id || '') ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-sm">
                  <FiTruck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Free Delivery</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-sm">
                  <FiShield className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-sm">
                  <FiRotateCcw className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-xs text-gray-600">7 Days Return</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex gap-6 mb-4">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
                      activeTab === 'description' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent'
                    }`}
                  >
                    Description
                  </button>
                </div>
                <div className="prose prose-sm max-w-none text-gray-600">
                  {activeTab === 'description' && (
                    <p>{product.description || 'No description available.'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EcommerceFooter />
    </>
  );
}