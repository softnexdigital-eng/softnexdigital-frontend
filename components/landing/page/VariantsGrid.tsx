"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  FaTag,
  FaAward,
  FaCheckCircle,
  FaShoppingBag,
  FaShoppingCart,
  FaWhatsapp,
  FaHeart,
  FaStar,
  FaFire,
  FaLeaf,
  FaSearch,
  FaThLarge,
  FaList,
  FaChevronLeft,
  FaChevronRight,
  FaBolt,
} from "react-icons/fa";
import type { Variant } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────
const parseAttributeValue = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    if (value.trim().startsWith("[") && value.trim().endsWith("]")) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    if (value.includes(",")) return value.split(",").map((v) => v.trim());
    return [value];
  }
  return [];
};

const colorNameToHex = (name: string): string => {
  const map: { [key: string]: string } = {
    red: "#EF4444", blue: "#3B82F6", orange: "#22C55E", yellow: "#EAB308",
    purple: "#A855F7", pink: "#EC4899",  gray: "#6B7280",
    black: "#111827", white: "#F9FAFB", silver: "#C0C0C0", gold: "#f50b0b",
    navy: "#1E3A8A", teal: "#14B8A6", indigo: "#6366F1", rose: "#F43F5E",
    cyan: "#06B6D4", lime: "#84CC16", emerald: "#10B981", violet: "#8B5CF6",
  };
  return map[name.toLowerCase()] || name;
};

const formatAttrLabel = (attrs: { [key: string]: any }): string => {
  if (!attrs) return "";
  return Object.values(attrs)
    .map((v) => {
      if (Array.isArray(v)) return v.join(" / ");
      if (typeof v === "string" && v.startsWith("[")) {
        try {
          const p = JSON.parse(v);
          if (Array.isArray(p)) return p.join(" / ");
        } catch {}
        return v;
      }
      return v;
    })
    .join(" · ");
};

// ─── Constants ────────────────────────────────────────────────
const GRID_THRESHOLD = 8;
const ITEMS_PER_PAGE = 12;

// ─── Props ────────────────────────────────────────────────────
interface VariantsGridProps {
  filteredVariants: Variant[];
  selectedVariant: Variant | null;
  selectedProduct: any;
  data: any;
  variantProductMap: { [key: string]: any };
  productImage: string | null;
  wishlistIds: Set<string>;
  cartLoadingItems: Set<string>;
  isOutOfStock: (v: Variant) => boolean;
  addToCart: (id: string, qty?: number) => void;
  onInitiateCheckout?: (productId: string, quantity: number) => void;
  updateVariantAndProduct: (v: Variant) => void;
  toggleWishlist: (id: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  activeFiltersCount: number;
  clearFilters: () => void;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  variantDetails: string[];
  scrollToHero?: () => void;
  selectedCategory?: string | null;
  onSelectCategory?: (id: string | null) => void;
}

// ─────────────────────────────────────────────────────────────
export default function VariantsGrid({
  filteredVariants,
  selectedVariant,
  selectedProduct,
  data,
  variantProductMap,
  productImage,
  wishlistIds,
  cartLoadingItems,
  isOutOfStock,
  addToCart,
  onInitiateCheckout,
  updateVariantAndProduct,
  toggleWishlist,
  sortBy,
  setSortBy,
  activeFiltersCount,
  clearFilters,
  primary,
  primaryDark,
  primaryLight,
  variantDetails,
  scrollToHero,
  selectedCategory,
  onSelectCategory,
}: VariantsGridProps) {
  const allVariants = data?.variants || [];

  // ─── Attribute detection ──────────────────────────────────
  const hasArrayAttributes = useMemo(() => {
    if (allVariants.length === 0) return false;
    const firstAttrs = allVariants[0]?.attributes || {};
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
  }, [allVariants]);

  // ─── Attribute map ────────────────────────────────────────
  const attributeMap: { [key: string]: Set<string> } = {};
  if (!hasArrayAttributes) {
    allVariants.forEach((v: any) => {
      const attrs = v.attributes || {};
      Object.keys(attrs).forEach((key) => {
        if (!attributeMap[key]) attributeMap[key] = new Set();
        const val = attrs[key];
        if (typeof val === "string" && !val.startsWith("[")) attributeMap[key].add(val);
        else if (typeof val === "string" && val.startsWith("[")) {
          try { const arr = JSON.parse(val); if (Array.isArray(arr)) arr.forEach((item) => attributeMap[key].add(item)); } catch {}
        } else if (typeof val === "string") attributeMap[key].add(val);
      });
    });
  }
  const attributeTypes = Object.keys(attributeMap).sort();
  const attributeOptions: { [key: string]: string[] } = {};
  attributeTypes.forEach((key) => { attributeOptions[key] = Array.from(attributeMap[key]).sort(); });

  // ─── State ────────────────────────────────────────────────
  const [attrFilters, setAttrFilters] = useState<{ [key: string]: string }>({});
  const [selectedMultiAttrs, setSelectedMultiAttrs] = useState<{ [key: string]: string }>({});
  const prevMultiVariantRef = useRef<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [manualView, setManualView] = useState<"list" | "grid" | null>(null);
  const [viewMoreCategoryId, setViewMoreCategoryId] = useState<string | null>(null);
  const sliderRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // ─── Category grouping ────────────────────────────────────
  const { categoryVariants, uncategorizedVariants } = useMemo(() => {
    const map: { [catId: string]: { category: any; variants: Variant[] } } = {};
    const categories = data?.categories || [];
    categories.forEach((cat: any) => { map[cat.id] = { category: cat, variants: [] }; });
    const uncategorized: Variant[] = [];
    filteredVariants.forEach((v: Variant) => {
      const product = variantProductMap[v.id];
      if (!product?.categories?.length) { uncategorized.push(v); return; }
      let assigned = false;
      product.categories.forEach((pc: any) => {
        const catId = pc.category?.id;
        if (catId && map[catId]) { map[catId].variants.push(v); assigned = true; }
      });
      if (!assigned) uncategorized.push(v);
    });
    const filtered = Object.fromEntries(Object.entries(map).filter(([_, g]) => g.variants.length > 0));
    return { categoryVariants: filtered, uncategorizedVariants: uncategorized };
  }, [filteredVariants, variantProductMap, data?.categories]);

  useEffect(() => { setCurrentPage(1); }, [attrFilters, sortBy, filteredVariants.length]);

  const isAttributeValueAvailable = (attrKey: string, value: string) => {
    const otherSelections = { ...attrFilters };
    delete otherSelections[attrKey];
    return allVariants.some((v: any) => {
      const vAttrs = v.attributes || {};
      return (
        Object.keys(otherSelections).every((key) => {
          const vVal = vAttrs[key];
          if (typeof vVal === "string" && !vVal.startsWith("[")) return vVal === otherSelections[key];
          if (typeof vVal === "string" && vVal.startsWith("[")) {
            try { const arr = JSON.parse(vVal); return Array.isArray(arr) && arr.includes(otherSelections[key]); } catch { return false; }
          }
          return false;
        }) &&
        (() => {
          const vVal = vAttrs[attrKey];
          if (typeof vVal === "string" && !vVal.startsWith("[")) return vVal === value;
          if (typeof vVal === "string" && vVal.startsWith("[")) {
            try { const arr = JSON.parse(vVal); return Array.isArray(arr) && arr.includes(value); } catch { return false; }
          }
          return false;
        })()
      );
    });
  };

  const handleAttributeSelect = (attrKey: string, value: string) => {
    const newFilters = { ...attrFilters, [attrKey]: value };
    if (attrFilters[attrKey] === value) delete newFilters[attrKey];
    setAttrFilters(newFilters);
    const matchingVariant = filteredVariants.find((v: any) => {
      const vAttrs = v.attributes || {};
      return Object.keys(newFilters).every((key) => {
        const vVal = vAttrs[key];
        const fVal = newFilters[key];
        if (Array.isArray(vVal)) return vVal.includes(fVal);
        if (typeof vVal === "string" && vVal.startsWith("[")) {
          try { const arr = JSON.parse(vVal); return arr.includes(fVal); } catch { return false; }
        }
        return vVal === fVal;
      });
    });
    if (matchingVariant) updateVariantAndProduct(matchingVariant);
  };

  const filteredByAttrs = useMemo(() => {
    if (Object.keys(attrFilters).length === 0) return filteredVariants;
    return filteredVariants.filter((v: any) => {
      const vAttrs = v.attributes || {};
      return Object.keys(attrFilters).every((key) => {
        const filterVal = attrFilters[key];
        const vVal = vAttrs[key];
        if (Array.isArray(vVal)) return vVal.includes(filterVal);
        if (typeof vVal === "string" && vVal.startsWith("[")) {
          try { const arr = JSON.parse(vVal); return arr.includes(filterVal); } catch { return false; }
        }
        return vVal === filterVal;
      });
    });
  }, [filteredVariants, attrFilters]);

  const totalActiveFilters = activeFiltersCount + Object.keys(attrFilters).length;

  const handleClearAll = () => {
    setAttrFilters({});
    clearFilters();
    setCurrentPage(1);
    if (allVariants.length > 0) updateVariantAndProduct(allVariants[0]);
  };

  useEffect(() => {
    if (hasArrayAttributes && selectedVariant && selectedVariant.id !== prevMultiVariantRef.current) {
      prevMultiVariantRef.current = selectedVariant.id;
      const attrs = selectedVariant.attributes || {};
      const first: { [key: string]: string } = {};
      Object.keys(attrs).forEach((key) => {
        const val = attrs[key];
        const parsed = Array.isArray(val) ? val
          : typeof val === "string" && val.startsWith("[")
          ? (() => { try { return JSON.parse(val); } catch { return []; } })()
          : [val];
        if (Array.isArray(parsed) && parsed.length > 0) first[key] = parsed[0];
      });
      setSelectedMultiAttrs(first);
    }
  }, [hasArrayAttributes, selectedVariant]);

  const handleMultiAttrClick = (attrKey: string, value: string) => {
    const newAttrs = { ...selectedMultiAttrs, [attrKey]: value };
    setSelectedMultiAttrs((prev) => {
      const next = { ...prev, [attrKey]: value };
      if (prev[attrKey] === value) delete next[attrKey];
      return next;
    });
    if (Object.keys(newAttrs).length > 0) {
      const matching = filteredVariants.find((v) => {
        const vAttrs = v.attributes || {};
        return Object.keys(newAttrs).every((key) => {
          const vVal = vAttrs[key];
          const vArr = Array.isArray(vVal) ? vVal
            : typeof vVal === "string" && vVal.startsWith("[")
            ? (() => { try { return JSON.parse(vVal); } catch { return []; } })()
            : [vVal];
          return Array.isArray(vArr) && vArr.includes(newAttrs[key]);
        });
      });
      if (matching) updateVariantAndProduct(matching);
    }
  };

  const renderMultiValueAttributes = () => {
    if (!hasArrayAttributes) return null;
    const attrs = selectedVariant?.attributes || {};
    if (Object.keys(attrs).length === 0 && allVariants.length > 0)
      Object.assign(attrs, allVariants[0]?.attributes || {});
    const entries = Object.entries(attrs);
    if (entries.length === 0) return null;
    return (
      <div className="space-y-4">
        {entries.map(([key, rawValue]) => {
          const values = parseAttributeValue(rawValue);
          if (values.length === 0) return null;
          const isColor = key.toLowerCase().includes("color");
          const currentSelected = selectedMultiAttrs[key];
          return (
            <div key={key}>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                {key}
                {currentSelected && (
                  <span className="ml-2 text-gray-800 normal-case font-semibold tracking-normal">— {currentSelected}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {values.map((val) => {
                  const isSelected = currentSelected === val;
                  if (isColor) {
                    const bg = colorNameToHex(val);
                    const isDark = ["#111827","#1E3A8A","#6B7280","#000000"].includes(bg);
                    return (
                      <button
                        key={val}
                        onClick={() => handleMultiAttrClick(key, val)}
                        title={val}
                        className="relative w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                        style={{
                          background: bg,
                          boxShadow: isSelected
                            ? `0 0 0 2px white, 0 0 0 4px ${primary}`
                            : "0 1px 3px rgba(0,0,0,0.2)",
                          transform: isSelected ? "scale(1.15)" : "scale(1)",
                        }}
                      >
                        {isSelected && (
                          <span
                            className="absolute inset-0 flex items-center justify-center text-[10px]"
                            style={{ color: isDark ? "white" : "#111827" }}
                          >✓</span>
                        )}
                        <span className="sr-only">{val}</span>
                      </button>
                    );
                  }
                  return (
                    <button
                      key={val}
                      onClick={() => handleMultiAttrClick(key, val)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95"
                      style={
                        isSelected
                          ? { background: primary, borderColor: primary, color: "white" }
                          : { background: "white", borderColor: "#e5e7eb", color: "#374151" }
                      }
                    >
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

  const showAttributeSelector =
    (!hasArrayAttributes && attributeTypes.length > 0 && allVariants.length > 1) ||
    (hasArrayAttributes && allVariants.length > 0);

  const autoGrid = filteredByAttrs.length > GRID_THRESHOLD;
  const useGridView = manualView === "grid" || (manualView === null && autoGrid);
  const totalPages = Math.ceil(filteredByAttrs.length / ITEMS_PER_PAGE);
  const pagedVariants = useGridView
    ? filteredByAttrs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : filteredByAttrs;

  const getPaginationPages = () => {
    const pages: (number | "…")[] = [];
    const p = currentPage;
    pages.push(1);
    if (p > 3) pages.push("…");
    for (let i = Math.max(2, p - 1); i <= Math.min(totalPages - 1, p + 1); i++) pages.push(i);
    if (p < totalPages - 2) pages.push("…");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  // ─── Compact card renderer (short height, wide) ──────────
  const renderCompactCard = (variant: Variant) => {
    const { isDefaultVariant, outOfStock, attrLabel, variantImage, isWishlisted, oldPrice, savings, discountPct, displayName, isSelected, isLoading } = getVariantData(variant);

    // Extract color and size for display
    const variantAttrs = variant.attributes || {};
    const colorKey = Object.keys(variantAttrs).find(k => k.toLowerCase().includes('color'));
    const sizeKey = Object.keys(variantAttrs).find(k => k.toLowerCase().includes('size'));
    const getAttrDisplayValues = (val: any): string[] => {
      if (Array.isArray(val)) return val.filter(v => v != null && v !== '');
      if (typeof val === 'string' && val.startsWith('[')) {
        try { const p = JSON.parse(val); return Array.isArray(p) ? p.filter(v => v != null && v !== '') : [val]; } catch { return [val]; }
      }
      if (typeof val === 'string' && val.trim() !== '') return [val];
      return [];
    };
    const colorValues = colorKey ? getAttrDisplayValues(variantAttrs[colorKey]) : [];
    const sizeValues = sizeKey ? getAttrDisplayValues(variantAttrs[sizeKey]) : [];

    return (
      <div
        key={variant.id}
        onClick={() => { if (!outOfStock) updateVariantAndProduct(variant); }}
        className="group bg-white flex flex-col cursor-pointer transition-all duration-300 overflow-hidden variant-card"
        style={{
          borderRadius: "14px",
          border: `1px solid ${isSelected ? primary : "#E5E7EB"}`,
          boxShadow: isSelected
            ? `0 8px 25px -6px ${primary}30`
            : "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
          transform: isSelected ? "translateY(-2px)" : "translateY(0)",
        }}
      >
        {/* Image zone - larger height */}
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{ height: "clamp(140px, 22vw, 200px)", background: "#F8FAFC" }}
        >
          {discountPct > 0 && (
            <div className="absolute top-1 left-1 z-10 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full shadow-sm"
              style={{ background: `linear-gradient(135deg, ${primary}, ${primaryDark})` }}>
              {discountPct}%
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(variant.id); }}
            className="absolute top-1 right-1 z-10 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center border border-white/80 hover:scale-110 active:scale-90 transition-all"
          >
            <FaHeart className={`text-[10px] ${isWishlisted ? "text-rose-500" : "text-gray-300 group-hover:text-gray-400"}`} />
          </button>
          {variantImage ? (
            <img src={variantImage} alt={displayName} className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <FaLeaf className="text-gray-200 text-2xl" />
          )}
        </div>

        {/* Info zone - show Color and Size */}
        <div className="px-3 pt-2 pb-1 flex-1">
          <h3 className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 group-hover:text-gray-900 transition-colors">
            {displayName}
          </h3>
          {/* Color and Size badges */}
          {(colorValues.length > 0 || sizeValues.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {colorValues.map((color: string) => (
                <span key={color} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ background: colorNameToHex(color) }}></span>
                  {color}
                </span>
              ))}
              {sizeValues.map((size: string) => (
                <span key={size} className="text-[10px] font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">
                  {size}
                </span>
              ))}
            </div>
          )}
          {!isDefaultVariant && attrLabel && colorValues.length === 0 && sizeValues.length === 0 && (
            <p className="text-[10px] text-gray-400 font-medium truncate mt-1">{attrLabel}</p>
          )}
        </div>

        {/* Price zone */}
        <div className="px-3 pt-1 pb-1 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-black leading-none text-sm" style={{ color: primary }}>
              ৳{variant.price.toFixed(0)}
            </span>
            {!isDefaultVariant && discountPct > 0 && (
              <span className="text-[9px] text-gray-400 line-through">৳{oldPrice}</span>
            )}
          </div>
          {savings > 0 && !isDefaultVariant && (
            <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded-full">
              -৳{savings}
            </span>
          )}
        </div>

        {/* Stock label */}
        <div className="px-3 pb-1.5 min-h-[16px]">
          {outOfStock ? (
            <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">স্টক শেষ</span>
          ) : !isDefaultVariant && variant.stock <= 10 ? (
            <span className="text-[8px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">⚡ {variant.stock} বাকি</span>
          ) : null}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 p-3 pt-0">
          <button
            onClick={(e) => { e.stopPropagation(); if (!outOfStock) { onInitiateCheckout?.(variant.productId, 1); updateVariantAndProduct(variant); scrollToHero?.(); } }}
            disabled={outOfStock}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-black text-white rounded-md disabled:opacity-40 active:scale-95 transition-all"
            style={{ background: outOfStock ? "#9ca3af" : `linear-gradient(135deg, ${primary}, ${primaryDark})` }}
          >
            <FaBolt className="text-[8px]" />
            {outOfStock ? "শেষ" : "কিনুন"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (!outOfStock) addToCart(variant.id, 1); }}
            disabled={outOfStock || isLoading}
            className="flex items-center justify-center px-3 py-2 text-[11px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-md border border-gray-200 disabled:opacity-40 transition-all"
          >
            <FaShoppingBag className="text-[8px]" />
            {isLoading ? "..." : "কার্ট"}
          </button>
        </div>
      </div>
    );
  };

  // Compact slider card (for category sliders)
  const renderCompactSliderCard = (variant: Variant) => {
    return (
      <div className="flex-shrink-0" style={{ width: "clamp(180px, 22vw, 220px)", scrollSnapAlign: "start" }}>
        {renderCompactCard(variant)}
      </div>
    );
  };

  // ─── Shared variant data extractor ───────────────────────
  const getVariantData = (variant: Variant) => {
    const isDefaultVariant = variant.sku && String(variant.sku).startsWith("default-");
    const outOfStock = isOutOfStock(variant);
    const attrLabel = formatAttrLabel(variant.attributes || {});

    // Get color-specific image from variantImages
    const variantImages = (variant as any).variantImages || [];

    // Try to find color image in priority:
    // 1. From selectedMultiAttrs (explicit color click)
    // 2. From the variant's own color attribute value (first color in attributes)
    let selectedColor = selectedMultiAttrs['Color'] || selectedMultiAttrs['color'] || null;

    // If no color selected in state, try to extract from the variant's own attributes
    if (!selectedColor && variant.attributes) {
      const colorAttrKey = Object.keys(variant.attributes).find(k => k.toLowerCase().includes('color'));
      if (colorAttrKey) {
        const colorAttr = variant.attributes[colorAttrKey];
        if (Array.isArray(colorAttr) && colorAttr.length > 0) {
          selectedColor = colorAttr[0];
        } else if (typeof colorAttr === 'string') {
          // Handle JSON array string
          if (colorAttr.startsWith('[')) {
            try { const arr = JSON.parse(colorAttr); if (Array.isArray(arr) && arr.length > 0) selectedColor = arr[0]; } catch {}
          } else {
            selectedColor = colorAttr;
          }
        }
      }
    }

    let colorImage = null;
    if (selectedColor && variantImages.length > 0) {
      const matched = variantImages.find(
        (img: any) => img.color?.toLowerCase() === selectedColor.toLowerCase() || img.altText?.toLowerCase() === selectedColor.toLowerCase()
      );
      if (matched) colorImage = matched.url;
    }
    const variantImage = colorImage || variant.image || productImage;

    const isWishlisted = wishlistIds.has(variant.id);
    const oldPrice = isDefaultVariant ? variant.price : Math.round(variant.price * 1.4);
    const savings = isDefaultVariant ? 0 : oldPrice - variant.price;
    const discountPct = isDefaultVariant ? 0 : Math.round((savings / oldPrice) * 100);
    const variantProduct = variantProductMap[variant.id];
    const displayName = variantProduct?.name || data.product?.name || "আমাদের পণ্য";
    const isSelected = selectedVariant?.id === variant.id;
    const isLoading = cartLoadingItems.has(variant.id);
    return { isDefaultVariant, outOfStock, attrLabel, variantImage, isWishlisted, oldPrice, savings, discountPct, displayName, isSelected, isLoading };
  };

  // ─── Pagination ───────────────────────────────────────────
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = getPaginationPages();
    return (
      <div className="flex flex-col items-center gap-2 pt-4 pb-1">
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <button
            onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <FaChevronLeft className="text-[8px]" />
          </button>
          {pages.map((pg, i) =>
            pg === "…" ? (
              <span key={`e-${i}`} className="w-5 text-center text-xs text-gray-400">…</span>
            ) : (
              <button
                key={pg}
                onClick={() => { setCurrentPage(pg as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[11px] font-bold transition-all hover:opacity-90"
                style={{
                  background: currentPage === pg ? primary : "white",
                  border: `1px solid ${currentPage === pg ? primary : "#e5e7eb"}`,
                  color: currentPage === pg ? "white" : "#374151",
                }}
              >
                {pg}
              </button>
            )
          )}
          <button
            onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={currentPage === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <FaChevronRight className="text-[8px]" />
          </button>
        </div>
        <p className="text-[9px] text-gray-400">
          পৃষ্ঠা {currentPage}/{totalPages} — দেখানো {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredByAttrs.length)} / {filteredByAttrs.length}টি
        </p>
      </div>
    );
  };

  // ─── Category slider ──────────────────────────────────────
  const scrollSlider = (catId: string, direction: "left" | "right") => {
    const el = sliderRefs.current[catId];
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -(el.clientWidth * 0.8) : el.clientWidth * 0.8, behavior: "smooth" });
  };

  const renderCategorySlider = (catId: string, catName: string, variants: Variant[]) => {
    if (variants.length === 0) return null;
    const showArrows = variants.length > 4;
    return (
      <div key={catId} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full inline-block" style={{ background: primary }} />
            {catName}
            <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{variants.length}টি</span>
          </h3>
          <div className="flex items-center gap-1">
            {showArrows && (
              <div className="flex gap-1">
                <button onClick={() => scrollSlider(catId, "left")}
                  className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded-md text-gray-400 hover:bg-gray-50 transition-all">
                  <FaChevronLeft className="text-[8px]" />
                </button>
                <button onClick={() => scrollSlider(catId, "right")}
                  className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded-md text-gray-400 hover:bg-gray-50 transition-all">
                  <FaChevronRight className="text-[8px]" />
                </button>
              </div>
            )}
            {variants.length > 4 && (
              <button
                onClick={() => setViewMoreCategoryId(catId)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-md text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: primary }}
              >
                সব দেখুন
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <div
            ref={(el) => { sliderRefs.current[catId] = el; }}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {variants.map((variant) => (
              <div key={variant.id}>
                {renderCompactSliderCard(variant)}
              </div>
            ))}
          </div>
          {showArrows && (
            <>
              <div className="absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-white to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </>
          )}
        </div>
      </div>
    );
  };

  const categoryViewMoreVariants = viewMoreCategoryId
    ? categoryVariants[viewMoreCategoryId]?.variants || []
    : [];
  const singleVariant = filteredByAttrs.length === 1 ? filteredByAttrs[0] : null;

  // ─── Main render ──────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Top toolbar ── */}
      {!singleVariant && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <span className="w-2 h-4 rounded-full inline-block" style={{ background: primary }} />
            আজকের বিশেষ মূল্য
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {/* View toggle */}
            {(autoGrid || manualView !== null) && !viewMoreCategoryId && (
              <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
                <button
                  onClick={() => setManualView("list")}
                  className="px-2 py-1 text-[11px] flex items-center gap-1 transition-all"
                  style={!useGridView ? { background: primary, color: "white" } : { color: "#9ca3af" }}
                  title="লিস্ট ভিউ"
                >
                  <FaList className="text-[9px]" />
                </button>
                <button
                  onClick={() => setManualView("grid")}
                  className="px-2 py-1 text-[11px] flex items-center gap-1 transition-all border-l border-gray-200"
                  style={useGridView ? { background: primary, color: "white" } : { color: "#9ca3af" }}
                  title="গ্রিড ভিউ"
                >
                  <FaThLarge className="text-[9px]" />
                </button>
              </div>
            )}
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-[11px] border border-gray-200 bg-white rounded-md px-2 py-1 outline-none cursor-pointer text-gray-600"
            >
              <option value="default">ডিফল্ট</option>
              <option value="newest">নতুন প্রথম</option>
              <option value="oldest">পুরাতন প্রথম</option>
              <option value="price_asc">দাম: কম → বেশি</option>
              <option value="price_desc">দাম: বেশি → কম</option>
            </select>
            {/* Clear filters */}
            {totalActiveFilters > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-[11px] bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md transition-all text-gray-600"
              >
                ফিল্টার মুছুন ({totalActiveFilters})
              </button>
            )}
            {/* Count */}
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
              {filteredByAttrs.length}টি পণ্য
            </span>
          </div>
        </div>
      )}

      {/* ── Attribute selector ── */}
      {showAttributeSelector && !singleVariant && (
        <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
          {!hasArrayAttributes && (
            <div className="flex flex-wrap gap-4 items-start">
              {attributeTypes.map((attrKey) => {
                const options = attributeOptions[attrKey] || [];
                const currentValue = attrFilters[attrKey] || "";
                const isColor = attrKey.toLowerCase().includes("color");
                return (
                  <div key={attrKey} className="flex items-start gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-1">{attrKey}:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {options.map((val) => {
                        const isSelected = val === currentValue;
                        const isAvailable = isAttributeValueAvailable(attrKey, val);
                        if (isColor) {
                          const bg = colorNameToHex(val);
                          return (
                            <button
                              key={val}
                              onClick={() => handleAttributeSelect(attrKey, val)}
                              disabled={!isAvailable}
                              title={val}
                              className="w-7 h-7 rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
                              style={{
                                background: bg,
                                boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 3px ${primary}` : "0 1px 2px rgba(0,0,0,0.2)",
                                transform: isSelected ? "scale(1.1)" : "scale(1)",
                              }}
                            >
                              <span className="sr-only">{val}</span>
                            </button>
                          );
                        }
                        return (
                          <button
                            key={val}
                            onClick={() => handleAttributeSelect(attrKey, val)}
                            disabled={!isAvailable}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
                            style={
                              isSelected
                                ? { background: primary, borderColor: primary, color: "white" }
                                : { background: "white", borderColor: "#e5e7eb", color: "#374151" }
                            }
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {hasArrayAttributes && renderMultiValueAttributes()}
        </div>
      )}

      {/* ── Empty state ── */}
      {filteredByAttrs.length === 0 ? (
        <div className="bg-white border border-gray-100 p-8 text-center rounded-xl shadow-sm">
          <FaSearch className="text-3xl text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">আপনার সার্চের সাথে মিলে এমন কোনো পণ্য পাওয়া যায়নি।</p>
          <button onClick={handleClearAll} className="mt-3 text-sm font-bold px-4 py-1.5 rounded-lg text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: primary }}>
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : singleVariant ? (
        // ── Single product: compact card ──
        <div onClick={() => { if (!singleVariant || isOutOfStock(singleVariant)) return; updateVariantAndProduct(singleVariant); scrollToHero?.(); }}
          className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer">
          {(() => {
            const { isDefaultVariant, outOfStock, attrLabel, variantImage, isWishlisted, oldPrice, savings, discountPct, displayName, isLoading } = getVariantData(singleVariant);
            return (
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-48 h-48 md:h-auto bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-shrink-0">
                  {variantImage ? (
                    <img src={variantImage} alt={displayName} className="w-full h-full object-contain p-4" />
                  ) : (
                    <FaLeaf className="text-gray-200 text-5xl" />
                  )}
                  {discountPct > 0 && (
                    <div className="absolute top-2 left-2 text-xs font-black text-white px-2.5 py-1 rounded-full shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${primary}, ${primaryDark})` }}>
                      {discountPct}% ছাড়
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); toggleWishlist(singleVariant.id); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/95 backdrop-blur rounded-full shadow-sm flex items-center justify-center border border-white/80">
                    <FaHeart className={`text-sm ${isWishlisted ? "text-rose-500" : "text-gray-300"}`} />
                  </button>
                </div>
                <div className="flex-1 p-4 flex flex-col min-w-[200px]">
                  <h3 className="text-lg font-black text-gray-900 leading-snug mb-1">{displayName}</h3>
                  {!isDefaultVariant && attrLabel && (
                    <p className="text-xs text-gray-400 mb-2">{attrLabel}</p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-black" style={{ color: primary }}>৳{singleVariant.price.toFixed(0)}</span>
                    {!isDefaultVariant && oldPrice > singleVariant.price && (
                      <span className="text-sm text-gray-400 line-through">৳{oldPrice}</span>
                    )}
                  </div>
                  <div className="mt-auto pt-3 flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); if (!outOfStock) addToCart(singleVariant.id, 1); }}
                      disabled={outOfStock || isLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 disabled:opacity-40">
                      <FaShoppingBag className="text-[10px]" />{isLoading ? "..." : "কার্টে যোগ"}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if (!outOfStock) { onInitiateCheckout?.(singleVariant.productId, 1); updateVariantAndProduct(singleVariant); scrollToHero?.(); } }}
                      disabled={outOfStock}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-black text-white rounded-lg disabled:opacity-40"
                      style={{ background: outOfStock ? "#9ca3af" : `linear-gradient(135deg, ${primary}, ${primaryDark})` }}>
                      <FaBolt className="text-[10px]" />অর্ডার করুন
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : viewMoreCategoryId ? (
        // ── Category expanded grid ──
        <>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => { setViewMoreCategoryId(null); setCurrentPage(1); }}
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
            >
              <FaChevronLeft className="text-[8px]" /> ফিরে যান
            </button>
            <h3 className="text-sm font-black text-gray-800">
              {categoryVariants[viewMoreCategoryId]?.category?.name || "পণ্য"}
            </h3>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {categoryViewMoreVariants.length}টি
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryViewMoreVariants.map((v) => renderCompactCard(v))}
          </div>
        </>
      ) : Object.keys(categoryVariants).length > 0 || uncategorizedVariants.length > 0 ? (
        // ── Category sliders (compact) ──
        <>
          {Object.entries(categoryVariants).map(([catId, group]) =>
            renderCategorySlider(catId, group.category?.name || catId, group.variants)
          )}
          {uncategorizedVariants.length > 0 &&
            renderCategorySlider("__uncategorized__", "অন্যান্য পণ্য", uncategorizedVariants)}
        </>
      ) : useGridView ? (
        // ── Standard compact grid ──
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {pagedVariants.map((v) => renderCompactCard(v))}
          </div>
          {renderPagination()}
        </>
      ) : (
        // ── List view (keep original) ──
        <div>{filteredByAttrs.map((v) => (
          <div key={v.id} onClick={() => { if (!isOutOfStock(v)) updateVariantAndProduct(v); }}
            className="bg-white rounded-lg border border-gray-100 p-3 mb-2 cursor-pointer hover:shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-50 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                {(() => {
                  const { variantImage } = getVariantData(v);
                  return variantImage ? (
                    <img src={variantImage} alt="" className="w-full h-full object-contain p-1" />
                  ) : <FaLeaf className="text-gray-200 text-xl" />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-800 truncate">{getVariantData(v).displayName}</h4>
                <p className="text-[10px] text-gray-400 truncate">{getVariantData(v).attrLabel}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base font-black" style={{ color: primary }}>৳{v.price.toFixed(0)}</span>
                  {getVariantData(v).savings > 0 && (
                    <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">৳{getVariantData(v).savings} সাশ্রয়</span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); if (!isOutOfStock(v)) addToCart(v.id, 1); }}
                disabled={isOutOfStock(v)}
                className="flex items-center justify-center gap-1 px-3 py-2 text-[11px] font-bold text-white rounded-md disabled:opacity-40 flex-shrink-0"
                style={{ background: isOutOfStock(v) ? "#9ca3af" : primary }}>
                <FaShoppingBag className="text-[9px]" />{getVariantData(v).isLoading ? "..." : "কার্ট"}
              </button>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}