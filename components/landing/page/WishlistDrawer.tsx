"use client";

import { FaHeart, FaTimes, FaRegTrashAlt, FaRegImage } from "react-icons/fa";
import { normalizeAttributes } from "@/lib/variants";

interface WishlistDrawerProps {
  open: boolean;
  onClose: () => void;
  wishlistData: Array<{
    id?: string;
    variantId?: string;
    variant?: {
      id?: string;
      image?: string | null;
      price?: number;
      stock?: number;
      attributes?: Record<string, unknown> | null;
      product?: { id?: string; name?: string };
    } | null;
  }>;
  wishlistLoading: boolean;
  addToCart: (id: string, qty?: number) => void;
  toggleWishlist: (id: string) => void;
  scrollToOrder: () => void;
  primary: string;
}

export default function WishlistDrawer({
  open,
  onClose,
  wishlistData,
  wishlistLoading,
  addToCart,
  toggleWishlist,
  scrollToOrder,
  primary,
}: WishlistDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="উইশলিস্ট">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">উইশলিস্ট</h2>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ background: `${primary}14`, color: primary }}
            >
              {wishlistData.length}
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
          {wishlistLoading ? (
            <div className="flex justify-center py-16">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: primary, borderTopColor: "transparent" }}
              />
            </div>
          ) : wishlistData.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                <FaHeart className="text-3xl" />
              </div>
              <p className="text-base font-bold text-gray-800">আপনার উইশলিস্ট খালি</p>
              <p className="mt-1.5 text-sm text-gray-500">পছন্দের পণ্য উইশলিস্টে যোগ করুন</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {wishlistData.map((item, i) => {
                const v = item.variant;
                const p = v?.product;
                const attrLabel = v?.attributes
                  ? Object.values(normalizeAttributes(v.attributes)).filter(Boolean).join(" / ")
                  : "";
                const outOfStock = (v?.stock ?? 0) <= 0;
                return (
                  <li
                    key={item.id || i}
                    className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                  >
                    {v?.image ? (
                      <img
                        src={v.image}
                        alt={p?.name || ""}
                        className="h-[72px] w-[72px] flex-shrink-0 rounded-lg border border-gray-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-300">
                        <FaRegImage className="text-xl" />
                      </div>
                    )}

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="truncate text-sm font-semibold text-gray-900">{p?.name || "পণ্য"}</div>
                      {attrLabel && <div className="mt-0.5 truncate text-xs text-gray-500">{attrLabel}</div>}
                      <div className="mt-1 text-sm font-bold" style={{ color: primary }}>
                        ৳{v?.price || 0}
                      </div>

                      <div className="mt-2.5 flex gap-2">
                        <button
                          onClick={() => {
                            if (v?.id) addToCart(v.id, 1);
                          }}
                          disabled={outOfStock}
                          className="h-10 flex-1 rounded-lg px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                          style={outOfStock ? undefined : { background: primary }}
                        >
                          {outOfStock ? "স্টক শেষ" : "কার্টে যোগ করুন"}
                        </button>
                        <button
                          onClick={() => {
                            if (v?.id) toggleWishlist(v.id);
                          }}
                          aria-label="সরান"
                          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        >
                          <FaRegTrashAlt className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {wishlistData.length > 0 && (
          <div
            className="border-t border-gray-100 bg-white px-4 pt-4 sm:px-5"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <button
              onClick={() => {
                onClose();
                scrollToOrder();
              }}
              className="h-12 w-full rounded-xl text-base font-bold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.99]"
              style={{ background: primary }}
            >
              সব পণ্য অর্ডার করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
