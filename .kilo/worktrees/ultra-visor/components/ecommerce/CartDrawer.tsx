'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { FiX, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import QuantitySelector from './QuantitySelector';
import { formatAttributes } from '@/lib/attrUtils';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, cartTotal, updateQuantity, removeFromCart, cartCount } = useCart();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FiShoppingCart className="w-5 h-5 text-gray-900" />
              <h2 className="text-lg font-bold text-gray-900">Cart ({cartCount})</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-sm flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-sm flex items-center justify-center mb-4">
                  <FiShoppingCart className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mb-6">Add some products to get started</p>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Browse Products <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex gap-3 bg-white border border-gray-100 rounded-sm p-3 hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-sm overflow-hidden bg-gray-50 flex-shrink-0">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                      {Object.keys(item.attributes).length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatAttributes(item.attributes)}
                        </p>
                      )}
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        ৳{item.price.toFixed(0)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <QuantitySelector
                          quantity={item.quantity}
                          onChange={(qty) => updateQuantity(item.variantId, qty)}
                          min={1}
                          max={item.stock}
                          size="sm"
                        />
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            ৳{(item.price * item.quantity).toFixed(0)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.variantId)}
                            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 mt-0.5"
                          >
                            <FiTrash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">৳{cartTotal.toFixed(0)}</span>
              </div>
              <p className="text-xs text-gray-400">Shipping calculated at checkout</p>
              <Link
                href="/cart"
                onClick={onClose}
                className="block w-full text-center bg-blue-600 text-white py-3 rounded-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full text-center bg-gray-900 text-white py-3 rounded-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}