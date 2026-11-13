"use client";

import { FaShoppingCart, FaTimes, FaMinus, FaPlus, FaRegTrashAlt, FaRegImage } from "react-icons/fa";
import { normalizeAttributes } from "@/lib/variants";

interface CartDrawerItem {
  id?: string;
  quantity: number;
  variant: {
    id: string;
    productId?: string;
    image?: string;
    price?: number;
    attributes?: Record<string, unknown>;
    product?: { id?: string; name?: string };
  };
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cartData: { items?: CartDrawerItem[] } | null;
  cartCount: number;
  updateCartQty: (variantId: string, qty: number) => void;
  removeFromCart: (variantId: string) => void;
  setIsCartOrder: (v: boolean) => void;
  setSelectedCartItems: (s: Set<string>) => void;
  scrollToOrder: () => void;
  onInitiateCheckout: (items: { productId: string; quantity: number }[]) => void;
  primary: string;
}

export default function CartDrawer({
  open,
  onClose,
  cartData,
  cartCount,
  updateCartQty,
  removeFromCart,
  setIsCartOrder,
  setSelectedCartItems,
  scrollToOrder,
  onInitiateCheckout,
  primary,
}: CartDrawerProps) {
  if (!open) return null;

  const cartItems = cartData?.items ?? [];
  const isEmpty = cartItems.length === 0;
  const total = cartItems.reduce((sum, ci) => sum + (ci.variant.price || 0) * ci.quantity, 0);

  const handleCheckout = () => {
    const items = cartItems.flatMap((item) => {
      const productId = item.variant.product?.id || item.variant.productId;
      return productId ? [{ productId, quantity: item.quantity }] : [];
    });
    onInitiateCheckout(items);
    onClose();
    setIsCartOrder(true);
    const allIds = new Set<string>(cartItems.map((item) => item.variant.id));
    setSelectedCartItems(allIds);
    setTimeout(scrollToOrder, 200);
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="শপিং কার্ট">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">শপিং কার্ট</h2>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ background: `${primary}14`, color: primary }}
            >
              {cartCount}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 active:scale-95"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div
                className="mb-4 flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: `${primary}0F`, color: primary }}
              >
                <FaShoppingCart className="text-3xl" />
              </div>
              <p className="text-base font-bold text-gray-800">আপনার কার্ট খালি</p>
              <p className="mt-1.5 max-w-[240px] text-sm text-gray-500">
                পণ্য যোগ করতে &quot;কার্টে যোগ করুন&quot; বাটনে ক্লিক করুন
              </p>
              <button
                onClick={onClose}
                className="mt-6 h-11 rounded-xl px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: primary }}
              >
                কেনাকাটা চালিয়ে যান
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {cartItems.map((cartItem, i) => {
                const v = cartItem.variant;
                const attrLabel = v?.attributes
                  ? Object.values(normalizeAttributes(v.attributes)).filter(Boolean).join(" / ")
                  : "";
                const lineTotal = (v?.price || 0) * cartItem.quantity;
                return (
                  <li
                    key={cartItem.id || i}
                    className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                  >
                    {v?.image ? (
                      <img
                        src={v.image}
                        alt={v?.product?.name || ""}
                        className="h-[72px] w-[72px] flex-shrink-0 rounded-lg border border-gray-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-300">
                        <FaRegImage className="text-xl" />
                      </div>
                    )}

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-gray-900">
                            {v?.product?.name || "পণ্য"}
                          </div>
                          {attrLabel && <div className="mt-0.5 truncate text-xs text-gray-500">{attrLabel}</div>}
                        </div>
                        <button
                          onClick={() => removeFromCart(v.id)}
                          aria-label="সরান"
                          className="-mr-1 -mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <FaRegTrashAlt className="text-sm" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-gray-200">
                          <button
                            onClick={() => updateCartQty(v.id, cartItem.quantity - 1)}
                            aria-label="কমান"
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50 active:bg-gray-100"
                          >
                            <FaMinus className="text-[10px]" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-900">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(v.id, cartItem.quantity + 1)}
                            aria-label="বাড়ান"
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50 active:bg-gray-100"
                          >
                            <FaPlus className="text-[10px]" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold" style={{ color: primary }}>
                            ৳{lineTotal}
                          </div>
                          {cartItem.quantity > 1 && (
                            <div className="text-[11px] text-gray-400">প্রতিটি ৳{v?.price || 0}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div
            className="border-t border-gray-100 bg-white px-4 pt-4 sm:px-5"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">সর্বমোট</span>
              <span className="text-xl font-extrabold text-gray-900">৳{total}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="h-12 w-full rounded-xl text-base font-bold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.99]"
              style={{ background: primary }}
            >
              অর্ডার সম্পন্ন করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
