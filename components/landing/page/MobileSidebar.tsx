   "use client";

import { FaChevronDown, FaLeaf, FaAward, FaStar, FaTimes } from "react-icons/fa";
import type { Variant, Review } from "@/types";
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
  onSelectSubcategory: (id: string | null, catId: string) => void;
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

export default function MobileSidebar({
  open, onClose, categories, brands, variants,
  selectedCategory, selectedSubcategory, selectedBrand,
  expandedCategoryId, expandedBrandId,
  onSelectCategory, onSelectSubcategory, onSelectBrand,
  onExpandCategory, onExpandBrand, onUpdateVariant,
  priceMin, priceMax, onPriceMinChange, onPriceMaxChange, primary,
}: MobileSidebarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl z-10 overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-black text-gray-800">ফিল্টার & ক্যাটাগরি</h3>
          <button onClick={onClose} className="text-gray-500 text-xl">&times;</button>
        </div>

        {/* Categories */}
        <div className="mb-1 border-b border-gray-100">
          <button
            onClick={() => {/* handled by children or state */}}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white transition-colors group rounded-sm"
          >
            <span className="text-sm font-black text-gray-800 group-hover:text-red-600 transition-colors">📁 ক্যাটাগরি</span>
            <FaChevronDown className={`text-gray-400 text-xs transition-transform duration-200 ${true ? "rotate-180" : ""}`} />
          </button>
          <div className="px-3 pb-3">
            <ul className="space-y-px">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onExpandCategory(expandedCategoryId === cat.id ? null : cat.id);
                      onSelectCategory(selectedCategory === cat.id ? null : cat.id);
                      // onSelectSubcategory(null);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-2 text-xs text-left rounded-sm ${
                      selectedCategory === cat.id ? 'bg-white font-bold text-red-700' : 'text-gray-600'
                    }`}
                    style={selectedCategory === cat.id ? { color: primary } : {}}
                  >
                    <span className="flex items-center gap-2"><FaLeaf style={{ color: selectedCategory === cat.id ? primary : '#9ca3af', fontSize: "9px" }} />{cat.name}</span>
                    {(cat.subcategories?.length || 0) > 0 && (
                      <FaChevronDown className={`text-gray-400 text-[8px] transition-transform duration-200 ${expandedCategoryId === cat.id ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {expandedCategoryId === cat.id && cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="ml-4 mt-1 mb-1 border-l-2 border-red-100 pl-2 space-y-0.5">
                      {cat.subcategories.map((sc) => (
                        <button
                          key={sc.id}
                          onClick={() => {
                            onSelectSubcategory(selectedSubcategory === sc.id ? null : sc.id, cat.id);
                            onClose();
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded-sm transition-all ${
                            selectedSubcategory === sc.id ? 'bg-red-100 font-bold text-red-700' : 'text-gray-500 hover:bg-white'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-sm" style={{ background: selectedSubcategory === sc.id ? primary : '#d1d5db' }} />
                          {sc.name}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Brands */}
        <div className="mb-1 border-b border-gray-100">
          <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white transition-colors group rounded-sm">
            <span className="text-sm font-black text-gray-800 group-hover:text-red-600 transition-colors">🏷️ ব্র্যান্ড</span>
          </button>
          <div className="px-3 pb-3">
            <ul className="space-y-px">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <button
                    onClick={() => {
                      onExpandBrand(expandedBrandId === brand.id ? null : brand.id);
                      onSelectBrand(selectedBrand === brand.id ? null : brand.id);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-2 text-xs text-left rounded-sm ${
                      selectedBrand === brand.id ? 'bg-white font-bold' : 'text-gray-600'
                    }`}
                    style={selectedBrand === brand.id ? { color: primary } : {}}
                  >
                    <span className="flex items-center gap-2"><FaAward style={{ color: selectedBrand === brand.id ? primary : '#9ca3af', fontSize: "9px" }} />{brand.name}</span>
                    <span className="text-gray-400 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-sm">{variants.length}</span>
                  </button>
                  {expandedBrandId === brand.id && (
                    <div className="ml-4 mt-1 mb-1 border-l-2 border-red-100 pl-2 space-y-0.5">
                      {variants.map((v) => {
                        const attrLabel = formatAttributes(v.attributes, ", ");
                        const isSelected = false;
                        return (
                          <button
                            key={v.id}
                            onClick={() => { onUpdateVariant(v); onClose(); }}
                            className={`w-full flex items-center justify-between px-2 py-1.5 text-xs text-left rounded-sm transition-all ${
                              isSelected ? 'bg-red-100 font-bold text-red-700' : 'text-gray-600 hover:bg-white'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate mr-1">
                              <FaLeaf style={{ color: isSelected ? primary : '#d1d5db', fontSize: "7px", flexShrink: 0 }} />
                              <span className="truncate">{attrLabel || `পণ্য`}</span>
                            </span>
                            <span className="font-black text-red-600 flex-shrink-0 text-[10px]">৳{v.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Price Filter */}
        <div className="mb-1 border-b border-gray-100">
          <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white transition-colors group rounded-sm">
            <span className="text-sm font-black text-gray-800 group-hover:text-red-600 transition-colors">💰 মূল্য (৳)</span>
          </button>
          <div className="px-3 pb-3">
            <div className="flex gap-2 mb-2">
              <input value={priceMin} onChange={e => onPriceMinChange(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-sm" placeholder="সর্বনিম্ন" />
              <input value={priceMax} onChange={e => onPriceMaxChange(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-sm" placeholder="সর্বোচ্চ" />
            </div>
            <button className="w-full text-white text-xs font-bold py-2 rounded-sm" style={{ background: primary }}>ফিল্টার করুন</button>
          </div>
        </div>
      </div>
    </div>
  );
}