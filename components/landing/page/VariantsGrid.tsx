"use client";

import { useMemo, useState } from "react";
import type { Variant, Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { FaSearch, FaThLarge, FaList } from "react-icons/fa";
import type { PublicProduct, PublicVariant } from "@/lib/variants";

interface VariantsGridProps {
  products: Product[];
  wishlistIds: Set<string>;
  cartLoading?: boolean;
  addToCart: (variantId: string, qty?: number, attrs?: Record<string, string>) => void;
  onOpenDetails: (productId: string, variantId: string) => void;
  toggleWishlist: (id: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  activeFiltersCount: number;
  clearFilters: () => void;
  primary: string;
}

export default function VariantsGrid({
  products,
  wishlistIds,
  cartLoading,
  addToCart,
  onOpenDetails,
  toggleWishlist,
  sortBy,
  setSortBy,
  activeFiltersCount,
  clearFilters,
  primary,
}: VariantsGridProps) {
  const [manualView, setManualView] = useState<"list" | "grid" | null>(null);
  const useGridView = manualView !== "list";
  const safeProducts = useMemo(
    () => (products || []).filter((p) => Array.isArray(p.variants) && p.variants.length > 0),
    [products],
  );

  const toCardProduct = (p: Product): Omit<PublicProduct, "variants"> & { images?: string[]; name: string; variants: (PublicVariant | Variant)[] } => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    images: Array.isArray(p.images) ? p.images : [],
    categories: (p.categories || []).map((pc) => pc.category).filter((c): c is { id: string; name: string; slug: string } => Boolean(c?.id)),
    variants: (p.variants || []) as (PublicVariant | Variant)[],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
          <span className="w-2 h-4 rounded-full inline-block" style={{ background: primary }} />
          আজকের বিশেষ মূল্য
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
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
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[11px] bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md transition-all text-gray-600"
            >
              ফিল্টার মুছুন ({activeFiltersCount})
            </button>
          )}
          <span className="text-[11px] text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
            {safeProducts.length}টি পণ্য
          </span>
        </div>
      </div>

      {safeProducts.length === 0 ? (
        <div className="bg-white border border-gray-100 p-8 text-center rounded-xl shadow-sm">
          <FaSearch className="text-3xl text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">আপনার সার্চের সাথে মিলে এমন কোনো পণ্য পাওয়া যায়নি।</p>
          <button onClick={clearFilters} className="mt-3 text-sm font-bold px-4 py-1.5 rounded-lg text-white transition-all hover:opacity-90 active:scale-95" style={{ background: primary }}>
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <div
          data-product-grid="true"
          className={
            useGridView
              ? "flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide sm:grid sm:gap-3 sm:grid-cols-3 sm:overflow-visible sm:pb-0 sm:snap-none lg:grid-cols-4 xl:grid-cols-5"
              : "space-y-3"
          }
        >
          {safeProducts.map((p) => (
            <div
              key={p.id}
              className={useGridView ? "w-[64%] shrink-0 snap-start sm:w-auto sm:shrink sm:snap-align-none" : "w-full"}
            >
              <ProductCard
                product={toCardProduct(p)}
                onAddToCart={(variantId, qty, attrs) => addToCart(variantId, qty ?? 1, attrs)}
                onBuyNow={(variantId) => onOpenDetails(p.id, variantId)}
                onOpenDetails={onOpenDetails}
                onToggleWishlist={(variantId) => toggleWishlist(variantId)}
                isWishlisted={(variantId) => wishlistIds.has(variantId)}
                cartLoading={cartLoading}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
