"use client";

import {
  FaChevronDown,
  FaLeaf,
  FaHeadphones,
  FaLaptop,
  FaSolarPanel,
  FaFolder,
  FaVideo,
  FaMobileAlt,
  FaClock,
  FaMicrochip,
  FaHeart,
  FaShoppingBag,
  FaAngleRight,
} from "react-icons/fa";
import type { Variant, Product } from "@/types";
import { formatAttributes } from "@/lib/attrUtils";

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

interface DesktopSidebarProps {
  categories: Category[];
  brands: Brand[];
  variants: Variant[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  selectedBrand: string | null;
  expandedCategoryId: string | null;
  expandedBrandId: string | null;
  selectedVariant: Variant | null;
  variantProductMap: { [key: string]: Product };
  productImage: string | null;
  data: any; // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filteredVariants: Variant[];
  priceMin: string;
  priceMax: string;
  onPriceMinChange: (v: string) => void;
  onPriceMaxChange: (v: string) => void;
  onSelectCategory: (id: string | null) => void;
  onExpandCategory: (id: string | null) => void;
  onSelectSubcategory: (id: string | null) => void;
  onSelectBrand: (id: string | null) => void;
  onExpandBrand: (id: string | null) => void;
  onUpdateVariant: (v: Variant) => void;
  primary: string;
}

function getCategoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("headphone") || n.includes("earphone") || n.includes("হেডফোন"))
    return <FaHeadphones className="text-xs" style={{ color: "#6366F1" }} />;
  if (n.includes("computer") || n.includes("office") || n.includes("কম্পিউটার"))
    return <FaLaptop className="text-xs" style={{ color: "#3B82F6" }} />;
  if (n.includes("solar") || n.includes("wind") || n.includes("সোলার"))
    return <FaSolarPanel className="text-xs" style={{ color: "#F59E0B" }} />;
  if (n.includes("office") || n.includes("supplie") || n.includes("অফিস"))
    return <FaFolder className="text-xs" style={{ color: "#10B981" }} />;
  if (n.includes("youtube") || n.includes("studio") || n.includes("স্টুডিও"))
    return <FaVideo className="text-xs" style={{ color: "#EF4444" }} />;
  if (n.includes("mobile") || n.includes("accessorie") || n.includes("মোবাইল"))
    return <FaMobileAlt className="text-xs" style={{ color: "#A855F7" }} />;
  if (n.includes("watch") || n.includes("ওয়াচ"))
    return <FaClock className="text-xs" style={{ color: "#EC4899" }} />;
  if (n.includes("consumer") || n.includes("electronic") || n.includes("ইলেকট্রনিক"))
    return <FaMicrochip className="text-xs" style={{ color: "#06B6D4" }} />;
  if (n.includes("health") || n.includes("fashion") || n.includes("স্বাস্থ্য"))
    return <FaHeart className="text-xs" style={{ color: "#F43F5E" }} />;
  if (n.includes("bag") || n.includes("accessorie") || n.includes("ব্যাগ"))
    return <FaShoppingBag className="text-xs" style={{ color: "#F59E0B" }} />;
  return <FaLeaf className="text-xs" style={{ color: "#9CA3AF" }} />;
}

export default function DesktopSidebar({
  categories,
  brands,
  variants,
  selectedCategory,
  selectedSubcategory,
  selectedBrand,
  expandedCategoryId,
  expandedBrandId,
  selectedVariant,
  variantProductMap,
  productImage,
  data,
  filteredVariants,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  onSelectCategory,
  onExpandCategory,
  onSelectSubcategory,
  onSelectBrand,
  onExpandBrand,
  onUpdateVariant,
  primary,
}: DesktopSidebarProps) {
  const sidebarCats = categories.slice(0, 10);

  return (
    <aside
      className="hidden lg:flex flex-shrink-0 w-56 xl:w-72 flex-col bg-white border border-gray-200/80 shadow-sm overflow-hidden"
      style={{ borderRadius: "14px" }}
    >
      {/* Header: Premium orange Title Bar */}
      <div className="px-4 py-4 flex items-center justify-between" style={{ background: primary }}>
        <h2 className="text-white font-bold text-[14px] tracking-wide uppercase">
          Categories
        </h2>
        <span className="text-[11px] font-medium text-white/70 hover:text-white cursor-pointer transition-colors">
          See All →
        </span>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {sidebarCats.map((cat: Category, i: number) => {
            const isSelected = selectedCategory === cat.id;
            const isExpanded = expandedCategoryId === cat.id;
            const catVariants = variants.filter((v: Variant) => {
              const product = variantProductMap[v.id];
              return product?.categories?.some(
                (pc: { category?: { id: string } }) => pc.category?.id === cat.id,
              );
            });

            return (
              <li key={cat.id || i} className="bg-white">
                <button
                  onClick={() => {
                    const newSelected = selectedCategory === cat.id ? null : cat.id;
                    onExpandCategory(expandedCategoryId === cat.id ? null : cat.id);
                    onSelectCategory(newSelected);
                    onSelectSubcategory(null);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-150 group outline-none border-l-4 ${
                    isSelected
                      ? "border-l-primary text-primary font-semibold"
                      : "border-l-transparent text-gray-700 hover:bg-gray-50/50"
                  }`}
                  style={{
                    borderLeftColor: isSelected ? primary : "transparent",
                    color: isSelected ? primary : undefined,
                    background: isSelected ? "#ecfdf5" : undefined,
                  }}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="w-5 h-5 flex items-center justify-center border border-gray-100 bg-gray-50/50 group-hover:bg-white transition-colors" style={{ borderRadius: "6px" }}>
                      {getCategoryIcon(cat.name)}
                    </span>
                    <span className="text-[13px] tracking-normal truncate">
                      {cat.name}
                    </span>
                  </span>

                  {(cat.subcategories?.length || catVariants.length) > 0 && (
                    <FaAngleRight
                      className={`text-[10px] transition-all duration-200 ${
                        isSelected ? "text-primary" : "text-gray-400 group-hover:text-primary"
                      } ${isExpanded ? "rotate-90" : ""}`}
                      style={{ color: isSelected ? primary : undefined }}
                    />
                  )}
                </button>

                {/* Subcategories */}
                {isExpanded && cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="bg-gray-50/40 border-t border-b border-gray-100/60 pl-8 pr-2 py-1.5 space-y-0.5">
                    {cat.subcategories.map((sc: { id: string; name: string }, si: number) => {
                      const isSubActive = selectedSubcategory === sc.id;
                      return (
                        <button
                          key={sc.id || si}
                          onClick={() => {
                            onSelectSubcategory(selectedSubcategory === sc.id ? null : sc.id);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors border-l-2 pl-2`}
                          style={{
                            color: isSubActive ? primary : "#6B7280",
                            fontWeight: isSubActive ? 700 : 400,
                            background: isSubActive ? "#ecfdf5" : "transparent",
                            borderLeftColor: isSubActive ? primary : "transparent",
                          }}
                        >
                          <span className="truncate">{sc.name}</span>
                          <FaAngleRight className="text-[8px]" style={{ color: isSubActive ? primary : "#D1D5DB" }} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}