'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiTrash2, FiArrowLeft, FiArrowRight, FiTag, FiCopy } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { formatAttributes } from '@/lib/attrUtils';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import EcommerceHeader from '@/components/ecommerce/EcommerceHeader';
import EcommerceFooter from '@/components/ecommerce/EcommerceFooter';
import QuantitySelector from '@/components/ecommerce/QuantitySelector';

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  isActive: boolean;
}

export default function CartPage() {
  const { items, cartTotal, updateQuantity, removeFromCart, clearCart, cartCount } = useCart();
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get('/coupons');
        if (res.data.success) {
          const activeCoupons = res.data.data.filter((c: Coupon) => c.isActive);
          setAvailableCoupons(activeCoupons);
        }
      } catch {
        // Silently fail - coupons are optional
      } finally {
        setLoadingCoupons(false);
      }
    };
    fetchCoupons();
  }, []);

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast.success('Coupon code copied!');
  };

  return (
    <>
      <EcommerceHeader />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-sm text-gray-500 mt-1">{cartCount} items</p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-sm flex items-center justify-center mx-auto mb-4">
                <FiShoppingCart className="w-8 h-8 text-gray-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Looks like you haven't added anything yet</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    className="bg-white border border-gray-100 rounded-sm p-4 sm:p-6 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <Link href={`/product/${item.productId}`} className="w-full sm:w-24 h-24 rounded-sm overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={item.image || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productId}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">
                        {item.name}
                      </Link>
                      {Object.keys(item.attributes).length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">{formatAttributes(item.attributes)}</p>
                      )}
                      <p className="text-sm text-gray-400 mt-0.5">SKU: {item.sku}</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">৳{item.price.toFixed(0)}</p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-3">
                      <QuantitySelector
                        quantity={item.quantity}
                        onChange={(qty) => updateQuantity(item.variantId, qty)}
                        min={1}
                        max={item.stock}
                        size="sm"
                      />
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">৳{(item.price * item.quantity).toFixed(0)}</p>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 mt-1"
                        >
                          <FiTrash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-gray-100 rounded-sm p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                      <span className="font-semibold text-gray-900">৳{cartTotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-gray-900">Calculated at checkout</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex justify-between">
                        <span className="text-base font-bold text-gray-900">Total</span>
                        <span className="text-base font-bold text-gray-900">৳{cartTotal.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Proceed to Checkout <FiArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/products"
                    className="mt-3 w-full flex items-center justify-center gap-2 text-gray-600 py-3 rounded-sm font-semibold hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <FiArrowLeft className="w-4 h-4" /> Continue Shopping
                  </Link>
                </div>

                {/* Available Coupons */}
                {!loadingCoupons && availableCoupons.length > 0 && (
                  <div className="bg-white border border-gray-100 rounded-sm p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FiTag className="w-4 h-4 text-blue-600" />
                      Available Coupons
                    </h3>
                    <div className="space-y-2">
                      {availableCoupons.map((coupon) => (
                        <div key={coupon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-sm border border-gray-100">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm font-bold text-gray-900">{coupon.code}</p>
                            <p className="text-xs text-gray-500">
                              {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% off` : `৳${coupon.discountValue} off`}
                            </p>
                          </div>
                          <button
                            onClick={() => copyCouponCode(coupon.code)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm"
                            title="Copy coupon code"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Apply these codes at checkout</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <EcommerceFooter />
    </>
  );
}