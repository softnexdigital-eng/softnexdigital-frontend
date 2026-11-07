"use client";

import { FaShoppingCart, FaTimes as FaTimesIcon, FaMinus, FaPlus, FaTrash, FaLeaf } from "react-icons/fa";
import { formatAttributes } from "@/lib/attrUtils";

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
  setViewMode: (mode: "home" | "detail") => void;
  onInitiateCheckout: (items: { productId: string; quantity: number }[]) => void;
  primary: string;
}

export default function CartDrawer({ open, onClose, cartData, cartCount, updateCartQty, removeFromCart, setIsCartOrder, setSelectedCartItems, scrollToOrder, setViewMode, onInitiateCheckout, primary }: CartDrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-10 overflow-y-auto">
        <div className="sticky top-0 bg-white flex justify-between items-center p-5 z-10" style={{ borderBottom: `1px solid ${primary}20` }}>
          <h2 className="text-lg font-black text-gray-800 flex items-center gap-2"><FaShoppingCart style={{ color: primary }} /> শপিং কার্ট ({cartCount})</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-sm transition-all duration-200 hover:opacity-80" style={{ background: `${primary}10`, color: primary }}><FaTimesIcon className="text-sm" /></button>
        </div>
        <div className="p-4">
          {!cartData || !cartData.items || cartData.items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaShoppingCart className="text-5xl mx-auto mb-3" style={{ color: `${primary}30` }} />
              <p className="font-bold">আপনার কার্ট খালি</p>
              <p className="text-xs mt-1">পণ্য যোগ করতে &quot;কার্টে যোগ করুন&quot; বাটনে ক্লিক করুন</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cartData.items.map((cartItem, i) => {
                const v = cartItem.variant;
                const attrLabel = v?.attributes ? formatAttributes(v.attributes, ", ") : "";
                const lineTotal = (v?.price || 0) * cartItem.quantity;
                return (
                  <div key={cartItem.id || i} className="flex gap-3 p-3 rounded-sm transition-all duration-200 hover:shadow-sm" style={{ border: `1px solid ${primary}15`, background: `${primary}02` }}>
                    {v?.image ? <img src={v.image} alt="" className="w-16 h-16 object-cover rounded-sm" style={{ border: `1px solid ${primary}15` }} /> : <div className="w-16 h-16 flex items-center justify-center rounded-sm" style={{ background: `${primary}08`, color: `${primary}30` }}><FaLeaf /></div>}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-gray-800 truncate">{v?.product?.name || "পণ্য"}</div>
                      <div className="text-xs text-gray-500 truncate">{attrLabel}</div>
                      <div className="font-black mt-1" style={{ color: primary }}>৳{v?.price || 0}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateCartQty(v.id, cartItem.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded-sm text-xs transition-all" style={{ border: `1px solid ${primary}30`, color: primary }}><FaMinus className="text-[10px]" /></button>
                        <span className="text-sm font-bold w-6 text-center">{cartItem.quantity}</span>
                        <button onClick={() => updateCartQty(v.id, cartItem.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-sm text-xs transition-all" style={{ border: `1px solid ${primary}30`, color: primary }}><FaPlus className="text-[10px]" /></button>
                        <button onClick={() => removeFromCart(v.id)} className="ml-auto text-xs transition-all hover:opacity-80" style={{ color: primary }}><FaTrash /></button>
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">মোট: ৳{lineTotal}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {cartData && cartData.items && cartData.items.length > 0 && (
          <div className="sticky bottom-0 bg-white p-4 space-y-2" style={{ borderTop: `1px solid ${primary}20` }}>
            <div className="flex justify-between font-bold text-sm">
              <span>সর্বমোট:</span>
              <span style={{ color: primary }}>৳{cartData.items.reduce((sum, ci) => sum + (ci.variant.price || 0) * ci.quantity, 0)}</span>
            </div>
            <button onClick={() => {
              const cartItems = cartData.items || [];
              const items = cartItems.flatMap((item) => {
                const productId = item.variant.product?.id || item.variant.productId;
                return productId ? [{ productId, quantity: item.quantity }] : [];
              });
              onInitiateCheckout(items);
              onClose();
              setIsCartOrder(true);
              const allIds = new Set<string>(cartItems.map((item) => item.variant.id));
              setSelectedCartItems(allIds);
              setViewMode("detail");
              setTimeout(scrollToOrder, 200);
            }} className="w-full text-white font-bold py-3 rounded-sm transition-all hover:opacity-90" style={{ background: primary }}>
              অর্ডার সম্পন্ন করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}