"use client";

import { FaTimes, FaAngleDown, FaRegCircle, FaCheckCircle } from "react-icons/fa";
import type { Variant } from "@/types";
import { normalizeAttributes } from "@/lib/variants";

interface Category {
  id: string;
  name: string;
  count?: number;
  subcategories?: { id: string; name: string }[];
}

interface Brand {
  id: string;
  name: string;
  count?: number;
  logo?: string;
}

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  brands: Brand[];
  variants: Variant[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  selectedBrand: string | null;
  expandedCategoryId: string | null;
  expandedBrandId: string | null;
  onSelectCategory: (id: string | null) => void;
  onSelectSubcategory: (id: string | null, catId?: string) => void;
  onSelectBrand: (id: string | null) => void;
  onExpandCategory: (id: string | null) => void;
  onExpandBrand: (id: string | null) => void;
  onUpdateVariant: (v: Variant) => void;
  priceMin: string;
  priceMax: string;
  onPriceMinChange: (v: string) => void;
  onPriceMaxChange: (v: string) => void;
  primary: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="px-4 pb-2 pt-5 text-[11px] font-bold uppercase tracking-wider text-gray-400">{children}</h4>;
}

export default function MobileSidebar({
  open,
  onClose,
  categories,
  brands,
  variants,
  selectedCategory,
  selectedSubcategory,
  selectedBrand,
  expandedCategoryId,
  expandedBrandId,
  onSelectCategory,
  onSelectSubcategory,
  onSelectBrand,
  onExpandCategory,
  onExpandBrand,
  onUpdateVariant,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  primary,
}: MobileSidebarProps) {
  if (!open) return null;

  const hasActiveFilter = !!(selectedCategory || selectedSubcategory || selectedBrand || priceMin || priceMax);

  const clearAll = () => {
    onSelectCategory(null);
    onExpandCategory(null);
    onSelectSubcategory(null, "");
    onSelectBrand(null);
    onExpandBrand(null);
    onPriceMinChange("");
    onPriceMaxChange("");
  };

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="ফিল্টার ও ক্যাটাগরি">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
          <h3 className="text-base font-bold text-gray-900">ফিল্টার ও ক্যাটাগরি</h3>
          <div className="flex items-center gap-1">
            {hasActiveFilter && (
              <button onClick={clearAll} className="px-2 py-2 text-xs font-semibold" style={{ color: primary }}>
                মুছুন
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 active:scale-95"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {/* Categories */}
          <SectionTitle>ক্যাটাগরি</SectionTitle>
          <ul className="px-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const isExpanded = expandedCategoryId === cat.id;
              const hasSubs = (cat.subcategories?.length || 0) > 0;
              return (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onExpandCategory(expandedCategoryId === cat.id ? null : cat.id);
                      onSelectCategory(selectedCategory === cat.id ? null : cat.id);
                    }}
                    className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors active:bg-gray-100"
                    style={{
                      background: isSelected ? `${primary}0F` : undefined,
                      color: isSelected ? primary : "#374151",
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    <span className="truncate">{cat.name}</span>
                    {hasSubs && (
                      <FaAngleDown
                        className={`flex-shrink-0 text-xs text-gray-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {isExpanded && hasSubs && (
                    <div className="mb-1 ml-5 space-y-0.5 border-l border-gray-200 pl-2">
                      {cat.subcategories!.map((sc) => {
                        const active = selectedSubcategory === sc.id;
                        return (
                          <button
                            key={sc.id}
                            onClick={() => {
                              onSelectSubcategory(selectedSubcategory === sc.id ? null : sc.id, cat.id);
                              onClose();
                            }}
                            className="flex min-h-[40px] w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors active:bg-gray-100"
                            style={{
                              color: active ? primary : "#6B7280",
                              fontWeight: active ? 600 : 400,
                              background: active ? `${primary}0F` : undefined,
                            }}
                          >
                            {active ? (
                              <FaCheckCircle className="flex-shrink-0 text-xs" />
                            ) : (
                              <FaRegCircle className="flex-shrink-0 text-xs text-gray-300" />
                            )}
                            {sc.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Brands */}
          {brands.length > 0 && (
            <>
              <div className="mx-4 mt-3 border-t border-gray-100" />
              <SectionTitle>ব্র্যান্ড</SectionTitle>
              <ul className="px-2">
                {brands.map((brand) => {
                  const isSelected = selectedBrand === brand.id;
                  const isExpanded = expandedBrandId === brand.id;
                  return (
                    <li key={brand.id}>
                      <button
                        onClick={() => {
                          onExpandBrand(expandedBrandId === brand.id ? null : brand.id);
                          onSelectBrand(selectedBrand === brand.id ? null : brand.id);
                        }}
                        className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors active:bg-gray-100"
                        style={{
                          background: isSelected ? `${primary}0F` : undefined,
                          color: isSelected ? primary : "#374151",
                          fontWeight: isSelected ? 600 : 500,
                        }}
                      >
                        <span className="truncate">{brand.name}</span>
                        <span className="flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                          {variants.length}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="mb-1 ml-5 space-y-0.5 border-l border-gray-200 pl-2">
                          {variants.map((v) => {
                            const attrLabel = v?.attributes ? Object.values(normalizeAttributes(v.attributes as Record<string, unknown>)).filter(Boolean).join(" / ") : "";
                            return (
                              <button
                                key={v.id}
                                onClick={() => {
                                  onUpdateVariant(v);
                                  onClose();
                                }}
                                className="flex min-h-[40px] w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-gray-600 transition-colors active:bg-gray-100"
                              >
                                <span className="truncate">{attrLabel || "পণ্য"}</span>
                                <span className="flex-shrink-0 text-xs font-bold" style={{ color: primary }}>
                                  ৳{v.price}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {/* Price */}
          <div className="mx-4 mt-3 border-t border-gray-100" />
          <SectionTitle>মূল্য (৳)</SectionTitle>
          <div className="px-4">
            <div className="flex items-center gap-2">
              <input
                value={priceMin}
                onChange={(e) => onPriceMinChange(e.target.value)}
                inputMode="numeric"
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-base outline-none focus:border-gray-400 focus:bg-white"
                placeholder="সর্বনিম্ন"
              />
              <span className="text-gray-300">–</span>
              <input
                value={priceMax}
                onChange={(e) => onPriceMaxChange(e.target.value)}
                inputMode="numeric"
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-base outline-none focus:border-gray-400 focus:bg-white"
                placeholder="সর্বোচ্চ"
              />
            </div>
          </div>
        </div>

        {/* Sticky apply */}
        <div
          className="border-t border-gray-100 bg-white px-4 pt-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={onClose}
            className="h-12 w-full rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-95 active:scale-[0.99]"
            style={{ background: primary }}
          >
            ফিল্টার করুন
          </button>
        </div>
      </div>
    </div>
  );
}
