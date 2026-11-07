"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaLock, FaShoppingBag, FaMinus, FaPlus, FaTimes, FaCheckCircle, FaShieldAlt, FaTruck } from "react-icons/fa";
import { formatAttributes } from "@/lib/attrUtils";

interface OrderFormProps {
  isCartOrder: boolean;
  cartData: any;
  selectedCartItems: Set<string>;
  setSelectedCartItems: (s: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  selectedVariantAttrs: {[key: string]: string};
  selectedVariant: any;
  quantity: number;
  setQuantity: (q: number) => void;
  roundToStep: (v: number) => number;
  QUANTITY_STEP: number;
  variants: any[];
  couponCode: string;
  setCouponCode: (v: string) => void;
  appliedDiscount: number;
  validatingCoupon: boolean;
  validateAndApplyCoupon: (code: string) => void;
  orderLoading: boolean;
  cartOrderProcessing: boolean;
  onSubmitOrder: (data: any) => void;
  onCartOrderSubmit: (data: any) => void;
  register: any;
  errors: any;
  handleSubmit: any;
  switchToSingleProductOrder: () => void;
  reset: () => void;
  primary: string;
  primaryDark: string;
  primaryMuted: string;
  isFreeDelivery: boolean;
  deliveryCharge: number;
  cartItemVariants: {[key: string]: any[]};
  selectedItemAttrs: {[key: string]: {[key: string]: string}};
  setSelectedItemAttrs: (v: {[key: string]: {[key: string]: string}} | ((prev: {[key: string]: {[key: string]: string}}) => {[key: string]: {[key: string]: string}})) => void;
  updateCartItemVariant: (cartItemId: string, newVariantId: string) => void;
  allVariants: any[];
}

type OrderFormData = { customerName: string; customerPhone: string; customerAddress: string; customerEmail: string; notes: string; paymentMethod?: string; };

export default function OrderForm({
  isCartOrder, cartData, selectedCartItems, setSelectedCartItems, selectedVariantAttrs, selectedVariant, quantity, setQuantity,
  roundToStep, QUANTITY_STEP, variants, couponCode, setCouponCode, appliedDiscount, validatingCoupon,
  validateAndApplyCoupon, orderLoading, cartOrderProcessing, onSubmitOrder, onCartOrderSubmit,
  register, errors, handleSubmit, switchToSingleProductOrder, reset, primary, primaryDark, primaryMuted,
  isFreeDelivery, deliveryCharge, cartItemVariants, selectedItemAttrs, setSelectedItemAttrs, updateCartItemVariant,
}: OrderFormProps) {
  const handleCartItemToggle = (variantId: string, checked: boolean) => {
    setSelectedCartItems((prev: Set<string>) => {
      const newSet = new Set(prev);
      checked ? newSet.add(variantId) : newSet.delete(variantId);
      return newSet;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findMatch = (productId: string, attrs: {[key: string]: string}, src: any[]) => {
    const pool = src.length > 0 ? src : Object.values(cartItemVariants).flat();
    return pool.find((v: any) => {
      const vAttrs = v.attributes || {};
      return Object.entries(attrs).every(([k, v2]) => {
        const a = vAttrs[k];
        const vals = Array.isArray(a) ? a : (typeof a === 'string' && a.startsWith('[') ? (() => { try { return JSON.parse(a); } catch { return [a]; } })() : [a]);
        return vals.includes(v2);
      });
    });
  };

  return (
    <div className="bg-white border border-gray-200 overflow-hidden rounded-sm shadow-md">
      <div className="p-4 sm:p-5 border-b border-gray-100 rounded-sm" style={{ background: `linear-gradient(135deg,${primary},${primaryDark})` }}>
        <div className="flex justify-between items-center">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <FaLock className="text-white text-xs" />
            {isCartOrder ? "কার্টের পণ্য নির্বাচন করুন" : "অর্ডার করতে ফর্ম পূরণ করুন"}
          </h2>
          {isCartOrder && (
            <button onClick={switchToSingleProductOrder} className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-sm transition-all">
              একক পণ্য অর্ডারে যান
            </button>
          )}
        </div>
        <p className="text-white/60 text-xs mt-0.5">
          {isCartOrder ? "পণ্যের পাশের চেকবক্স ব্যবহার করে অর্ডার থেকে বাদ দিন / যুক্ত করুন" : "ক্যাশ অন ডেলিভারি — পণ্য পেয়ে টাকা দিন"}
        </p>
      </div>
      <div className="p-5 sm:p-7">
        {isCartOrder && cartData?.items?.length > 0 && (
          <div className="mb-5 space-y-2 max-h-96 overflow-y-auto rounded-sm p-2" style={{ border: `1px solid ${primary}20`, background: `${primary}03` }}>
            <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2 px-1">
              <FaShoppingBag style={{ color: primary }} />
              কার্টের পণ্যসমূহ (টিক চিহ্ন দিয়ে অর্ডার করার জন্য নির্বাচন করুন)
            </div>
            {cartData.items.map((cartItem: any, idx: number) => {
              const variant = cartItem.variant;
              const itemId = cartItem.id || idx;
              const attrLabel = variant?.attributes ? formatAttributes(variant.attributes, ", ") : "";
              const isChecked = selectedCartItems.has(variant.id);
              const currentAttrs = selectedItemAttrs[itemId] || {};
              const productId = variant?.product?.id || variant?.productId;
              // Get all variants for this product to show attribute options
              const productVariants = variants.filter((v: any) => (v.productId === productId) || (v.product?.id === productId));
              const fallbackVariants = Object.values(cartItemVariants).flat() as any[];
              const availableVariants = productVariants.length > 0 ? productVariants : fallbackVariants.filter((v: any) => (v.productId === productId) || (v.product?.id === productId));
              
              return (
                <label key={idx} className="flex items-start gap-3 p-3 rounded-sm transition-all duration-200 cursor-pointer" style={{ border: isChecked ? `1px solid ${primary}50` : '1px solid #f0f0f0', background: isChecked ? `${primary}06` : '#fafafa' }}>
                  <input type="checkbox" checked={isChecked} onChange={e => handleCartItemToggle(variant.id, e.target.checked)} className="mt-1 w-4 h-4 rounded-sm focus:ring-2" style={{ accentColor: primary }} />
                  {variant?.image && <img src={variant.image} alt="" className="w-12 h-12 object-cover rounded-sm border border-gray-100 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-800">{variant?.product?.name || "পণ্য"}</div>
                    
                    {/* Attribute selectors */}
                    {(() => {
                      const attrEntries = Object.entries(variant?.attributes || {});
                      const selectableKeys = attrEntries.filter(([, val]) => {
                        const vals = Array.isArray(val) ? val : (typeof val === 'string' && val.startsWith('[') ? (() => { try { return JSON.parse(val); } catch { return [val]; } })() : [val]);
                        return vals.length > 1;
                      });
                      if (selectableKeys.length === 0) return null;
                      return (
                        <div className="mt-2 space-y-1.5">
                          {selectableKeys.map(([key, val]) => {
                            const allVals = new Set<string>();
                            availableVariants.forEach((v: any) => {
                              const a = v.attributes?.[key];
                              const vals = Array.isArray(a) ? a : (typeof a === 'string' && a.startsWith('[') ? (() => { try { return JSON.parse(a); } catch { return [a]; } })() : [a]);
                              vals.forEach((x: any) => allVals.add(typeof x === 'string' ? x : JSON.stringify(x)));
                            });
                            return (
                              <div key={key} className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">{key}:</span>
                                <div className="flex gap-1 flex-wrap">
                                  {Array.from(allVals).map((opt) => {
                                    const isSelected = currentAttrs[key] === opt;
                                    return (
                                        <button key={opt} type="button" onClick={() => {
                                        const newAttrs = { ...currentAttrs, [key]: opt };
                                        setSelectedItemAttrs(prev => ({ ...prev, [itemId]: newAttrs }));
                                        const matched = findMatch(productId, newAttrs, availableVariants);
                                        if (matched && matched.id !== variant.id) {
                                          // Remove old variant from selection, add new one
                                          setSelectedCartItems(prev => {
                                            const next = new Set(prev);
                                            next.delete(variant.id);
                                            next.add(matched.id);
                                            return next;
                                          });
                                          updateCartItemVariant(cartItem.id, matched.id);
                                        }
                                      }} className={`px-2 py-0.5 text-[10px] font-bold border rounded-sm transition-all ${isSelected ? 'text-white' : 'text-gray-600 hover:opacity-80'}`} style={isSelected ? { border: `1px solid ${primary}`, background: primary } : { border: '1px solid #e5e7eb', background: '#fff' }}>
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-black text-red-600">৳{variant?.price}</span>
                      <span className="text-xs text-gray-400">পরিমাণ: {cartItem.quantity}</span>
                    </div>
                  </div>
                </label>
              );
            })}
            {selectedCartItems.size === 0 && <div className="text-center text-xs text-red-500 py-2">অন্তত একটি পণ্য নির্বাচন করুন</div>}
          </div>
        )}

        <form onSubmit={handleSubmit(isCartOrder ? onCartOrderSubmit : onSubmitOrder)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black mb-1.5 text-gray-700">আপনার নাম *</label>
              <input {...register("customerName", { required: "নাম আবশ্যক" })} className="w-full px-3.5 py-2.5 text-sm border-2 bg-gray-50 transition-all rounded-sm" style={{ borderColor: errors.customerName ? "#ef4444" : "#e5e7eb" }} onFocus={e => e.target.style.borderColor = primary} onBlur={e => e.target.style.borderColor = errors.customerName ? "#ef4444" : "#e5e7eb"} placeholder="নাম লিখুন" />
              {errors.customerName && <p className="text-xs text-red-500 mt-1">⚠ {errors.customerName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-black mb-1.5 text-gray-700">মোবাইল নম্বর *</label>
              <input {...register("customerPhone", { required: "মোবাইল নম্বর আবশ্যক" })} className="w-full px-3.5 py-2.5 text-sm border-2 bg-gray-50 transition-all rounded-sm" style={{ borderColor: errors.customerPhone ? "#ef4444" : "#e5e7eb" }} onFocus={e => e.target.style.borderColor = primary} onBlur={e => e.target.style.borderColor = errors.customerPhone ? "#ef4444" : "#e5e7eb"} placeholder="01XXXXXXXXX" />
              {errors.customerPhone && <p className="text-xs text-red-500 mt-1">⚠ {errors.customerPhone.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-black mb-1.5 text-gray-700">ইমেইল <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span></label>
            <input {...register("customerEmail")} type="email" className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-200 bg-gray-50 transition-all rounded-sm" onFocus={e => e.target.style.borderColor = primary} onBlur={e => e.target.style.borderColor = "#e5e7eb"} placeholder="example@email.com" />
          </div>
          <div>
            <label className="block text-xs font-black mb-1.5 text-gray-700">ঠিকানা *</label>
            <textarea {...register("customerAddress", { required: "ঠিকানা আবশ্যক" })} rows={2} className="w-full px-3.5 py-2.5 text-sm resize-none border-2 bg-gray-50 transition-all rounded-sm" style={{ borderColor: errors.customerAddress ? "#ef4444" : "#e5e7eb" }} onFocus={e => e.target.style.borderColor = primary} onBlur={e => e.target.style.borderColor = errors.customerAddress ? "#ef4444" : "#e5e7eb"} placeholder="বাসা, রোড, এলাকা, থানা, জেলা" />
            {errors.customerAddress && <p className="text-xs text-red-500 mt-1">⚠ {errors.customerAddress.message}</p>}
          </div>

          {!isCartOrder && (
            <>
              <div>
                <label className="block text-xs font-black mb-1.5 text-gray-700">নির্বাচিত পণ্য</label>
                {selectedVariant ? (
                  <div className="flex items-center gap-3 p-3 border-2 rounded-sm" style={{ borderColor: `${primary}40`, background: `${primary}08` }}>
                    {selectedVariant.image && <img src={selectedVariant.image} alt="" className="w-14 h-14 object-cover rounded-sm border border-gray-200 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-gray-800 truncate">{selectedVariant?.product?.name || "পণ্য"}</div>
                      <div className="text-lg text-gray-500">
                        {Object.keys(selectedVariantAttrs).length > 0
                          ? Object.values(selectedVariantAttrs).join(" / ")
                          : formatAttributes(selectedVariant.attributes)}
                      </div>
                      <div className="font-black text-red-600 text-sm">৳{(selectedVariant.price * quantity).toFixed(0)}{quantity > 1 ? <span className="text-xs text-gray-500 ml-1">({quantity} পিস)</span> : ""}{selectedVariant.stock <= 0 ? <span className="text-red-500 text-xs ml-2">স্টক শেষ</span> : ""}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 border-2 border-dashed border-gray-200 rounded-sm text-xs text-gray-400 text-center">সাইজ ও কালার সিলেক্ট করুন</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-black mb-1.5 text-gray-700">পরিমাণ</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setQuantity(roundToStep(Math.max(QUANTITY_STEP, quantity - QUANTITY_STEP)))} className="w-10 h-10 font-bold text-lg flex items-center justify-center border-2 transition-all hover:bg-white rounded-sm" style={{ borderColor: `${primary}50`, color: primary }}><FaMinus className="text-xs" /></button>
                  <input type="number" min={QUANTITY_STEP} step={QUANTITY_STEP} value={quantity} onChange={e => setQuantity(roundToStep(Math.max(QUANTITY_STEP, Number(e.target.value) || QUANTITY_STEP)))} className="w-20 px-3 py-2 text-sm text-center font-bold border-2 border-gray-200 bg-gray-50 rounded-sm" />
                  <button type="button" onClick={() => setQuantity(roundToStep(Math.min(selectedVariant?.stock || 99, quantity + QUANTITY_STEP)))} className="w-10 h-10 font-bold text-lg flex items-center justify-center border-2 transition-all hover:bg-white rounded-sm" style={{ borderColor: `${primary}50`, color: primary }}><FaPlus className="text-xs" /></button>
                </div>
              </div>
            </>
          )}

          {/* <div>
            <label className="block text-xs font-black mb-1.5 text-gray-700">কুপন কোড <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span></label>
            <div className="flex gap-2">
              <input type="text" placeholder="WELCOME50 বা অন্য কুপন" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} onBlur={() => validateAndApplyCoupon(couponCode)} className="flex-1 px-3.5 py-2.5 text-sm border-2 border-gray-200 bg-gray-50 transition-all rounded-sm" onFocus={e => e.target.style.borderColor = primary} />
              <button type="button" onClick={() => validateAndApplyCoupon(couponCode)} disabled={validatingCoupon || !couponCode.trim()} className="px-4 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 rounded-sm" style={{ background: primary }}>
                {validatingCoupon ? "যাচাই..." : "প্রয়োগ"}
              </button>
            </div>
            {appliedDiscount > 0 && <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-sm"><p className="text-xs text-red-700 font-bold">✓ ছাড় প্রয়োগ করা হয়েছে: ৳{appliedDiscount.toFixed(0)}</p></div>}
          </div> */}
          <div>
            <label className="block text-xs font-black mb-1.5 text-gray-700">পেমেন্ট মেথড *</label>
            <label className="flex items-center gap-3 p-3 border-2 rounded-sm cursor-pointer" style={{ borderColor: `${primary}40`, background: `${primary}08` }}>
              <input
                type="radio"
                value="CASH_ON_DELIVERY"
                {...register("paymentMethod")}
                defaultChecked
                className="w-4 h-4"
                style={{ accentColor: primary }}
              />
              <div>
                <div className="text-sm font-bold text-gray-800">ক্যাশ অন ডেলিভারি</div>
                <div className="text-[11px] text-gray-500">পণ্য হাতে পেয়ে টাকা দিন</div>
              </div>
            </label>
          </div>
          <div>
            <label className="block text-xs font-black mb-1.5 text-gray-700">বিশেষ নির্দেশনা <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span></label>
            <textarea {...register("notes")} rows={2} className="w-full px-3.5 py-2.5 text-sm resize-none border-2 border-gray-200 bg-gray-50 transition-all rounded-sm" onFocus={e => e.target.style.borderColor = primary} onBlur={e => e.target.style.borderColor = "#e5e7eb"} placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন" />
          </div>
          <button type="submit" disabled={isCartOrder ? (cartOrderProcessing || selectedCartItems.size === 0) : (orderLoading || !selectedVariant || (selectedVariant?.stock ?? 0) <= 0)} className="w-full text-white font-black py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90 shadow-md rounded-sm" style={{ background: `linear-gradient(135deg,${primary},${primaryDark})` }}>
            {isCartOrder ? (cartOrderProcessing ? <span className="flex items-center justify-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white inline-block rounded-sm" /> অর্ডার করা হচ্ছে...</span> : `✅ নির্বাচিত ${selectedCartItems.size}টি পণ্য অর্ডার করুন`) : (orderLoading ? <span className="flex items-center justify-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white inline-block rounded-sm" /> অর্ডার করা হচ্ছে...</span> : "✅ অর্ডার নিশ্চিত করুন")}
          </button>
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><FaLock style={{ color: primary }} /> নিরাপদ</span>
            <span className="flex items-center gap-1"><FaShieldAlt style={{ color: primary }} /> গ্যারান্টিযুক্ত</span>
            <span className="flex items-center gap-1"><FaTruck style={{ color: primary }} /> দ্রুত ডেলিভারি</span>
          </div>
        </form>
      </div>
    </div>
  );
}