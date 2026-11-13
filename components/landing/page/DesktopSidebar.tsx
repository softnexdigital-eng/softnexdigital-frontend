"use client";

import {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
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
  const cls = "text-[13px]";
  if (n.includes("headphone") || n.includes("earphone") || n.includes("হেডফোন")) return <FaHeadphones className={cls} />;
  if (n.includes("computer") || n.includes("কম্পিউটার")) return <FaLaptop className={cls} />;
  if (n.includes("solar") || n.includes("wind") || n.includes("সোলার")) return <FaSolarPanel className={cls} />;
  if (n.includes("office") || n.includes("supplie") || n.includes("অফিস")) return <FaFolder className={cls} />;
  if (n.includes("youtube") || n.includes("studio") || n.includes("স্টুডিও")) return <FaVideo className={cls} />;
  if (n.includes("mobile") || n.includes("accessorie") || n.includes("মোবাইল")) return <FaMobileAlt className={cls} />;
  if (n.includes("watch") || n.includes("ওয়াচ")) return <FaClock className={cls} />;
  if (n.includes("consumer") || n.includes("electronic") || n.includes("ইলেকট্রনিক")) return <FaMicrochip className={cls} />;
  if (n.includes("health") || n.includes("fashion") || n.includes("স্বাস্থ্য")) return <FaHeart className={cls} />;
  if (n.includes("bag") || n.includes("ব্যাগ")) return <FaShoppingBag className={cls} />;
  return <FaLeaf className={cls} />;
}

export default function DesktopSidebar({
  categories,
  variants,
  selectedCategory,
  selectedSubcategory,
  expandedCategoryId,
  variantProductMap,
  onSelectCategory,
  onExpandCategory,
  onSelectSubcategory,
  primary,
}: DesktopSidebarProps) {
  const sidebarCats = categories.slice(0, 10);

  return (
    <aside className="hidden w-56 flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:flex xl:w-72">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-bold text-gray-900">ক্যাটাগরি</h2>
        <button
          onClick={() => {
            onSelectCategory(null);
            onExpandCategory(null);
            onSelectSubcategory(null);
          }}
          className="text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: primary }}
        >
          সব দেখুন
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <ul className="py-1.5">
          {sidebarCats.map((cat: Category, i: number) => {
            const isSelected = selectedCategory === cat.id;
            const isExpanded = expandedCategoryId === cat.id;
            const catVariants = variants.filter((v: Variant) => {
              const product = variantProductMap[v.id];
              const cats = (product?.categories || []) as Array<{ id?: string; name?: string; category?: { id?: string; name?: string } }>;
              return cats.some((pc) => {
                const cid = pc.id || pc.category?.id;
                const cname = pc.name || pc.category?.name;
                return cid === cat.id || cname === cat.name;
              });
            });
            const hasChildren = (cat.subcategories?.length || catVariants.length) > 0;

            return (
              <li key={cat.id || i}>
                <button
                  onClick={() => {
                    const newSelected = selectedCategory === cat.id ? null : cat.id;
                    onExpandCategory(expandedCategoryId === cat.id ? null : cat.id);
                    onSelectCategory(newSelected);
                    onSelectSubcategory(null);
                  }}
                  className="group flex w-full items-center justify-between gap-3 border-l-[3px] px-4 py-2.5 text-left outline-none transition-colors hover:bg-gray-50"
                  style={{
                    borderLeftColor: isSelected ? primary : "transparent",
                    background: isSelected ? `${primary}0D` : undefined,
                    color: isSelected ? primary : "#374151",
                  }}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: isSelected ? `${primary}18` : "#F3F4F6",
                        color: isSelected ? primary : "#6B7280",
                      }}
                    >
                      {getCategoryIcon(cat.name)}
                    </span>
                    <span className={`truncate text-[13px] ${isSelected ? "font-semibold" : "font-medium"}`}>
                      {cat.name}
                    </span>
                  </span>

                  {hasChildren && (
                    <FaAngleRight
                      className={`flex-shrink-0 text-xs text-gray-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </button>

                {isExpanded && cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="space-y-0.5 bg-gray-50/60 py-1.5 pl-[3.75rem] pr-3">
                    {cat.subcategories.map((sc: { id: string; name: string }, si: number) => {
                      const isSubActive = selectedSubcategory === sc.id;
                      return (
                        <button
                          key={sc.id || si}
                          onClick={() => onSelectSubcategory(selectedSubcategory === sc.id ? null : sc.id)}
                          className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-white"
                          style={{
                            color: isSubActive ? primary : "#6B7280",
                            fontWeight: isSubActive ? 600 : 400,
                            background: isSubActive ? "#fff" : "transparent",
                          }}
                        >
                          <span className="truncate">{sc.name}</span>
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
