"use client";

import { FaHeart, FaTimes as FaTimesIcon, FaShoppingBag, FaTrash, FaLeaf } from "react-icons/fa";
import type { Variant } from "@/types";
import { formatAttributes } from "@/lib/attrUtils";

interface WishlistDrawerProps {
  open: boolean;
  onClose: () => void;
  wishlistData: any[];
  wishlistLoading: boolean;
  addToCart: (id: string, qty?: number) => void;
  toggleWishlist: (id: string) => void;
  scrollToOrder: () => void;
  primary: string;
}

export default function WishlistDrawer({ open, onClose, wishlistData, wishlistLoading, addToCart, toggleWishlist, scrollToOrder, primary }: WishlistDrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-10 overflow-y-auto">
        <div className="sticky top-0 bg-white flex justify-between items-center p-5 border-b z-10">
          <h2 className="text-lg font-black text-gray-800 flex items-center gap-2"><FaHeart className="text-red-500" /> উইশলিস্ট ({wishlistData.length})</h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 flex items-center justify-center rounded-sm"><FaTimesIcon className="text-gray-600" /></button>
        </div>
        <div className="p-4">
          {wishlistLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin h-7 w-7 border-2 border-red-500 border-t-transparent rounded-sm" /></div>
          ) : wishlistData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaHeart className="text-5xl mx-auto mb-3 text-gray-200" />
              <p className="font-bold">আপনার উইশলিস্ট খালি</p>
              <p className="text-xs mt-1">পছন্দের পণ্য উইশলিস্টে যোগ করুন</p>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlistData.map((item: any, i: number) => {
                const v = item.variant;
                const p = v?.product;
                const attrLabel = v?.attributes ? formatAttributes(v.attributes, ", ") : "";
                return (
                  <div key={item.id || i} className="flex gap-3 p-3 border border-gray-100 rounded-sm hover:bg-white transition-colors">
                    {v?.image ? <img src={v.image} alt="" className="w-16 h-16 object-cover rounded-sm border border-gray-100" /> : <div className="w-16 h-16 bg-gray-50 flex items-center justify-center rounded-sm"><FaLeaf className="text-gray-300" /></div>}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-gray-800 truncate">{p?.name || "পণ্য"}</div>
                      <div className="text-xs text-gray-500 truncate">{attrLabel}</div>
                      <div className="font-black text-red-600 mt-1">৳{v?.price || 0}</div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => { if (v?.id) addToCart(v.id, 1); }} disabled={v?.stock <= 0} className="flex-1 text-xs font-bold text-white bg-white0 hover:bg-red-600 py-1.5 px-3 rounded-sm disabled:opacity-50">
                          {v?.stock <= 0 ? "স্টক শেষ" : "কার্টে যোগ করুন"}
                        </button>
                        <button onClick={() => { if (v?.id) toggleWishlist(v.id); }} className="text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 py-1.5 px-3 rounded-sm">
                          <FaTrash className="inline mr-1" />সরান
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {wishlistData.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t p-4">
            <button onClick={() => { onClose(); scrollToOrder(); }} className="w-full text-white font-bold py-3 rounded-sm" style={{ background: primary }}>সব পণ্য অর্ডার করুন</button>
          </div>
        )}
      </div>
    </div>
  );
}