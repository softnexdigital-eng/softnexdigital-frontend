"use client";

import { useMemo } from "react";
import type { Product } from "@/types";
import ThemedProductCard from "@/components/landing/page/ThemedProductCard";

interface AllProductsProps {
  products: Product[];
  wishlistIds: Set<string>;
  addToCart: (variantId: string, qty?: number, attrs?: Record<string, string>) => void;
  onOpenDetails: (productId: string, variantId: string) => void;
  toggleWishlist: (id: string) => void;
  primary?: string;
  theme?: string;
}

export default function AllProducts({
  products,
  wishlistIds,
  addToCart,
  onOpenDetails,
  toggleWishlist,
  primary,
  theme = "original",
}: AllProductsProps) {
  const visibleProducts = useMemo(
    () => (products || []).filter((p) => Array.isArray(p.variants) && p.variants.length > 0),
    [products],
  );

  if (visibleProducts.length === 0) return null;

  return (
    <section className="mt-9">
      <div className="mb-3.5 flex items-end justify-between">
        <h2 className="text-xl font-bold text-[#17181c]">সব পণ্য</h2>
        <a href="#" className="text-[13px] font-semibold" style={{ color: primary || "var(--primary,#e11d48)" }}>
          ফিল্টার ও সর্ট
        </a>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3.5">
        {visibleProducts.map((p) => (
          <div key={p.id} className="h-full">
            <ThemedProductCard
              theme={theme}
              product={p as any}
              onAddToCart={(variantId, qty, attrs) => addToCart(variantId, qty ?? 1, attrs)}
              onBuyNow={(variantId) => onOpenDetails(p.id, variantId)}
              onOpenDetails={onOpenDetails}
              onToggleWishlist={toggleWishlist}
              isWishlisted={(variantId) => wishlistIds.has(variantId)}
              className="h-full"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
