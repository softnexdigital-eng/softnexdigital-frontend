"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  FaAward,
  FaStar,
  FaCheckCircle,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaWhatsapp,
  FaShoppingBag,
  FaHeart,
  FaLeaf,
} from "react-icons/fa";

interface HeroSectionProps {
  selectedVariant: any;
  selectedProduct: any;
  data: any;
  variants?: any[];
  productImage: string | null;
  allImages: string[];
  activeGallery: number;
  setActiveGallery: (i: number) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  roundToStep: (v: number) => number;
  QUANTITY_STEP: number;
  avgRating: number;
  reviewsCount: number;
  trustBar: any[];
  features: string[];
  variantDetails: string[];
  badge: string;
  tagline: string;
  addToCart: (id: string, qty?: number) => void;
  updateVariantAndProduct: (v: any) => void;
  toggleWishlist: (id: string) => void;
  cartLoadingItems: Set<string>;
  wishlistIds: Set<string>;
  isFreeDelivery: boolean;
  formatBanglaNum: (n: number | string) => string;
  formatBanglaDate: (d: Date) => string;
  bdDateObj: Date;
  primary: string;
  primaryDark: string;
  primaryMuted: string;
  primaryLight: string;
  orderNowLink: string;
  whatsappLink: string;
  whatsappVariantLink: (name: string) => string;
  heroWishlistBtnClass: string;
  onColorChange?: (color: string | null) => void;
  onVariantAttrsChange?: (attrs: {[key: string]: string}) => void;
}

// Helper to parse attribute values (could be JSON array or single string)
const parseAttributeValue = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    if (value.trim().startsWith("[") && value.trim().endsWith("]")) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    if (value.includes(",")) {
      return value.split(",").map(v => v.trim());
    }
    return [value];
  }
  return [];
};

// Helper to convert color name to hex (fallback)
const colorNameToHex = (name: string): string => {
  const map: {[key: string]: string} = {
    red: "#EF4444", blue: "#3B82F6", red: "#22C55E", red: "#EAB308",
    purple: "#A855F7", pink: "#EC4899", red: "#F97316", gray: "#6B7280",
    black: "#000000", white: "#FFFFFF", silver: "#C0C0C0", gold: "#f50b0b",
    navy: "#1E3A8A", teal: "#14B8A6", indigo: "#6366F1", rose: "#F43F5E",
    cyan: "#06B6D4", lime: "#84CC16", emerald: "#10B981", red: "#f50b0b", violet: "#8B5CF6",
  };
  return map[name.toLowerCase()] || name;
};

export default function HeroSection({
  selectedVariant,
  selectedProduct,
  data,
  variants: propVariants,
  productImage,
  allImages,
  activeGallery,
  setActiveGallery,
  quantity,
  setQuantity,
  roundToStep,
  QUANTITY_STEP,
  avgRating,
  reviewsCount,
  trustBar,
  features,
  variantDetails,
  badge,
  tagline,
  addToCart,
  updateVariantAndProduct,
  toggleWishlist,
  cartLoadingItems,
  wishlistIds,
  isFreeDelivery,
  formatBanglaNum,
  formatBanglaDate,
  bdDateObj,
  primary,
  primaryDark,
  primaryMuted,
  primaryLight,
  orderNowLink,
  whatsappLink,
  whatsappVariantLink,
  heroWishlistBtnClass,
  onColorChange,
  onVariantAttrsChange,
}: HeroSectionProps) {
  const allVariants = propVariants || data?.variants || [];
  
  // Filter variants to only include those belonging to the currently selected product
  const variants = useMemo(() => {
    if (!selectedProduct?.id) return allVariants;
    return allVariants.filter(v => v.productId === selectedProduct.id);
  }, [allVariants, selectedProduct]);

  const name = selectedProduct?.name || data?.product?.name || data?.name || "আমাদের পণ্য";
  const description =
    selectedProduct?.description ||
    data?.product?.description ||
    data?.description ||
    "আমাদের পণ্য তৈরি করা হয় ঐতিহ্যবাহী পদ্ধতিতে। কোনো প্রকার কেমিক্যাল বা প্রিজারভেটিভ ব্যবহার করা হয় না। সম্পূর্ণ প্রাকৃতিক ও পুষ্টিগুণ সমৃদ্ধ।";

  // Determine if attributes use array/multi-value format
  const hasArrayAttributes = useMemo(() => {
    if (variants.length === 0) return false;
    const sourceVariant = selectedVariant || variants[0];
    const firstAttrs = sourceVariant?.attributes || {};
    for (const key of Object.keys(firstAttrs)) {
      const val = firstAttrs[key];
      if (Array.isArray(val)) return true;
      if (typeof val === "string" && val.trim().startsWith("[") && val.trim().endsWith("]")) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) return true;
        } catch {}
      }
    }
    return false;
  }, [variants, selectedVariant]);

  // Build attribute options for classic single-value selector
  const attributeMap: {[key: string]: Set<string>} = {};
  if (!hasArrayAttributes) {
    variants.forEach((v: any) => {
      const attrs = v.attributes || {};
      Object.keys(attrs).forEach(key => {
        if (!attributeMap[key]) attributeMap[key] = new Set();
        const val = attrs[key];
        if (typeof val === "string" && !val.startsWith("[")) {
          attributeMap[key].add(val);
        } else if (typeof val === "string" && val.startsWith("[")) {
          try {
            const arr = JSON.parse(val);
            if (Array.isArray(arr)) arr.forEach(item => attributeMap[key].add(item));
          } catch {}
        } else if (typeof val === "string") {
          attributeMap[key].add(val);
        }
      });
    });
  }

  const attributeTypes = Object.keys(attributeMap).sort();
  const attributeOptions: {[key: string]: string[]} = {};
  attributeTypes.forEach(key => {
    attributeOptions[key] = Array.from(attributeMap[key]).sort();
  });

  // Local state for selected attributes (single-value mode)
  const [localAttrs, setLocalAttrs] = useState<{[key: string]: string}>({});
  const prevSelectedVariantRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasArrayAttributes && selectedVariant && variants.length > 0) {
      if (prevSelectedVariantRef.current === selectedVariant.id) return;
      prevSelectedVariantRef.current = selectedVariant.id;
      
      const attrs = selectedVariant.attributes || {};
      const singleAttrs: {[key: string]: string} = {};
      Object.keys(attrs).forEach(key => {
        const val = attrs[key];
        if (typeof val === "string" && !val.startsWith("[")) {
          singleAttrs[key] = val;
        } else if (typeof val === "string" && val.startsWith("[")) {
          try {
            const arr = JSON.parse(val);
            if (Array.isArray(arr) && arr.length > 0) singleAttrs[key] = arr[0];
          } catch {}
        }
      });
      setLocalAttrs(singleAttrs);
    } else if (!hasArrayAttributes && variants.length > 0 && variants[0]?.attributes) {
      const firstAttrs = variants[0].attributes || {};
      const singleAttrs: {[key: string]: string} = {};
      Object.keys(firstAttrs).forEach(key => {
        const val = firstAttrs[key];
        if (typeof val === "string" && !val.startsWith("[")) {
          singleAttrs[key] = val;
        } else if (typeof val === "string" && val.startsWith("[")) {
          try {
            const arr = JSON.parse(val);
            if (Array.isArray(arr) && arr.length > 0) singleAttrs[key] = arr[0];
          } catch {}
        }
      });
      setLocalAttrs(singleAttrs);
    } else {
      setLocalAttrs({});
    }
  }, [selectedVariant, variants, hasArrayAttributes]);

  // Handle attribute selection (single-value mode)
  const handleAttributeSelect = (attrKey: string, value: string) => {
    const newAttrs = { ...localAttrs, [attrKey]: value };
    setLocalAttrs(newAttrs);

    const matchingVariant = variants.find((v: any) => {
      const vAttrs = v.attributes || {};
      return Object.keys(newAttrs).every(key => {
        const vVal = vAttrs[key];
        if (typeof vVal === "string" && !vVal.startsWith("[")) {
          return vVal === newAttrs[key];
        } else if (typeof vVal === "string" && vVal.startsWith("[")) {
          try {
            const arr = JSON.parse(vVal);
            return Array.isArray(arr) && arr.includes(newAttrs[key]);
          } catch {
            return false;
          }
        }
        return false;
      });
    });

    if (matchingVariant) {
      updateVariantAndProduct(matchingVariant);
    }
  };

  const isAttributeValueAvailable = (attrKey: string, value: string) => {
    const otherSelections = { ...localAttrs };
    delete otherSelections[attrKey];
    return variants.some((v: any) => {
      const vAttrs = v.attributes || {};
      return (
        Object.keys(otherSelections).every(key => {
          const vVal = vAttrs[key];
          if (typeof vVal === "string" && !vVal.startsWith("[")) {
            return vVal === otherSelections[key];
          } else if (typeof vVal === "string" && vVal.startsWith("[")) {
            try {
              const arr = JSON.parse(vVal);
              return Array.isArray(arr) && arr.includes(otherSelections[key]);
            } catch {
              return false;
            }
          }
          return false;
        }) &&
        (() => {
          const vVal = vAttrs[attrKey];
          if (typeof vVal === "string" && !vVal.startsWith("[")) {
            return vVal === value;
          } else if (typeof vVal === "string" && vVal.startsWith("[")) {
            try {
              const arr = JSON.parse(vVal);
              return Array.isArray(arr) && arr.includes(value);
            } catch {
              return false;
            }
          }
          return false;
        })()
      );
    });
  };

  const showAttributeSelector = !hasArrayAttributes && attributeTypes.length > 0 && variants.length > 1;

  // Multi-value attributes: display as selectable tags/swatches
  const [selectedMultiAttrs, setSelectedMultiAttrs] = useState<{[key: string]: string}>({});
  const prevMultiVariantRef = useRef<string | null>(null);

  useEffect(() => {
    if (hasArrayAttributes && selectedVariant && selectedVariant.id !== prevMultiVariantRef.current) {
      prevMultiVariantRef.current = selectedVariant.id;
      const attrs = selectedVariant.attributes || {};
      const first: {[key: string]: string} = {};
      Object.keys(attrs).forEach(key => {
        const val = attrs[key];
        const parsed = Array.isArray(val) ? val : (typeof val === "string" && val.startsWith("[") ? (() => { try { return JSON.parse(val); } catch { return []; } })() : [val]);
        if (Array.isArray(parsed) && parsed.length > 0) first[key] = parsed[0];
      });
      setSelectedMultiAttrs(first);
    }
  }, [hasArrayAttributes, selectedVariant]);

  // Notify parent of selected attribute values (multi-value mode)
  useEffect(() => {
    if (hasArrayAttributes && selectedMultiAttrs && Object.keys(selectedMultiAttrs).length > 0) {
      onVariantAttrsChange?.(selectedMultiAttrs);
    }
  }, [hasArrayAttributes, selectedMultiAttrs, onVariantAttrsChange]);

  // Notify parent of selected attribute values (single-value mode) on change
  useEffect(() => {
    if (!hasArrayAttributes && localAttrs && Object.keys(localAttrs).length > 0) {
      onVariantAttrsChange?.(localAttrs);
    }
  }, [hasArrayAttributes, localAttrs, onVariantAttrsChange]);

  const handleMultiAttrClick = (attrKey: string, value: string) => {
    const newAttrs = { ...selectedMultiAttrs, [attrKey]: value };
    
    setSelectedMultiAttrs(prev => {
      const current = prev[attrKey];
      const next = { ...prev, [attrKey]: value };
      if (current === value) delete next[attrKey];
      if (Object.keys(next).filter(k => k !== attrKey || next[k] !== undefined).length === 0) return prev;
      return next;
    });

    // Find matching variant and update product OUTSIDE setState to avoid
    // "Cannot update a component while rendering a different component" error
    if (Object.keys(newAttrs).length > 0) {
      const matching = variants.find(v => {
        const vAttrs = v.attributes || {};
        return Object.keys(newAttrs).every(key => {
          const vVal = vAttrs[key];
          const vArr = Array.isArray(vVal) ? vVal : (typeof vVal === "string" && vVal.startsWith("[") ? (() => { try { return JSON.parse(vVal); } catch { return []; } })() : [vVal]);
          return Array.isArray(vArr) && vArr.includes(newAttrs[key]);
        });
      });
      if (matching) {
        // Notify parent about color selection BEFORE updating variant
        // so currentColor persists and doesn't get overwritten to null
        if (attrKey.toLowerCase().includes('color') && onColorChange) {
          onColorChange(value);
        }
        updateVariantAndProduct(matching);
        return;
      }
    }

    // Notify parent about color selection for image matching
    if (attrKey.toLowerCase().includes('color') && onColorChange) {
      onColorChange(value);
    }
  };

  const renderMultiValueAttributes = () => {
    if (!selectedVariant && variants.length === 0) return null;
    const attrs = selectedVariant?.attributes || {};
    if (Object.keys(attrs).length === 0 && variants.length > 0 && selectedProduct?.id) {
      const fallback = variants.find((v: any) => v.productId === selectedProduct.id) || variants[0];
      Object.assign(attrs, fallback?.attributes || {});
    }
    const entries = Object.entries(attrs);
    if (entries.length === 0) return null;

    return (
      <div className="space-y-3 mb-4">
        {entries.map(([key, rawValue]) => {
          const values = parseAttributeValue(rawValue);
          if (values.length === 0) return null;
          const isColor = key.toLowerCase().includes("color");
          const currentSelected = selectedMultiAttrs[key];
          return (
            <div key={key}>
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">{key} :</div>
              <div className="flex flex-wrap gap-2">
                {values.map(val => {
                  const isSelected = currentSelected === val;
                  if (isColor) {
                    const bgColor = colorNameToHex(val);
                    return (
                      <button key={val} onClick={() => handleMultiAttrClick(key, val)}
                        className={`w-10 h-10 rounded-sm border-2 transition-all ${isSelected ? "ring-2 ring-offset-2 ring-primary scale-110" : "border-gray-300 hover:border-gray-400"}`}
                        style={{ background: bgColor, borderColor: isSelected ? primary : "transparent", boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${primary}` : "none" }} title={val}>
                        <span className="sr-only">{val}</span>
                      </button>
                    );
                  }
                  return (
                    <button key={val} onClick={() => handleMultiAttrClick(key, val)}
                      className={`px-3 py-1.5 text-xs font-semibold border rounded-sm transition-all ${isSelected ? "text-white border-transparent" : "text-gray-700 border-gray-300 bg-white"}`}
                      style={isSelected ? { background: primary, borderColor: primary } : {}}>
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* TRUST BAR */}
      {trustBar.length > 0 && (
        <div className="bg-white border border-gray-200 py-4 px-5" style={{ borderRadius: "14px" }}>
          <div className="flex flex-wrap items-center justify-around gap-4">
            {trustBar.map((s: any, i: number) => {
              const icons = [
                <FaStar key="s" className="text-amber-400 text-sm" />,
                <span key="u" className="text-base">👥</span>,
                <FaStar key="t" style={{ color: primary, fontSize: "13px" }} />,
                <FaStar key="l" className="text-amber-500 text-xs" />,
              ];
              const bgs = ["#fffbeb", "#ecfdf5", "#ecfdf5", "#f0f9ff"];
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 border border-gray-100" style={{ background: bgs[i % bgs.length], borderRadius: "10px" }}>
                    {icons[i % icons.length]}
                  </div>
                  <div>
                    <div className="font-black text-gray-800 text-xs sm:text-sm leading-tight">{s.value}</div>
                    <div className="text-[10px] text-gray-400">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HERO / PRODUCT DETAIL */}
      <div className="bg-white border border-gray-200" style={{ borderRadius: "14px" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="relative aspect-square mb-3 overflow-hidden" style={{ background: "#f8fafc", borderRadius: "14px" }}>
              {productImage ? (
                <img src={allImages[activeGallery] || productImage} alt={name} className="w-full h-full object-contain p-4 transition-all duration-500 hover:scale-105" style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.10))" }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaLeaf className="text-gray-300 text-6xl" />
                </div>
              )}
              {selectedVariant && (
                <div className="absolute top-3 right-3 w-12 h-12 flex flex-col items-center justify-center text-white text-center shadow-lg" style={{ background: "#F59E0B", borderRadius: "10px" }}>
                  <div className="text-sm font-black leading-none">১০%</div>
                  <div className="text-[8px] font-bold opacity-90">ছাড়</div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white border border-gray-200 px-2 py-1 text-[10px] font-bold text-gray-700 shadow-sm" style={{ borderRadius: "8px" }}>
                <span className="w-1.5 h-1.5 bg-rose-500 animate-pulse" style={{ borderRadius: "4px" }} />
                {formatBanglaDate(bdDateObj)}
              </div>
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveGallery(i)} className="flex-shrink-0 w-14 h-14 border-2 overflow-hidden transition-all" style={{ borderColor: activeGallery === i ? primary : "#e5e7eb", borderRadius: "10px" }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-5 sm:p-7 flex flex-col">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 mb-3 w-fit" style={{ background: primaryLight, color: primary, border: `1px solid ${primary}30`, borderRadius: "8px" }}>
              <FaAward className="text-[10px]" /> {badge}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1.5 leading-tight">{name}</h1>
            <p className="text-sm font-bold mb-3" style={{ color: "#6B7280" }}>{tagline}</p>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <div className="flex gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <FaStar key={i} className={i < Math.round(avgRating) ? "text-amber-400" : "text-gray-200"} style={{ fontSize: "13px" }} />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-600">{avgRating.toFixed(1)}/৫</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-500">{reviewsCount} রিভিউ</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-500">২০০+ বিক্রি</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{description}</p>

            {/* ATTRIBUTE DISPLAY */}
            {hasArrayAttributes ? (
              renderMultiValueAttributes()
            ) : (
              showAttributeSelector && (
                <div className="mb-4 space-y-3">
                  {attributeTypes.map(attrKey => {
                    const options = attributeOptions[attrKey] || [];
                    const currentValue = localAttrs[attrKey] || "";
                    const isColor = attrKey.toLowerCase().includes("color");
                    return (
                      <div key={attrKey}>
                        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">{attrKey} :</div>
                        <div className="flex flex-wrap gap-2">
                          {options.map(val => {
                            const isSelected = val === currentValue;
                            const isAvailable = isAttributeValueAvailable(attrKey, val);
                            if (isColor) {
                              const bgColor = colorNameToHex(val);
                              return (
                                <button key={val} onClick={() => handleAttributeSelect(attrKey, val)} disabled={!isAvailable}
                                  className={`w-10 h-10 border-2 transition-all ${isSelected ? "ring-2 ring-offset-2 ring-primary scale-110" : "border-gray-300 hover:border-gray-400"} ${!isAvailable ? "opacity-40 cursor-not-allowed" : ""}`}
                                  style={{ background: bgColor, borderColor: isSelected ? primary : "transparent", boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${primary}` : "none", borderRadius: "10px" }} title={val}>
                                  <span className="sr-only">{val}</span>
                                </button>
                              );
                            }
                            return (
                              <button key={val} onClick={() => handleAttributeSelect(attrKey, val)} disabled={!isAvailable}
                                className={`px-3 py-1.5 text-xs font-semibold border transition-all ${isSelected ? "text-white border-transparent" : "text-gray-700 border-gray-300 bg-white"} ${isAvailable ? "hover:border-gray-400 hover:bg-gray-50" : "opacity-40 cursor-not-allowed"}`}
                                style={isSelected ? { background: primary, borderColor: primary, borderRadius: "8px" } : { borderRadius: "8px" }}>
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
            {/* END ATTRIBUTE DISPLAY */}

            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {features.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <FaCheckCircle style={{ color: primary, fontSize: "11px", flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>

            {selectedVariant && (
              <div className="flex items-center gap-3 mb-4 p-3 border-l-4" style={{ background: primaryMuted, borderColor: primary, borderRadius: "10px" }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-700 truncate">{selectedProduct?.name || name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {Object.values(selectedVariant.attributes || {}).map(v => {
                      if (Array.isArray(v)) return v.join(" / ");
                      if (typeof v === "string" && v.startsWith("[")) {
                        try { const parsed = JSON.parse(v); if (Array.isArray(parsed)) return parsed.join(" / "); } catch {}
                        return v;
                      }
                      return v;
                    }).join(" / ")}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black" style={{ color: primary }}>৳{selectedVariant.price.toFixed(0)}</span>
                  <div className="text-sm text-gray-400 line-through">৳{Math.round(selectedVariant.price * 1.15)}</div>
                </div>
                {isFreeDelivery && (
                  <div className="text-xs font-bold px-2 py-1 text-rose-700" style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px" }}>
                    🎁 ফ্রি ডেলিভারি
                  </div>
                )}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">পরিমাণ</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setQuantity(roundToStep(Math.max(QUANTITY_STEP, quantity - QUANTITY_STEP)))} className="w-11 h-11 flex items-center justify-center border-2 transition-all" style={{ borderColor: "#d1fae5", color: primary, borderRadius: "10px" }}>
                  <FaMinus className="text-lg" />
                </button>
                <input type="number" min={QUANTITY_STEP} step={QUANTITY_STEP} value={quantity} onChange={e => setQuantity(roundToStep(Math.max(QUANTITY_STEP, Number(e.target.value) || QUANTITY_STEP)))} className="w-24 h-11 text-center text-lg font-bold border-2 border-gray-200 bg-white focus:outline-none" style={{ borderRadius: "10px", borderColor: "#E5E7EB" }} />
                <button type="button" onClick={() => setQuantity(roundToStep(Math.min(selectedVariant?.stock || 99, quantity + QUANTITY_STEP)))} className="w-11 h-11 flex items-center justify-center border-2 transition-all" style={{ borderColor: "#d1fae5", color: primary, borderRadius: "10px" }}>
                  <FaPlus className="text-lg" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-2">
             <a 
  href={orderNowLink} 
  className="flex-1 flex items-center justify-center gap-2 text-white font-extrabold py-2.5 px-4 shadow-md hover:shadow-lg transition-all duration-200 text-sm active:scale-[0.985] hover:opacity-95"
  style={{ background: "#F59E0B", borderRadius: "10px" }}
>
  <FaShoppingCart className="text-base" /> এখনই কিনুন
</a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#22c35e] text-white font-bold py-2.5 shadow-lg transition-all duration-200 text-sm active:scale-[0.985]" style={{ borderRadius: "10px" }}>
                <FaWhatsapp className="text-lg" /> হোয়াটসঅ্যাপে কিনুন
              </a>
              <button onClick={() => { if (selectedVariant) addToCart(selectedVariant.id, 1); }} disabled={!selectedVariant || cartLoadingItems.has(selectedVariant?.id || "")}
                className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-2.5 shadow-lg transition-all duration-200 text-sm active:scale-[0.985]"
                style={{ background: primary, borderRadius: "10px" }}>
                <FaShoppingBag className="text-base" />
                {cartLoadingItems.has(selectedVariant?.id || "") ? "..." : "কার্টে যোগ করুন"}
              </button>
              <button onClick={heroWishlistBtnClass ? () => { if (selectedVariant) toggleWishlist(selectedVariant.id); } : undefined} className={heroWishlistBtnClass}>
                <FaHeart className={`text-xl transition-colors ${selectedVariant && wishlistIds.has(selectedVariant.id) ? "text-red-500" : "text-gray-400"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}