"use client";

import { useMemo } from "react";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

interface BestProductsSectionProps {
  products: Product[];
  wishlistIds: Set<string>;
  addToCart: (variantId: string, qty?: number, attrs?: Record<string, string>) => void;
  onOpenDetails: (productId: string, variantId: string) => void;
  toggleWishlist: (id: string) => void;
  primary: string;
}

export default function BestProductsSection({
  products,
  wishlistIds,
  addToCart,
  onOpenDetails,
  toggleWishlist,
  primary,
}: BestProductsSectionProps) {
  const bestProducts = useMemo(
    () => (products || []).filter((p) => Array.isArray(p.variants) && p.variants.length > 0).slice(0, 4),
    [products],
  );

  if (bestProducts.length === 0) return null;

  return (
    <section className="mt-9">
      <div className="mb-3.5 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#17181c]">সেরা পণ্য</h2>
          <p className="mt-0.5 text-[13px] text-[#6b6f78]">আমাদের সবচেয়ে জনপ্রিয় পণ্যসমূহ</p>
        </div>
        <a href="#" className="text-[13px] font-semibold" style={{ color: primary }}>
          সব দেখুন
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {bestProducts.map((p) => (
          <div key={p.id} className="h-full">
            <ProductCard
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
